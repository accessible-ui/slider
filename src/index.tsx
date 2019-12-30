import React, {
  cloneElement,
  useEffect,
  useState,
  useMemo,
  useContext,
  useRef,
} from 'react'
import VisuallyHidden from '@accessible/visually-hidden'
import useMergedRef from '@react-hook/merged-ref'
import useLayoutEffect from '@react-hook/passive-layout-effect'
import raf from 'raf'

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
  disabled: boolean
  orientation: 'horizontal' | 'vertical'
  inputRef: React.MutableRefObject<HTMLInputElement | null>
}

// @ts-ignore
export const SliderContext: React.Context<SliderContextValue> = React.createContext(
    {}
  ),
  useSlider = () => useContext<SliderContextValue>(SliderContext),
  useValue = () => useSlider().value,
  useOrientation = () => useSlider().orientation,
  useFocused = () => useSlider().focused,
  useDisabled = () => useSlider().disabled,
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
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  onChange?: (value?: number) => any
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
      disabled = false,
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
    const prevValue = useRef<number>(value)
    const context = useMemo(
      () => ({
        value,
        incr: (by = step) =>
          !disabled && setValue(current => Math.min(current + by, max)),
        decr: (by = step) =>
          !disabled && setValue(current => Math.max(current - by, min)),
        set: (next: number) =>
          !disabled && setValue(Math.max(Math.min(next, max), min)),
        focused,
        disabled,
        orientation,
        min,
        max,
        step,
        inputRef,
      }),
      [step, value, focused, disabled, orientation, min, max, step, inputRef]
    )
    // @ts-ignore
    const realChildren =
      typeof children === 'function' ? children(context) : children

    useEffect(() => {
      prevValue.current !== value && onChange?.(value)
      prevValue.current = value
    }, [value])

    return (
      <SliderContext.Provider value={context}>
        <VisuallyHidden>
          <input
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={e => setValue(Number(e.target.value))}
            onFocus={e => {
              onFocus?.(e)
              setFocused(true)
            }}
            onBlur={e => {
              onBlur?.(e)
              setFocused(false)
            }}
            ref={useMergedRef(ref, inputRef)}
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
  const orientation = useOrientation()
  const progress = useProgress()
  const props = children.props
  return cloneElement(children, {
    style: Object.assign(
      {
        pointerEvents: 'none',
        position: 'absolute',
        [orientation === 'horizontal' ? 'left' : 'bottom']: `${Math.round(
          progress * 100
        )}%`,
      },
      props.style
    ),
  })
}

export const useProgress = (): number => {
  const {value, max} = useSlider()
  return value / max
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

type MouseState = {
  x?: number
  y?: number
  elementWidth?: number
  elementHeight?: number
  isDown: boolean
}

const useTrack = () => {
  const {set, max, orientation, inputRef} = useSlider()
  const mouseRef = useRef<HTMLElement | null>(null)
  const [mouse, setMouse] = useState<MouseState>({isDown: false})
  const prevIsDown = useRef<boolean>(mouse.isDown)

  useLayoutEffect(() => {
    const current = mouseRef.current
    if (current) {
      const position = (e: MouseEvent | TouchEvent) => {
        const rect = current.getBoundingClientRect()
        let clientX, clientY

        if ('changedTouches' in e) {
          clientX = e.changedTouches[0].clientX
          clientY = e.changedTouches[0].clientY
        } else {
          clientX = e.clientX
          clientY = e.clientY
        }

        return {
          x: clientX - rect.left,
          y: rect.bottom - clientY,
          elementWidth: rect.width,
          elementHeight: rect.height,
          isDown: true,
        }
      }

      const onDown = (e: MouseEvent | TouchEvent) =>
        setMouse(prev => (prev.isDown ? prev : position(e)))

      const onUp = (e: MouseEvent | TouchEvent) =>
        setMouse(prev =>
          !prev.isDown ? prev : Object.assign(position(e), {isDown: false})
        )

      let tick, ev
      const onMove = (e: MouseEvent | TouchEvent) => {
        ev = e // always use latest event despite ticks
        if (tick) return
        tick = raf(() => {
          setMouse(prev => (!prev.isDown ? prev : position(ev)))
          tick = void 0
        })
      }

      const docEl = window
      current.addEventListener('mousedown', onDown)
      docEl.addEventListener('mouseup', onUp)
      current.addEventListener('touchstart', onDown)
      docEl.addEventListener('touchend', onUp)
      docEl.addEventListener('mousemove', onMove)
      docEl.addEventListener('touchmove', onMove)

      return () => {
        current.removeEventListener('mousedown', onDown)
        docEl.removeEventListener('mouseup', onUp)
        current.removeEventListener('touchstart', onDown)
        docEl.removeEventListener('touchend', onUp)
        docEl.removeEventListener('mousemove', onMove)
        docEl.removeEventListener('touchmove', onMove)
        /* istanbul ignore next */
        tick && raf.cancel(tick)
      }
    }
  }, [mouseRef.current])

  useLayoutEffect(() => {
    if (
      mouse.x !== void 0 &&
      mouse.y !== void 0 &&
      mouse.elementWidth !== void 0 &&
      mouse.elementHeight !== void 0
    )
      set(
        (orientation === 'horizontal'
          ? mouse.x / mouse.elementWidth
          : mouse.y / mouse.elementHeight) * max
      )

    if (prevIsDown.current && !mouse.isDown) inputRef.current?.focus()
    prevIsDown.current = mouse.isDown
  }, [mouse, orientation])

  return mouseRef
}

/* istanbul ignore next */
if (__DEV__) {
  Slider.displayName = 'AccessibleSlider'
  Thumb.displayName = 'Thumb'
  Track.displayName = 'Track'
}
