/* eslint-disable @typescript-eslint/no-explicit-any */
import { callbackTee, capitalise } from './smallUtils'
import { Identity } from './typescript utils'

export type PinDef = Record<string, [arg: unknown]> // { [pinName: string]: [arg: unknown] }

export type OutputPinGetter<
  Pins extends PinDef,
  SetPin extends keyof Pins = keyof Pins,
  Getters = {
    [P in SetPin]: Identity<
      { readonly setPin: P } & { readonly [I in P]: Pins[I][0] } & {
        [I in keyof Pins as `is${Capitalize<string & I>}`]: () => I extends P ? true : false
      } & { value(): Pins[P][0] }
    >
  },
> = Getters[keyof Getters] & (() => Pins[SetPin][0])

// type Z = OutputPinGetter<{
//   result: [result: 'R']
//   error: [error: 'E']
//   cancel: [cancelReason: 'C']
// }>['isCancel']

//   [SetPin] extends [never]
//   ? Identity<
//       { readonly setPin: keyof Pins } & { readonly [I in keyof Pins]?: Pins[I][0] } & {
//         [I in keyof Pins as `is${Capitalize<string & I>}`]: () => boolean
//       } & {
//         value(): Pins[keyof Pins][0]
//       }
//     >
//   : Identity<
//       { readonly setPin: SetPin } & { readonly [I in SetPin]: Pins[I][0] } & {
//         [I in keyof Pins as `is${Capitalize<string & I>}`]: () => I extends SetPin ? true : false
//       } & { value(): Pins[SetPin][0] }
//     > &
//       (() => [SetPin] extends [never] ? Pins[keyof Pins][0] : Pins[SetPin][0]),
// > = RT

// Identity<
//     {
//       readonly setPin: [SetPin] extends [never] ? keyof Pins : SetPin
//     } & [SetPin] extends [never]
//       ? { readonly [I in keyof Pins]?: Pins[I][0] }
//       : { readonly [I in SetPin]: Pins[I][0] } & {
//           [I in keyof Pins as `is${Capitalize<string & I>}`]: () => [SetPin] extends [never]
//             ? boolean
//             : I extends SetPin
//             ? true
//             : false
//         } & {
//           value(): [SetPin] extends [never] ? Pins[keyof Pins][0] : Pins[SetPin][0]
//         }
//   > &
//     (() => [SetPin] extends [never] ? Pins[keyof Pins][0] : Pins[SetPin][0]),

export type OutputPinSetter<
  Pins extends PinDef,
  DefaultPin extends keyof Pins,
  RT = Identity<
    {
      [I in keyof Pins]: (...args: Pins[I]) => OutputPinGetter<Pins, I>
    } & {
      readonly awaiters: {
        [I in keyof Pins as `on${Capitalize<string & I>}`]: (
          callback: (...args: Pins[I]) => void,
        ) => void
      }
    }
  > &
    ((...args: Pins[DefaultPin]) => OutputPinGetter<Pins, DefaultPin>),
> = RT

export type OutputPinCallbacks<Pins extends PinDef> = {
  [I in keyof Pins as `on${Capitalize<string & I>}`]?: (
    callback: (...args: Pins[I]) => void,
  ) => void
}

/**
 *
 * @param defaultPin
 * @param outputPinDefs
 * @returns (callbacks?: OutputPinCallbacks)=>OutputPinSetter
 */
function outputPins<Pins extends PinDef, DefaultPin extends Extract<keyof Pins, string>>(
  defaultPin: DefaultPin,
  ...outputPinDefs: Extract<keyof Pins, string>[]
) {
  const pinDef = [defaultPin, ...outputPinDefs]
  return (callbacks?: OutputPinCallbacks<Pins>) => {
    const cb = {}

    let pinReturned: Extract<keyof Pins, string>

    const setter = function SetterFn(arg) {
      return (setter[defaultPin] as any)(arg)
    } as unknown as OutputPinSetter<Pins, DefaultPin>

    Object.defineProperty(setter, 'awaiters', {
      get() {
        const obj = {}
        pinDef.forEach((pin) => {
          const prop = `on${capitalise(pin)}`
          Object.defineProperty(obj, prop, { value: cb[prop].addCallback })
        })
        return obj
      },
    })

    pinDef.forEach((pin) => {
      const prop = `on${capitalise(pin)}`
      cb[prop] = callbackTee({ resolvePerpetually: true, canCallOnlyOnce: true })
      if (callbacks && prop in callbacks) cb[prop].addCallback(callbacks[prop])

      Object.defineProperty(setter, pin, {
        value: (value) => {
          if (pinReturned) {
            throw new Error(
              `only one outputPin can be set and the '${pinReturned}' pin has already been set`,
            )
          }
          pinReturned = pin
          cb[prop].callCallbacks(value)

          const getter = function GetterFn() {
            return value
          } as unknown as OutputPinGetter<Pins, DefaultPin>

          Object.defineProperties(getter, {
            setPin: { value: pin },
            value: { value },
            [pin]: { value },
          })
          pinDef.forEach((pinName) => {
            Object.defineProperties(getter, {
              [`is${capitalise(pinName)}`]: {
                value: () => pin === pinName,
              },
            })
          })

          return getter
        },
      })
    })

    return setter
  }
}

