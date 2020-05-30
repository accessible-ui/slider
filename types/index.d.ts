import * as React from 'react'
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
export declare const SliderContext: React.Context<SliderContextValue>,
  useSlider: () => SliderContextValue,
  useValue: () => number,
  useOrientation: () => 'horizontal' | 'vertical',
  useFocused: () => boolean,
  useDisabled: () => boolean,
  useControls: () => {
    incr: (by?: number | undefined) => void
    decr: (by?: number | undefined) => void
    set: (value: number) => void
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
export declare const Slider: React.FC<SliderProps>
export interface ThumbProps {
  children: React.ReactElement | JSX.Element
}
export declare const Thumb: React.FC<ThumbProps>
export declare const useProgress: () => number
export interface TrackProps {
  children: React.ReactElement | JSX.Element
}
export declare const Track: React.FC<TrackProps>
