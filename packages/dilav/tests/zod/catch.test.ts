/* eslint-disable max-len */
import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('basic catch', () => {
  expect(v.string.catch('default').parse(undefined)).toBe('default')
})

it('catch fn does not run when parsing succeeds', () => {
  // let isCalled = false
  // const cb = () => {
  //   isCalled = true
  //   return 'asdf'
  // }
  expect(v.string.catch('abc').parse('test')).toBe('test')
  // expect(isCalled).toEqual(false)
})

it('basic catch async', async () => {
  const result = await v.string.catch('default').parseAsync(1243)
  expect(result).toBe('default')
})

it('catch replace wrong types', () => {
  expect(v.string.catch('default').parse(true)).toBe('default')
  expect(v.string.catch('default').parse(true)).toBe('default')
  expect(v.string.catch('default').parse(15)).toBe('default')
  expect(v.string.catch('default').parse([])).toBe('default')
  expect(v.string.catch('default').parse(new Map())).toBe('default')
  expect(v.string.catch('default').parse(new Set())).toBe('default')
  expect(v.string.catch('default').parse({})).toBe('default')
})

it('catch with transform', () => {
  const stringWithDefault = v.string.transform((val) => val.toUpperCase()).catch('default')
  expect(stringWithDefault.parse(undefined)).toBe('default')
  expect(stringWithDefault.parse(15)).toBe('default')
  expect(stringWithDefault.baseType).toBe('postprocess')
  expect(stringWithDefault.definition.baseSchema.baseType).toBe('postprocess')
  expect(stringWithDefault.definition.baseSchema.definition.baseSchema.baseType).toBe('string')

  //   type inp = v.input<typeof stringWithDefault>
  //   assertEqual<inp, unknown>(true)
  type out = v.Infer<typeof stringWithDefault>
  assertEqual<out, string>(true)
})

it('catch on existing optional', () => {
  const stringWithDefault = v.string.optional().catch('asdf')
  expect(stringWithDefault.parse(undefined)).toBe(undefined)
  expect(stringWithDefault.parse(15)).toBe('asdf')
  expect(stringWithDefault.baseType).toBe('postprocess')
  expect(stringWithDefault.definition.baseSchema.baseType).toBe('optional')
  expect(stringWithDefault.definition.baseSchema.definition?.wrappedSchema.baseType).toBe('string')

  //   type inp = v.input<typeof stringWithDefault>
  //   assertEqual<inp, unknown>(true)
  type out = v.Infer<typeof stringWithDefault>
  assertEqual<out, string | undefined>(true)
})

it.skip('optional on catch', () => {
  const stringWithDefault = v.string.catch('asdf').optional()

  //   type inp = v.input<typeof stringWithDefault>
  //   assertEqual<inp, unknown>(true)
  type out = v.Infer<typeof stringWithDefault>
  assertEqual<out, string | undefined>(true)
})

it.skip('complex chain example', () => {
  const complex = v.string
    .catch('asdf')
    .transform((val) => `${val}!`)
    .transform((val) => val.toUpperCase())
    .catch('qwer')
    // .removeCatch()
    .optional()
    .catch('asdfasdf')

  expect(complex.parse('qwer')).toBe('QWER!')
  expect(complex.parse(15)).toBe('ASDF!')
  expect(complex.parse(true)).toBe('ASDF!')
})

it.skip('removeCatch', () => {
  //   const stringWithRemovedDefault = v.string.catch('asdf').removeCatch()
  //   type out = v.Infer<typeof stringWithRemovedDefault>
  //   assertEqual<out, string>(true)
})

it('nested', () => {
  const inner = v.string.catch('asdf')
  const outer = v.object({ inner }).catch({
    inner: 'asdf',
  })
  //   type input = v.input<typeof outer>
  //   assertEqual<input, unknown>(true)
  type out = v.Infer<typeof outer>
  assertEqual<out, { inner: string }>(true)
  expect(outer.parse(undefined)).toEqual({ inner: 'asdf' })
  expect(outer.parse({})).toEqual({ inner: 'asdf' })
  expect(outer.parse({ inner: undefined })).toEqual({ inner: 'asdf' })
})

it('chained catch', () => {
  const stringWithDefault = v.string.catch('inner').catch('outer')
  const result = stringWithDefault.parse(undefined)
  expect(result).toEqual('inner')
  const resultDiff = stringWithDefault.parse(5)
  expect(resultDiff).toEqual('inner')
})

it.skip('factory', () => {
  // v.ZodCatch.create(v.string, {
  //   catch: 'asdf',
  // }).parse(undefined)
})

it('native enum', () => {
  // eslint-disable-next-line no-shadow
  enum Fruits {
    apple = 'apple',
    orange = 'orange',
  }

  const schema = v.object({
    fruit: v.enum(Fruits).catch(Fruits.apple),
  })

  expect(schema.parse({})).toEqual({ fruit: Fruits.apple })
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: Fruits.apple })
})

it('enum', () => {
  const schema = v.object({
    fruit: v.enum(['apple', 'orange']).catch('apple'),
  })

  expect(schema.parse({})).toEqual({ fruit: 'apple' })
  expect(schema.parse({ fruit: true })).toEqual({ fruit: 'apple' })
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: 'apple' })
})

it('reported issues with nested usage', () => {
  const schema = v.object({
    string: v.string,
    obj: v.object({
      sub: v.object({
        lit: v.literal('a'),
        subCatch: v.number.catch(23),
      }),
      midCatch: v.number.catch(42),
    }),
    number: v.number.catch(0),
    bool: v.boolean,
  })

  try {
    schema.parse({
      string: {},
      obj: {
        sub: {
          lit: 'b',
          subCatch: '24',
        },
        midCatch: 444,
      },
      number: '',
      bool: 'yes',
    })
  } catch (error) {
    expect(error.errors[0])
      .toEqual(`The object {"string":{},"obj":{"sub":{"lit":"b","subCatch":"24"},"midCatch":444},"number":"","bool":"yes"} is not of type {string:string,obj:{sub:{lit:"a",subCatch:number},midCatch:number},number:number,bool:boolean}.
"string": {} is not a string, 
"obj": The object {"sub":{"lit":"b","subCatch":"24"},"midCatch":444} is not of type {sub:{lit:"a",subCatch:number},midCatch:number}.
"sub": The object {"lit":"b","subCatch":"24"} is not of type {lit:"a",subCatch:number}.
"lit": "b" is not identical to a, 
"bool": "yes" is not a boolean`)

    // expect(issues.length).toEqual(3)
    // expect(issues[0].message).toMatch('string')
    // expect(issues[1].message).toMatch('literal')
    // expect(issues[2].message).toMatch('boolean')
  }
})

it('catch error', () => {
  let catchError: any

  const schema = v.object({
    age: v.number,
    name: v.string.postprocess((ctx) => {
      catchError = ctx

      return [undefined, 'John Doe']
    }),
  })

  const result = schema.safeParse({
    age: null,
    name: null,
  })

  expect(v.isResult(result)).toEqual(false)
  expect(v.isError(result) && result[0].errors.length).toEqual(1)
  expect(v.isError(result) && result[0].errors[0]).toMatch('number')

  expect(v.isError(catchError)).toBe(true)
  expect(catchError !== undefined && catchError[0].errors.length).toEqual(1)
  expect(catchError !== undefined && catchError[0].errors[0]).toMatch('string')
})

it('ctx.input', () => {
  const schema = v.string.postprocess((ctx: any) => [undefined, String(ctx[0].input)])

  expect(schema.parse(123)).toEqual('123')
})
