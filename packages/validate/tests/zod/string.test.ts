/* eslint-disable no-empty */
/* eslint-disable no-restricted-syntax */
/* eslint-disable curly */

// cSpell:disable

import { it, expect } from 'vitest'
import { configCustomerErrors } from '../../src/types/init'
import { vString, vStringInstance } from '../../src/types/string'
import { ValidationErrors } from '../../src/types/base validations'
import { firstErrorFromResultError } from '../../src/types/shared'

debugger

const minFive = vStringInstance.min(5, () => 'min5')
const maxFive = vStringInstance.max(5, () => 'max5')
const justFive = vStringInstance.length(5)
const nonempty = vStringInstance.notEmpty(() => 'nonempty')
const startsWith = vStringInstance.startsWith('startsWith')
const endsWith = vStringInstance.endsWith('EndsWith')

it('passing validations', () => {
  debugger
  minFive.parse('12345')
  minFive.parse('123456')
  maxFive.parse('12345')
  maxFive.parse('1234')
  nonempty.parse('1')
  justFive.parse('12345')
  startsWith.parse('startsWithX')
  endsWith.parse('xEndsWith')
})

it('failing validations', () => {
  expect(() => minFive.parse('1234')).toThrow()
  expect(() => maxFive.parse('123456')).toThrow()
  expect(() => nonempty.parse('')).toThrow()
  expect(() => justFive.parse('1234')).toThrow()
  expect(() => justFive.parse('123456')).toThrow()
  expect(() => startsWith.parse('x')).toThrow()
  expect(() => endsWith.parse('x')).toThrow()
})

it('email validations', () => {
  const email = vStringInstance.email()
  email.parse('mojojojo@example.com')
  expect(() => email.parse('asdf')).toThrow()
  expect(() => email.parse('@mail.com')).toThrow()
  expect(() => email.parse('asdf@sdf.')).toThrow()
  expect(() => email.parse('asdf@asdf.com-')).toThrow()
  expect(() => email.parse('asdf@-asdf.com')).toThrow()
  expect(() => email.parse('asdf@-a(sdf.com')).toThrow()
  expect(() => email.parse('asdf@-asdf.com(')).toThrow()
})

it('more email validations', () => {
  const data = [
    `"josé.arrañoça"@domain.com`,
    `"сайт"@domain.com`,
    `"💩"@domain.com`,
    `"🍺🕺🎉"@domain.com`,
    `poop@💩.la`,
    `"🌮"@i❤️tacos.ws`,
    'sss--asd@i❤️tacos.ws',
  ]
  const email = vStringInstance.email()
  for (const datum of data) {
    email.parse(datum)
  }
})

it('url validations', () => {
  const url = vStringInstance.url()
  try {
    url.parse('http://google.com')
    url.parse('https://google.com/asdf?asdf=ljk3lk4&asdf=234#asdf')
    expect(() => url.parse('asdf')).toThrow()
    expect(() => url.parse('https:/')).toThrow()
    expect(() => url.parse('asdfj@lkjsdf.com')).toThrow()
  } catch (err) {}
})

it('url error overrides', () => {
  try {
    vStringInstance.url().parse('https')
  } catch (err) {
    expect((err as ValidationErrors).errors[0]).toEqual("'https' is not a valid URL")
  }
  try {
    vStringInstance.url(() => 'badUrl').parse('https')
  } catch (err) {
    expect((err as ValidationErrors).errors[0]).toEqual('badUrl')
  }
  try {
    vStringInstance.url(() => 'badUrl').parse('https')
  } catch (err) {
    expect((err as ValidationErrors).errors[0]).toEqual('badUrl')
  }
})

it('uuid', () => {
  const uuid = vStringInstance.uuid(() => 'custom error')
  uuid.parse('9491d710-3185-4e06-bea0-6a2f275345e0')
  uuid.parse('00000000-0000-0000-0000-000000000000')
  uuid.parse('b3ce60f8-e8b9-40f5-1150-172ede56ff74') // Variant 0 - RFC 4122: Reserved, NCS backward compatibility
  uuid.parse('92e76bf9-28b3-4730-cd7f-cb6bc51f8c09') // Variant 2 - RFC 4122: Reserved, Microsoft Corporation backward compatibility
  const result = uuid.safeParse('9491d710-3185-4e06-bea0-6a2f275345e0X')
  expect(result[1]).toEqual(undefined)
  if (result[0]) {
    expect(result[0].errors[0]).toEqual('custom error')
  }
})

it('bad uuid', () => {
  const uuid = vStringInstance.uuid(() => 'custom error')
  uuid.parse('9491d710-3185-4e06-bea0-6a2f275345e0')
  const result = uuid.safeParse('invalid uuid')
  expect(result[1]).toEqual(undefined)
  if (result[0]) {
    expect(result[0].errors[0]).toEqual('custom error')
  }
})

it('cuid', () => {
  const cuid = vStringInstance.cuid()
  cuid.parse('ckopqwooh000001la8mbi2im9')
  const result = cuid.safeParse('cifjhdsfhsd-invalid-cuid')
  expect(result[1]).toEqual(undefined)
  if (result[0]) {
    expect(result[0].errors[0]).toEqual("'cifjhdsfhsd-invalid-cuid' is not a valid cuid")
  }
})

