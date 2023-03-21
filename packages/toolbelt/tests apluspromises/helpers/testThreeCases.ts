/* eslint-disable mocha/no-nested-tests */
/* eslint-disable mocha/no-exports */
import { promiseTestObject } from '../../src/index'

const adapter = promiseTestObject
const { resolved, rejected, deferred } = adapter

export function testFulfilled(value, test) {
  specify('already-fulfilled', (done) => {
    test(resolved(value), done)
  })

  specify('immediately-fulfilled', (done) => {
    const d = deferred()
    test(d.promise, done)
    d.resolve(value)
  })

  specify('eventually-fulfilled', (done) => {
    const d = deferred()
    test(d.promise, done)
    setTimeout(() => {
      d.resolve(value)
    }, 50)
  })
}

export function testRejected(reason, test) {
  specify('already-rejected', (done) => {
    test(rejected(reason), done)
  })

  specify('immediately-rejected', (done) => {
    const d = deferred()
    test(d.promise, done)
    d.reject(reason)
  })

  specify('eventually-rejected', (done) => {
    const d = deferred()
    test(d.promise, done)
    setTimeout(() => {
      d.reject(reason)
    }, 50)
  })
}
