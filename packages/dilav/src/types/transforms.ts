/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, isError } from 'toolbelt'
import { createFinalBaseObject } from './base'
import {
  MinimumSchema,
  VCatch,
  VDefault,
  VInfer,
  VPostProcess,
  VPreprocess,
  ValidationErrors,
} from './types'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parsers
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parsePreprocessed<S extends (value: unknown) => unknown, T extends MinimumSchema>(
  preprocessFn: S,
  schema: T,
) {
  return (value: unknown) => schema.safeParse(preprocessFn(value))
}

export function parsePostProcessed<
  T extends MinimumSchema,
  S extends (value: ReturnType<T['safeParse']>) => unknown,
>(postprocessFn: S, schema: T) {
  return (value: unknown) => postprocessFn(schema.safeParse(value) as ReturnType<T['safeParse']>)
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vMap
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VPreprocessFn = <T extends MinimumSchema, S extends (value: unknown) => unknown>(
  preprocessFn: S,
  safeParsableObject: T,
) => VPreprocess<T, S>

export type VPostprocessFn = <
  T extends MinimumSchema,
  S extends (value: ReturnType<T['safeParse']>) => ResultError<ValidationErrors, any>,
>(
  postprocessFn: S,
  safeParsableObject: T,
) => VPostProcess<T, S>

export type VDefaultFn = <T extends MinimumSchema, S extends VInfer<T>>(
  defaultValue: S,
  safeParsableObject: T,
) => VDefault<T>

export type VCatchFn = <T extends MinimumSchema, S extends VInfer<T>>(
  catchValue: S,
  safeParsableObject: T,
) => VCatch<T>

export function initDefault(baseObject: MinimumSchema): {
  vPreprocess: VPreprocessFn
  vPostprocess: VPostprocessFn
  vDefault: VDefaultFn
  vCatch: VCatchFn
} {
  const baseDefaultObject = Object.create(baseObject)
  function vPreprocess<T extends MinimumSchema, S extends (value: unknown) => unknown>(
    preprocessFn: S,
    schema: T,
  ): VPreprocess<T, S> {
    return createFinalBaseObject(
      baseDefaultObject,
      parsePreprocessed(preprocessFn, schema),
      schema.type,
      'preprocess',
      { baseSchema: schema, preprocessFn, transformed: true },
    ) as VPreprocess<T, S>
  }
  function vPostprocess<
    T extends MinimumSchema,
    S extends (value: ReturnType<T['safeParse']>) => ResultError<ValidationErrors, any>,
  >(postprocessFn: S, schema: T): VPostProcess<T, S> {
    return createFinalBaseObject(
      baseDefaultObject,
      parsePostProcessed<T, S>(postprocessFn, schema) as any,
      schema.type,
      'postprocess',
      { baseSchema: schema, postprocessFn, transformed: true },
    ) as VPostProcess<T, S>
  }
  function vDefault<T extends MinimumSchema, S extends VInfer<T>>(
    defaultValue: S,
    schema: T,
  ): VPreprocess<T, (value: unknown) => unknown> {
    return vPreprocess((value) => value ?? defaultValue, schema)
  }
  function vCatch<T extends MinimumSchema, S extends VInfer<T>>(
    catchValue: S,
    schema: T,
  ): VPostProcess<T, (value: ReturnType<T['safeParse']>) => ReturnType<T['safeParse']>> {
    return vPostprocess(
      (value: ReturnType<T['safeParse']>) =>
        isError(value) ? ([undefined, catchValue] as ReturnType<T['safeParse']>) : value,
      schema,
    )
  }
  return { vPreprocess, vPostprocess, vDefault, vCatch }
}