it('cuid2', () => {
  const cuid2 = vStringInstance.cuid2(() => 'Invalid cuid2')
  const validStrings = [
    'a', // short string
    'tz4a98xxat96iws9zmbrgj3a', // normal string
    'kf5vz6ssxe4zjcb409rjgo747tc5qjazgptvotk6', // longer than require("@paralleldrive/cuid2").bigLength
  ]
  validStrings.forEach((s) => cuid2.parse(s))
  const invalidStrings = [
    '', // empty string
    '1z4a98xxat96iws9zmbrgj3a', // starts with a number
    'tz4a98xxat96iws9zMbrgj3a', // include uppercase
    'tz4a98xxat96iws-zmbrgj3a', // involve symbols
  ]
  const results = invalidStrings.map((s) => cuid2.safeParse(s))
  // debugger
  expect(results.every((r) => r[0] !== undefined)).toEqual(true)
  if (results[0] && results[0][0]) {
    expect(results[0][0].errors[0]).toEqual('Invalid cuid2')
  }
})

it('regex', () => {
  vStringInstance.regex(/^moo+$/).parse('mooooo')
  expect(() => vStringInstance.uuid().parse('purr')).toThrow()
})

it('regexp error message', () => {
  const result = vStringInstance.regex(/^moo+$/).safeParse('boooo')
  if (result[0]) {
    expect(result[0].errors[0]).toEqual("'boooo' doesn't pass the regex test")
  } else {
    throw new Error('validation should have failed')
  }

  expect(() => vStringInstance.uuid().parse('purr')).toThrow()
})

it('regex lastIndex reset', () => {
  const schema = vStringInstance.regex(/^\d+$/g)
  expect(schema.safeParse('123')[1] !== undefined).toEqual(true)
  expect(schema.safeParse('123')[1] !== undefined).toEqual(true)
  expect(schema.safeParse('123')[1] !== undefined).toEqual(true)
  expect(schema.safeParse('123')[1] !== undefined).toEqual(true)
  expect(schema.safeParse('123')[1] !== undefined).toEqual(true)
})

// it('checks getters', () => {
//   expect(vStringInstance.email().isEmail).toEqual(true)
//   expect(vStringInstance.email().isURL).toEqual(false)
//   expect(vStringInstance.email().isCUID).toEqual(false)
//   expect(vStringInstance.email().isCUID2).toEqual(false)
//   expect(vStringInstance.email().isUUID).toEqual(false)

//   expect(vStringInstance.url().isEmail).toEqual(false)
//   expect(vStringInstance.url().isURL).toEqual(true)
//   expect(vStringInstance.url().isCUID).toEqual(false)
//   expect(vStringInstance.url().isCUID2).toEqual(false)
//   expect(vStringInstance.url().isUUID).toEqual(false)

//   expect(vStringInstance.cuid().isEmail).toEqual(false)
//   expect(vStringInstance.cuid().isURL).toEqual(false)
//   expect(vStringInstance.cuid().isCUID).toEqual(true)
//   expect(vStringInstance.cuid().isCUID2).toEqual(false)
//   expect(vStringInstance.cuid().isUUID).toEqual(false)

//   expect(vStringInstance.cuid2().isEmail).toEqual(false)
//   expect(vStringInstance.cuid2().isURL).toEqual(false)
//   expect(vStringInstance.cuid2().isCUID).toEqual(false)
//   expect(vStringInstance.cuid2().isCUID2).toEqual(true)
//   expect(vStringInstance.cuid2().isUUID).toEqual(false)

//   expect(vStringInstance.uuid().isEmail).toEqual(false)
//   expect(vStringInstance.uuid().isURL).toEqual(false)
//   expect(vStringInstance.uuid().isCUID).toEqual(false)
//   expect(vStringInstance.uuid().isCUID2).toEqual(false)
//   expect(vStringInstance.uuid().isUUID).toEqual(true)
// })

// it('min max getters', () => {
//   expect(vStringInstance.min(5).minLength).toEqual(5)
//   expect(vStringInstance.min(5).min(10).minLength).toEqual(10)
//   expect(vStringInstance.minLength).toEqual(null)

//   expect(vStringInstance.max(5).maxLength).toEqual(5)
//   expect(vStringInstance.max(5).max(1).maxLength).toEqual(1)
//   expect(vStringInstance.maxLength).toEqual(null)
// })

// it('trim', () => {
//   expect(xString().trim().min(2).parse(' 12 ')).toEqual('12')

//   // ordering of methods is respected
//   expect(xString().min(2).trim().parse(' 1 ')).toEqual('1')
//   expect(() => xString().trim().min(2).parse(' 1 ')).toThrow()
// })

it('custom parser', () => {
  const badScheme = vString({ parser: (value: unknown) => [undefined, value as string] })
  badScheme.parse(1)
  const customError = vString({ parseStringError: () => 'hello' })
  const result = customError.safeParse(1)
  expect(firstErrorFromResultError(result)).toBe('hello')
  configCustomerErrors({ parseString: () => 'works!' })
  const result2 = vStringInstance.safeParse(1)
  expect(firstErrorFromResultError(result2)).toBe('works!')
  const result3 = vString().safeParse(1)
  expect(firstErrorFromResultError(result3)).toBe('works!')
})
