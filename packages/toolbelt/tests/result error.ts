import { describe, it, expect } from 'vitest'
import {
  toResult,
  resultErrorToResultNever,
  resultNeverToResultError,
  onlyExecuteOnResult,
  ResultError,
} from '../src/index'
import { isError, isResult } from '../src/result error'

describe('resultError', () => {
  it('basic usage - resultError', () => {
    const reFn = (arg: 'error' | 'result'): ResultError<'ERROR', 'RESULT'> =>
      arg === 'error' ? ['ERROR'] : toResult('RESULT')
    const [errA, resA] = reFn('error')
    expect(errA).toEqual('ERROR')
    expect(resA).toEqual(undefined)
    const [errB, resB] = reFn('result')
    expect(errB).toEqual(undefined)
    expect(resB).toEqual('RESULT')
    expect(() => resultErrorToResultNever(reFn)('error')).toThrow('ERROR')
    expect(resultErrorToResultNever(reFn)('result')).toEqual('RESULT')
  })
  it('resultNeverToResultError', () => {
    const reFn = (arg: 'error' | 'result') => {
      // eslint-disable-next-line no-throw-literal
      if (arg === 'error') throw 'ERROR'
      return 'RESULT'
    }
    const [errA, resA] = resultNeverToResultError(reFn)('error')
    expect(errA).toEqual('ERROR')
    expect(resA).toEqual(undefined)
    const [errB, resB] = resultNeverToResultError(reFn)('result')
    expect(errB).toEqual(undefined)
    expect(resB).toEqual('RESULT')
  })
  it('onlyExecuteOnResult', () => {
    const reFn = (arg: 'error' | 'result'): ResultError<'ERROR', 'RESULT'> =>
      arg === 'error' ? ['ERROR'] : toResult('RESULT')
    const [errA, resA] = onlyExecuteOnResult(reFn)([undefined, 'result'])
    expect(errA).toEqual(undefined)
    expect(resA).toEqual('RESULT')
    const [errB, resB] = onlyExecuteOnResult(reFn)(['error'])
    expect(errB).toEqual('error')
    expect(resB).toEqual(undefined)
  })
  it('isResult', () => {
    const reFn = (arg: 'error' | 'result'): ResultError<'ERROR', 'RESULT'> =>
      arg === 'error' ? ['ERROR'] : toResult('RESULT')
    const out = reFn('result')
    if (isResult(out)) {
      const [errA, resA] = out
      expect(errA).toEqual(undefined)
      expect(resA).toEqual('RESULT')
    } else expect(true).toBeFalsy()
  })
  it('isError', () => {
    const reFn = (arg: 'error' | 'result'): ResultError<'ERROR', 'RESULT'> =>
      arg === 'error' ? ['ERROR'] : toResult('RESULT')
    const out = reFn('error')
    if (isError(out)) {
      const [errA, resA] = out
      expect(errA).toEqual('ERROR')
      expect(resA).toEqual(undefined)
    } else expect(true).toBeFalsy()
  })
})
