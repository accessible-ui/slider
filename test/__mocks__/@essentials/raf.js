const createMockRaf = require('mock-raf')
export let mock = {_: createMockRaf()}
export let cancel = (...args) => mock._.cancel(...args)
export let step = (...args) => mock._.step(...args)
export const reset = () => {
  mock._ = createMockRaf()
}
export const raf = (cb) => mock._.raf(cb)
export const caf = cancel
