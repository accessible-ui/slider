/* jest */
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {render, act, fireEvent} from '@testing-library/react'
import {
  Slider,
  Thumb,
  Track,
  useFocused,
  useControls,
  useValue,
  useDisabled,
  useOrientation,
} from './index'
import * as raf from 'raf'

beforeEach(raf.reset)

describe(`<Slider>`, () => {
  it('should provide context to function child', () => {
    let value

    render(
      <Slider>
        {context => {
          value = context
          return <div />
        }}
      </Slider>
    )

    expect(value).toMatchSnapshot('context')
  })

  it(`should add 'min' attribute to input`, () => {
    expect(
      render(
        <Slider min={20}>
          <div />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('min=20')
  })

  it(`should add 'max' attribute to input`, () => {
    expect(
      render(
        <Slider max={50}>
          <div />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('max=50')
  })

  it(`should add 'step' attribute to input`, () => {
    expect(
      render(
        <Slider step={2}>
          <div />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('step=2')
  })

  it(`should have defaultValue`, () => {
    expect(
      render(
        <Slider defaultValue={2}>
          <div />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('value=2')
  })

  it(`should have controlled value`, () => {
    expect(
      render(
        <Slider value={2}>
          <div />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('value=2')
  })

  it(`should round based upon the step`, () => {
    expect(
      render(
        <Slider step={5} defaultValue={42} disabled>
          <div />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('value=40')
  })

  it(`should throw if value < min`, () => {
    expect(() =>
      render(
        <Slider min={51} disabled>
          <div />
        </Slider>
      )
    ).toThrowErrorMatchingSnapshot()
  })

  it(`should throw if value > max`, () => {
    expect(() =>
      render(
        <Slider max={49} disabled>
          <div />
        </Slider>
      )
    ).toThrowErrorMatchingSnapshot()
  })

  it(`should override w/ child aria-hidden`, () => {
    expect(
      render(
        <Slider>
          <div aria-hidden="false" />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('aria-hidden=false')
  })

  it(`should add disabled attribute to input`, () => {
    expect(
      render(
        <Slider disabled>
          <div />
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('disabled=""')
  })

  it('should provide orientation to context', () => {
    let value

    render(
      <Slider orientation="vertical">
        {context => {
          value = context.orientation
          return <div />
        }}
      </Slider>
    )

    expect(value).toBe('vertical')
  })

  it('should provide disabled to context', () => {
    let value

    render(
      <Slider disabled>
        {context => {
          value = context.disabled
          return <div />
        }}
      </Slider>
    )

    expect(value).toBe(true)
  })

  it('should provide step to context', () => {
    let value

    render(
      <Slider step={2}>
        {context => {
          value = context.step
          return <div />
        }}
      </Slider>
    )

    expect(value).toBe(2)
  })

  it('should provide min to context', () => {
    let value

    render(
      <Slider min={2}>
        {context => {
          value = context.min
          return <div />
        }}
      </Slider>
    )

    expect(value).toBe(2)
  })

  it('should provide max to context', () => {
    let value

    render(
      <Slider max={200}>
        {context => {
          value = context.max
          return <div />
        }}
      </Slider>
    )

    expect(value).toBe(200)
  })

  it('should provide value to context', () => {
    let value

    render(
      <Slider defaultValue={20}>
        {context => {
          value = context.value
          return <div />
        }}
      </Slider>
    )

    expect(value).toBe(20)
  })
})

describe(`<Thumb>`, () => {
  it('should update progress when value changes', () => {
    const result = render(
      <Slider value={20}>
        <Thumb>
          <div />
        </Thumb>
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('20%')

    result.rerender(
      <Slider value={30}>
        <Thumb>
          <div />
        </Thumb>
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('30%')
  })

  it('should change position w/ orientation', () => {
    const result = render(
      <Slider orientation="horizontal" value={20}>
        <Thumb>
          <div />
        </Thumb>
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('left=20%')

    result.rerender(
      <Slider orientation="vertical" value={30}>
        <Thumb>
          <div />
        </Thumb>
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('bottom=30%')
  })

  it('should apply custom styles', () => {
    const result = render(
      <Slider>
        <Thumb>
          <div style={{transform: 'translateX(-50%)'}} />
        </Thumb>
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('transform')
  })

  it('should update value on change', () => {
    const {getByTestId, asFragment} = render(
      <Slider data-testid="slider">
        <div />
      </Slider>
    )

    fireEvent.change(getByTestId('slider'), {target: {value: 20}})
    expect(asFragment()).toMatchSnapshot('value=20')
  })
})

describe(`<Track>`, () => {
  const mockRect = values => {
    // @ts-ignore
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 300,
        height: 20,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        ...values,
      }
    })
  }

  const fireMouse = (node, eventType, values) => {
    node.dispatchEvent(
      new (eventType.includes('mouse') ? MouseEvent : TouchEvent)(eventType, {
        bubbles: true,
        cancelable: true,
        ...values,
      })
    )
  }

  it(`should respond to mouse events`, () => {
    mockRect({width: 300, right: 300, height: 20, top: 20})

    const {getByTestId, asFragment} = render(
      <Slider>
        <Track>
          <div data-testid="track" style={{width: 300, height: 20}} />
        </Track>
      </Slider>
    )

    fireEvent.mouseDown(getByTestId('track'), {clientX: 30, clientY: 10})
    expect(asFragment()).toMatchSnapshot('value=10')

    act(() => {
      fireMouse(window, 'mousemove', {clientX: 60, clientY: 10})
      raf.step({count: 1})
    })
    expect(asFragment()).toMatchSnapshot('value=20')

    act(() => {
      fireMouse(window, 'mouseup', {clientX: 120, clientY: 10})
    })
    expect(asFragment()).toMatchSnapshot('value=40')

    act(() => {
      fireMouse(window, 'mousemove', {clientX: 90, clientY: 10})
      raf.step({count: 1})
    })
    expect(asFragment()).toMatchSnapshot('value=40 [despite move]')
  })

  it(`should not respond to mousemove if current tick is unresolved`, () => {
    mockRect({width: 300, right: 300, height: 20, top: 20})

    const {getByTestId, asFragment} = render(
      <Slider>
        <Track>
          <div data-testid="track" style={{width: 300, height: 20}} />
        </Track>
      </Slider>
    )

    fireEvent.mouseDown(getByTestId('track'), {clientX: 150, clientY: 10})

    act(() => {
      fireMouse(window, 'mousemove', {clientX: 60, clientY: 10})
    })
    expect(asFragment()).toMatchSnapshot('value=50')

    act(() => {
      fireMouse(window, 'mousemove', {clientX: 90, clientY: 10})
    })
    expect(asFragment()).toMatchSnapshot('value=50 [despite move]')

    act(() => {
      raf.step({count: 1})
    })
    // should use the last event despite ticks
    expect(asFragment()).toMatchSnapshot('value=30')
  })

  it(`should respond to touch events`, () => {
    mockRect({width: 300, right: 300, height: 20, bottom: 20})

    const {getByTestId, asFragment} = render(
      <Slider>
        <Track>
          <div data-testid="track" style={{width: 300, height: 20}} />
        </Track>
      </Slider>
    )

    fireEvent.touchStart(getByTestId('track'), {
      changedTouches: [{clientX: 30, clientY: 10}],
    })
    expect(asFragment()).toMatchSnapshot('value=10')

    act(() => {
      fireMouse(window, 'touchmove', {
        changedTouches: [{clientX: 60, clientY: 10}],
      })
      raf.step({count: 1})
    })
    expect(asFragment()).toMatchSnapshot('value=20')

    act(() => {
      fireMouse(window, 'touchend', {
        changedTouches: [{clientX: 120, clientY: 10}],
      })
    })
    expect(asFragment()).toMatchSnapshot('value=40')

    act(() => {
      fireMouse(window, 'touchmove', {
        changedTouches: [{clientX: 90, clientY: 10}],
      })
      raf.step({count: 1})
    })
    expect(asFragment()).toMatchSnapshot('value=40 [despite move]')
  })

  it(`should not respond to up without a preceding down`, () => {
    mockRect({width: 300, right: 300, height: 20, top: 20})

    const {asFragment} = render(
      <Slider>
        <Track>
          <div data-testid="track" style={{width: 300, height: 20}} />
        </Track>
      </Slider>
    )

    act(() => {
      fireMouse(window, 'mouseup', {clientX: 120, clientY: 10})
    })
    expect(asFragment()).toMatchSnapshot('value=50 [despite up]')
  })

  it(`should not respond to down if already down`, () => {
    mockRect({width: 300, right: 300, height: 20, top: 20})

    const {getByTestId, asFragment} = render(
      <Slider>
        <Track>
          <div data-testid="track" style={{width: 300, height: 20}} />
        </Track>
      </Slider>
    )

    fireEvent.mouseDown(getByTestId('track'), {clientX: 30, clientY: 10})
    expect(asFragment()).toMatchSnapshot('value=10')
    fireEvent.mouseDown(getByTestId('track'), {clientX: 60, clientY: 10})
    expect(asFragment()).toMatchSnapshot('value=10 [despite down]')
  })

  it(`should change w/ orientation`, () => {
    mockRect({width: 20, right: 20, height: 300, bottom: 300})

    const {getByTestId, asFragment} = render(
      <Slider orientation="vertical">
        <Track>
          <div data-testid="track" style={{width: 20, height: 300}} />
        </Track>
      </Slider>
    )

    fireEvent.mouseDown(getByTestId('track'), {clientX: 10, clientY: 270})
    expect(asFragment()).toMatchSnapshot('value=10')

    act(() => {
      fireMouse(window, 'mousemove', {clientX: 10, clientY: 240})
      raf.step({count: 1})
    })
    expect(asFragment()).toMatchSnapshot('value=20')

    act(() => {
      fireMouse(window, 'mouseup', {clientX: 10, clientY: 180})
    })
    expect(asFragment()).toMatchSnapshot('value=40')

    act(() => {
      fireMouse(window, 'mousemove', {clientX: 10, clientY: 90})
      raf.step({count: 1})
    })
    expect(asFragment()).toMatchSnapshot('value=40 [despite move]')
  })

  it(`should apply custom styles`, () => {
    expect(
      render(
        <Slider>
          <Track>
            <div data-testid="track" style={{width: 20, height: 300}} />
          </Track>
        </Slider>
      ).asFragment()
    ).toMatchSnapshot('width=20, height=300')
  })
})

describe('useFocused()', () => {
  it('should be `true` when focused, `false` when blurred', () => {
    const Focusable = () => {
      return <>{String(useFocused())}</>
    }

    const result = render(
      <Slider data-testid="slider">
        <Focusable />
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('false')
    fireEvent.focus(result.getByTestId('slider'))
    expect(result.asFragment()).toMatchSnapshot('true')
    fireEvent.blur(result.getByTestId('slider'))
    expect(result.asFragment()).toMatchSnapshot('false')
  })
})

describe('useControls()', () => {
  it('should have `incr`, `decr`, `set` keys', () => {
    const {result} = renderHook(() => useControls(), {wrapper: Slider})
    expect(Object.keys(result.current)).toStrictEqual(['incr', 'decr', 'set'])
  })

  it('should change value', () => {
    const Component = () => {
      const {incr, decr, set} = useControls()
      return (
        <>
          <button data-testid="incr" onClick={() => incr()} />
          <button data-testid="decr" onClick={() => decr()} />
          <button data-testid="set" onClick={() => set(40)} />
        </>
      )
    }
    const result = render(
      <Slider data-testid="slider">
        <Component />
      </Slider>
    )

    fireEvent.click(result.getByTestId('incr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('51')
    fireEvent.click(result.getByTestId('decr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('50')
    fireEvent.click(result.getByTestId('set'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('40')
  })

  it('should change value w/ custom step', () => {
    const Component = () => {
      const {incr, decr} = useControls()
      return (
        <>
          <button data-testid="incr" onClick={() => incr(2)} />
          <button data-testid="decr" onClick={() => decr(3)} />
        </>
      )
    }
    const result = render(
      <Slider data-testid="slider">
        <Component />
      </Slider>
    )

    fireEvent.click(result.getByTestId('incr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('52')
    fireEvent.click(result.getByTestId('decr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('49')
  })

  it('should round value based upon step', () => {
    const Component = () => {
      const {incr, decr} = useControls()
      return (
        <>
          <button data-testid="incr" onClick={() => incr(2)} />
          <button data-testid="decr" onClick={() => decr(3)} />
        </>
      )
    }
    const result = render(
      <Slider step={5} data-testid="slider">
        <Component />
      </Slider>
    )

    fireEvent.click(result.getByTestId('incr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('50')
    fireEvent.click(result.getByTestId('decr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('45')
  })

  it('should not change value when disabled', () => {
    const Component = () => {
      const {incr, decr, set} = useControls()
      return (
        <>
          <button data-testid="incr" onClick={() => incr()} />
          <button data-testid="decr" onClick={() => decr()} />
          <button data-testid="set" onClick={() => set(40)} />
        </>
      )
    }
    const result = render(
      <Slider data-testid="slider" disabled>
        <Component />
      </Slider>
    )

    fireEvent.click(result.getByTestId('incr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('50')
    fireEvent.click(result.getByTestId('decr'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('50')
    fireEvent.click(result.getByTestId('set'))
    expect((result.getByTestId('slider') as HTMLInputElement).value).toBe('50')
  })
})

describe('useDisabled()', () => {
  it('should be `true` when disabled, `false` when enabled', () => {
    const Disabled = () => {
      return <>{String(useDisabled())}</>
    }

    const result = render(
      <Slider data-testid="slider">
        <Disabled />
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('false')

    result.rerender(
      <Slider data-testid="slider" disabled>
        <Disabled />
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('true')
  })
})

describe('useValue()', () => {
  it('should provide current value', () => {
    const Value = () => {
      return <>{String(useValue())}</>
    }

    const result = render(
      <Slider data-testid="slider" defaultValue={30}>
        <Value />
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('30')
  })
})

describe('useOrientation()', () => {
  it('should provide current orientation', () => {
    const Orientation = () => {
      return <>{String(useOrientation())}</>
    }

    const result = render(
      <Slider data-testid="slider" orientation="vertical">
        <Orientation />
      </Slider>
    )

    expect(result.asFragment()).toMatchSnapshot('vertical')
  })
})
