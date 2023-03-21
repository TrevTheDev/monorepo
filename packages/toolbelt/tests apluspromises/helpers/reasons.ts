/* eslint-disable @typescript-eslint/no-empty-function */
// This module exports some valid rejection reason factories, keyed by human-readable versions of their names.
import { promiseTestObject } from '../../src/index'

const adapter = promiseTestObject
const { resolved, rejected } = adapter

const dummy = { dummy: 'dummy' }

const reasons = {
  undefined,
  null: null,
  false: false,
  0: 0,
  'an error': new Error(),
  get 'an error without a stack'() {
    const error = new Error()
    delete error.stack
    return error
  },
  'a date': new Date(),
  'an object': {},
  'an always-pending thenable': { then() { } },
  'a fulfilled promise': resolved(dummy),
  'a rejected promise': rejected(dummy),
}
export default reasons
