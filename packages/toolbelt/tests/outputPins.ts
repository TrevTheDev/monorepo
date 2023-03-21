import { describe, it } from 'vitest'
import { OutputPinGetter, outputPins, resultNone, ResultNone } from '../src/index'

describe('outputPins', () => {
  it('basic usage - outputPins', () => {
    const exampleResultErrorGenerator = outputPins<
      { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: 'CANCEL'] },
      'result'
    >('result', 'error', 'cancel')
    type OutputError = OutputPinGetter<
      { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: unknown] },
      'error'
    >
    type OutputCancel = OutputPinGetter<
      { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: unknown] },
      'cancel'
    >

    type OutputResult = OutputPinGetter<
      { result: [result: 'RESULT']; error: [error: Error]; cancel: [cancelReason: unknown] },
      'result'
    >
    const fn = (error: boolean) => {
      const returnResult = exampleResultErrorGenerator()
      // eslint-disable-next-line no-constant-condition
      if (false) return returnResult.cancel('CANCEL')
      return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isError()) throw (results as OutputError).error
    if (results.isCancel()) throw (results as OutputCancel).cancel
    console.log(results()) // 'RESULT'
    console.log(results.isResult())
    console.log((results as OutputResult).result)
  })
  // it('basic usage - resultError', () => {
  //   const fn = (error: boolean) => {
  //     const returnResult = resultError<'RESULT', Error>()
  //     return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
  //   }
  //   const results = fn(false)
  //   if (results.isError()) throw (results as ResultError<'RESULT', Error, 'error'>).error
  //   console.log(results()) // 'RESULT'
  //   console.log((results as ResultError<'RESULT', Error, 'result'>).result) // 'RESULT'
  // })
  it('basic usage - resultNone', () => {
    const fn = (error: boolean) => {
      const returnResult = resultNone<'RESULT', null>()
      return error ? returnResult.none(null) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isNone()) throw new Error('null')
    console.log(results()) // 'RESULT'
    console.log((results as ResultNone<'RESULT', null, 'result'>).result) // 'RESULT'
  })
  // it('resultErrorOutputPins', () => {
  //   const re = resultError<'RESULT', 'ERROR'>({
  //     onError: (_error) => expect(true).toBeFalsy(),
  //     onResult: (result) => {
  //       expect(result).toEqual('RESULT')
  //     },
  //   })

  //   const rv = re('RESULT')
  //   expect(() => re.result('RESULT')).toThrowError()
  //   expect(() => re.error('ERROR')).toThrowError()

  //   expect(rv()).toEqual('RESULT')
  //   expect(rv.result).toEqual('RESULT')
  //   expect(rv.value).toEqual('RESULT')
  //   expect('error' in rv).toBeFalsy()

  //   expect(rv.isResult()).toBeTruthy()
  //   expect(rv.isError()).toBeFalsy()
  //   expect(rv.setPin).toEqual('result')
  // })
  // it('awaiters', () => {
  //   const re = resultError<'RESULT', 'ERROR'>()

  //   const cb = re.awaiters

  //   cb.onResult((result) => {
  //     expect(result).toEqual('RESULT')
  //     re.awaiters.onResult((_result) => {
  //       expect(_result).toEqual('RESULT')
  //     })
  //   })
  //   re('RESULT')
  // })
  // it('typing check', () => {
  //   const fn = (error: boolean): ResultError<'RESULT', Error> => {
  //     const returnResult = resultError<'RESULT', Error>()
  //     return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
  //   }
  //   const results = fn(false)
  //   if (results.isError()) throw (results as ResultError<'RESULT', Error, 'error'>).error
  //   console.log(results()) // 'RESULT'
  //   console.log((results as ResultError<'RESULT', Error, 'result'>).result) // 'RESULT'
  // })
})
