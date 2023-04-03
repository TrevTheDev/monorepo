import { initArray } from './array'
import { baseInitialiser } from './base'
import { initIntersectionType } from './intersection'
import { initLiteralTypes } from './literal'
import { initUnionTypes } from './union'

const { createBaseValidationBuilder, setBaseChildren } = baseInitialiser()
const { vUnion, vOptional, vNullable, vNullish, setInstances } = initUnionTypes(
  createBaseValidationBuilder,
)
const { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL } = initLiteralTypes(
  createBaseValidationBuilder,
)
const vArray = initArray(createBaseValidationBuilder)
const vIntersection = initIntersectionType(createBaseValidationBuilder)

setBaseChildren(vOptional, vNullable, vArray, vUnion, vIntersection, vNullish)

const vNaNInstance = vNaN()
const vUndefinedInstance = vUndefined()
const vNullInstance = vNull()
const vAnyInstance = vAny()
const vUnknownInstance = vUnknown()
const vNeverInstance = vNever()

setInstances(vUndefinedInstance, vNullInstance)

export {
  vIntersection,
  vUnion,
  vOptional,
  vNullable,
  vLiteral,
  vNaN,
  vUndefined,
  vNull,
  vNullish,
  vAny,
  vUnknown,
  vNever,
  vNullishL,
  vArray,
  vNaNInstance,
  vUndefinedInstance,
  vNullInstance,
  vAnyInstance,
  vUnknownInstance,
  vNeverInstance,
  createBaseValidationBuilder,
}
