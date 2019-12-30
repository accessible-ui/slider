const createMockRaf = require('mock-raf')
export let mock = {_: createMockRaf()}
export let cancel = (...args) => mock._.cancel(...args)
export let step = (...args) => mock._.step(...args)
export const reset = () => {
  mock._ = createMockRaf()
}
const raf = cb => mock._.raf(cb)
raf.cancel = cancel
export default raf
