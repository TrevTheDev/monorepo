/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { testFulfilled, testRejected } from './helpers/testThreeCases'
import { promiseTestObject } from '../src/index'

const adapter = promiseTestObject
const { resolved, rejected, deferred } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

describe('2.2.4: `onFulfilled` or `onRejected` must not be called until the execution context stack contains only '
         + 'platform code.', () => {
  describe('`then` returns before the promise becomes fulfilled or rejected', () => {
    testFulfilled(dummy, (promise, done) => {
      let thenHasReturned = false

      promise.then(() => {
        assert.strictEqual(thenHasReturned, true)
        done()
      })

      thenHasReturned = true
    })
    testRejected(dummy, (promise, done) => {
      let thenHasReturned = false

      promise.then(null, () => {
        assert.strictEqual(thenHasReturned, true)
        done()
      })

      thenHasReturned = true
    })
  })

  describe('Clean-stack execution ordering tests (fulfillment case)', () => {
    specify(
      'when `onFulfilled` is added immediately before the promise is fulfilled',
      () => {
        const d = deferred()
        let onFulfilledCalled = false

        d.promise.then(() => {
          onFulfilledCalled = true
        })

        d.resolve(dummy)

        assert.strictEqual(onFulfilledCalled, false)
      },
    )

    specify(
      'when `onFulfilled` is added immediately after the promise is fulfilled',
      () => {
        const d = deferred()
        let onFulfilledCalled = false

        d.resolve(dummy)

        d.promise.then(() => {
          onFulfilledCalled = true
        })

        assert.strictEqual(onFulfilledCalled, false)
      },
    )

    specify('when one `onFulfilled` is added inside another `onFulfilled`', (done) => {
      const promise = resolved()
      let firstOnFulfilledFinished = false

      promise.then(() => {
        promise.then(() => {
          assert.strictEqual(firstOnFulfilledFinished, true)
          done()
        })
        firstOnFulfilledFinished = true
      })
    })

    specify('when `onFulfilled` is added inside an `onRejected`', (done) => {
      const promise = rejected()
      const promise2 = resolved()
      let firstOnRejectedFinished = false

      promise.then(null, () => {
        promise2.then(() => {
          assert.strictEqual(firstOnRejectedFinished, true)
          done()
        })
        firstOnRejectedFinished = true
      })
    })

    specify('when the promise is fulfilled asynchronously', (done) => {
      const d = deferred()
      let firstStackFinished = false

      setTimeout(() => {
        d.resolve(dummy)
        firstStackFinished = true
      }, 0)

      d.promise.then(() => {
        assert.strictEqual(firstStackFinished, true)
        done()
      })
    })
  })

  describe('Clean-stack execution ordering tests (rejection case)', () => {
    specify(
      'when `onRejected` is added immediately before the promise is rejected',
      () => {
        const d = deferred()
        let onRejectedCalled = false

        d.promise.then(null, () => {
          onRejectedCalled = true
        })

        d.reject(dummy)

        assert.strictEqual(onRejectedCalled, false)
      },
    )

    specify(
      'when `onRejected` is added immediately after the promise is rejected',
      () => {
        const d = deferred()
        let onRejectedCalled = false

        d.reject(dummy)

        d.promise.then(null, () => {
          onRejectedCalled = true
        })

        assert.strictEqual(onRejectedCalled, false)
      },
    )

    specify('when `onRejected` is added inside an `onFulfilled`', (done) => {
      const promise = resolved()
      const promise2 = rejected()
      let firstOnFulfilledFinished = false

      promise.then(() => {
        promise2.then(null, () => {
          assert.strictEqual(firstOnFulfilledFinished, true)
          done()
        })
        firstOnFulfilledFinished = true
      })
    })

    specify('when one `onRejected` is added inside another `onRejected`', (done) => {
      const promise = rejected()
      let firstOnRejectedFinished = false

      promise.then(null, () => {
        promise.then(null, () => {
          assert.strictEqual(firstOnRejectedFinished, true)
          done()
        })
        firstOnRejectedFinished = true
      })
    })

    specify('when the promise is rejected asynchronously', (done) => {
      const d = deferred()
      let firstStackFinished = false

      setTimeout(() => {
        d.reject(dummy)
        firstStackFinished = true
      }, 0)

      d.promise.then(null, () => {
        assert.strictEqual(firstStackFinished, true)
        done()
      })
    })
  })
})
