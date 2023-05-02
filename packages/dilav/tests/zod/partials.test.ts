import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const nested = v.object({
  name: v.string,
  age: v.number,
  outer: v.object({
    inner: v.string,
  }),
  array: v.array(v.object({ asdf: v.string })),
})

it('shallow inference', () => {
  const shallow = nested.partial()
  type shallow = v.Infer<typeof shallow>
  type correct = {
    name?: string | undefined
    age?: number | undefined
    outer?: { inner: string } | undefined
    array?: { asdf: string }[]
  }
  assertEqual<shallow, correct>(true)
})

it('shallow partial parse', () => {
  const shallow = nested.partial()
  shallow.parse({})
  shallow.parse({
    name: 'asdf',
    age: 23143,
  })
})

it('deep partial inference', () => {
  const deep = nested.deepPartial()
  const { asdf } =
    deep.definition.propertySchemas.array.definition.wrappedSchema.definition.itemSchema.definition
      .propertySchemas
  asdf.parse('asdf')
  type deep = v.Infer<typeof deep>
  type correct = {
    array?: { asdf?: string }[]
    name?: string | undefined
    age?: number | undefined
    outer?: { inner?: string | undefined } | undefined
  }

  assertEqual<deep, correct>(true)
})

it('deep partial parse', () => {
  const deep = nested.deepPartial()

  expect(deep.definition.propertySchemas.name.baseType).toBe('optional')
  expect(deep.definition.propertySchemas.outer.baseType).toBe('optional')
  expect(deep.definition.propertySchemas.outer.definition.wrappedSchema.baseType).toBe('object')
  expect(
    deep.definition.propertySchemas.outer.definition.wrappedSchema.definition.propertySchemas.inner
      .baseType,
  ).toBe('optional')
  expect(
    deep.definition.propertySchemas.outer.definition.wrappedSchema.definition.propertySchemas.inner
      .definition.wrappedSchema.baseType,
  ).toBe('string')
})

it('deep partial runtime tests', () => {
  const deep = nested.deepPartial()
  deep.parse({})
  deep.parse({
    outer: {},
  })
  deep.parse({
    name: 'asdf',
    age: 23143,
    outer: {
      inner: 'adsf',
    },
  })
})

it('deep partial optional/nullable', () => {
  const schema = v
    .object({
      name: v.string.optional(),
      age: v.number.nullable(),
    })
    .deepPartial()

  expect(schema.definition.propertySchemas.name.definition.wrappedSchema.baseType).toBe('string')
  expect(schema.definition.propertySchemas.age.definition.wrappedSchema.baseType).toBe('nullable')
})

it('deep partial array', () => {
  const schema = v
    .object({
      array: v.array([
        v.object({
          name: v.string.optional(),
          age: v.number.nullable(),
        }),
      ]),
    })
    .deepPartial()

  expect(
    schema.definition.propertySchemas.array.definition.wrappedSchema.definition.itemSchemas[0]
      .definition.propertySchemas.name.baseType,
  ).toBe('optional')
})

it('deep partial inference', () => {
  const mySchema = v.object({
    name: v.string,
    array: v.array(v.object({ asdf: v.string })),
    tuple: v.array([v.object({ value: v.string })]),
  })

  const partialed = mySchema.deepPartial()
  type partialed = v.Infer<typeof partialed>
  type expected = {
    name?: string | undefined
    array?:
      | {
          asdf?: string | undefined
        }[]
      | undefined
    tuple?: [{ value?: string }] | undefined
  }
  assertEqual<expected, partialed>(true)
})

it('required', () => {
  const object = v.object({
    name: v.string,
    age: v.number.optional(),
    field: v.string.optional().default('asdf'),
    nullableField: v.number.nullable(),
    nullishField: v.string.nullish(),
  })

  const requiredObject = object.required()
  expect(requiredObject.definition.propertySchemas.name.baseType).toBe('string')
  expect(requiredObject.definition.propertySchemas.age.baseType).toBe('number')
  expect(requiredObject.definition.propertySchemas.field.baseType).toBe('preprocess')
  expect(requiredObject.definition.propertySchemas.nullableField.baseType).toBe('nullable')
  expect(requiredObject.definition.propertySchemas.nullishField.baseType).toBe('nullish')
})

it('required inference', () => {
  const object = v.object({
    name: v.string,
    age: v.number.optional(),
    field: v.string.optional().default('asdf'),
    nullableField: v.number.nullable(),
    nullishField: v.string.nullish(),
  })

  const requiredObject = object.required()

  type required = v.Infer<typeof requiredObject>
  type expected = {
    name: string
    age: number
    field: string | undefined // TODO : consider
    nullableField: number | null
    nullishField: string | null | undefined
  }
  assertEqual<expected, required>(true)
})

it('required with mask', () => {
  const object = v.object({
    name: v.string,
    age: v.number.optional(),
    field: v.string.optional().default('asdf'),
    country: v.string.optional(),
  })

  const requiredObject = object.required('age')
  expect(requiredObject.definition.propertySchemas.name.baseType).toBe('string')
  expect(requiredObject.definition.propertySchemas.age.baseType).toBe('number')
  expect(requiredObject.definition.propertySchemas.field.baseType).toBe('preprocess')
  expect(requiredObject.definition.propertySchemas.country.baseType).toBe('optional')
})

it('required with mask -- ignore falsy values', () => {
  const object = v.object({
    name: v.string,
    age: v.number.optional(),
    field: v.string.optional().default('asdf'),
    country: v.string.optional(),
  })

  const requiredObject = object.required('age', 'country')
  expect(requiredObject.definition.propertySchemas.name.baseType).toBe('string')
  expect(requiredObject.definition.propertySchemas.age.baseType).toBe('number')
  expect(requiredObject.definition.propertySchemas.field.baseType).toBe('preprocess')
  expect(requiredObject.definition.propertySchemas.country.baseType).toBe('string')
})

it('partial with mask', async () => {
  const obj = v.object({
    name: v.string,
    age: v.number.optional(),
    field: v.string.optional(), // .default('asdf'),
    country: v.string,
  })

  const masked = obj.partial('age', 'field', 'name').strict()

  expect(masked.definition.propertySchemas.name.baseType).toBe('optional')
  expect(masked.definition.propertySchemas.age.baseType).toBe('optional')
  expect(masked.definition.propertySchemas.field.baseType).toBe('optional')
  expect(masked.definition.propertySchemas.country.baseType).toBe('string')

  masked.parse({ country: 'US' })
  await masked.parseAsync({ country: 'US' })
})

it('partial with mask ignore falsy values', async () => {
  const object = v.object({
    name: v.string,
    age: v.number.optional(),
    field: v.string.optional(), // .default('asdf'),
    country: v.string,
  })

  const masked = object.partial('name').strict()

  expect(masked.definition.propertySchemas.name.baseType).toBe('optional')
  expect(masked.definition.propertySchemas.age.baseType).toBe('optional')
  expect(masked.definition.propertySchemas.field.baseType).toBe('optional')
  expect(masked.definition.propertySchemas.country.baseType).toBe('string')

  masked.parse({ country: 'US' })
  await masked.parseAsync({ country: 'US' })
})

it('deeppartial array', () => {
  const schema = v.object({ array: v.string.array().min(42) }).deepPartial()

  // works as expected
  schema.parse({})

  // should be false, but is true
  expect(v.isResult(schema.safeParse({ array: [] }))).toBe(false)
})
