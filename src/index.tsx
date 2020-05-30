import * as React from 'react'
import VisuallyHidden from '@accessible/visually-hidden'
import useMergedRef from '@react-hook/merged-ref'
import useLayoutEffect from '@react-hook/passive-layout-effect'
import {raf, caf} from '@essentials/raf'

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

const noop = () => {}
export const SliderContext = React.createContext<SliderContextValue>({
    incr: noop,
    decr: noop,
    set: noop,
    value: 0,
    min: 0,
    max: 0,
    step: 0,
    focused: false,
    disabled: false,
    orientation: 'horizontal',
    inputRef: {current: null},
  }),
  useSlider = () => React.useContext<SliderContextValue>(SliderContext),
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

const round = (value: number, step: number) => Math.round(value / step) * step

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
    const [valueState, setValue] = React.useState<number>(defaultValue)
    const [focused, setFocused] = React.useState<boolean>(false)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const value = round(
      controlledValue === void 0 ? valueState : controlledValue,
      step
    )

    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV !== 'production'
    ) {
      if (min > max) {
        throw new Error(
          `[AccessibleSlider] min value must be less than the max value`
        )
      }
      if (value > max) {
        throw new Error(
          `[AccessibleSlider] ${value} is greater than the max allowed: ${max}`
        )
      }
      if (value < min) {
        throw new Error(
          `[AccessibleSlider] ${value} is less than the min allowed: ${min}`
        )
      }
    }

    const context = React.useMemo(
      () => ({
        value,
        incr: (by = step) =>
          !disabled &&
          setValue((current) => Math.min(round(current + by, step), max)),
        decr: (by = step) =>
          !disabled &&
          setValue((current) => Math.max(round(current - by, step), min)),
        set: (next: number) =>
          !disabled &&
          setValue(Math.max(Math.min(round(next, step), max), min)),
        focused,
        disabled,
        orientation,
        min,
        max,
        step,
        inputRef,
      }),
      [value, focused, disabled, orientation, min, max, step, inputRef]
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
            step={step}
            disabled={disabled}
            onChange={(e) => {
              const nextValue = Number(e.target.value)
              setValue(nextValue)
              onChange?.(nextValue)
            }}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            ref={useMergedRef(ref, inputRef)}
            {...props}
          />
        </VisuallyHidden>

        {React.isValidElement(realChildren) &&
          React.cloneElement(realChildren, {
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
  return React.cloneElement(children, {
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
  const {value, max, min} = useSlider()
  return (value - min) / (max - min)
}

export interface TrackProps {
  children: React.ReactElement | JSX.Element
}

export const Track: React.FC<TrackProps> = ({children}) => {
  const mouseRef = useTrack()
  const props = children.props

  return React.cloneElement(children, {
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
  const {set, max, min, orientation, inputRef} = useSlider()
  const mouseRef = React.useRef<HTMLElement | null>(null)
  const [mouse, setMouse] = React.useState<MouseState>({isDown: false})
  const prevIsDown = React.useRef<boolean>(mouse.isDown)

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
        setMouse((prev) => (prev.isDown ? prev : position(e)))

      const onUp = (e: MouseEvent | TouchEvent) =>
        setMouse((prev) =>
          !prev.isDown ? prev : Object.assign(position(e), {isDown: false})
        )

      let tick: number | undefined, ev: MouseEvent | TouchEvent
      const onMove = (e: MouseEvent | TouchEvent) => {
        ev = e // always use latest event despite ticks
        if (tick) return
        tick = raf(() => {
          setMouse((prev) => (!prev.isDown ? prev : position(ev)))
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
        tick && caf(tick)
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (
      mouse.x !== void 0 &&
      mouse.y !== void 0 &&
      mouse.elementWidth !== void 0 &&
      mouse.elementHeight !== void 0
    ) {
      const progress =
        orientation === 'horizontal'
          ? mouse.x / mouse.elementWidth
          : mouse.y / mouse.elementHeight
      set(min + progress * (max - min))
    }

    if (prevIsDown.current && !mouse.isDown) inputRef.current?.focus()
    prevIsDown.current = mouse.isDown
  }, [inputRef, mouse, orientation, max, min, set])

  return mouseRef
}

/* istanbul ignore next */
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  Slider.displayName = 'AccessibleSlider'
  Thumb.displayName = 'Thumb'
  Track.displayName = 'Track'
}
