/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { testRejected } from './helpers/testThreeCases'
import { promiseTestObject } from '../src/index'

const adapter = promiseTestObject
const { deferred } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

describe('2.1.3.1: When rejected, a promise: must not transition to any other state.', () => {
  testRejected(dummy, (promise, done) => {
    let onRejectedCalled = false

    promise.then(() => {
      assert.strictEqual(onRejectedCalled, false)
      done()
    }, () => {
      onRejectedCalled = true
    })

    setTimeout(done, 100)
  })

  specify('trying to reject then immediately fulfill', (done) => {
    const d = deferred()
    let onRejectedCalled = false

    d.promise.then(() => {
      assert.strictEqual(onRejectedCalled, false)
      done()
    }, (() => {
      onRejectedCalled = true
    }) as never)

    d.reject(dummy)
    d.resolve(dummy)
    setTimeout(done, 100)
  })

  specify('trying to reject then fulfill, delayed', (done) => {
    const d = deferred()
    let onRejectedCalled = false

    d.promise.then(() => {
      assert.strictEqual(onRejectedCalled, false)
      done()
    }, (() => {
      onRejectedCalled = true
    }) as never)

    setTimeout(() => {
      d.reject(dummy)
      d.resolve(dummy)
    }, 50)
    setTimeout(done, 100)
  })

  specify('trying to reject immediately then fulfill delayed', (done) => {
    const d = deferred()
    let onRejectedCalled = false

    d.promise.then(() => {
      assert.strictEqual(onRejectedCalled, false)
      done()
    }, (() => {
      onRejectedCalled = true
    }) as never)

    d.reject(dummy)
    setTimeout(() => {
      d.resolve(dummy)
    }, 50)
    setTimeout(done, 100)
  })
})
