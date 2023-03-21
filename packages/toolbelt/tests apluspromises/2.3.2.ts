/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable mocha/no-nested-tests */
/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { promiseTestObject } from '../src/index'

const adapter = promiseTestObject
const { resolved, rejected, deferred } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

const sentinel = { sentinel: 'sentinel' } // a sentinel fulfillment value to test for with strict equality

function testPromiseResolution(xFactory, test) {
  specify('via return from a fulfilled promise', (done) => {
    const promise = resolved(dummy).then(() => xFactory())

    test(promise, done)
  })

  specify('via return from a rejected promise', (done) => {
    const promise = rejected(dummy).then(null, () => xFactory())

    test(promise, done)
  })
}

describe('2.3.2: If `x` is a promise, adopt its state', () => {
  describe(
    '2.3.2.1: If `x` is pending, `promise` must remain pending until `x` is fulfilled or rejected.',
    () => {
      function xFactory() {
        return deferred().promise
      }

      testPromiseResolution(xFactory, (promise, done) => {
        let wasFulfilled = false
        let wasRejected = false

        promise.then(
          () => {
            wasFulfilled = true
          },
          () => {
            wasRejected = true
          },
        )

        setTimeout(() => {
          assert.strictEqual(wasFulfilled, false)
          assert.strictEqual(wasRejected, false)
          done()
        }, 100)
      })
    },
  )

  describe('2.3.2.2: If/when `x` is fulfilled, fulfill `promise` with the same value.', () => {
    describe('`x` is already-fulfilled', () => {
      function xFactory() {
        return resolved(sentinel)
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then((value) => {
          assert.strictEqual(value, sentinel)
          done()
        })
      })
    })

    describe('`x` is eventually-fulfilled', () => {
      let d: any = null

      function xFactory() {
        d = deferred()
        setTimeout(() => {
          d.resolve(sentinel)
        }, 50)
        return d.promise
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then((value) => {
          assert.strictEqual(value, sentinel)
          done()
        })
      })
    })
  })

  describe('2.3.2.3: If/when `x` is rejected, reject `promise` with the same reason.', () => {
    describe('`x` is already-rejected', () => {
      function xFactory() {
        return rejected(sentinel)
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(null, (reason) => {
          assert.strictEqual(reason, sentinel)
          done()
        })
      })
    })

    describe('`x` is eventually-rejected', () => {
      let d:any = null

      function xFactory() {
        d = deferred()
        setTimeout(() => {
          d.reject(sentinel)
        }, 50)
        return d.promise
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(null, (reason) => {
          assert.strictEqual(reason, sentinel)
          done()
        })
      })
    })
  })
})
