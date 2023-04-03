/* eslint-disable @typescript-eslint/no-explicit-any */
import { isResult } from 'toolbelt'
import type { ResultError } from 'toolbelt'
import {
  SafeParseFn,
  SafeParsableObject,
  MinimumSafeParsableObject,
  VInfer,
  defaultErrorFnSym,
  createFinalBaseObject,
  parserObject,
  ParserObject,
} from './base'

import { baseObject } from './init'
import { ValidationErrors, createValidationBuilder } from './base validations'
import { DefaultErrorFn } from './errorFns'

const errorFns = baseObject[defaultErrorFnSym]

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export interface ValidatedPromise<T> {
  then(
    onfulfilled?: ((value: T) => T | PromiseLike<T>) | undefined | null,
    onrejected?:
      | ((reason: any) => ValidationErrors | PromiseLike<ValidationErrors>)
      | undefined
      | null,
  ): Promise<T | ValidationErrors>
  catch(
    onrejected?:
      | ((reason: any) => ValidationErrors | PromiseLike<ValidationErrors>)
      | undefined
      | null,
  ): Promise<T | ValidationErrors>
  finally(onfinally?: (() => void) | undefined | null): Promise<T>
  readonly [Symbol.toStringTag]: string
}

type PromiseOptions<T> =
  | {
      parser: SafeParseFn<unknown, ValidatedPromise<T>>
    }
  | {
      parsePromise: DefaultErrorFn['parsePromise']
    }
  // eslint-disable-next-line @typescript-eslint/ban-types
  | {}

export function parsePromise<T extends MinimumSafeParsableObject>(
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
                if (!isResult(res)) return rejectorS(res[0])
                return resolverS(res[1])
              },
              (error) => rejectorS(error),
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
      { input: value, errors: [((options as any).parsePromise || errorFns.parsePromise)(value)] },
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

export interface VPromise<
  T extends MinimumSafeParsableObject,
  Output = ValidatedPromise<VInfer<T>>,
  Input = unknown,
> extends SafeParsableObject<Output, string, 'promise', Input> {
  [parserObject]: ParserObject<Output, string, 'promise', Input, { readonly resultParser: T }>
  readonly definition: { readonly resultParser: T }
}

const basePromiseObject = createValidationBuilder(baseObject, [])

export function vPromise<T extends MinimumSafeParsableObject>(
  resultParser: T,
  options: PromiseOptions<VInfer<T>> = {},
): VPromise<T> {
  return createFinalBaseObject(
    basePromiseObject,
    (options as any).parser || parsePromise(resultParser, options),
    `ValidatedPromise<${resultParser.type}>`,
    'promise',
    { resultParser },
  ) as VPromise<T>
}
