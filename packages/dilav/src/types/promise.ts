/* eslint-disable @typescript-eslint/no-explicit-any */
import { isResult } from 'toolbelt'
import type { ResultError } from 'toolbelt'
import { createFinalBaseObject } from './base'
import {
  SafeParseFn,
  MinimumSchema,
  VInfer,
  defaultErrorFnSym,
  VPromise,
  ValidatedPromise,
  ValidationErrors,
  parserObject,
  SingleValidationError,
} from './types'

import { asyncValidate, createValidationBuilder, validate } from './base validations'
import defaultErrorFn, { DefaultErrorFn } from './errorFns'
import ValidationError from './Validation error'

let errorFns: DefaultErrorFn = defaultErrorFn

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type PromiseOptions<T> =
  | {
      parser: SafeParseFn<unknown, ValidatedPromise<T>>
    }
  | {
      parsePromise: DefaultErrorFn['parsePromise']
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}

export function parsePromise<T extends MinimumSchema>(
  resultParser: T,
  options: PromiseOptions<VInfer<T>> = {},
): SafeParseFn<unknown, ValidatedPromise<VInfer<T>>> {
  return (value: unknown): ResultError<ValidationErrors, ValidatedPromise<VInfer<T>>> => {
    if (
      value instanceof Object &&
      'then' in value &&
      typeof value.then === 'function' &&
      'catch' in value &&
      typeof value.catch === 'function'
    ) {
      let resolverS: (result: VInfer<T>) => void
      let rejectorS: (error: ValidationErrors) => void
      const p = new Promise<VInfer<T>>((resolve, reject) => {
        resolverS = resolve
        rejectorS = reject
      })
      let alreadyRan = false
      const newP = {
        then(
          successResolver:
            | ((value_: VInfer<T>) => VInfer<T> | PromiseLike<VInfer<T>>)
            | undefined
            | null,
          errorResolver:
            | ((reason: any) => ValidationErrors | PromiseLike<ValidationErrors>)
            | undefined
            | null,
        ): Promise<VInfer<T> | ValidationErrors> {
          if (!alreadyRan) {
            ;(value as any).then(
              (result) => {
                const res = resultParser.safeParse(result) as ResultError<
                  ValidationErrors,
                  VInfer<T>
                >
                if (!isResult(res)) return rejectorS(new ValidationError(res[0]))
                return resolverS(res[1])
              },
              (error) => rejectorS(new ValidationError(error)),
            )
            alreadyRan = true
          }
          return p.then(successResolver, errorResolver)
        },
        catch(errorResolver) {
          return newP.then(undefined, errorResolver)
        },
        finally(...args) {
          return p.finally(...args)
        },
        [Symbol.toStringTag]: `ValidatedPromise<${resultParser.type}>`,
      }
      return [undefined, newP]
    }
    return [
      { input: value, errors: [((options as any).parsePromise ?? errorFns.parsePromise)(value)] },
      undefined,
    ]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vPromise
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VPromiseFn = <T extends MinimumSchema>(
  successSchema: T,
  options?: PromiseOptions<VInfer<T>>,
) => VPromise<T>

export function initPromise(baseObject: MinimumSchema): VPromiseFn {
  errorFns = baseObject[defaultErrorFnSym]

  const basePromiseObject = createValidationBuilder(baseObject, [])

  return function vPromise<T extends MinimumSchema>(
    resultSchema: T,
    options: PromiseOptions<VInfer<T>> = {},
  ): VPromise<T> {
    const newP = createFinalBaseObject(
      basePromiseObject,
      (options as any).parser ?? parsePromise(resultSchema, options),
      `ValidatedPromise<${resultSchema.type}>`,
      'promise',
      { resultSchema },
    ) as VPromise<T>
    Object.defineProperties(newP, {
      safeParseAsync: {
        async value(this: MinimumSchema, value) {
          const { asyncValidators, validators, parserFn } = this[parserObject]
          const validationFn = validate(validators, false)
          const asyncValidationFn = asyncValidate(asyncValidators)
          const parsedOutput = await parserFn(value)
          if (parsedOutput[0] !== undefined || validators === undefined || validators.length === 0)
            return parsedOutput
          const errors = [] as SingleValidationError[]
          const validationErrors = validationFn(parsedOutput[1])
          const asyncValidationErrors = await asyncValidationFn(parsedOutput[1])
          if (validationErrors !== undefined) errors.push(...validationErrors)
          if (asyncValidationErrors !== undefined) errors.push(...asyncValidationErrors)
          return errors.length !== 0 ? [{ value, errors }, undefined] : [undefined, parsedOutput[1]]
        },
      },
    })
    return newP
  }
}
