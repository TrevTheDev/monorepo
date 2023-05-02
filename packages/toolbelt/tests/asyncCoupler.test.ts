import { describe, it, expect } from 'vitest'
import { asyncCoupler, asyncCouplerWorkAround } from '../src/index'

// import type { AsyncCoupler } from '../src/index'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

describe('asyncCoupler', () => {
  it('example usage', () =>
    new Promise((done) => {
      // default asyncCouper has `addOutgoingCallback` and `addIncomingCallback` methods
      const coupler = asyncCoupler<(result: number) => void>()
      coupler.addOutgoingCallback((incomingCb) => incomingCb(1))
      coupler.addIncomingCallback(
        (result) => console.log(result), // 1
      )

      // renaming methods
      const cCoupler = asyncCoupler<
        (input: number) => void,
        {
          outgoingCallbackName: 'addA'
          incomingCallbackName: 'addB'
        }
      >({
        outgoingCallbackName: 'addA',
        incomingCallbackName: 'addB',
      })
      cCoupler.addA((incomingCb) => incomingCb(1))
      cCoupler.addB((result) => {
        console.log(result) // 1
        done(undefined)
      })

      // a workaround to reduce typing
      const cCouplerA = asyncCouplerWorkAround({
        outgoingCallbackName: 'addA',
        incomingCallbackName: 'addB',
      } as const)<(input: number) => void>()
      cCouplerA.addA((incomingCb) => incomingCb(1))
      cCouplerA.addB((result) => {
        console.log(result) // 1
        done(undefined)
      })
    }))
  it('asyncCoupler', () =>
    new Promise((done) => {
      let i = 1
      const coupler = asyncCoupler<(result: number) => number>()
      coupler.addIncomingCallback((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        return 3
      })
      coupler.addOutgoingCallback((incomingCb) => {
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
      const coupler = asyncCoupler<(result: number) => void>()
      coupler.addOutgoingCallback((incomingCb) => {
        console.log(`i: ${i}`)
        i += 1
        incomingCb(i)
      })
      coupler.addIncomingCallback((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        done(undefined)
      })
    }))
  it('throws an error for outgoingCallback', () => {
    const coupler = asyncCoupler<(result: number) => void>()
    coupler.addOutgoingCallback(noop)
    expect(() => coupler.addOutgoingCallback(noop)).to.throw('outgoingCallback already added')
  })
  it('throws an error for incomingCallback', () => {
    const coupler = asyncCoupler<(result: () => void) => void>()
    coupler.addIncomingCallback((res) => res())
    expect(() => coupler.addIncomingCallback((res) => res())).to.throw(
      'incomingCallback already added',
    )
  })
  it('customised methods', () =>
    new Promise((done) => {
      let i = 1
      const coupler = asyncCoupler<
        (input: number) => void,
        {
          outgoingCallbackName: 'addA'
          incomingCallbackName: 'addB'
        }
      >({
        outgoingCallbackName: 'addA',
        incomingCallbackName: 'addB',
      })
      coupler.addA((incomingCb) => {
        console.log(`i: ${i}`)
        i += 1
        incomingCb(i)
      })
      coupler.addB((result) => {
        console.log(`result: ${result}`)
        expect(result).to.equal(2)
        done(undefined)
      })
    }))
})
