/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DeepWriteable, isError } from '../toolbelt'
import { createFinalBaseObject } from './base'
import {
  MinimumSchema,
  IntersectionT2,
  IntersectionT,
  MSPOArrayToIntersection,
  VIntersectionT,
  MinimumObjectSchema,
  PropertySchemasDef,
  BaseTypes,
  VArrayInfinite,
  parserObject,
  groupBaseTypes,
  SafeParseOutput,
} from './types'
import { VObjectFn, allKeys } from './object'
import { VArrayFn } from './array'
import { isTransformed } from './shared'
import { vOptional } from './init'

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * types
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

type IntersectionOptions<T extends IntersectionT> = {
  parser?: ReturnType<typeof parseIntersection<T>>
  breakOnFirstError?: boolean
}

export type VIntersectionFn = {
  <const T extends IntersectionT2, TW extends IntersectionT = DeepWriteable<T>>(
    types: T,
    options?: IntersectionOptions<TW>,
  ): VIntersectionT<TW>
  (types: IntersectionT, options?: IntersectionOptions<IntersectionT>): MinimumSchema
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * parser
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function parseIntersection<
  const T extends IntersectionT,
  RV = MSPOArrayToIntersection<DeepWriteable<T>>,
>(types: T, breakOnFirstError = true): (value: unknown) => SafeParseOutput<RV> {
  return (value: unknown): SafeParseOutput<RV> => {
    const errors: string[] = []
    // eslint-disable-next-line no-restricted-syntax
    for (const vType of types) {
      const result = vType.safeParse(value)
      if (isError(result)) {
        errors.push(...result[0].errors)
        if (breakOnFirstError) return [{ input: value, errors }, undefined]
      }
    }
    return errors.length !== 0 ? [{ input: value, errors }, undefined] : [undefined, value as RV]
  }
}

/** ****************************************************************************************************************************
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 * VIntersection
 * *****************************************************************************************************************************
 * *****************************************************************************************************************************
 ***************************************************************************************************************************** */

export function initIntersectionType(
  baseObject: MinimumSchema,
  vArray: VArrayFn,
  vObject: VObjectFn,
): VIntersectionFn {
  const baseIntersectionObject = Object.create(baseObject)

  function intersectObjects(objectSchemas: MinimumObjectSchema[]) {
    const mergeObjectDefinition: { [key: PropertyKey]: MinimumSchema[] } = {}
    const unmatchedPropSchemas: MinimumSchema[] = []
    for (const objectSchema of objectSchemas) {
      const propSchemas = objectSchema.definition.propertySchemas
      unmatchedPropSchemas.push(objectSchema.definition.unmatchedPropertySchema)
      for (const propKey of allKeys(propSchemas)) {
        if (propKey in mergeObjectDefinition)
          mergeObjectDefinition[propKey]!.push(propSchemas[propKey]!)
        else mergeObjectDefinition[propKey] = [propSchemas[propKey]!]
      }
    }
    const objDefinition: PropertySchemasDef = {}
    for (const propKey of allKeys(
      mergeObjectDefinition,
    ) as (keyof typeof mergeObjectDefinition)[]) {
      if (mergeObjectDefinition[propKey]!.length === 1)
        [objDefinition[propKey]!] = mergeObjectDefinition[propKey] as [MinimumSchema]
      else objDefinition[propKey] = vIntersection(mergeObjectDefinition[propKey] as IntersectionT)
    }
    return vObject(objDefinition, vIntersection(unmatchedPropSchemas as IntersectionT))
  }

  function intersectInfiniteArray(arraySchemas: VArrayInfinite<MinimumSchema>[]) {
    const itemSchemas: MinimumSchema[] = []
    for (const arraySchema of arraySchemas)
      itemSchemas.push(arraySchema[parserObject].definition.itemSchema)

    return vArray(vIntersection(itemSchemas as IntersectionT))
  }

  function vIntersection(
    schemasToIntersect: IntersectionT,
    options: IntersectionOptions<IntersectionT> = {},
  ): MinimumSchema {
    let typeString = ''
    let baseSchemaType: BaseTypes | 'mixed' | undefined
    for (const schema of schemasToIntersect) {
      if (isTransformed(schema)) throw new Error('transformed schemas cannot be intersected')
      if (baseSchemaType === undefined) baseSchemaType = schema.baseType
      else if (baseSchemaType !== schema.baseType) baseSchemaType = 'mixed'
      typeString = `${typeString}${
        groupBaseTypes.includes(schema.baseType) ? `(${schema.type})` : schema.type
      }&`
    }
    typeString = typeString.slice(0, -1)
    if (baseSchemaType === 'object')
      return intersectObjects(schemasToIntersect as unknown as MinimumObjectSchema[])
    if (baseSchemaType === 'infinite array') {
      return intersectInfiniteArray(
        schemasToIntersect as unknown as VArrayInfinite<MinimumSchema>[],
      )
    }

    const obj = createFinalBaseObject(
      baseIntersectionObject,
      options.parser ?? parseIntersection(schemasToIntersect, options.breakOnFirstError ?? true),
      typeString,
      'intersection',
    ) as MinimumSchema
    return baseSchemaType === 'optional' ? vOptional(obj) : obj
  }

  return vIntersection as VIntersectionFn
}
