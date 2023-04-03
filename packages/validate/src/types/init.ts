import { DefaultErrorFnSym, defaultErrorFnSym, initBase } from './base'
// import { DefaultErrorFn } from './errorFns'
import { initLiteralTypes } from './literal'
import { initVObject } from './object'
// import { initIntersectionType } from './intersection'

import { initUnionTypes } from './union'
import { initArray } from './array'
import { initIntersectionType } from './intersection'
import { initDefault } from './default'

const { baseObject, setBaseChildren } = initBase()

const { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL } =
  initLiteralTypes(baseObject)

const vNaNInstance = vNaN()
const vUndefinedInstance = vUndefined()
const vNullInstance = vNull()
const vAnyInstance = vAny()
const vUnknownInstance = vUnknown()
const vNeverInstance = vNever()
const vNullishInstance = vNullishL()

export type VNever = typeof vNeverInstance

const { vUnion, vOptional, vNullable, vNullish, setUnionInstances } = initUnionTypes(baseObject)

const { vObject, vLazy, setObjectInstances } = initVObject(baseObject)

export const vArray = initArray(baseObject)
export const vIntersection = initIntersectionType(baseObject)

export const vDefault = initDefault(baseObject)

setBaseChildren(vOptional, vNullable, vUnion, vNullish, vArray, vIntersection, vDefault)
setObjectInstances(vNeverInstance, vUnknownInstance)
setUnionInstances(vUndefinedInstance, vNullInstance, vNeverInstance)

export { vLiteral, vNaN, vUndefined, vNull, vAny, vUnknown, vNever, vNullishL }
export { vUnion, vOptional, vNullable, vNullish }
export { vObject, vLazy }

// export const vString = initVString(baseObject)
// export const vStringInstance = vString()

export {
  vNaNInstance,
  vUndefinedInstance,
  vNullInstance,
  vAnyInstance,
  vUnknownInstance,
  vNeverInstance,
  vNullishInstance,
}

export function configCustomerErrors(errors: Partial<DefaultErrorFnSym>) {
  Object.assign(baseObject[defaultErrorFnSym], errors)
}

export { baseObject }
