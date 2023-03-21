import { describe, it, expect } from 'vitest'
import { didError, wrapTryCatchInDidError, DidError } from '../src/index'

describe('didError', () => {
  it('basic usage - didError', () => {
    const fn = (error: boolean) => {
      const output = didError<Error>()
      return error ? output.error(new Error('ERROR')) : output()
    }
    const results = fn(true)
    if (results.isError()) console.log((results as DidError<Error, true>).errorValue()) // Error('ERROR')
    expect((results as DidError<Error, true>).errorValue()).toBeInstanceOf(Error)
  })
  it('basic usage - wrapTryCatchInDidError', () => {
    const fn = wrapTryCatchInDidError((error: boolean) => {
      if (error) throw new Error('ERROR')
    })
    const results = fn(true)
    if (results.isError()) console.log((results as DidError<Error, true>).errorValue()) // Error('ERROR')
    expect((results as DidError<Error, true>).errorValue()).toBeInstanceOf(Error)
  })
})
