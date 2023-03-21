import { it, expect } from 'vitest'
import { vObject } from '../../src/types/object'
import { vStringInstance } from '../../src/types/string'
import { vNumberInstance } from '../../src/types/number'
import { vArray } from '../../src/types/init'
import { VInfer } from '../../src/types/base'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const nested = vObject({
  name: vStringInstance,
  age: vNumberInstance,
  outer: vObject({
    inner: vStringInstance,
  }),
  array: vArray(vObject({ asdf: vStringInstance })),
})

it('shallow inference', () => {
  const shallow = nested.partial()
  type shallow = VInfer<typeof shallow>
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
  const asdf = deep
    .required()
    .shape.propertyParsers.array.infiniteArrayItemParser.shape.propertyParsers.asdf.required()
  asdf.parse('asdf')
  type deep = VInfer<typeof deep>
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

  expect(deep.shape.propertyParsers.name.type).toBe('string|undefined')
  expect(deep.shape.propertyParsers.outer.type).toBe('{inner?:string}|undefined')
  expect(deep.shape.propertyParsers.outer.nonOptionalType.shape.propertyParsers.inner.type).toBe(
    'string|undefined',
  )
  expect(
    deep.shape.propertyParsers.outer.nonOptionalType.shape.propertyParsers.inner.nonOptionalType
      .type,
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
  const schema = vObject({
    name: vStringInstance.optional(),
    age: vNumberInstance.nullable(),
  }).deepPartial()

  expect(schema.shape.propertyParsers.name.type).toBe('string|undefined')
  expect(schema.shape.propertyParsers.age.type).toBe('number|null|undefined')
})

it('deep partial tuple', () => {
  const z = [
    vObject({
      name: vStringInstance.optional(),
      age: vNumberInstance.nullable(),
    }),
  ] as const

  const schema = vObject({
    tuple: vArray(z),
  }).deepPartial()

  expect(
    schema.shape.propertyParsers.tuple.nonOptionalType.finiteArrayParsers[0].shape.propertyParsers
      .name.type,
  ).toBe('string|undefined')
})

it('deep partial inference', () => {
  const obj = vObject({ value: vStringInstance })
  // type Partially2 = VInfer<typeof obj>
  const tup = vArray([obj] as const)
  // type Partially1 = VInfer<typeof tup>
  const mySchema = vObject({
    name: vStringInstance,
    array: vArray(vObject({ asdf: vStringInstance })),
    tuple: tup,
  })

  // type X1 = (typeof mySchema)['shape']['propertyParsers']['tuple']
  // const x = mySchema.shape.propertyParsers.tuple.finiteArrayParsers

  const partially = mySchema.deepPartial()
  type Partially = VInfer<typeof partially>
  type expected = {
    name?: string | undefined
    array?:
      | {
          asdf?: string | undefined
        }[]
      | undefined
    tuple?: [{ value?: string }] | undefined
  }
  assertEqual<expected, Partially>(true)
})

it('required', () => {
  const object = vObject({
    name: vStringInstance,
    age: vNumberInstance.optional(),
    field: vStringInstance.optional().default('asdf'),
    nullableField: vNumberInstance.nullable(),
    nullishField: vStringInstance.nullish(),
  })

  const requiredObject = object.required()
  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString)
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber)
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault)
  expect(requiredObject.shape.nullableField).toBeInstanceOf(z.ZodNullable)
  expect(requiredObject.shape.nullishField).toBeInstanceOf(z.ZodNullable)
})

it('required inference', () => {
  const object = vObject({
    name: vStringInstance,
    age: vNumberInstance.optional(),
    field: vStringInstance.optional().default('asdf'),
    nullableField: vNumberInstance.nullable(),
    nullishField: vStringInstance.nullish(),
  })

  const requiredObject = object.required()

  type required = z.infer<typeof requiredObject>
  type expected = {
    name: string
    age: number
    field: string
    nullableField: number | null
    nullishField: string | null
  }
  assertEqual<expected, required>(true)
})

it('required with mask', () => {
  const object = vObject({
    name: vStringInstance,
    age: vNumberInstance.optional(),
    field: vStringInstance.optional().default('asdf'),
    country: vStringInstance.optional(),
  })

  const requiredObject = object.required({ age: true })
  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString)
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber)
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault)
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodOptional)
})

it('required with mask -- ignore falsy values', () => {
  const object = vObject({
    name: vStringInstance,
    age: vNumberInstance.optional(),
    field: vStringInstance.optional().default('asdf'),
    country: vStringInstance.optional(),
  })

  // @ts-expect-error
  const requiredObject = object.required({ age: true, country: false })
  expect(requiredObject.shape.name).toBeInstanceOf(z.ZodString)
  expect(requiredObject.shape.age).toBeInstanceOf(z.ZodNumber)
  expect(requiredObject.shape.field).toBeInstanceOf(z.ZodDefault)
  expect(requiredObject.shape.country).toBeInstanceOf(z.ZodOptional)
})

it('partial with mask', async () => {
  const object = vObject({
    name: vStringInstance,
    age: vNumberInstance.optional(),
    field: vStringInstance.optional().default('asdf'),
    country: vStringInstance,
  })

  const masked = object.partial({ age: true, field: true, name: true }).strict()

  expect(masked.shape.name).toBeInstanceOf(z.ZodOptional)
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional)
  expect(masked.shape.field).toBeInstanceOf(z.ZodOptional)
  expect(masked.shape.country).toBeInstanceOf(z.ZodString)

  masked.parse({ country: 'US' })
  await masked.parseAsync({ country: 'US' })
})

it('partial with mask -- ignore falsy values', async () => {
  const object = vObject({
    name: vStringInstance,
    age: vNumberInstance.optional(),
    field: vStringInstance.optional().default('asdf'),
    country: vStringInstance,
  })

  const masked = object.partial({ name: true, country: false }).strict()

  expect(masked.shape.name).toBeInstanceOf(z.ZodOptional)
  expect(masked.shape.age).toBeInstanceOf(z.ZodOptional)
  expect(masked.shape.field).toBeInstanceOf(z.ZodDefault)
  expect(masked.shape.country).toBeInstanceOf(z.ZodString)

  masked.parse({ country: 'US' })
  await masked.parseAsync({ country: 'US' })
})

it('deeppartial array', () => {
  const schema = vObject({ array: vStringInstance.array().min(42) }).deepPartial()

  // works as expected
  schema.parse({})

  // should be false, but is true
  expect(schema.safeParse({ array: [] }).success).toBe(false)
})
