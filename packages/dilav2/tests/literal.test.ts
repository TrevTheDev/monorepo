/* eslint-disable no-restricted-syntax */
import { it } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests } from './shared'

it('passing validations', () => {
  basicSchemaTests({
    parser: v.undefined,
    passValue: undefined,
    failValues: [{ failValue: 1, failError: '1 is not undefined' }, { failValue: '1' }],
    type: 'undefined',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.undefined.custom({ parseUndefinedError: () => 'UNDEFINED' }),
    passValue: undefined,
    failValues: [{ failValue: 1, failError: 'UNDEFINED' }, { failValue: '1' }],
    type: 'undefined',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.null,
    passValue: null,
    failValues: [{ failValue: 1, failError: '1 is not null' }, { failValue: '1' }],
    type: 'null',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.null.custom({ parseNullError: () => 'NULL' }),
    passValue: null,
    failValues: [{ failValue: 1, failError: 'NULL' }, { failValue: '1' }],
    type: 'null',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.true,
    passValue: true,
    failValues: [{ failValue: 1, failError: '1 is not true' }, { failValue: '1' }],
    type: 'true',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.true.custom({ parseTrueError: () => 'TRUE' }),
    passValue: true,
    failValues: [{ failValue: 1, failError: 'TRUE' }, { failValue: '1' }],
    type: 'true',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.false,
    passValue: false,
    failValues: [{ failValue: 1, failError: '1 is not false' }, { failValue: '1' }],
    type: 'false',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.false.custom({ parseFalseError: () => 'FALSE' }),
    passValue: false,
    failValues: [{ failValue: 1, failError: 'FALSE' }, { failValue: '1' }],
    type: 'false',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.literal({
      literal: 'a',
    }),
    passValue: 'a',
    failValues: [{ failValue: 1, failError: '1 is not deeply equal to "a"' }, { failValue: '1' }],
    type: 'a',
    schemaType: 'literal',
  })
  basicSchemaTests({
    parser: v.literal({
      literal: 'b',
      parseLiteralError: () => 'NOT B',
    }),
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
it('chaining any', () => {
  const { custom } = v.any.validators
  const parserA1 = v.any.validations([
    custom((x) => (x === 'a' ? 'ERROR A' : undefined)),
    custom((x) => (x === 'b' ? 'ERROR B' : undefined)),
  ])
  // const parserXX = parserA1.builder
  const parserA = parserA1.builder
    .custom((x) => (x === 'c' ? 'ERROR C' : undefined))
    .custom((x) => (x === 'd' ? 'ERROR D' : undefined))
  const parserB = parserA.builder
    .custom((x) => (x === 'e' ? 'ERROR E' : undefined))
    .validations([custom((x) => (x === 'f' ? 'ERROR F' : undefined))])
  basicSchemaTests({
    parser: parserA,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
      { passValue: 'e', passValueOutput: 'e' },
      { passValue: 'f', passValueOutput: 'f' },
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
    parser: parserB,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
      { failValue: 'c', failError: 'ERROR C' },
      { failValue: 'd', failError: 'ERROR D' },
      { failValue: 'e', failError: 'ERROR E' },
      { failValue: 'f', failError: 'ERROR F' },
    ],
    type: 'any',
    schemaType: 'any',
  })
})
it('parsing unknown', () => {
  basicSchemaTests({
    parser: v.unknown,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    type: 'unknown',
    schemaType: 'unknown',
  })
  const builder = v.unknown.builder
    .custom((x) => (x === 'a' ? 'ERROR A' : undefined))
    .custom((x) => (x === 'b' ? 'ERROR B' : undefined))
  basicSchemaTests({
    parser: builder,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
    ],
    type: 'unknown',
    schemaType: 'unknown',
  })
  const { custom } = v.unknown.validators
  basicSchemaTests({
    parser: v.unknown.validations([
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
    type: 'unknown',
    schemaType: 'unknown',
  })
  basicSchemaTests({
    parser: v.unknown.validations(builder),
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
    ],
    type: 'unknown',
    schemaType: 'unknown',
  })
})

it('chaining unknown', () => {
  const { custom } = v.unknown.validators
  const parserA = v.unknown
    .validations([
      custom((x) => (x === 'a' ? 'ERROR A' : undefined)),
      custom((x) => (x === 'b' ? 'ERROR B' : undefined)),
    ])
    .builder.custom((x) => (x === 'c' ? 'ERROR C' : undefined))
    .custom((x) => (x === 'd' ? 'ERROR D' : undefined))
  const parserB = parserA.builder
    .custom((x) => (x === 'e' ? 'ERROR E' : undefined))
    .validations([custom((x) => (x === 'f' ? 'ERROR F' : undefined))])
  basicSchemaTests({
    parser: parserA,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
      { passValue: 'e', passValueOutput: 'e' },
      { passValue: 'f', passValueOutput: 'f' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
      { failValue: 'c', failError: 'ERROR C' },
      { failValue: 'd', failError: 'ERROR D' },
    ],
    type: 'unknown',
    schemaType: 'unknown',
  })
  basicSchemaTests({
    parser: parserB,
    passValues: [
      { passValue: 1, passValueOutput: 1 },
      { passValue: '1', passValueOutput: '1' },
    ],
    failValues: [
      { failValue: 'a', failError: 'ERROR A' },
      { failValue: 'b', failError: 'ERROR B' },
      { failValue: 'c', failError: 'ERROR C' },
      { failValue: 'd', failError: 'ERROR D' },
      { failValue: 'e', failError: 'ERROR E' },
      { failValue: 'f', failError: 'ERROR F' },
    ],
    type: 'unknown',
    schemaType: 'unknown',
  })
})

it('never', () => {
  basicSchemaTests({
    parser: v.never,
    failValues: [{ failValue: 1, failError: "1 doesn't match 'never'" }, { failValue: '1' }],
    type: 'never',
    schemaType: 'never',
  })
  basicSchemaTests({
    parser: v.never.custom({ parseNeverError: () => 'NEVER' }),
    failValues: [{ failValue: 1, failError: 'NEVER' }, { failValue: '1' }],
    type: 'never',
    schemaType: 'never',
  })
})
