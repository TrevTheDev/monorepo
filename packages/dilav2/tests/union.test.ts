import { it } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests, testValidations } from './shared'

it('passing validations', () => {
  const literalUnion01 = v.literalUnion({
    literals: ['A', 'B', 1],
    noMatchFoundInLiteralUnionError: () => 'L UNION',
  })
  basicSchemaTests({
    parser: literalUnion01,
    passValues: [{ passValue: 'A' }, { passValue: 1 }],
    failValues: [{ failValue: 'C', failError: 'L UNION' }],
    type: `"A"|"B"|1`,
    schemaType: 'literal union',
  })
  // const { builder } = v.string
  // const stringSchema02 = v.string({
  //   validations: builder.maximum(3).minimum(3),
  //   parseStringError: () => 'STRING',
  // })
  // basicSchemaTests({
  //   parser: stringSchema02,
  //   passValue: 'abc',
  //   failValues: [{ failValue: 'a' }, { failValue: 1, failError: 'STRING' }],
  //   type: 'string',
  //   schemaType: 'string',
  // })
  // expect(stringSchema02.parse('abc')).toEqual('abc')
  // const stringSchema03 = v.string.coerce({ validations: [maximum(3), minimum(3)] })
  // basicSchemaTests({
  //   parser: stringSchema03,
  //   passValue: 'abc',
  //   failValue: 'a',
  //   type: 'string',
  //   schemaType: 'coerced string',
  // })
  // basicSchemaTests({
  //   parser: v.string.coerce(),
  //   passValues: [{ passValue: 1, passValueOutput: '1' }],
  //   type: 'string',
  //   schemaType: 'coerced string',
  // })
})

it('validations', () => {
  const b = v.string.validators
  testValidations(v.string, [
    {
      validations: [b.maximum(3)],
      passValues: [{ passValue: 'a' }, { passValue: 'abc' }],
      failValues: [{ failValue: 'abcd', failError: "'abcd' is longer than 3 character(s)" }],
    },
    {
      validations: [b.minimum(3)],
      passValues: [{ passValue: 'abc' }, { passValue: 'abcd' }],
      failValues: [{ failValue: 'ab', failError: "'ab' is shorter than 3 character(s)" }],
    },
    {
      validations: [b.length(3)],
      passValues: [{ passValue: 'abc' }],
      failValues: [
        { failValue: 'ab', failError: "'ab' must contain exactly exactly 3 character(s)" },
        { failValue: 'abcd', failError: "'abcd' must contain exactly exactly 3 character(s)" },
      ],
    },
    {
      validations: [b.notEmpty()],
      passValues: [{ passValue: 'abc' }],
      failValues: [{ failValue: '', failError: 'string cannot be empty' }],
    },
    {
      validations: [b.beOneOf(['A', 'B'])],
      passValues: [{ passValue: 'A' }, { passValue: 'B' }],
      failValues: [{ failValue: 'C', failError: "'C' not in 'A,B'" }],
    },
    {
      validations: [b.validEmail()],
      passValues: [{ passValue: 'a@a.com' }],
      failValues: [
        { failValue: 'C', failError: "'C' is not a valid email" },
        { failValue: 'a.com', failError: "'a.com' is not a valid email" },
      ],
    },
    {
      validations: [b.validIpv4()],
      passValues: [{ passValue: '127.0.0.1' }],
      failValues: [
        { failValue: '1', failError: "'1' is not a valid IPv4 address" },
        { failValue: '127.0.1' },
      ],
    },
    {
      validations: [b.validIp()],
      passValues: [{ passValue: '127.0.0.1' }],
      failValues: [
        { failValue: '1', failError: "'1' is not a valid IP address" },
        { failValue: '127.0.1' },
      ],
    },
    {
      validations: [b.validURL()],
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
      validations: [b.startsWith('ab')],
      passValues: [{ passValue: 'ab' }, { passValue: 'abc' }],
      failValues: [{ failValue: 'a', failError: "'a' doesn't start with 'ab'" }],
    },
    {
      validations: [b.endsWith('ab')],
      passValues: [{ passValue: '12ab' }, { passValue: 'ab' }],
      failValues: [{ failValue: '12abc', failError: "'12abc' doesn't end with 'ab'" }],
    },
    {
      validations: [b.includes('ab')],
      passValues: [{ passValue: '12abds' }, { passValue: 'ab' }],
      failValues: [{ failValue: 'acd', failError: "'acd' doesn't include 'ab'" }],
    },
    {
      validations: [b.custom((value) => (value === 'a' ? undefined : 'not a'))],
      passValues: [{ passValue: 'a' }],
      failValues: [{ failValue: 'b', failError: 'not a' }],
    },
  ])
})
