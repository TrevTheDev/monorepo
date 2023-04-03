import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { vBooleanInstance } from '../../src/types/boolean'
import { vArray, vNullInstance, vUnknownInstance, vObject } from '../../src/types/init'
import { MinimumSafeParsableObject } from '../../src/types/base'

function checkErrors(a: MinimumSafeParsableObject, bad: unknown) {
  let expected
  try {
    a.parse(bad)
  } catch (error) {
    ;[expected] = error.errors
  }
  try {
    ;(a as any).nullable().parse(bad)
  } catch (error) {
    expect(error.errors[0]).toEqual(expected)
  }
}

it('Should have error messages appropriate for the underlying type', () => {
  checkErrors(vStringInstance.min(2), 1)
  vStringInstance.min(2).nullable().parse(null)
  checkErrors(vNumberInstance.gte(2), 1)
  vNumberInstance.gte(2).nullable().parse(null)
  checkErrors(vBooleanInstance, '')
  vBooleanInstance.nullable().parse(null)
  checkErrors(vNullInstance, null)
  vNullInstance.nullable().parse(null)
  checkErrors(vNullInstance, {})
  vNullInstance.nullable().parse(null)
  checkErrors(vObject({}), 1)
  vObject({}).nullable().parse(null)
  checkErrors(vArray([]), 1)
  vArray([]).nullable().parse(null)
  checkErrors(vUnknownInstance, 1)
  vUnknownInstance.nullable().parse(null)
})

it.only('unwrap', () => {
  const nulled = vStringInstance.nullable()
  expect(nulled.type).toEqual('string|null')
  const unwrapped = nulled.definition.wrappedType
  expect(unwrapped.type).toEqual('string')
})
