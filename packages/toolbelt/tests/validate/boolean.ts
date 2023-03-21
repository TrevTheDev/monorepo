/* eslint-disable no-empty */
/* eslint-disable no-restricted-syntax */
/* eslint-disable curly */
import { describe, it, expect } from 'vitest'
// eslint-disable-next-line import/no-extraneous-dependencies
import { vBoolean, coerceBoolean } from '../../src/validate/boolean'

describe('adapted from zod strings', () => {
  it('passing validations', () => {
    expect(vBoolean().parse(true)).toBeTruthy()
    expect(vBoolean().parse(false)).toBeFalsy()
  })
  it('does not parse', () => {
    ;[1, 0, -1, undefined, null, '', {}].forEach((element) => {
      expect(() => vBoolean().parse(element)).toThrow()
    })
  })
  it('better parse', () => {
    ;[1, -1, 'true', 't', 'True'].forEach((element) => {
      expect(() => vBoolean(coerceBoolean()).parse(element)).toBeTruthy()
    })
  })
  it('beTrue, beFalse', () => {
    expect(() => vBoolean().beFalse().parse(true)).toThrow()
    expect(() => vBoolean().beTrue().parse(false)).toThrow()
    expect(vBoolean().beTrue().parse(true)).toBeTruthy()
    expect(vBoolean().beFalse().parse(false)).toBeFalsy()
  })
  // it('makeString', () => {
  //   expect(vBoolean().makeString().parse(true)).toEqual('true')
  //   expect(vBoolean().makeString().upperCase().parse(false)).toEqual('FALSE')
  // })
})
