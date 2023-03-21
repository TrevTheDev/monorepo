/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-plusplus */
/* eslint-disable mocha/no-nested-tests */
/* eslint-disable mocha/no-setup-in-describe */
import assert from 'assert'

import { promiseTestObject } from '../src/index'

import * as thenables from './helpers/thenables'
import reasons from './helpers/reasons'

const adapter = promiseTestObject
const { resolved, rejected, deferred } = adapter

const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it
const sentinel = { sentinel: 'sentinel' } // a sentinel fulfillment value to test for with strict equality
const other = { other: 'other' } // a value we don't want to be strict equal to
const sentinelArray = [sentinel] // a sentinel fulfillment value to test when we need an array

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

function testCallingResolvePromise(yFactory, stringRepresentation, test) {
  describe(`\`y\` is ${stringRepresentation}`, () => {
    describe('`then` calls `resolvePromise` synchronously', () => {
      function xFactory() {
        return {
          then(resolvePromise) {
            resolvePromise(yFactory())
          },
        }
      }

      testPromiseResolution(xFactory, test)
    })

    describe('`then` calls `resolvePromise` asynchronously', () => {
      function xFactory() {
        return {
          then(resolvePromise) {
            setTimeout(() => {
              resolvePromise(yFactory())
            }, 0)
          },
        }
      }

      testPromiseResolution(xFactory, test)
    })
  })
}

function testCallingRejectPromise(r, stringRepresentation, test) {
  describe(`\`r\` is ${stringRepresentation}`, () => {
    describe('`then` calls `rejectPromise` synchronously', () => {
      function xFactory() {
        return {
          then(_resolvePromise, rejectPromise) {
            rejectPromise(r)
          },
        }
      }

      testPromiseResolution(xFactory, test)
    })

    describe('`then` calls `rejectPromise` asynchronously', () => {
      function xFactory() {
        return {
          then(_resolvePromise, rejectPromise) {
            setTimeout(() => {
              rejectPromise(r)
            }, 0)
          },
        }
      }

      testPromiseResolution(xFactory, test)
    })
  })
}

function testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, fulfillmentValue) {
  testCallingResolvePromise(yFactory, stringRepresentation, (promise, done) => {
    promise.then((value) => {
      assert.strictEqual(value, fulfillmentValue)
      done()
    })
  })
}

function testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, rejectionReason) {
  testCallingResolvePromise(yFactory, stringRepresentation, (promise, done) => {
    promise.then(null, (reason) => {
      assert.strictEqual(reason, rejectionReason)
      done()
    })
  })
}

function testCallingRejectPromiseRejectsWith(reason, stringRepresentation) {
  testCallingRejectPromise(reason, stringRepresentation, (promise, done) => {
    promise.then(null, (rejectionReason) => {
      assert.strictEqual(rejectionReason, reason)
      done()
    })
  })
}

