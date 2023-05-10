import type { ResultError, DeepWriteable, FlattenObjectUnion } from '@trevthedev/toolbelt'

import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  BaseSchema,
  defaultErrorFnSym,
  ValidationArray,
  ValidationErrors,
  ValidationItem,
} from './types'

import { baseObject } from './init'
import { createValidationBuilder } from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns: DefaultErrorFn = baseObject[defaultErrorFnSym]

// function saneBooleanParser(
//   unmatchedValue: true | false | undefined,
//   truthyValues?: string[],
//   falsyValues?: string[],
// ) {
//   const createFn = () => {
//     if (truthyValues) {
//       if (falsyValues) {
//         return (value: string) => {
//           if (truthyValues.includes(value)) return true
//           if (falsyValues.includes(value)) return false
//           return unmatchedValue
//         }
//       }
//       return (value: string) => {
//         if (truthyValues.includes(value)) return true
//         return unmatchedValue
//       }
//     }
//     if (falsyValues) {
//       return (value: string) => {
//         if (falsyValues.includes(value)) return false
//         return unmatchedValue
//       }
//     }
//     return (_value: string) => unmatchedValue
//   }
//   const fn = createFn()
//   return (value: unknown) => {
//     if (typeof value === 'boolean') return value
//     const valueToString = String(value).toLowerCase().trim()
//     return fn(valueToString)
//   }
// }

// function defaultSaneBooleanParser(throwOnUndefined = true) {
//   const parser = saneBooleanParser(
//     undefined,
//     ['true', 'yes', 'on', 't', 'y', '1', '-1'],
//     ['', 'false', 'no', 'off', 'f', 'n', '0'],
//   )
//   return (value: unknown) => {
//     const result = parser(value)
//     if (throwOnUndefined && result !== undefined)
//       throw new Error(`could not parse ${String(value)} to boolean`)
//     return result
//   }
// }

// const safeSaneBooleanParser = defaultSaneBooleanParser(false)

export function parseBoolean(
  invalidBooleanFn?: DefaultErrorFn['parseBoolean'],
): SafeParseFn<unknown, boolean> {
  return (value: unknown): ResultError<ValidationErrors, boolean> =>
    typeof value !== 'boolean'
      ? [{ input: value, errors: [(invalidBooleanFn ?? errorFns.parseBoolean)(value)] }, undefined]
      : [undefined, value]
}

export function coerceBoolean(value: unknown): [undefined, boolean] {
  return [undefined, Boolean(value)]
}

// export function coerceBoolean(
//   invalidBooleanFn: (invalidValue: string) => SingleValidationError = defaultErrorFn.parseBoolean,
// ): (value: unknown) => ResultError<ValidationErrors, boolean> {
//   return (value: unknown): ResultError<ValidationErrors, boolean> => {
//     const result = safeSaneBooleanParser(value)
//     return result === undefined
//       ? [{ input: value, errors: [invalidBooleanFn(String(value))] }, undefined]
//       : [undefined, result]
//   }
// }

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
export function beTrue(errorReturnValueFn: () => string = errorFns.beTrue) {
  return (value: boolean) => (!value ? errorReturnValueFn() : undefined)
}