export default outputPins

// type OutputPinGetter2<
//   Pins extends PinDef,
//   SetPin extends keyof Pins = keyof Pins,
//   RT = Identity<
//     {
//       readonly setPin: SetPin
//     } & {
//       readonly [I in SetPin]: Pins[I][0]
//     } & {
//       [I in keyof Pins as `is${Capitalize<string & I>}`]: () => I extends SetPin ? true : false
//     } & {
//       value(): Pins[SetPin][0]
//     }
//   > &
//     (() => Pins[SetPin][0]),
// > = RT

// type OutputPinGetter3<
//   Pins extends PinDef,
//   SetPin extends keyof Pins = keyof Pins,
//   RT = Identity<
//     {
//       readonly setPin: SetPin
//     } & {
//       [I in keyof Pins as `is${Capitalize<string & I>}`]: () => I extends SetPin ? true : false
//     } & {
//       value(): Pins[SetPin][0]
//     }
//   >,
// > = RT

// type OutputPinSetter2<
//   Pins extends PinDef,
//   DefaultPin extends keyof Pins,
//   SetPin extends Exclude<keyof Pins, DefaultPin>,
//   RT = Identity<
//     {
//       [I in Exclude<keyof Pins, SetPin>]: (...args: Pins[I]) => OutputPinGetter2<Pins, I>
//     } & {
//       readonly awaiters: {
//         [I in keyof Pins as `on${Capitalize<string & I>}`]: (
//           callback: (...args: Pins[I]) => void,
//         ) => void
//       }
//     } & OutputPinGetter3<Pins, SetPin>
//   > &
//     ((...args: Pins[DefaultPin]) => OutputPinGetter2<Pins, DefaultPin>),
// > = RT

// type Z2 = OutputPinSetter2<
//   {
//     result: [result: 'RESULT']
//     none: [none: null]
//   },
//   'result',
//   'none'
// >
// function outputPins2<
//   Pins extends PinDef,
//   DefaultPin extends keyof Pins,
//   SetPin extends Exclude<keyof Pins, DefaultPin>,
// >(
//   pinDef: [defaultPin: DefaultPin, ...outputPinDefs: Extract<keyof Pins, string>[]],
//   setPin?: { setPin: SetPin; value: Pins[SetPin][0] },
// ) {
//   const defaultPin = pinDef[0]
//   const setterPins = setPin ? pinDef.filter((element) => element !== setPin.setPin) : pinDef
//   return (callbacks?: OutputPinCallbacks<Pins>) => {
//     const cb = {}

//     let set = false
//     let pinReturned: keyof Pins | undefined = setPin ? setPin.setPin : undefined

//     const setter = function SetterFn(arg) {
//       return (setter[defaultPin] as any)(arg)
//     } as unknown as OutputPinSetter2<Pins, DefaultPin, SetPin>

//     Object.defineProperty(setter, 'awaiters', {
//       get() {
//         const obj = {}
//         setterPins.forEach((pin) => {
//           const prop = `on${capitalise(pin as string)}`
//           Object.defineProperty(obj, prop, { value: cb[prop].addCallback })
//         })
//         return obj
//       },
//     })
//     if (setPin) {
//       Object.defineProperties(setter, {
//         setPin: { value: setPin.setPin },
//         value: { value: setPin.value },
//         [setPin.setPin]: { value: setPin.value },
//       })
//       pinDef.forEach((pinName) => {
//         Object.defineProperties(setter, {
//           [`is${capitalise(pinName as string)}`]: {
//             value: () => setPin.setPin === pinName,
//           },
//         })
//       })
//     }

//     setterPins.forEach((pin) => {
//       const prop = `on${capitalise(pin as string)}`
//       cb[prop] = callbackTee({ resolvePerpetually: true, canCallOnlyOnce: true })
//       if (callbacks && prop in callbacks) cb[prop].addCallback(callbacks[prop])

//       Object.defineProperty(setter, pin, {
//         value: (value) => {
//           if (set) {
//             throw new Error(
//               `only one outputPin can be set and the '${
//                 pinReturned as string
//               }' pin has already been set`,
//             )
//           }
//           pinReturned = pin
//           cb[prop].callCallbacks(value)

//           const getter = function GetterFn() {
//             return value
//           } as unknown as OutputPinGetter<Pins, DefaultPin>

