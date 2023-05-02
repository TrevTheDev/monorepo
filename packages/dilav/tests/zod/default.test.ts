import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('basic defaults', () => {
  expect(v.string.default('default').parse(undefined)).toBe('default')
})

it('default with transform', () => {
  const stringWithDefault = v.string.transform((val) => val.toUpperCase()).default('default')
  expect(stringWithDefault.parse(undefined)).toBe('DEFAULT')
  expect(stringWithDefault.baseType).toEqual('preprocess')
  expect(stringWithDefault.definition.baseSchema.baseType).toBe('postprocess')
  expect(stringWithDefault.definition.baseSchema.definition.baseSchema.baseType).toBe('string')

  //   type inp = v.input<typeof stringWithDefault>
  //   assertEqual<inp, string | undefined>(true)
  type out = v.Infer<typeof stringWithDefault>
  assertEqual<out, string>(true)
})

it('default on existing optional', () => {
  const stringWithDefault = v.string.optional().default('asdf')
  expect(stringWithDefault.parse(undefined)).toBe('asdf')
  expect(stringWithDefault.baseType).toBe('preprocess')
  expect(stringWithDefault.definition.baseSchema.baseType).toBe('optional')
  expect(stringWithDefault.definition.baseSchema.definition?.wrappedSchema.baseType).toBe('string')

  //   type inp = v.input<typeof stringWithDefault>
  //   assertEqual<inp, string | undefined>(true)
  // TODO: consider

  // type out = v.Infer<typeof stringWithDefault>
  // assertEqual<out, string>(true)
})

it.skip('optional on default', () => {
  const stringWithDefault = v.string.default('asdf').optional()

  //   type inp = v.input<typeof stringWithDefault>
  //   assertEqual<inp, string | undefined>(true)
  type out = v.Infer<typeof stringWithDefault>
  assertEqual<out, string | undefined>(true)
})

it('complex chain example', () => {
  const complex = v.string
    .default('asdf')
    .transform((val) => val.toUpperCase())
    .default('qwer')
    // .removeDefault()
    // .optional()
    .default('asdfasdf')

  expect(complex.parse(undefined)).toBe('ASDFASDF')
})

it.skip('removeDefault', () => {
  //   const stringWithRemovedDefault = v.string.default('asdf').removeDefault()
  //   type out = v.Infer<typeof stringWithRemovedDefault>
  //   assertEqual<out, string>(true)
})

it('nested', () => {
  const inner = v.string.default('asdf')
  const outer = v.object({ inner }).default({
    inner: undefined as unknown as string,
  })
  //   type input = v.input<typeof outer>
  //   assertEqual<input, { inner?: string | undefined } | undefined>(true)
  type out = v.Infer<typeof outer>
  assertEqual<out, { inner: string }>(true)
  expect(outer.parse(undefined)).toEqual({ inner: 'asdf' })
  expect(outer.parse({})).toEqual({ inner: 'asdf' })
  expect(outer.parse({ inner: undefined })).toEqual({ inner: 'asdf' })
})

it('chained defaults', () => {
  const stringWithDefault = v.string.default('inner').default('outer')
  const result = stringWithDefault.parse(undefined)
  expect(result).toEqual('outer')
})

it.skip('factory', () => {
  //   expect(v.ZodDefault.create(v.string, { default: 'asdf' }).parse(undefined)).toEqual('asdf')
})

it('native enum', () => {
  // eslint-disable-next-line no-shadow
  enum Fruits {
    apple = 'apple',
    orange = 'orange',
  }

  const schema = v.object({
    fruit: v.enum(Fruits).default(Fruits.apple),
  })

  expect(schema.parse({})).toEqual({ fruit: Fruits.apple })
})

it('enum', () => {
  const schema = v.object({
    fruit: v.enum(['apple', 'orange']).default('apple'),
  })

  expect(schema.parse({})).toEqual({ fruit: 'apple' })
})
