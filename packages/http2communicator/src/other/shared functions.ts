/* eslint-disable import/prefer-default-export */
// import Crypto from 'crypto-browserify'

// const { randomBytes } = Crypto// import Crypto from 'crypto-browserify'

// const { randomBytes } = Crypto

/**
 * generates a random unique identification string
 * @private
 * @returns {uid}
 */
const createUid = () : string => Array.from(
  { length: 20 },
  () => Math.random().toString(36)[2],
).join('')

const runFunctionOnlyOnce = () => {
  let called = false
  // eslint-disable-next-line no-return-assign
  return (fn) => (...args) => called || ((called = true) && fn(...args))
}

/* eslint-disable no-extend-native */
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: https://es5.github.io/#x15.4.4.18

type iterationDoneCb = (result: any)=>any
type forEachDoneCb = (result: any)=>void

const forEachCb = (
  array : any[],
  callback: (done :iterationDoneCb, item: any, itemIndex: number, previousResult: any)=>void,
  initialValue: any = undefined,
) => {
  const len = array.length
  let i = -1
  let doneCb_ : forEachDoneCb
  const itemDone = (previousResult : any) => {
    i += 1
    if (i < len) callback(itemDone, array[i], i, previousResult)
    else doneCb_(previousResult)
  }
  return (doneCb: forEachDoneCb) => {
    doneCb_ = doneCb
    itemDone(initialValue)
  }
}

// const tester = forEachCb([1, 2, 3], (done, item, itemIndex, previousResult) => {
//   setTimeout(() => {
//     const result = item * 2
//     console.log(`item: ${item} itemIndex: ${itemIndex} previousResult: ${previousResult} result: ${result}`)
//     done(result)
//   }, 1000)
// })
// tester((result) => {
//   console.log(`done${result}`)
// })

export { createUid, runFunctionOnlyOnce, forEachCb }
