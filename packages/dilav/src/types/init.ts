import { initBase } from './base'
import { defaultErrorFnSym } from './types'
import { initLiteralTypes } from './literal'
import { initVObject } from './object'
import { initUnionTypes } from './union'
import { initArray } from './array'
import { initIntersectionType } from './intersection'
import { initDefault } from './transforms'
import { initPromise } from './promise'
import { DefaultErrorFn } from './errorFns'

const { baseObject, setBaseChildren } = initBase()

const { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL, vVoid } =
  initLiteralTypes(baseObject)

const vNaNInstance = vNaN()
const vUndefinedInstance = vUndefined()
const vNullInstance = vNull()
const vAnyInstance = vAny()
const vUnknownInstance = vUnknown()
const vNeverInstance = vNever()
const vNullishInstance = vNullishL()
const vVoidInstance = vVoid()

const { vUnion, vOptional, vNullable, vNullish, setUnionInstances } = initUnionTypes(baseObject)

const { vObject, setObjectInstances } = initVObject(baseObject)

export const vArray = initArray(baseObject)
export const vIntersection = initIntersectionType(baseObject, vArray, vObject)

const { vPreprocess, vPostprocess, vDefault, vCatch } = initDefault(baseObject)

export const vPromise = initPromise(baseObject)

setBaseChildren(
  vOptional,
  vNullable,
  vUnion,
  vNullish,
  vArray,
  vIntersection,
  vPreprocess,
  vPostprocess,
  vDefault,
  vCatch,
  vPromise,
)
setObjectInstances(vNeverInstance, vUnknownInstance)
setUnionInstances(vUndefinedInstance, vNullInstance)

export { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL, vVoid }
export { vUnion, vOptional, vNullable, vNullish }
export { vObject }

export {
  vNaNInstance,
  vUndefinedInstance,
  vNullInstance,
  vAnyInstance,
  vUnknownInstance,
  vNeverInstance,
  vNullishInstance,
  vVoidInstance,
}

export function setGlobalErrorMessages(errors: Partial<DefaultErrorFn>) {
  Object.assign(baseObject[defaultErrorFnSym], errors)
}

export { baseObject }
