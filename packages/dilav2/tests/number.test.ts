/* eslint-disable no-restricted-syntax */
import { it } from 'vitest'
import { v } from '../src/dilav2'
import { basicSchemaTests, testValidations } from './shared'

it('passing validations', () => {
  const { greaterThan, lesserThan } = v.number.validators
  const schema01 = v.number.validations([greaterThan(3), lesserThan(5)])
  basicSchemaTests({
    parser: schema01,
    passValue: 4,
    failValue: 5,
    type: 'number',
    schemaType: 'number',
  })

  const schema02 = v.number.validations(v.number.builder.greaterThan(3).lesserThan(5))
  basicSchemaTests({
    parser: schema02,
    passValue: 4,
    failValue: 5,
    type: 'number',
    schemaType: 'number',
  })
  const schema03 = v.number.coerce({ validations: [greaterThan(3), lesserThan(5)] })
  basicSchemaTests({
    parser: schema03,
    passValue: 4,
    failValue: 5,
    type: 'number',
    schemaType: 'coerced number',
  })
  basicSchemaTests({
    parser: v.number.coerce(),
    passValues: [{ passValue: '1', passValueOutput: 1 }],
    type: 'number',
    schemaType: 'coerced number',
  })
})

it('validations', () => {
  const b = v.number.validators
  testValidations(v.number.validations, [
    {
      validations: [b.greaterThan(3)],
      passValues: [{ passValue: 4 }],
      failValues: [{ failValue: 3, failError: '3 is not greater than 3' }],
    },
    {
      validations: [b.greaterThanOrEqualTo(3)],
      passValues: [{ passValue: 3 }, { passValue: 4 }],
      failValues: [{ failValue: 2, failError: '2 is not greater than or equal to 3' }],
    },
    {
      validations: [b.lesserThan(3)],
      passValues: [{ passValue: 2 }],
      failValues: [{ failValue: 3, failError: '3 is not lesser than 3' }],
    },
    {
      validations: [b.lesserThanOrEqualTo(3)],
      passValues: [{ passValue: 3 }, { passValue: 2 }],
      failValues: [{ failValue: 4, failError: '4 is not lesser than or equal to 3' }],
    },
    {
      validations: [b.positive()],
      passValues: [{ passValue: 1 }],
      failValues: [{ failValue: 0, failError: '0 is not positive' }, { failValue: -1 }],
    },
    {
      validations: [b.nonNegative()],
      passValues: [{ passValue: 0 }, { passValue: 1 }],
      failValues: [{ failValue: -1, failError: '-1 is not positive' }],
    },
    {
      validations: [b.negative()],
      passValues: [{ passValue: -1 }],
      failValues: [{ failValue: 0, failError: '0 is not negative' }, { failValue: 1 }],
    },
    {
      validations: [b.nonPositive()],
      passValues: [{ passValue: 0 }, { passValue: -1 }],
      failValues: [{ failValue: 1, failError: '1 is not negative' }],
    },
    {
      validations: [b.notNaN()],
      passValues: [{ passValue: 1 }],
      failValues: [{ failValue: NaN, failError: 'NaN is not permitted' }],
    },
    {
      validations: [b.multipleOf(5)],
      passValues: [{ passValue: 0 }, { passValue: 5 }, { passValue: 500 }],
      failValues: [{ failValue: 1, failError: '1 is not a multiple of 5' }],
    },
    // {
    //   validations: [b.safe('ab')],
    //   passValues: ['12ab', 'ab'],
    //   failValues: [['12abc', "'12abc' doesn't end with 'ab'"]],
    // },
    {
      validations: [b.finite()],
      passValues: [{ passValue: 1 }],
      failValues: [{ failValue: Infinity, failError: 'Infinity is not finite' }],
    },
    {
      validations: [b.custom((value) => (value === 1 ? undefined : 'not 1'))],
      passValues: [{ passValue: 1 }],
      failValues: [{ failValue: 2, failError: 'not 1' }],
    },
  ])
})
