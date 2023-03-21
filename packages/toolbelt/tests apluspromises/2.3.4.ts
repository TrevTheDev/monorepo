/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable func-names */
/* eslint-disable no-extend-native */
/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { testFulfilled, testRejected } from './helpers/testThreeCases'

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

declare global {
  interface Boolean { then: any }
  interface Number { then: any }
}

describe('2.3.4: If `x` is not an object or function, fulfill `promise` with `x`', () => {
  function testValue(expectedValue, stringRepresentation, beforeEachHook?, afterEachHook?) {
    describe(`The value is ${stringRepresentation}`, () => {
      if (typeof beforeEachHook === 'function')
        beforeEach(beforeEachHook)

      if (typeof afterEachHook === 'function')
        afterEach(afterEachHook)

      testFulfilled(dummy, (promise1, done) => {
        const promise2 = promise1.then(() => expectedValue)

        promise2.then((actualValue) => {
          assert.strictEqual(actualValue, expectedValue)
          done()
        })
      })
      testRejected(dummy, (promise1, done) => {
        const promise2 = promise1.then(null, () => expectedValue)

        promise2.then((actualValue) => {
          assert.strictEqual(actualValue, expectedValue)
          done()
        })
      })
    })
  }

  testValue(undefined, '`undefined`')
  testValue(null, '`null`')
  testValue(false, '`false`')
  testValue(true, '`true`')
  testValue(0, '`0`')

  testValue(
    true,
    '`true` with `Boolean.prototype` modified to have a `then` method',
    () => {
      Boolean.prototype.then = function () {}
    },
    () => {
      delete Boolean.prototype.then
    },
  )

  testValue(
    1,
    '`1` with `Number.prototype` modified to have a `then` method',
    () => {
      Number.prototype.then = function () {}
    },
    () => {
      delete Number.prototype.then
    },
  )
})
