/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResultError, isError } from 'toolbelt'
import { asyncValidate, validate } from './base validations'
import { isOptional } from './shared'
import ValidationError from './Validation error'
import { VArrayFn } from './array'
import { VIntersectionFn } from './intersection'
import defaultErrorFn /* , { DefaultErrorFn }  */ from './errorFns'
import { VCatchFn, VDefaultFn, VPostprocessFn, VPreprocessFn } from './transforms'
import { VPromiseFn } from './promise'
import {
  MinimumSchema,
  parserObject,
  defaultErrorFnSym,
  SafeParseFn,
  SafeParsableObjectTypes,
  ValidationErrors,
  AsyncValidationFn,
  SingleValidationError,
} from './types'
import { VOptionalFn, VNullableFn, VNullishFn, VUnionFn } from './union'

// SafeParsableArray
// VObject
// VOptional2
// VNullable2
// VNullish2

export function initBase() {
  let vOptional: VOptionalFn
  let vNullable: VNullableFn
  let vNullish: VNullishFn
  let vUnion: VUnionFn
  let vArray: VArrayFn
  let vIntersection: VIntersectionFn
  let vPreprocess: VPreprocessFn
  let vPostprocess: VPostprocessFn
  let vDefault: VDefaultFn
  let vCatch: VCatchFn
  let vPromise: VPromiseFn

  const baseObject = {
    safeParse(this: MinimumSchema, value) {
      const { validators, parserFn } = this[parserObject]
      const validationFn = validate(validators, false)
      const parsedOutput = parserFn(value)
      if (parsedOutput[0] !== undefined || validators === undefined || validators.length === 0)
        return parsedOutput
      const validationErrors = validationFn(parsedOutput[1])
      return validationErrors !== undefined
        ? [{ value, errors: validationErrors }, undefined]
        : [undefined, parsedOutput[1]]
    },
    get type(): string {
      return this[parserObject].type
    },
    get baseType(): string {
      return this[parserObject].baseType
    },
    parse(this: MinimumSchema, value) {
      const result = this.safeParse(value)
      if (result[0]) throw new ValidationError(result[0])
      return result[1]
    },
    async parseAsync(this: any, value) {
      const result = await this.safeParseAsync(value)
      if (result[0]) throw new ValidationError(result[0])
      return result[1]
    },
    async safeParseAsync(this: MinimumSchema, value) {
      const { asyncValidators, validators, parserFn } = this[parserObject]
      const validationFn = validate(validators, false)
      const asyncValidationFn = asyncValidate(asyncValidators)
      const parsedOutput = await parserFn(await value)
      if (parsedOutput[0] !== undefined || validators === undefined || validators.length === 0)
        return parsedOutput
      const errors = [] as SingleValidationError[]
      const validationErrors = validationFn(parsedOutput[1])
      const asyncValidationErrors = await asyncValidationFn(parsedOutput[1])
      if (validationErrors !== undefined) errors.push(...validationErrors)
      if (asyncValidationErrors !== undefined) errors.push(...asyncValidationErrors)
      return errors.length !== 0 ? [{ value, errors }, undefined] : [undefined, parsedOutput[1]]
    },
    customAsyncValidation(this: MinimumSchema, fn: AsyncValidationFn<any>) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const oldObject = this
      return {
        __proto__: oldObject,
        [parserObject]: {
          ...oldObject[parserObject],
          asyncValidators: [...oldObject[parserObject].asyncValidators, fn],
        },
      }
    },
    [defaultErrorFnSym]: { ...defaultErrorFn },
    optional(this: MinimumSchema): MinimumSchema {
      return isOptional(this) ? this : vOptional(this)
    },
    and(this: MinimumSchema, ...schemas: [MinimumSchema, ...MinimumSchema[]]): MinimumSchema {
      // const intersection = [this, ...schemas] as const
      return vIntersection([this, ...schemas])
    },
    or(this: MinimumSchema, ...schemas: [MinimumSchema, ...MinimumSchema[]]): MinimumSchema {
      return vUnion([this, ...schemas])
    },
    nullable(this: MinimumSchema): MinimumSchema {
      return this.baseType === 'nullable' ? this : vNullable(this as any)
    },
    nullish(this: MinimumSchema): MinimumSchema {
      return this.baseType === 'nullish' ? (this as any) : vNullish(this as any)
    },
    array(this: MinimumSchema): MinimumSchema {
      return vArray(this)
    },
    preprocess(this: any, preprocessFn: (value: unknown) => unknown) {
      return vPreprocess(preprocessFn, this)
    },
    postprocess(this: any, postprocessFn: (value: any) => any) {
      return vPostprocess(postprocessFn, this)
    },
    transform(this: any, transformFn: (value: any) => any) {
      return vPostprocess((result: any): any => {
        if (isError(result)) return result
        try {
          return [undefined, transformFn(result[1])]
        } catch (e) {
          return [
            {
              input: result[1],
              errors: [`transform failed with: ${String(e)}`],
            },
            undefined,
          ]
        }
      }, this)
    },
    default(this: any, defaultValue: any): MinimumSchema {
      return vDefault(defaultValue, this)
    },
    catch(this: any, catchValue: any): MinimumSchema {
      return vCatch(catchValue, this)
    },
    promise(this: any): MinimumSchema {
      return vPromise(this)
    },
    pipe(this: any, ...schemas: [MinimumSchema, ...MinimumSchema[]]) {
      const [schema, ...rest] = schemas
      const postProcess = vPostprocess((input: ResultError<ValidationErrors, unknown>) => {
        if (isError(input)) return input
        return schema.safeParse(input[1])
      }, this)
      return rest.length === 0
        ? postProcess
        : postProcess.pipe(...(rest as [MinimumSchema, ...MinimumSchema[]]))
    },
    toString(this: MinimumSchema) {
      return `schema:${this.type}`
    },
  }

  return {
    setBaseChildren(
      optional: VOptionalFn,
      nullable: VNullableFn,
      union: VUnionFn,
      nullish: VNullishFn,
      array: VArrayFn,
      intersection: VIntersectionFn,
      preprocessFn: VPreprocessFn,
      postprocessFn: VPostprocessFn,
      defaultFn: VDefaultFn,
      catchFn: VCatchFn,
      promiseFn: VPromiseFn,
    ) {
      vOptional = optional
      vNullable = nullable
      vUnion = union
      vNullish = nullish
      vArray = array
      vIntersection = intersection
      vPreprocess = preprocessFn
      vPostprocess = postprocessFn
      vDefault = defaultFn
      vCatch = catchFn
      vPromise = promiseFn
    },
    baseObject: baseObject as unknown as MinimumSchema, //  Omit<BaseObject, ParserObjectSymbol>,
  }
}

export function createFinalBaseObject<T extends MinimumSchema>(
  baseObject: T,
  parserFn: SafeParseFn<any, any>,
  type: string,
  baseType: SafeParsableObjectTypes,
  definition?: any,
  freeze = false,
): T {
  const obj =
    definition === undefined
      ? {
          __proto__: baseObject,
          [parserObject]: {
            parserFn,
            validators: [],
            asyncValidators: [],
            type,
            baseType,
          },
        }
      : ({
          __proto__: baseObject,
          [parserObject]: {
            parserFn,
            validators: [],
            asyncValidators: [],
            type,
            baseType,
            definition,
          },
          get definition() {
            return this[parserObject].definition
          },
        } as unknown as T)
  return (freeze ? Object.freeze(obj) : obj) as T
}