describe('2.3.3: Otherwise, if `x` is an object or function,', () => {
  describe('2.3.3.1: Let `then` be `x.then`', () => {
    describe('`x` is an object with null prototype', () => {
      let numberOfTimesThenWasRetrieved:any = null

      beforeEach(() => {
        numberOfTimesThenWasRetrieved = 0
      })

      function xFactory() {
        return Object.create(null, {
          then: {
            get() {
              ++numberOfTimesThenWasRetrieved
              return function thenMethodForX(onFulfilled) {
                onFulfilled()
              }
            },
          },
        })
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(() => {
          assert.strictEqual(numberOfTimesThenWasRetrieved, 1)
          done()
        })
      })
    })

    describe('`x` is an object with normal Object.prototype', () => {
      let numberOfTimesThenWasRetrieved: any = null

      beforeEach(() => {
        numberOfTimesThenWasRetrieved = 0
      })

      function xFactory() {
        return Object.create(Object.prototype, {
          then: {
            get() {
              ++numberOfTimesThenWasRetrieved
              return function thenMethodForX(onFulfilled) {
                onFulfilled()
              }
            },
          },
        })
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(() => {
          assert.strictEqual(numberOfTimesThenWasRetrieved, 1)
          done()
        })
      })
    })

    describe('`x` is a function', () => {
      let numberOfTimesThenWasRetrieved: any = null

      beforeEach(() => {
        numberOfTimesThenWasRetrieved = 0
      })

      function xFactory() {
        function x() { }

        Object.defineProperty(x, 'then', {
          get() {
            ++numberOfTimesThenWasRetrieved
            return function thenMethodForX(onFulfilled) {
              onFulfilled()
            }
          },
        })

        return x
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(() => {
          assert.strictEqual(numberOfTimesThenWasRetrieved, 1)
          done()
        })
      })
    })
  })

  describe('2.3.3.2: If retrieving the property `x.then` results in a thrown exception `e`, reject `promise` with '
             + '`e` as the reason.', () => {
    function testRejectionViaThrowingGetter(e, stringRepresentation) {
      function xFactory() {
        return Object.create(Object.prototype, {
          then: {
            get() {
              throw e
            },
          },
        })
      }

      describe(`\`e\` is ${stringRepresentation}`, () => {
        testPromiseResolution(xFactory, (promise, done) => {
          promise.then(null, (reason) => {
            assert.strictEqual(reason, e)
            done()
          })
        })
      })
    }

    Object.keys(reasons).forEach((stringRepresentation) => {
      testRejectionViaThrowingGetter(reasons[stringRepresentation], stringRepresentation)
    })
  })

  describe('2.3.3.3: If `then` is a function, call it with `x` as `this`, first argument `resolvePromise`, and '
             + 'second argument `rejectPromise`', () => {
    describe('Calls with `x` as `this` and two function arguments', () => {
      function xFactory() {
        const x = {
          then(onFulfilled, onRejected) {
            assert.strictEqual(this, x)
            assert.strictEqual(typeof onFulfilled, 'function')
            assert.strictEqual(typeof onRejected, 'function')
            onFulfilled()
          },
        }
        return x
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(() => {
          done()
        })
      })
    })

    describe('Uses the original value of `then`', () => {
      let numberOfTimesThenWasRetrieved: any = null

      beforeEach(() => {
        numberOfTimesThenWasRetrieved = 0
      })

      function xFactory() {
        return Object.create(Object.prototype, {
          then: {
            get() {
              if (numberOfTimesThenWasRetrieved === 0) {
                return function (onFulfilled) {
                  onFulfilled()
                }
              }
              return null
            },
          },
        })
      }

      testPromiseResolution(xFactory, (promise, done) => {
        promise.then(() => {
          done()
        })
      })
    })

    describe(
      '2.3.3.3.1: If/when `resolvePromise` is called with value `y`, run `[[Resolve]](promise, y)`',
      () => {
        describe('`y` is not a thenable', () => {
          testCallingResolvePromiseFulfillsWith(() => undefined, '`undefined`', undefined)
          testCallingResolvePromiseFulfillsWith(() => null, '`null`', null)
          testCallingResolvePromiseFulfillsWith(() => false, '`false`', false)
          testCallingResolvePromiseFulfillsWith(() => 5, '`5`', 5)
          testCallingResolvePromiseFulfillsWith(() => sentinel, 'an object', sentinel)
          testCallingResolvePromiseFulfillsWith(() => sentinelArray, 'an array', sentinelArray)
        })

        describe('`y` is a thenable', () => {
          Object.keys(thenables.fulfilled).forEach((stringRepresentation) => {
            function yFactory() {
              return thenables.fulfilled[stringRepresentation](sentinel)
            }

            testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, sentinel)
          })

          Object.keys(thenables.rejected).forEach((stringRepresentation) => {
            function yFactory() {
              return thenables.rejected[stringRepresentation](sentinel)
            }

            testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, sentinel)
          })
        })

        describe('`y` is a thenable for a thenable', () => {
          Object.keys(thenables.fulfilled).forEach((outerStringRepresentation) => {
            const outerThenableFactory = thenables.fulfilled[outerStringRepresentation]

            Object.keys(thenables.fulfilled).forEach((innerStringRepresentation) => {
              const innerThenableFactory = thenables.fulfilled[innerStringRepresentation]

              const stringRepresentation = `${outerStringRepresentation} for ${innerStringRepresentation}`

              function yFactory() {
                return outerThenableFactory(innerThenableFactory(sentinel))
              }

              testCallingResolvePromiseFulfillsWith(yFactory, stringRepresentation, sentinel)
            })

            Object.keys(thenables.rejected).forEach((innerStringRepresentation) => {
              const innerThenableFactory = thenables.rejected[innerStringRepresentation]

              const stringRepresentation = `${outerStringRepresentation} for ${innerStringRepresentation}`

              function yFactory() {
                return outerThenableFactory(innerThenableFactory(sentinel))
              }

              testCallingResolvePromiseRejectsWith(yFactory, stringRepresentation, sentinel)
            })
          })
        })
      },
    )

    describe(
      '2.3.3.3.2: If/when `rejectPromise` is called with reason `r`, reject `promise` with `r`',
      () => {
        Object.keys(reasons).forEach((stringRepresentation) => {
          testCallingRejectPromiseRejectsWith(reasons[stringRepresentation], stringRepresentation)
        })
      },
    )

    describe(
      '2.3.3.3.3: If both `resolvePromise` and `rejectPromise` are called, or multiple calls to the same '
                 + 'argument are made, the first call takes precedence, and any further calls are ignored.',
      () => {
        describe('calling `resolvePromise` then `rejectPromise`, both synchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                resolvePromise(sentinel)
                rejectPromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` synchronously then `rejectPromise` asynchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                resolvePromise(sentinel)

                setTimeout(() => {
                  rejectPromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` then `rejectPromise`, both asynchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                setTimeout(() => {
                  resolvePromise(sentinel)
                }, 0)

                setTimeout(() => {
                  rejectPromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` with an asynchronously-fulfilled promise, then calling '
                     + '`rejectPromise`, both synchronously', () => {
          function xFactory() {
            const d = deferred()
            setTimeout(() => {
              d.resolve(sentinel)
            }, 50)

            return {
              then(resolvePromise, rejectPromise) {
                resolvePromise(d.promise)
                rejectPromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` with an asynchronously-rejected promise, then calling '
                     + '`rejectPromise`, both synchronously', () => {
          function xFactory() {
            const d = deferred()
            setTimeout(() => {
              d.reject(sentinel)
            }, 50)

            return {
              then(resolvePromise, rejectPromise) {
                resolvePromise(d.promise)
                rejectPromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('calling `rejectPromise` then `resolvePromise`, both synchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                rejectPromise(sentinel)
                resolvePromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('calling `rejectPromise` synchronously then `resolvePromise` asynchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                rejectPromise(sentinel)

                setTimeout(() => {
                  resolvePromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('calling `rejectPromise` then `resolvePromise`, both asynchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                setTimeout(() => {
                  rejectPromise(sentinel)
                }, 0)

                setTimeout(() => {
                  resolvePromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` twice synchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise) {
                resolvePromise(sentinel)
                resolvePromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` twice, first synchronously then asynchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise) {
                resolvePromise(sentinel)

                setTimeout(() => {
                  resolvePromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` twice, both times asynchronously', () => {
          function xFactory() {
            return {
              then(resolvePromise) {
                setTimeout(() => {
                  resolvePromise(sentinel)
                }, 0)

                setTimeout(() => {
                  resolvePromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` with an asynchronously-fulfilled promise, then calling it again, both '
                     + 'times synchronously', () => {
          function xFactory() {
            const d = deferred()
            setTimeout(() => {
              d.resolve(sentinel)
            }, 50)

            return {
              then(resolvePromise) {
                resolvePromise(d.promise)
                resolvePromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('calling `resolvePromise` with an asynchronously-rejected promise, then calling it again, both '
                     + 'times synchronously', () => {
          function xFactory() {
            const d = deferred()
            setTimeout(() => {
              d.reject(sentinel)
            }, 50)

            return {
              then(resolvePromise) {
                resolvePromise(d.promise)
                resolvePromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('calling `rejectPromise` twice synchronously', () => {
          function xFactory() {
            return {
              then(_resolvePromise, rejectPromise) {
                rejectPromise(sentinel)
                rejectPromise(other)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('calling `rejectPromise` twice, first synchronously then asynchronously', () => {
          function xFactory() {
            return {
              then(_resolvePromise, rejectPromise) {
                rejectPromise(sentinel)

                setTimeout(() => {
                  rejectPromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('calling `rejectPromise` twice, both times asynchronously', () => {
          function xFactory() {
            return {
              then(_resolvePromise, rejectPromise) {
                setTimeout(() => {
                  rejectPromise(sentinel)
                }, 0)

                setTimeout(() => {
                  rejectPromise(other)
                }, 0)
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('saving and abusing `resolvePromise` and `rejectPromise`', () => {
          let savedResolvePromise; let
            savedRejectPromise

          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                savedResolvePromise = resolvePromise
                savedRejectPromise = rejectPromise
              },
            }
          }

          beforeEach(() => {
            savedResolvePromise = null
            savedRejectPromise = null
          })

          testPromiseResolution(xFactory, (promise, done) => {
            let timesFulfilled = 0
            let timesRejected = 0

            promise.then(
              () => {
                ++timesFulfilled
              },
              () => {
                ++timesRejected
              },
            )

            if (savedResolvePromise && savedRejectPromise) {
              savedResolvePromise(dummy)
              savedResolvePromise(dummy)
              savedRejectPromise(dummy)
              savedRejectPromise(dummy)
            }

            setTimeout(() => {
              savedResolvePromise(dummy)
              savedResolvePromise(dummy)
              savedRejectPromise(dummy)
              savedRejectPromise(dummy)
            }, 50)

            setTimeout(() => {
              assert.strictEqual(timesFulfilled, 1)
              assert.strictEqual(timesRejected, 0)
              done()
            }, 100)
          })
        })
      },
    )

    describe('2.3.3.3.4: If calling `then` throws an exception `e`,', () => {
      describe('2.3.3.3.4.1: If `resolvePromise` or `rejectPromise` have been called, ignore it.', () => {
        describe('`resolvePromise` was called with a non-thenable', () => {
          function xFactory() {
            return {
              then(resolvePromise) {
                resolvePromise(sentinel)
                throw other
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('`resolvePromise` was called with an asynchronously-fulfilled promise', () => {
          function xFactory() {
            const d = deferred()
            setTimeout(() => {
              d.resolve(sentinel)
            }, 50)

            return {
              then(resolvePromise) {
                resolvePromise(d.promise)
                throw other
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('`resolvePromise` was called with an asynchronously-rejected promise', () => {
          function xFactory() {
            const d = deferred()
            setTimeout(() => {
              d.reject(sentinel)
            }, 50)

            return {
              then(resolvePromise) {
                resolvePromise(d.promise)
                throw other
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('`rejectPromise` was called', () => {
          function xFactory() {
            return {
              then(_resolvePromise, rejectPromise) {
                rejectPromise(sentinel)
                throw other
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('`resolvePromise` then `rejectPromise` were called', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                resolvePromise(sentinel)
                rejectPromise(other)
                throw other
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then((value) => {
              assert.strictEqual(value, sentinel)
              done()
            })
          })
        })

        describe('`rejectPromise` then `resolvePromise` were called', () => {
          function xFactory() {
            return {
              then(resolvePromise, rejectPromise) {
                rejectPromise(sentinel)
                resolvePromise(other)
                throw other
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })
      })

      describe('2.3.3.3.4.2: Otherwise, reject `promise` with `e` as the reason.', () => {
        describe('straightforward case', () => {
          function xFactory() {
            return {
              then() {
                throw sentinel
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('`resolvePromise` is called asynchronously before the `throw`', () => {
          function xFactory() {
            return {
              then(resolvePromise) {
                setTimeout(() => {
                  resolvePromise(other)
                }, 0)
                throw sentinel
              },
            }
          }

          testPromiseResolution(xFactory, (promise, done) => {
            promise.then(null, (reason) => {
              assert.strictEqual(reason, sentinel)
              done()
            })
          })
        })

        describe('`rejectPromise` is called asynchronously before the `throw`', () => {
          function xFactory() {
            return {
              then(_resolvePromise, rejectPromise) {
                setTimeout(() => {
                  rejectPromise(other)
                }, 0)
                throw sentinel
              },
            }
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
  })

  describe('2.3.3.4: If `then` is not a function, fulfill promise with `x`', () => {
    function testFulfillViaNonFunction(then, stringRepresentation) {
      let x: any = null

      beforeEach(() => {
        x = { then }
      })

      function xFactory() {
        return x
      }

      describe(`\`then\` is ${stringRepresentation}`, () => {
        testPromiseResolution(xFactory, (promise, done) => {
          promise.then((value) => {
            assert.strictEqual(value, x)
            done()
          })
        })
      })
    }

    testFulfillViaNonFunction(5, '`5`')
    testFulfillViaNonFunction({}, 'an object')
    testFulfillViaNonFunction([function () { }], 'an array containing a function')
    testFulfillViaNonFunction(/a-b/i, 'a regular expression')
    testFulfillViaNonFunction(Object.create(Function.prototype), 'an object inheriting from `Function.prototype`')
  })
})
