/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { promiseTestObject } from '../src/index'

const adapter = promiseTestObject
const { resolved, rejected } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

describe(
  "2.3.1: If `promise` and `x` refer to the same object, reject `promise` with a `TypeError' as the reason.",
  () => {
    specify('via return from a fulfilled promise', (done) => {
      const promise = resolved(dummy).then(() => promise)

      promise.then(null, (reason) => {
        assert(reason instanceof TypeError)
        done()
      })
    })

    specify('via return from a rejected promise', (done) => {
      const promise = rejected(dummy).then(null, () => promise)

      promise.then(null, (reason) => {
        assert(reason instanceof TypeError)
        done()
      })
    })
  },
)
