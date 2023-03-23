/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, isResult } from 'toolbelt'

import type {
  SafeParseFn,
  SafeParsableObject,
  ValidationErrors,
  MinimumSafeParsableObject,
  VInfer,
} from './base'
import defaultErrorFn from './defaultErrors'
import { createBaseValidationBuilder } from './init'

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

type PromiseOptions<T> = {
  parser?: SafeParseFn<unknown, ValidatedPromise<T>>
  notAPromise: typeof defaultErrorFn.notAPromise
}

export function parsePromise<T extends MinimumSafeParsableObject>(
  resultParser: T,
  options: PromiseOptions<VInfer<T>>,
): (value: unknown) => ResultError<ValidationErrors, ValidatedPromise<VInfer<T>>> {
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
    return [{ input: value, errors: [options.notAPromise(value)] }, undefined]
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
> extends SafeParsableObject<Output, `ValidatedPromise<${T['type']}>`, Input> {
  resultParser: T
}

export const vPromise = <T extends MinimumSafeParsableObject>(
  resultParser: T,
  options: Partial<PromiseOptions<VInfer<T>>> = {},
) => {
  const fOptions: PromiseOptions<VInfer<T>> = {
    notAPromise: defaultErrorFn.notAPromise,
    ...options,
  }
  const p = createBaseValidationBuilder(
    fOptions.parser ? fOptions.parser : parsePromise(resultParser, fOptions),
    [],
    `ValidatedPromise<${resultParser.type}>`,
  ) as unknown as VPromise<T>
  return Object.defineProperty(p, 'resultParser', {
    value: resultParser,
  })
}
