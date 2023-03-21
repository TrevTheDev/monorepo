/* eslint-disable no-plusplus */
/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { testFulfilled } from './helpers/testThreeCases'
import { promiseTestObject } from '../src/index'

const adapter = promiseTestObject
const { resolved, deferred } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: 'sentinel' } // a sentinel fulfillment value to test for with strict equality

describe('2.2.2: If `onFulfilled` is a function,', () => {
  describe('2.2.2.1: it must be called after `promise` is fulfilled, with `promise`’s fulfillment value as its '
             + 'first argument.', () => {
    testFulfilled(sentinel, (promise, done) => {
      promise.then((value) => {
        assert.strictEqual(value, sentinel)
        done()
      })
    })
  })

  describe('2.2.2.2: it must not be called before `promise` is fulfilled', () => {
    specify('fulfilled after a delay', (done) => {
      const d = deferred()
      let isFulfilled = false

      d.promise.then(() => {
        assert.strictEqual(isFulfilled, true)
        done()
      })

      setTimeout(() => {
        d.resolve(dummy)
        isFulfilled = true
      }, 50)
    })

    specify('never fulfilled', (done) => {
      const d = deferred()
      let onFulfilledCalled = false

      d.promise.then(() => {
        onFulfilledCalled = true
        done()
      })

      setTimeout(() => {
        assert.strictEqual(onFulfilledCalled, false)
        done()
      }, 150)
    })
  })

  describe('2.2.2.3: it must not be called more than once.', () => {
    specify('already-fulfilled', (done) => {
      let timesCalled = 0

      resolved(dummy).then(() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      })
    })

    specify('trying to fulfill a pending promise more than once, immediately', (done) => {
      const d = deferred()
      let timesCalled = 0

      d.promise.then(() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      })

      d.resolve(dummy)
      d.resolve(dummy)
    })

    specify('trying to fulfill a pending promise more than once, delayed', (done) => {
      const d = deferred()
      let timesCalled = 0

      d.promise.then(() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      })

      setTimeout(() => {
        d.resolve(dummy)
        d.resolve(dummy)
      }, 50)
    })

    specify('trying to fulfill a pending promise more than once, immediately then delayed', (done) => {
      const d = deferred()
      let timesCalled = 0

      d.promise.then(() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      })

      d.resolve(dummy)
      setTimeout(() => {
        d.resolve(dummy)
      }, 50)
    })

    specify('when multiple `then` calls are made, spaced apart in time', (done) => {
      const d = deferred()
      const timesCalled = [0, 0, 0]

      d.promise.then(() => {
        assert.strictEqual(++timesCalled[0], 1)
      })

      setTimeout(() => {
        d.promise.then(() => {
          assert.strictEqual(++timesCalled[1], 1)
        })
      }, 50)

      setTimeout(() => {
        d.promise.then(() => {
          assert.strictEqual(++timesCalled[2], 1)
          done()
        })
      }, 100)

      setTimeout(() => {
        d.resolve(dummy)
      }, 150)
    })

    specify('when `then` is interleaved with fulfillment', (done) => {
      const d = deferred()
      const timesCalled = [0, 0]

      d.promise.then(() => {
        assert.strictEqual(++timesCalled[0], 1)
      })

      d.resolve(dummy)

      d.promise.then(() => {
        assert.strictEqual(++timesCalled[1], 1)
        done()
      })
    })
  })
})
