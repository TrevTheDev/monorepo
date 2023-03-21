/* eslint-disable func-names */
/* eslint-disable no-plusplus */
import { promiseTestObject } from '../../src/index'

const adapter = promiseTestObject
const { resolved, rejected, deferred } = adapter

const other = { other: 'other' } // a value we don't want to be strict equal to

export const fulfilled = {
  'a synchronously-fulfilled custom thenable': function (value) {
    return {
      then(onFulfilled) {
        onFulfilled(value)
      },
    }
  },

  'an asynchronously-fulfilled custom thenable': function (value) {
    return {
      then(onFulfilled) {
        setTimeout(() => {
          onFulfilled(value)
        }, 0)
      },
    }
  },

  'a synchronously-fulfilled one-time thenable': function (value) {
    let numberOfTimesThenRetrieved = 0
    return Object.create(null, {
      then: {
        get() {
          if (numberOfTimesThenRetrieved === 0) {
            ++numberOfTimesThenRetrieved
            return function (onFulfilled) {
              onFulfilled(value)
            }
          }
          return null
        },
      },
    })
  },

  'a thenable that tries to fulfill twice': function (value) {
    return {
      then(onFulfilled) {
        onFulfilled(value)
        onFulfilled(other)
      },
    }
  },

  'a thenable that fulfills but then throws': function (value) {
    return {
      then(onFulfilled) {
        onFulfilled(value)
        throw other
      },
    }
  },

  'an already-fulfilled promise': function (value) {
    return resolved(value)
  },

  'an eventually-fulfilled promise': function (value) {
    const d = deferred()
    setTimeout(() => {
      d.resolve(value)
    }, 50)
    return d.promise
  },
}

const rejected2 = {
  'a synchronously-rejected custom thenable': function (reason) {
    return {
      then(_onFulfilled, onRejected) {
        onRejected(reason)
      },
    }
  },

  'an asynchronously-rejected custom thenable': function (reason) {
    return {
      then(_onFulfilled, onRejected) {
        setTimeout(() => {
          onRejected(reason)
        }, 0)
      },
    }
  },

  'a synchronously-rejected one-time thenable': function (reason) {
    let numberOfTimesThenRetrieved = 0
    return Object.create(null, {
      then: {
        get() {
          if (numberOfTimesThenRetrieved === 0) {
            ++numberOfTimesThenRetrieved
            return function (_onFulfilled, onRejected) {
              onRejected(reason)
            }
          }
          return null
        },
      },
    })
  },

  'a thenable that immediately throws in `then`': function (reason) {
    return {
      then() {
        throw reason
      },
    }
  },

  'an object with a throwing `then` accessor': function (reason) {
    return Object.create(null, {
      then: {
        get() {
          throw reason
        },
      },
    })
  },

  'an already-rejected promise': function (reason) {
    return rejected(reason)
  },

  'an eventually-rejected promise': function (reason) {
    const d = deferred()
    setTimeout(() => {
      d.reject(reason)
    }, 50)
    return d.promise
  },
}
export { rejected2 as rejected }
