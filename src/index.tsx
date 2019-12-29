import React, {cloneElement, useState, useMemo, useContext, useRef} from 'react'
import VisuallyHidden from '@accessible/visually-hidden'
import useMousePosition from '@react-hook/mouse-position'
import useMergedRef from '@react-hook/merged-ref'
import useLayoutEffect from '@react-hook/passive-layout-effect'

const __DEV__ =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

export interface SliderContextValue {
  incr: (by?: number) => void
  decr: (by?: number) => void
  set: (value: number) => void
  value: number
  min: number
  max: number
  step: number
  focused: boolean
  orientation: 'horizontal' | 'vertical'
  inputRef: React.MutableRefObject<HTMLInputElement | null>
}

// @ts-ignore
export const SliderContext: React.Context<SliderContextValue> = React.createContext(
    {}
  ),
  useSlider = () => useContext<SliderContextValue>(SliderContext),
  useValue = () => useSlider().value,
  useFocused = () => useSlider().focused,
  useControls = () => {
    const {incr, decr, set} = useSlider()
    return {incr, decr, set}
  }

export interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  orientation?: 'horizontal' | 'vertical'
  onChange?: (event: React.ChangeEvent) => any
  onFocus?: (event: React.FocusEvent) => any
  onBlur?: (event: React.FocusEvent) => any
  children?:
    | React.ReactElement
    | ((context: SliderContextValue) => React.ReactElement)
  [property: string]: any
}

// @ts-ignore
export const Slider: React.FC<SliderProps> = React.forwardRef<
  JSX.Element | React.ReactElement,
  SliderProps
>(
  (
    {
      min = 0,
      max = 100,
      step = 1,
      defaultValue = 50,
      value: controlledValue,
      orientation = 'horizontal',
      onChange,
      onFocus,
      onBlur,
      children,
      ...props
    },
    ref: any
  ) => {
    const [valueState, setValue] = useState<number>(defaultValue)
    const [focused, setFocused] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const value = controlledValue === void 0 ? valueState : controlledValue
    const context = useMemo(
      () => ({
        value,
        incr: (by = step) => setValue(current => Math.min(current + by, max)),
        decr: (by = step) => setValue(current => Math.max(current - by, min)),
        set: (next: number) => setValue(Math.max(Math.min(next, max), min)),
        focused,
        orientation,
        min,
        max,
        step,
        inputRef,
      }),
      [step, value, focused, orientation, min, max, step, inputRef]
    )
    // @ts-ignore
    const realChildren =
      typeof children === 'function' ? children(context) : children

    return (
      <SliderContext.Provider value={context}>
        <VisuallyHidden>
          <input
            type="range"
            value={value}
            min={min}
            max={max}
            ref={useMergedRef(ref, inputRef)}
            onChange={e => {
              onChange?.(e)
              setValue(Number(e.target.value))
            }}
            onFocus={e => {
              onFocus?.(e)
              setFocused(true)
            }}
            onBlur={e => {
              onBlur?.(e)
              setFocused(false)
            }}
            {...props}
          />
        </VisuallyHidden>

        {React.isValidElement(realChildren) &&
          cloneElement(realChildren, {
            'aria-hidden': realChildren.props.hasOwnProperty('aria-hidden')
              ? realChildren.props['aria-hidden']
              : 'true',
          })}
      </SliderContext.Provider>
    )
  }
)

export interface ThumbProps {
  children: React.ReactElement | JSX.Element
}

export const Thumb: React.FC<ThumbProps> = ({children}) => {
  const {value, max} = useSlider()
  const props = children.props

  return cloneElement(children, {
    style: Object.assign(
      {
        pointerEvents: 'none',
        position: 'absolute',
        left: `${Math.round((value / max) * 100)}%`,
      },
      props.style
    ),
  })
}

export interface TrackProps {
  children: React.ReactElement | JSX.Element
}

export const Track: React.FC<TrackProps> = ({children}) => {
  const mouseRef = useTrack()
  const props = children.props

  return cloneElement(children, {
    style: Object.assign(
      {userSelect: 'none', touchAction: 'none', position: 'relative'},
      props.style
    ),
    ref: useMergedRef(
      // @ts-ignore
      children.ref,
      mouseRef
    ),
  })
}

export const useTrack = () => {
  const {set, max, orientation, inputRef} = useSlider()
  const [mouse, mouseRef] = useMousePosition(0, 0, Infinity)
  const prevIsDown = useRef<boolean>(mouse.isDown)

  useLayoutEffect(() => {
    if (
      mouse.isDown &&
      mouse.x !== null &&
      mouse.y !== null &&
      mouse.elementWidth !== null &&
      mouse.elementHeight !== null
    )
      set(
        (orientation === 'horizontal'
          ? mouse.x / mouse.elementWidth
          : mouse.y / mouse.elementHeight) * max
      )

    if (prevIsDown.current && !mouse.isDown) inputRef.current?.focus()
    prevIsDown.current = mouse.isDown
  }, [mouse])

  return mouseRef
}

/* istanbul ignore next */
if (__DEV__) {
  Slider.displayName = 'AccessibleSlider'
  Thumb.displayName = 'Thumb'
  Track.displayName = 'Track'
}
