import { it, expect } from 'vitest'
import { asyncCoupler } from '../src'

console.log(it)
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

it('example usage2ssd', () =>
  new Promise((done) => {
    // default asyncCoupler has `addPayload` and `addAwaitPayload` methods
    const coupler = asyncCoupler<[number]>()
    coupler.addPayload(1)
    coupler.addAwaitPayload((result: number) => expect(result).toBe(1))

    // renaming methods:
    const customCoupler = asyncCoupler(
      {
        addPayloadName: 'addNumbers',
        addAwaitPayloadName: 'awaitNumbers',
      },
      undefined as unknown as number, // hack to simplify generic typing
    )
    customCoupler.addNumbers(1)
    customCoupler.awaitNumbers((result) => {
      expect(result).toBe(1)
      done(undefined)
    })
  }))
it('asyncCoupler', () =>
  new Promise((done) => {
    let i = 1
    const coupler = asyncCoupler<[(result: number) => number]>()
    coupler.addPayload((result) => {
      console.log(`result: ${result}`)
      expect(result).to.equal(2)
      return 3
    })
    coupler.addAwaitPayload((incomingCb) => {
      console.log(`i: ${i}`)
      i += 1
      const x = incomingCb(i)
      expect(x).to.equal(3)
      done(undefined)
    })
  }))
it('asyncCouple other way around', () =>
  new Promise((done) => {
    let i = 1
    const coupler = asyncCoupler<[(cb: (cb2: number) => void) => void]>()
    coupler.addPayload((incomingCb) => {
      console.log(`i: ${i}`)
      i += 1
      incomingCb(i)
    })
    coupler.addAwaitPayload((callback) => {
      callback((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        done(undefined)
      })
    })
  }))
it('throws an error for addAwaitPayload', () => {
  const coupler = asyncCoupler<[(result: number) => void]>()
  coupler.addAwaitPayload(noop)
  expect(() => coupler.addAwaitPayload(noop)).to.throw('addAwaitPayload already added')
})
it('throws an error for addPayload', () => {
  const coupler = asyncCoupler<[(result: () => void) => void]>()
  coupler.addPayload((res) => res())
  expect(() => coupler.addPayload((res) => res())).to.throw('previous addPayload not yet called')
})
it('customised methods', () =>
  new Promise((done) => {
    let i = 1
    const coupler = asyncCoupler(
      {
        addPayloadName: 'addNumberFn',
        addAwaitPayloadName: 'addB',
      },
      undefined as unknown as (cb: (input: number) => void) => void,
    )
    coupler.addNumberFn((incomingCb) => {
      console.log(`i: ${i}`)
      i += 1
      incomingCb(i)
    })
    coupler.addB((cb) => {
      cb((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        done(undefined)
      })
    })
  }))
it('with state', () => {
  const coupler = asyncCoupler({ withState: true, indexed: true }, undefined as unknown as number)
  expect(coupler.state).toBe('in progress')
  expect(coupler.addPayload([1], 0)).toBe(undefined)
  coupler.addAwaitPayload((result) => expect(result).toBe(1))
  expect(coupler.state).toBe('in progress')
  expect(() => coupler.addPayload([2], 0)).toThrow()
  coupler.end()
  expect(coupler.state).toBe('ended')
  expect(() => coupler.end()).toThrow()
  expect(() => coupler.error()).toThrow()
})
