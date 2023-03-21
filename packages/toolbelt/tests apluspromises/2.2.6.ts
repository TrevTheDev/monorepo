/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-plusplus */
/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import sinon from 'sinon'
import { testFulfilled, testRejected } from './helpers/testThreeCases'

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it
const other = { other: 'other' } // a value we don't want to be strict equal to
const sentinel = { sentinel: 'sentinel' } // a sentinel fulfillment value to test for with strict equality
const sentinel2 = { sentinel2: 'sentinel2' }
const sentinel3 = { sentinel3: 'sentinel3' }

function callbackAggregator(times, ultimateCallback) {
  let soFar = 0
  return () => {
    if (++soFar === times)
      ultimateCallback()
  }
}

describe('2.2.6: `then` may be called multiple times on the same promise.', () => {
  describe('2.2.6.1: If/when `promise` is fulfilled, all respective `onFulfilled` callbacks must execute in the '
             + 'order of their originating calls to `then`.', () => {
    describe('multiple boring fulfillment handlers', () => {
      testFulfilled(sentinel, (promise, done) => {
        const handler1 = sinon.stub().returns(other)
        const handler2 = sinon.stub().returns(other)
        const handler3 = sinon.stub().returns(other)

        const spy = sinon.spy()
        promise.then(handler1, spy)
        promise.then(handler2, spy)
        promise.then(handler3, spy)

        promise.then((value) => {
          assert.strictEqual(value, sentinel)

          sinon.assert.calledWith(handler1, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler2, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler3, sinon.match.same(sentinel))
          sinon.assert.notCalled(spy)

          done()
        })
      })
    })

    describe('multiple fulfillment handlers, one of which throws', () => {
      testFulfilled(sentinel, (promise, done) => {
        const handler1 = sinon.stub().returns(other)
        const handler2 = sinon.stub().throws(other)
        const handler3 = sinon.stub().returns(other)

        const spy = sinon.spy()
        promise.then(handler1, spy)
        promise.then(handler2, spy)
        promise.then(handler3, spy)

        promise.then((value) => {
          assert.strictEqual(value, sentinel)

          sinon.assert.calledWith(handler1, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler2, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler3, sinon.match.same(sentinel))
          sinon.assert.notCalled(spy)

          done()
        })
      })
    })

    describe('results in multiple branching chains with their own fulfillment values', () => {
      testFulfilled(dummy, (promise, done) => {
        const semiDone = callbackAggregator(3, done)

        promise.then(() => sentinel).then((value) => {
          assert.strictEqual(value, sentinel)
          semiDone()
        })

        promise.then(() => {
          throw sentinel2
        }).then(null, (reason) => {
          assert.strictEqual(reason, sentinel2)
          semiDone()
        })

        promise.then(() => sentinel3).then((value) => {
          assert.strictEqual(value, sentinel3)
          semiDone()
        })
      })
    })

    describe('`onFulfilled` handlers are called in the original order', () => {
      testFulfilled(dummy, (promise, done) => {
        const handler1 = sinon.spy(() => {})
        const handler2 = sinon.spy(() => {})
        const handler3 = sinon.spy(() => {})

        promise.then(handler1)
        promise.then(handler2)
        promise.then(handler3)

        promise.then(() => {
          sinon.assert.callOrder(handler1, handler2, handler3)
          done()
        })
      })

      describe('even when one handler is added inside another handler', () => {
        testFulfilled(dummy, (promise, done) => {
          const handler1 = sinon.spy(() => {})
          const handler2 = sinon.spy(() => {})
          const handler3 = sinon.spy(() => {})

          promise.then(() => {
            handler1()
            promise.then(handler3)
          })
          promise.then(handler2)

          promise.then(() => {
            // Give implementations a bit of extra time to flush their internal queue, if necessary.
            setTimeout(() => {
              sinon.assert.callOrder(handler1, handler2, handler3)
              done()
            }, 15)
          })
        })
      })
    })
  })

  describe('2.2.6.2: If/when `promise` is rejected, all respective `onRejected` callbacks must execute in the '
             + 'order of their originating calls to `then`.', () => {
    describe('multiple boring rejection handlers', () => {
      testRejected(sentinel, (promise, done) => {
        const handler1 = sinon.stub().returns(other)
        const handler2 = sinon.stub().returns(other)
        const handler3 = sinon.stub().returns(other)

        const spy = sinon.spy()
        promise.then(spy, handler1)
        promise.then(spy, handler2)
        promise.then(spy, handler3)

        promise.then(null, (reason) => {
          assert.strictEqual(reason, sentinel)

          sinon.assert.calledWith(handler1, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler2, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler3, sinon.match.same(sentinel))
          sinon.assert.notCalled(spy)

          done()
        })
      })
    })

    describe('multiple rejection handlers, one of which throws', () => {
      testRejected(sentinel, (promise, done) => {
        const handler1 = sinon.stub().returns(other)
        const handler2 = sinon.stub().throws(other)
        const handler3 = sinon.stub().returns(other)

        const spy = sinon.spy()
        promise.then(spy, handler1)
        promise.then(spy, handler2)
        promise.then(spy, handler3)

        promise.then(null, (reason) => {
          assert.strictEqual(reason, sentinel)

          sinon.assert.calledWith(handler1, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler2, sinon.match.same(sentinel))
          sinon.assert.calledWith(handler3, sinon.match.same(sentinel))
          sinon.assert.notCalled(spy)

          done()
        })
      })
    })

    describe('results in multiple branching chains with their own fulfillment values', () => {
      testRejected(sentinel, (promise, done) => {
        const semiDone = callbackAggregator(3, done)

        promise.then(null, () => sentinel).then((value) => {
          assert.strictEqual(value, sentinel)
          semiDone()
        })

        promise.then(null, () => {
          throw sentinel2
        }).then(null, (reason) => {
          assert.strictEqual(reason, sentinel2)
          semiDone()
        })

        promise.then(null, () => sentinel3).then((value) => {
          assert.strictEqual(value, sentinel3)
          semiDone()
        })
      })
    })

    describe('`onRejected` handlers are called in the original order', () => {
      testRejected(dummy, (promise, done) => {
        const handler1 = sinon.spy(() => {})
        const handler2 = sinon.spy(() => {})
        const handler3 = sinon.spy(() => {})

        promise.then(null, handler1)
        promise.then(null, handler2)
        promise.then(null, handler3)

        promise.then(null, () => {
          sinon.assert.callOrder(handler1, handler2, handler3)
          done()
        })
      })

      describe('even when one handler is added inside another handler', () => {
        testRejected(dummy, (promise, done) => {
          const handler1 = sinon.spy(() => {})
          const handler2 = sinon.spy(() => {})
          const handler3 = sinon.spy(() => {})

          promise.then(null, () => {
            handler1()
            promise.then(null, handler3)
          })
          promise.then(null, handler2)

          promise.then(null, () => {
            // Give implementations a bit of extra time to flush their internal queue, if necessary.
            setTimeout(() => {
              sinon.assert.callOrder(handler1, handler2, handler3)
              done()
            }, 15)
          })
        })
      })
    })
  })
})
