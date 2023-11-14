import { it, expect } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests, testValidations } from './shared'

it('tmp', () => {
  debugger
  const z1 = v.notAString(1 as unknown)
  const z2 = v.notAString('1' as '1' | 1)
  debugger
})

it('basic', () => {
  basicSchemaTests({
    parser: v.string,
    passValue: 'abc',
    failValue: 1,
    type: 'string',
    schemaType: 'string',
  })
})
it('builder', () => {
  const X1 = v.string
    .custom({ parseStringError: () => 'STRING' })
    .builder.maximum(3)
    .minimum(3)
  basicSchemaTests({
    parser: v.string
      .custom({ parseStringError: () => 'STRING' })
      .builder.maximum(3)
      .minimum(3),
    passValue: 'abc',
    failValues: [{ failValue: 'a' }, { failValue: 1, failError: 'STRING' }],
    type: 'string',
    schemaType: 'string',
  })
})

it('state', () => {
  const p1 = v.string.custom({ parseStringError: () => 'STRING A' })
  expect(() => p1.parse(1)).toThrow('STRING A')
  // expect(() => ).toThrow('STRING A')
  const p2 = p1.builder.maximum(5)
  p2.parse('a')
  const p3 = p2.builder.minimum(2)
  p3.parse('ab')
  expect(() => p3.parse('a')).toThrow()
  const p4 = p3.validations([v.string.validators.minimum(3)])
  p4.parse('abc')
  expect(() => p4.parse('ab')).toThrow()
  const b = v.string.builder.minimum(4)
  const p5 = p4.validations(b)
  p5.parse('abcd')
  expect(() => p5.parse('abc')).toThrow()
  p2.parse('a')
  p3.parse('ab')
  p4.parse('abc')
  p5.parse('abcd')
  expect(() => p5.parse('abcdef')).toThrow()
})

it('validations', () => {
  const {
    maximum,
    minimum,
    size,
    notEmpty,
    beOneOf,
    validEmail,
    validIpv4,
    validIp,
    validURL,
    startsWith,
    includes,
    custom,
    endsWith,
  } = v.string.validators
  testValidations(v.string.validations, [
    {
      validations: [maximum(3)],
      passValues: [{ passValue: 'a' }, { passValue: 'abc' }],
      failValues: [{ failValue: 'abcd', failError: "'abcd' is longer than 3 character(s)" }],
    },
    {
      validations: [minimum(3)],
      passValues: [{ passValue: 'abc' }, { passValue: 'abcd' }],
      failValues: [{ failValue: 'ab', failError: "'ab' is shorter than 3 character(s)" }],
    },
    {
      validations: [size(3)],
      passValues: [{ passValue: 'abc' }],
      failValues: [
        { failValue: 'ab', failError: "'ab' must contain exactly exactly 3 character(s)" },
        { failValue: 'abcd', failError: "'abcd' must contain exactly exactly 3 character(s)" },
      ],
    },
    {
      validations: [notEmpty()],
      passValues: [{ passValue: 'abc' }],
      failValues: [{ failValue: '', failError: 'string cannot be empty' }],
    },
    {
      validations: [beOneOf(['A', 'B'])],
      passValues: [{ passValue: 'A' }, { passValue: 'B' }],
      failValues: [{ failValue: 'C', failError: "'C' not in 'A,B'" }],
    },
    {
      validations: [validEmail()],
      passValues: [{ passValue: 'a@a.com' }],
      failValues: [
        { failValue: 'C', failError: "'C' is not a valid email" },
        { failValue: 'a.com', failError: "'a.com' is not a valid email" },
      ],
    },
    {
      validations: [validIpv4()],
      passValues: [{ passValue: '127.0.0.1' }],
      failValues: [
        { failValue: '1', failError: "'1' is not a valid IPv4 address" },
        { failValue: '127.0.1' },
      ],
    },
    {
      validations: [validIp()],
      passValues: [{ passValue: '127.0.0.1' }],
      failValues: [
        { failValue: '1', failError: "'1' is not a valid IP address" },
        { failValue: '127.0.1' },
      ],
    },
    {
      validations: [validURL()],
      passValues: [
        { passValue: 'http://127.0.0.1' },
        { passValue: 'https://127.0.0.1' },
        { passValue: 'http://cnn.com' },
      ],
      failValues: [
        { failValue: 'cnn.com', failError: "'cnn.com' is not a valid URL" },
        { failValue: '127.0.1' },
      ],
    },
    // {
    //   validations: [b.validDateTime({ precision: 1, offset: true })],
    //   passValues: ['http://127.0.0.1', 'https://127.0.0.1', 'http://cnn.com'],
    //   failValues: [['cnn.com', "'1' is not a valid IPv4 address"], ['127.0.1']],
    // },
    {
      validations: [startsWith('ab')],
      passValues: [{ passValue: 'ab' }, { passValue: 'abc' }],
      failValues: [{ failValue: 'a', failError: "'a' doesn't start with 'ab'" }],
    },
    {
      validations: [endsWith('ab')],
      passValues: [{ passValue: '12ab' }, { passValue: 'ab' }],
      failValues: [{ failValue: '12abc', failError: "'12abc' doesn't end with 'ab'" }],
    },
    {
      validations: [includes('ab')],
      passValues: [{ passValue: '12abds' }, { passValue: 'ab' }],
      failValues: [{ failValue: 'acd', failError: "'acd' doesn't include 'ab'" }],
    },
    {
      validations: [custom((value) => (value === 'a' ? undefined : 'not a'))],
      passValues: [{ passValue: 'a' }],
      failValues: [{ failValue: 'b', failError: 'not a' }],
    },
  ])
})

it('coerce', () => {
  basicSchemaTests({
    parser: v.string.coerce,
    passValues: [{ passValue: 'a' }, { passValue: 1, passValueOutput: '1' }],
    // failValues: [{ failValue: 'a' }, { failValue: 1, failError: 'STRING' }],
    type: 'string',
    schemaType: 'coerced string',
  })

  basicSchemaTests({
    parser: v.string.coerce.builder.size(2),
    passValues: [{ passValue: 'aa' }, { passValue: 12, passValueOutput: '12' }],
    failValues: [{ failValue: 'a' }],
    type: 'string',
    schemaType: 'coerced string',
  })
  expect(v.string.coerce.builder.parse(1)).toEqual('1')
})
