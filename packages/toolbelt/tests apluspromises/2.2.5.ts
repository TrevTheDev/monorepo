// /* eslint-disable strict */
// /* eslint-disable @typescript-eslint/ban-ts-comment */
// /* eslint-disable mocha/no-setup-in-describe */
// // @ts-nocheck
// import assert from 'assert'

// import { testFulfilled, testRejected } from './helpers/testThreeCases'
// import PromiseTester from '../../../src/PromiseTester'

// const adapter = PromiseTester
// const { resolved, rejected } = adapter

// const dummy = { dummy: 'dummy' } // we fulfill or reject with this when we don't intend to test against it

// describe('2.2.5 `onFulfilled` and `onRejected` must be called as functions (i.e. with no `this` value).', () => {
//   describe('strict mode', () => {
//     specify('fulfilled', (done) => {
//       resolved(dummy).then(function onFulfilled() {
//         'use strict'

//         debugger
//         assert.strictEqual(this, undefined)
//         done()
//       })
//     })

//     specify('rejected', (done) => {
//       rejected(dummy).then(null, function onRejected() {
//         'use strict'

//         debugger
//         assert.strictEqual(this, undefined)
//         done()
//       })
//     })
//   })

//   describe('sloppy mode', () => {
//     specify('fulfilled', (done) => {
//       resolved(dummy).then(function onFulfilled() {
//         debugger
//         assert.strictEqual(this, global)
//         done()
//       })
//     })

//     specify('rejected', (done) => {
//       rejected(dummy).then(null, function onRejected() {
//         debugger
//         assert.strictEqual(this, global)
//         done()
//       })
//     })
//   })
// })
