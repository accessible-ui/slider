<hr>
<div align="center">
  <h1 align="center">
    &lt;Slider&gt;
  </h1>
</div>

<p align="center">
  <a href="https://bundlephobia.com/result?p=@accessible/slider">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@accessible/slider?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/@accessible/slider">
    <img alt="Types" src="https://img.shields.io/npm/types/@accessible/slider?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Code coverage report" href="https://codecov.io/gh/accessible-ui/slider">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/accessible-ui/slider?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Build status" href="https://travis-ci.org/accessible-ui/slider">
    <img alt="Build status" src="https://img.shields.io/travis/accessible-ui/slider?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@accessible/slider">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@accessible/slider?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/@accessible/slider?style=for-the-badge&labelColor=24292e">
  </a>
</p>

<pre align="center">npm i @accessible/slider</pre>
<hr>

An accessible and versatile slider component for React. These components are touchable and
keyboard navigable.

This library contains components for single-thumb sliders out of the box, though you could feasibly fashion a
dual-thumb slider from what's here.

## Quick Start

[Check out the example on CodeSandbox](https://codesandbox.io/s/accessibleslider-example-vi94o)

```jsx harmony
import {Slider, Track, Thumb} from '@accessible/slider'

const Component = () => (
  <Slider orientation="vertical">
    <div className="slider">
      <Track>
        <div className="track">
          <Thumb>
            <div className="thumb" />
          </Thumb>
        </div>
      </Track>
    </div>
  </Slider>
)
```

## API

### `<Slider>`

Creates the context for your slider and configures it. This also creates the underlying
`<input type='range'>` component. Any props not listed below are provided to the `<input>`.

#### Props

| Prop         | Type                                         | Default        | Required? | Description                                                                                                                                                                              |
| ------------ | -------------------------------------------- | -------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| min          | `number`                                     | `0`            | Yes       | The minimum value of the slider                                                                                                                                                          |
| max          | `number`                                     | `100`          | Yes       | The maximum value of the slider                                                                                                                                                          |
| step         | `number`                                     | `1`            | Yes       | The amount the slider increases or decreases each time it is ticked                                                                                                                      |
| value        | `number`                                     | `undefined`    | No        | Makes this component controlled. This is always the value of the slider. `incr`, `decr`, `set` and keyboard steps have no effect.                                                        |
| defaultValue | `number`                                     | `50`           | No        | Sets the default value of the slider                                                                                                                                                     |
| orientation  | <code>"horizontal" &#0124; "vertical"</code> | `"horizontal"` | Yes       | Sets the orientation of the slider. When `horizontal` the minimum value is on the left, max on the right. When `vertical`, the minimum value is on the bottom and the max is on the top. |
| disabled     | `boolean`                                    | `false`        | No        | Disables the slider `incr`, `decr`, `set`, and keyboard controls. You can still update the slider's value using the `value` prop.                                                        |
| onChange     | `(value?: number) => any`                    | `undefined`    | No        | Called each time the `value` changes.                                                                                                                                                    |

### `<Track>`

This component attaches event handlers to its child that make it act like a native `<input type="range">` track. It
is your responsibility to style it.

#### Props

| Prop     | Type                 | Default     | Required? | Description                                                                                                                       |
| -------- | -------------------- | ----------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| children | `React.ReactElement` | `undefined` | Yes       | Provides events to its child component that control the state of the slider's value depending on the current drag/click position. |

### `<Thumb>`

This component adds styles to its child that update the child's position within a track based upon the
progress of the slider i.e. `value / max`.

#### Props

| Prop     | Type                 | Default     | Required? | Description                                             |
| -------- | -------------------- | ----------- | --------- | ------------------------------------------------------- |
| children | `React.ReactElement` | `undefined` | Yes       | The child component you want to add progress styles to. |

### `useSlider()`

A hook that provides the slider's [`SliderContext`](#slidercontextvalue)

### `SliderContextValue`

```typescript jsx
interface SliderContextValue {
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
```

### `useValue()`

A hook that returns the slider's current `value`

### `useProgress()`

A hook that returns the value of `value / max`

### `useOrientation()`

A hook that returns the slider's current orientation

### `useFocused()`

A hook that returns `true` if the slider is `focused`

### `useDisabled()`

A hook that returns `true` if the slider is `disabled`

### `useControls()`

A hook that provide's the slider's `incr`, `decr`, and `set` functions

## LICENSE

MIT
