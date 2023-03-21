/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { testFulfilled } from './helpers/testThreeCases'
import { promiseTestObject } from '../src/index'

const adapter = promiseTestObject
const { deferred } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

describe('2.1.2.1: When fulfilled, a promise: must not transition to any other state.', () => {
  testFulfilled(dummy, (promise, done) => {
    let onFulfilledCalled = false

    promise.then(() => {
      onFulfilledCalled = true
    }, () => {
      assert.strictEqual(onFulfilledCalled, false)
      done()
    })

    setTimeout(done, 100)
  })

  specify('trying to fulfill then immediately reject', (done) => {
    const d = deferred()
    let onFulfilledCalled = false

    d.promise.then(
      () => { onFulfilledCalled = true },
      (() => {
        assert.strictEqual(onFulfilledCalled, false)
        done()
      }) as never,
    )

    d.resolve(dummy)
    d.reject(dummy)
    setTimeout(done, 100)
  })

  specify('trying to fulfill then reject, delayed', (done) => {
    const d = deferred()
    let onFulfilledCalled = false

    d.promise.then(() => {
      onFulfilledCalled = true
    }, (() => {
      assert.strictEqual(onFulfilledCalled, false)
      done()
    }) as never)

    setTimeout(() => {
      d.resolve(dummy)
      d.reject(dummy)
    }, 50)
    setTimeout(done, 100)
  })

  specify('trying to fulfill immediately then reject delayed', (done) => {
    const d = deferred()
    let onFulfilledCalled = false

    d.promise.then(() => {
      onFulfilledCalled = true
    }, (() => {
      assert.strictEqual(onFulfilledCalled, false)
      done()
    }) as never)

    d.resolve(dummy)
    setTimeout(() => {
      d.reject(dummy)
    }, 50)
    setTimeout(done, 100)
  })
})