export function beFalse(errorReturnValueFn: () => string = errorFns.beFalse) {
  return (value: boolean) => (value ? errorReturnValueFn() : undefined)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * all validations
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type BooleanValidations = DeepWriteable<typeof booleanValidations_> extends ValidationArray<boolean>
  ? DeepWriteable<typeof booleanValidations_>
  : never

const booleanValidations_ = [
  ['beTrue', beTrue],
  ['beFalse', beFalse],
  ['TODOdefault', beTrue],
] as const
const booleanValidations = booleanValidations_ as BooleanValidations

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vBoolean
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */
type BooleanValidationFuncs<
  Output extends boolean,
  Input,
  Validations extends ValidationArray<boolean> = BooleanValidations,
> = {
  [I in keyof Validations as I extends Exclude<I, keyof unknown[]>
    ? Validations[I] extends ValidationItem<boolean>
      ? Validations[I][0]
      : never
    : never]: (...args: Parameters<Validations[I][1]>) => VBoolean<Output, Input>
}

export interface VBoolean<Output extends boolean = boolean, Input = unknown>
  extends BaseSchema<Output, 'boolean', 'boolean', Input>,
    BooleanValidationFuncs<Output, Input> {
  readonly coerce: this
  custom(newOptions: BooleanOptions): this
}
type BooleanOptions =
  | {
      parseBooleanError: DefaultErrorFn['parseBoolean']
    }
  | {
      parser: SafeParseFn<unknown, boolean>
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {} // | Record<string, never>

const baseBooleanObject = createValidationBuilder(
  baseObject,
  booleanValidations,
  coerceBoolean,
  vBoolean,
)
export function vBoolean(options: BooleanOptions = {}): VBoolean {
  type Opts = FlattenObjectUnion<BooleanOptions>
  return createFinalBaseObject(
    baseBooleanObject,
    (options as Opts).parser ?? parseBoolean((options as Opts).parseBooleanError),
    'boolean',
    'boolean',
  ) as VBoolean
}

export const vBooleanInstance = vBoolean()
// export const vBooleanCoerce = vBoolean({ parser: coerceBoolean })

// const baseBooleanObj: VBoolean & {
//   _parentParser: ((value: unknown) => unknown) | undefined
//   _validators: ((value: boolean) => string | undefined)[]
//   _invalidBooleanFn: (invalidValue: unknown) => string
//   _parser: (value: unknown) => ResultError<string, boolean>
// } = {
//   // _parentParser: undefined,
//   // _parser: undefined,
//   // _validators: undefined,
//   // _invalidStringFn: undefined,
//   type: 'vBoolean',
//   parse(value: unknown): boolean {
//     const input = this._parentParser ? this._parentParser(value) : value
//     const result = this._parser(input)
//     if (result[0] !== undefined) throw new Error(result[0])
//     const errors = inParallel(this._validators)(result[1])
//     if (errors) throw new Error(String(errors))
//     return result[1]
//   },
//   safeParse(futureBoolean: unknown): ResultError<string[], boolean> {
//     const input = this._parentParser ? this._parentParser(futureBoolean) : futureBoolean
//     const result = this._parser(input)
//     if (result[0] !== undefined) return [[result[0]], undefined]
//     const errors = inParallel(this._validators)(result[1])
//     if (errors) return [errors, undefined]
//     return [undefined, result[1]]
//   },
//   catch(replacementValueOrFn: boolean | ((originalValue: unknown, errors: string[]) => boolean)) {
//     let originalVal: unknown
//     return this.safeTransform(
//       (result) => {
//         debugger
//         if (result[0]) {
//           return typeof replacementValueOrFn === 'function'
//             ? replacementValueOrFn(originalVal, result[0])
//             : replacementValueOrFn
//         }
//         return result[1]
//       },
//       (pParser) => {
//         debugger
//         return vBooleanFn(this._invalidBooleanFn, (originalV: unknown) => {
//           originalVal = originalV
//           return pParser(originalV)
//         })
//       },
//     )
//   },
//   transform<
//     T extends (input: boolean) => unknown,
//     I extends (parentParserFn: (string: unknown) => unknown) => any,
//   >(transformFn: T, parentParseObj: I) {
//     return parentParseObj((value) => transformFn(this.parse(value)))
//   },
//   safeTransform<
//     T extends (result: ResultError<string[], boolean>) => unknown,
//     I extends (parentParserFn: (futureBool: unknown) => unknown) => any,
//   >(transformFn: T, parentParseObj: I) {
//     return parentParseObj((value) => {
//       debugger
//       return transformFn(this.safeParse(value))
//     })
//   },
// } as VBoolean & {
//   _parentParser: ((futureBool: unknown) => unknown) | undefined
//   _validators: ((value: boolean) => string | undefined)[]
//   _invalidBooleanFn: (invalidValue: unknown) => string
//   _parser: (value: unknown) => ResultError<string, boolean>
// }

// validations.forEach(([propName, validationFn]) => {
//   Object.defineProperty(baseBooleanObj, propName, {
//     value: function X(...args) {
//       this._validators.push(validationFn(...args))
//       return this
//     },
//   })
// })

// vBooleanFn = function zB(
//   invalidBooleanFn: (invalidValue: unknown) => string = defaultErrorFn.parseBoolean,
//   parentParser: ((string: unknown) => unknown) | undefined = undefined,
// ): VBoolean {
//   return Object.create(baseBooleanObj, {
//     _parentParser: { value: parentParser },
//     _parser: {
//       value: (potentialBool) => {
//         if (typeof potentialBool === 'boolean') return potentialBool
//         throw new Error(invalidBooleanFn(potentialBool))
//       },
//     },
//     _validators: { value: [] },
//     _invalidBooleanFn: { value: invalidBooleanFn },
//   }) as VBoolean
// }
// export const vBoolean = vBooleanFn

// type ParseOptions = {
//   throwOnUndefined: boolean // throws an error if the parsing returns an 'undefined'
//   toLowerCase: boolean // convert strings to lower case before testing
//   trim: boolean // trim white space from strings before testing
//   stringTruthyValues?: string[] // strings that should return true
//   numberTruthyValues?: number[] // numbers that should return true
//   bigIntTruthyValues?: bigint[] // bigInts that should return true
//   stringFalsyValues?: string[] // strings that should return false
//   numberFalsyValues?: number[] // numbers that should return false
//   bigIntFalsyValues?: bigint[] // bigInts that should return false
//   unmatchedString: true | false | undefined // what any unmatched strings should evaluate to
//   unmatchedNumber: true | false | undefined // what any numbers strings should evaluate to
//   unmatchedBigInt: true | false | undefined // what any bigInts strings should evaluate to
//   null: true | false | undefined // what null should evaluate to
//   undefined: true | false | undefined // what undefined should evaluate to
//   // NaN: true | false | undefined
//   object: true | false | undefined // what objects should evaluate to
//   symbol: true | false | undefined // what symbols should evaluate to
// }

// // type StrictParseOptions = {
// //   throwOnUndefined: boolean
// //   null: true | false
// //   undefined: true | false
// //   NaN: true | false
// //   toLowerCase: boolean
// //   trim: boolean
// //   strings: [pattern: string, value: true | false][]
// //   unmatchedString: true | false
// // }

// const parseOptions: ParseOptions = {
//   throwOnUndefined: false,
//   toLowerCase: true,
//   trim: true,
//   stringTruthyValues: ['true', 'yes', 'on', 't', 'y', '1', '-1'],
//   numberTruthyValues: [1, -1],
//   bigIntTruthyValues: [1n, -1n],
//   stringFalsyValues: ['', 'false', 'no', 'off', 'f', 'n', '0'],
//   numberFalsyValues: [0],
//   bigIntFalsyValues: [0n],
//   unmatchedString: undefined,
//   unmatchedNumber: undefined,
//   unmatchedBigInt: undefined,
//   null: undefined,
//   undefined,
//   // NaN: undefined,
//   object: undefined,
//   symbol: undefined,
// }

// function parseBooleans(options: ParseOptions = parseOptions) {
//   const createFn = <T>(
//     unmatchedValue: true | false | undefined,
//     truthyValues?: T[],
//     falsyValues?: T[],
//   ) => {
//     if (truthyValues) {
//       if (falsyValues) {
//         return (value: T) => {
//           if (truthyValues.includes(value)) return true
//           if (falsyValues.includes(value)) return false
//           return unmatchedValue
//         }
//       }
//       return (value: T) => {
//         if (truthyValues.includes(value)) return true
//         return unmatchedValue
//       }
//     }
//     if (falsyValues) {
//       return (value: T) => {
//         if (falsyValues.includes(value)) return false
//         return unmatchedValue
//       }
//     }
//     return (_value: T) => unmatchedValue
//   }
//   const stringTester = createFn(
//     options.unmatchedString,
//     options.stringTruthyValues,
//     options.stringFalsyValues,
//   )
//   const numberTester = createFn(
//     options.unmatchedNumber,
//     options.numberTruthyValues,
//     options.numberFalsyValues,
//   )
//   const bigTester = createFn(
//     options.unmatchedBigInt,
//     options.bigIntTruthyValues,
//     options.bigIntFalsyValues,
//   )
//   return (value: unknown) => {
//     const parse = () => {
//       switch (typeof value) {
//         case 'boolean':
//           return value
//         case 'string': {
//           let str: string = options.toLowerCase
//             ? (value as string).toLowerCase()
//             : (value as string)
//           str = options.trim ? str.toLowerCase() : str
//           return stringTester(str)
//         }
//         case 'object':
//           return value === null ? options.null : options.object
//         case 'undefined':
//           return options.undefined
//         case 'symbol':
//           return options.symbol
//         case 'number':
//           return numberTester(value)
//         case 'bigint':
//           return bigTester(value)
//         default:
//           throw new Error(`unknown type '${typeof value}'`)
//       }
//     }
//     const result = parse()
//     if (result === undefined && options.throwOnUndefined) throw new Error('parsing error')
//     return result
//   }
// }

// const parser = parseBooleans()
// console.log(safeBooleanParser(true))
// const values = [
//   true,
//   'true',
//   'yes',
//   'on',
//   'y',
//   't',
//   '1',
//   '-1',
//   1,
//   -1,
//   1.0,
//   1n,
//   false,
//   'false',
//   'no',
//   'off',
//   'n',
//   'f',
//   '0',
//   0,
//   0.0,
//   0n,
//   null,
//   'hello',
//   0.1,
//   1.1,
//   100,
//   -100,
//   100n,
//   -100n,
//   undefined,
//   {},
//   NaN,
//   Infinity,
//   -Infinity,
//   new Date(),
// ]
// const tt = ['']
// const t0 = ['mine'] as any[]
// const t1 = ["element === 'true'"] as any[]
// const t2 = ['Boolean(element)'] as any[]
// const t3 = ['!!JSON.parse(elementAsString.toLowerCase())'] as any[]
// const t4 = ["elementAsString.toLowerCase() == 'true'"] as any[]
// const t5 = ['!regEx.test(elementAsString) && !!element'] as any[]
// const t6 = ['if'] as any[]

// values.forEach((element) => {
//   const elementAsString = String(element)
//   tt.push(elementAsString)
//   t0.push(safeBooleanParser(element))
//   t1.push(element === 'true')
//   t2.push(Boolean(element))
//   let json
//   try {
//     json = !!JSON.parse(elementAsString.toLowerCase())
//   } catch (e) {
//     json = 'throws'
//   }
//   t3.push(json)
//   // eslint-disable-next-line eqeqeq
//   t4.push(elementAsString.toLowerCase() == 'true')
//   const falsy = /^(?:f(?:else)?|no?|0+)$/i
//   t5.push(!falsy.test(elementAsString) && !!element)
//   t6.push(
//     elementAsString === 'false' ||
//       elementAsString === 'undefined' ||
//       elementAsString === 'null' ||
//       elementAsString === '0'
//       ? false
//       : !!elementAsString,
//   )
// })
// // console.table([tt, t0, t1, t2, t3, t4, t5, t6])
// tt.forEach((v, i) => {
//   console.log(
//     v,
//     ', ',
//     t0[i],
//     ', ',
//     t1[i],
//     ', ',
//     t2[i],
//     ', ',
//     t3[i],
//     ', ',
//     t4[i],
//     ', ',
//     t5[i],
//     ', ',
//     t6[i],
//   )
// })