//           Object.defineProperties(getter, {
//             setPin: { value: pin },
//             value: { value },
//             [pin]: { value },
//           })
//           pinDef.forEach((pinName) => {
//             Object.defineProperties(getter, {
//               [`is${capitalise(pinName as string)}`]: {
//                 value: () => pin === pinName,
//               },
//             })
//           })

//           return getter
//         },
//       })
//     })

//     return setter
//   }
// }

export type ResultNoneSetter<ResultType, NoneType> = OutputPinSetter<
  { result: [result: ResultType]; none: [none: NoneType] },
  'result'
>

export type ResultNone<
  ResultType,
  NoneType,
  Type extends 'result' | 'none' = 'result' | 'none',
> = OutputPinGetter<
  {
    result: [result: ResultType]
    none: [none: NoneType]
  },
  Type
>

/**
 * Inspired by the `maybe` monad, this function returns a function object, that can have either a `result` or a `none` set.
 * 
 * @example
 *  const fn = (error: boolean) => {
      const returnResult = resultNone<'RESULT', null>()
      return error ? returnResult.none(null) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isNone()) throw new Error('null')
    console.log(results()) // 'RESULT'
    console.log((results as ResultNone<'RESULT', null, 'result'>).result) // 'RESULT'
  
 *
 * @param callbacks : {
 *      onResult(callback: (result)=>void): void
 *      onError(callback: (error)=>void): void
 *    } - optional callbacks that can be made when setter is set
 * @returns {
    *    (result):OutputPinGetter
    *    result(result):OutputPinGetter
    *    error(error):OutputPinGetter
    *    awaiter: {
    *      onResult(callback: (result)=>void): void
    *      onError(callback: (error)=>void): void
    *    }
    * }
    *
    * OutputPinGetter: {
    *   readonly result?: result
    *   readonly error?: error
    *   value: result|error
    *   setPin: 'result'|'error'
    *   isResult(): boolean
    *   isError(): boolean
    * }
    */
export function resultNone<ResultType, NoneType>(
  callbacks?: OutputPinCallbacks<{ result: [result: ResultType]; none: [none: NoneType] }>,
) {
  return outputPins<{ result: [result: ResultType]; none: [none: NoneType] }, 'result'>(
    'result',
    'none',
  )(callbacks)
}

/**
 * Inspired by the `either` monad, this function returns a function object, that can have either a `result` or an `error` set.
 * 
 * @example
 *  const fn = (error: boolean) => {
      const returnResult = resultError<'RESULT', Error>()
      return error ? returnResult.error(new Error('error')) : returnResult('RESULT')
    }
    const results = fn(false)
    if (results.isError()) throw (results as ResultError<'RESULT', Error, 'error'>).error
    console.log(results()) // 'RESULT'
    console.log((results as ResultError<'RESULT', Error, 'result'>).result) // 'RESULT'
 *
 * @param callbacks : {
 *      onResult(callback: (result)=>void): void
 *      onError(callback: (error)=>void): void
 *    } - optional callbacks that can be made when setter is set
 * @returns {
 *    (result):OutputPinGetter
 *    result(result):OutputPinGetter
 *    error(error):OutputPinGetter
 *    awaiter: {
 *      onResult(callback: (result)=>void): void
 *      onError(callback: (error)=>void): void
 *    }
 * }
 *
 * OutputPinGetter: {
 *   readonly result?: result
 *   readonly error?: error
 *   value: result|error
 *   setPin: 'result'|'error'
 *   isResult(): boolean
 *   isError(): boolean
 * }
 */
// export type ResultErrorSetter<ResultType, ErrorType> = OutputPinSetter<
//   { result: [result: ResultType]; error: [error: ErrorType] },
//   'result'
// >
// export type ResultError<
//   ResultType,
//   ErrorType,
//   Type extends 'result' | 'error' = 'result' | 'error',
// > = OutputPinGetter<
//   {
//     result: [result: ResultType]
//     error: [error: ErrorType]
//   },
//   Type
// >

// export function resultError<ResultType, ErrorType>(
//   callbacks?: OutputPinCallbacks<{ result: [result: ResultType]; error: [error: ErrorType] }>,
// ) {
//   return outputPins<{ result: [result: ResultType]; error: [error: ErrorType] }, 'result'>(
//     'result',
//     'error',
//   )(callbacks) // as unknown as ResultError<ResultType, ErrorType>
// }

// const Nothing = Symbol('Nothing')
// export const maybe = <T>() => {
//   const outPins = resultNoneOutputPins<T>()
//   Object.defineProperties(fn, {
//     map: {
//       value: <U>(fn: (value: T) => U) => {
//         if (!outPins.pinReturned) throw new Error('no value yet set for outputPins')
//         if (outPins.pinReturned === 'none') return Nothing
//         return fn(outPins.result)
//       },
//     },
//   })
//   return outPins
// }
