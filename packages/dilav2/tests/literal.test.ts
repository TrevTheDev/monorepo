/* eslint-disable no-restricted-syntax */
import { it } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests } from './shared'

it('passing validations', () => {
  // const x1 = v.any
  // const b1 = x1.builder.custom((x) => (x === 'a' ? 'ERROR' : undefined))
  // b1.parse(`b`)
  // b1.parse('a')
  // const c = v.any.validations(b1)
  // c.parse(`b`)
  // c.parse('a')
  basicSchemaTests({
    parser: v.any,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    type: 'any',
    schemaType: 'any',
  })
  basicSchemaTests({
    parser: v.any.builder
      .custom((x) => (x === 'a' ? 'ERROR A' : undefined))
      .custom((x) => (x === 'b' ? 'ERROR B' : undefined)),
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
    ],
    type: 'any',
    schemaType: 'any',
  })
  const { custom } = v.any.validators
  basicSchemaTests({
    parser: v.any.validations([
      custom((x) => (x === 'a' ? 'ERROR A' : undefined)),
      custom((x) => (x === 'b' ? 'ERROR B' : undefined)),
    ]),
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
    ],
    type: 'any',
    schemaType: 'any',
  })
  basicSchemaTests({
    parser: v.any
      .validations([
        custom((x) => (x === 'a' ? 'ERROR A' : undefined)),
        custom((x) => (x === 'b' ? 'ERROR B' : undefined)),
      ])
      .builder.custom((x) => (x === 'c' ? 'ERROR C' : undefined))
      .custom((x) => (x === 'd' ? 'ERROR D' : undefined)),
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
      { failValue: 'c', failError: 'ERROR C' },
      { failValue: 'd', failError: 'ERROR D' },
    ],
    type: 'any',
    schemaType: 'any',
  })
  basicSchemaTests({
    parser: v.unknown,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    type: 'unknown',
    schemaType: 'unknown',
  })
  const never = v.never({ parseNeverError: () => 'NEVER' })
  basicSchemaTests({
    parser: never,
    failValues: [{ failValue: 1, failError: 'NEVER' }, { failValue: '1' }],
    type: 'never',
    schemaType: 'never',
  })
  const undef = v.undefined({ parseUndefinedError: () => 'UNDEFINED' })
  basicSchemaTests({
    parser: undef,
    passValue: undefined,
    failValues: [{ failValue: 1, failError: 'UNDEFINED' }, { failValue: '1' }],
    type: 'undefined',
    schemaType: 'literal',
  })
  const vNull = v.null({ parseNullError: () => 'NULL' })
  basicSchemaTests({
    parser: vNull,
    passValue: null,
    failValues: [{ failValue: 1, failError: 'NULL' }, { failValue: '1' }],
    type: 'null',
    schemaType: 'literal',
  })
  const vTrue = v.true({ parseTrueError: () => 'TRUE' })
  basicSchemaTests({
    parser: vTrue,
    passValue: true,
    failValues: [{ failValue: 1, failError: 'TRUE' }, { failValue: '1' }],
    type: 'true',
    schemaType: 'literal',
  })
  const vFalse = v.false({ parseFalseError: () => 'FALSE' })
  basicSchemaTests({
    parser: vFalse,
    passValue: false,
    failValues: [{ failValue: 1, failError: 'FALSE' }, { failValue: '1' }],
    type: 'false',
    schemaType: 'literal',
  })
  const a = v.literal({
    literal: 'a',
  })
  basicSchemaTests({
    parser: a,
    passValue: 'a',
    failValues: [{ failValue: 1, failError: '1 is not deeply equal to "a"' }, { failValue: '1' }],
    type: 'a',
    schemaType: 'literal',
  })
  const b = v.literal({
    literal: 'b',
    parseLiteralError: () => 'NOT B',
  })
  basicSchemaTests({
    parser: b,
    passValue: 'b',
    failValues: [{ failValue: 1, failError: 'NOT B' }, { failValue: '1' }],
    type: 'b',
    schemaType: 'literal',
  })
  // const { builder } = v.number
  // const schema02 = v.number({ validations: builder.greaterThan(3).lesserThan(5) })
  // basicSchemaTests({
  //   parser: schema02,
  //   passValue: 4,
  //   failValue: 5,
  //   type: 'number',
  //   schemaType: 'number',
  // })
  // const schema03 = v.number.coerce({ validations: [greaterThan(3), lesserThan(5)] })
  // basicSchemaTests({
  //   parser: schema03,
  //   passValue: 4,
  //   failValue: 5,
  //   type: 'number',
  //   schemaType: 'coerced number',
  // })
  // basicSchemaTests({
  //   parser: v.number.coerce(),
  //   passValues: [{ passValue: '1', passValueOutput: 1 }],
  //   type: 'number',
  //   schemaType: 'coerced number',
  // })
})
