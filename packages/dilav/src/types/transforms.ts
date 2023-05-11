import { ResultError, isError } from '../toolbelt'
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
  Input extends MinimumSchema,
  Output,
  Process extends (
    value: ResultError<ValidationErrors, VInfer<Input>>,
  ) => ResultError<ValidationErrors, Output>,
>(postprocessFn: Process, schema: Input) {
  return (value: unknown): ResultError<ValidationErrors, Output> =>
    postprocessFn(schema.safeParse(value))
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * vMap
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export type VPreprocessFn = <T extends MinimumSchema>(
  preprocessFn: (value: unknown) => VInfer<T> | unknown,
  safeParsableObject: T,
) => VPreprocess<T>

export type VPostprocessFn = <Input extends MinimumSchema, Output>(
  postprocessFn: (
    value: ResultError<ValidationErrors, VInfer<Input>>,
  ) => ResultError<ValidationErrors, Output>,
  safeParsableObject: Input,
) => VPostProcess<Input, Output>

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
  function vPreprocess<T extends MinimumSchema>(
    preprocessFn: (value: unknown) => VInfer<T> | unknown,
    schema: T,
  ): VPreprocess<T> {
    return createFinalBaseObject(
      baseDefaultObject,
      parsePreprocessed(preprocessFn, schema),
      schema.type,
      'preprocess',
      { baseSchema: schema, preprocessFn, transformed: true },
    ) as VPreprocess<T>
  }
  function vPostprocess<Input extends MinimumSchema, Output>(
    postprocessFn: (
      value: ResultError<ValidationErrors, VInfer<Input>>,
    ) => ResultError<ValidationErrors, Output>,
    schema: Input,
  ): VPostProcess<Input, Output> {
    return createFinalBaseObject(
      baseDefaultObject,
      parsePostProcessed(postprocessFn, schema),
      schema.type,
      'postprocess',
      {
        baseSchema: schema,
        postprocessFn,
        transformed: true,
      },
    ) as VPostProcess<Input, Output>
  }
  function vDefault<T extends MinimumSchema>(defaultValue: VInfer<T>, schema: T): VPreprocess<T> {
    return vPreprocess((value) => value ?? defaultValue, schema)
  }
  function vCatch<T extends MinimumSchema>(
    catchValue: VInfer<T>,
    schema: T,
  ): VPostProcess<T, VInfer<T>> {
    const x = vPostprocess(
      (value: ResultError<ValidationErrors, VInfer<T>>): ResultError<ValidationErrors, VInfer<T>> =>
        isError(value) ? [undefined, catchValue] : value,
      schema,
    )
    return x
  }
  return { vPreprocess, vPostprocess, vDefault, vCatch }
}
