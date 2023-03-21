import { it, expect } from 'vitest'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { vBooleanInstance } from '../../src/types/boolean'
import { vArray, vNullInstance, vUndefinedInstance, vUnknownInstance } from '../../src/types/init'
import { vObject } from '../../src/types/object'
import { MinimumSafeParsableObject } from '../../src/types/base'

function checkErrors(a: MinimumSafeParsableObject, bad: unknown) {
  let expected
  try {
    a.parse(bad)
  } catch (error) {
    ;[expected] = error.errors
  }
  try {
    a.nullable().parse(bad)
  } catch (error) {
    expect(error.errors[0]).toEqual(expected)
  }
}

it('Should have error messages appropriate for the underlying type', () => {
  checkErrors(vStringInstance.min(2), 1)
  vStringInstance.min(2).optional().parse(undefined)
  checkErrors(vNumberInstance.gte(2), 1)
  vNumberInstance.gte(2).optional().parse(undefined)
  checkErrors(vBooleanInstance, '')
  vBooleanInstance.optional().parse(undefined)
  checkErrors(vUndefinedInstance, null)
  vUndefinedInstance.optional().parse(undefined)
  checkErrors(vNullInstance, {})
  vNullInstance.optional().parse(undefined)
  checkErrors(vObject({}), 1)
  vObject({}).optional().parse(undefined)
  checkErrors(vArray([]), 1)
  vArray([]).optional().parse(undefined)
  checkErrors(vUnknownInstance, 1)
  vUnknownInstance.optional().parse(undefined)
})

it('unwrap', () => {
  const optioned = vStringInstance.optional()
  expect(optioned.type).toEqual('string|undefined')
  const unwrapped = optioned.required()
  expect(unwrapped.type).toEqual('string')
})
