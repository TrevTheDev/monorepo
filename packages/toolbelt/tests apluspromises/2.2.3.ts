/* eslint-disable no-plusplus */
/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { testRejected } from './helpers/testThreeCases'
import { promiseTestObject } from '../src/index'

const adapter = promiseTestObject
const { rejected, deferred } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: 'sentinel' } // a sentinel fulfillment value to test for with strict equality

describe('2.2.3: If `onRejected` is a function,', () => {
  describe('2.2.3.1: it must be called after `promise` is rejected, with `promise`’s rejection reason as its '
             + 'first argument.', () => {
    testRejected(sentinel, (promise, done) => {
      promise.then(null, (reason) => {
        assert.strictEqual(reason, sentinel)
        done()
      })
    })
  })

  describe('2.2.3.2: it must not be called before `promise` is rejected', () => {
    specify('rejected after a delay', (done) => {
      const d = deferred()
      let isRejected = false

      d.promise.then(null, (() => {
        assert.strictEqual(isRejected, true)
        done()
      }) as never)

      setTimeout(() => {
        d.reject(dummy)
        isRejected = true
      }, 50)
    })

    specify('never rejected', (done) => {
      const d = deferred()
      let onRejectedCalled = false

      d.promise.then(null, (() => {
        onRejectedCalled = true
        done()
      }) as never)

      setTimeout(() => {
        assert.strictEqual(onRejectedCalled, false)
        done()
      }, 150)
    })
  })

  describe('2.2.3.3: it must not be called more than once.', () => {
    specify('already-rejected', (done) => {
      let timesCalled = 0

      rejected(dummy).then(null, (() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      }) as never)
    })

    specify('trying to reject a pending promise more than once, immediately', (done) => {
      const d = deferred()
      let timesCalled = 0

      d.promise.then(null, (() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      }) as never)

      d.reject(dummy)
      d.reject(dummy)
    })

    specify('trying to reject a pending promise more than once, delayed', (done) => {
      const d = deferred()
      let timesCalled = 0

      d.promise.then(null, (() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      })as never)

      setTimeout(() => {
        d.reject(dummy)
        d.reject(dummy)
      }, 50)
    })

    specify('trying to reject a pending promise more than once, immediately then delayed', (done) => {
      const d = deferred()
      let timesCalled = 0

      d.promise.then(null, (() => {
        assert.strictEqual(++timesCalled, 1)
        done()
      }) as never)

      d.reject(dummy)
      setTimeout(() => {
        d.reject(dummy)
      }, 50)
    })

    specify('when multiple `then` calls are made, spaced apart in time', (done) => {
      const d = deferred()
      const timesCalled = [0, 0, 0]

      d.promise.then(null, (() => {
        assert.strictEqual(++timesCalled[0], 1)
      }) as never)

      setTimeout(() => {
        d.promise.then(null, (() => {
          assert.strictEqual(++timesCalled[1], 1)
        }) as never)
      }, 50)

      setTimeout(() => {
        d.promise.then(null, (() => {
          assert.strictEqual(++timesCalled[2], 1)
          done()
        }) as never)
      }, 100)

      setTimeout(() => {
        d.reject(dummy)
      }, 150)
    })

    specify('when `then` is interleaved with rejection', (done) => {
      const d = deferred()
      const timesCalled = [0, 0]

      d.promise.then(null, (() => {
        assert.strictEqual(++timesCalled[0], 1)
      }) as never)

      d.reject(dummy)

      d.promise.then(null, (() => {
        assert.strictEqual(++timesCalled[1], 1)
        done()
      }) as never)
    })
  })
})
