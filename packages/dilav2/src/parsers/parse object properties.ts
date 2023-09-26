import { Identity } from '@trevthedev/toolbelt'
import defaultErrorFn, { DefaultErrorFn } from '../errorFns'
import { SafeParseOutput } from './parsers'
import { SingleValidationError } from '../validations/validations'
import { isNeverSchema, isOptionalSchema } from '../shared'
import { MinimumSchema, SafeParseFn, VInfer } from '../schema'

const errorFns = defaultErrorFn

export type PropertySchemasDef = { [key: PropertyKey]: MinimumSchema }
export type SingleObjectValidationError = [key: PropertyKey, errors: SingleValidationError[]]

export type ObjectDefToObjectType<
  PropSchemas extends PropertySchemasDef,
  BaseObj extends object = {
    [K in keyof PropSchemas]: VInfer<PropSchemas[K]>['output']
  },
  RequiredKeysT extends PropertyKey = keyof {
    [K in keyof PropSchemas as PropSchemas[K] extends {
      baseType: 'optional'
    }
      ? never
      : K]: K
  },
  RequiredKeys extends keyof BaseObj = RequiredKeysT extends keyof BaseObj ? RequiredKeysT : never,
  FinalObj extends object = Identity<Partial<BaseObj> & Required<Pick<BaseObj, RequiredKeys>>>,
> = FinalObj

export type SafeParseObjectFn<O extends object, I extends object> = SafeParseFn<
  O,
  I,
  [newObject?: object]
>

export function allKeys(propertySchemas: object) {
  return [...Object.keys(propertySchemas), ...Object.getOwnPropertySymbols(propertySchemas)]
}

export function objectValidationErrorsToValidationErrors(
  errors: SingleObjectValidationError[],
): SingleValidationError[] {
  const newErrors = [] as SingleValidationError[]
  for (const error of errors) newErrors.push(`${String(error[0])}: ${error[1]}`)
  return newErrors
}

export function parseObjectProperties<
  T extends PropertySchemasDef,
  I extends object = object,
  O extends object = [keyof I] extends [never]
    ? ObjectDefToObjectType<T>
    : I & ObjectDefToObjectType<T>,
>(options: {
  propertySchemas: T
  missingPropertyError?: DefaultErrorFn['missingPropertyError'] | undefined
  propertySchemaKeys?: PropertyKey[]
  breakOnFirstError?: boolean
}): SafeParseObjectFn<O, I> {
  const {
    propertySchemas,
    missingPropertyError,
    propertySchemaKeys = allKeys(propertySchemas),
    breakOnFirstError,
  } = options
  //   const definedKeys = propertySchemaKeys ?? allKeys(propertySchemas)

  return function ParsePartialObjectFn(value: I, newObject?: object): SafeParseOutput<O> {
    const propertyErrors = [] as SingleObjectValidationError[]

    for (const key of propertySchemaKeys) {
      const schema = propertySchemas[key] as MinimumSchema
      if (key in value || newObject) {
        const result = schema(value[key])
        if (result[0] !== undefined) {
          propertyErrors.push([key, result[0].errors])
          if (breakOnFirstError) break
        } else if (newObject) {
          Object.defineProperty(newObject, key, {
            value: result[1],
            enumerable: true,
            configurable: false,
            writable: false,
          })
        }
      } else if (!isOptionalSchema(schema) && !isNeverSchema(schema)) {
        propertyErrors.push([
          key,
          [(missingPropertyError ?? errorFns.missingPropertyError)(value, key)],
        ])
      }
    }
    const errors: SingleValidationError[] | undefined =
      propertyErrors.length !== 0
        ? objectValidationErrorsToValidationErrors(propertyErrors)
        : undefined

    return errors === undefined
      ? [undefined, (newObject ?? value) as O]
      : [{ input: value, errors }, undefined]
  }
}
