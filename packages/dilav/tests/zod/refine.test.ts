import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('refinement', () => {
  const obj1 = v.object({
    first: v.string,
    second: v.string,
  })
  const obj2 = obj1.partial().strict()

  const obj3 = obj2.customValidation((data) =>
    data.first || data.second ? undefined : 'Either first or second should be filled in.',
  )

  expect(obj1 === (obj2 as any)).toEqual(false)
  expect(obj2 === (obj3 as any)).toEqual(false)

  expect(() => obj1.parse({})).toThrow()
  expect(() => obj2.parse({ third: 'adsf' })).toThrow()
  expect(() => obj3.parse({})).toThrow()
  obj3.parse({ first: 'a' })
  obj3.parse({ second: 'a' })
  obj3.parse({ first: 'a', second: 'a' })
})

it('refinement 2', () => {
  const validationSchema = v
    .object({
      email: v.string.email(),
      password: v.string,
      confirmPassword: v.string,
    })
    .customValidation((data) =>
      data.password === data.confirmPassword
        ? undefined
        : 'Both password and confirmation must match',
    )

  expect(() =>
    validationSchema.parse({
      email: 'aaaa@gmail.com',
      password: 'aaaaaaaa',
      confirmPassword: 'bbbbbbbb',
    }),
  ).toThrow()
})

it.skip('refinement type guard', () => {
  const validationSchema = v.object({
    a: v.string.customValidation((s): s is 'a' => (s === 'a' ? undefined : 'not a')),
  })
  type Schema = v.Infer<typeof validationSchema>

  //   assertEqual<'a', Input['a']>(false)
  //   assertEqual<string, Input['a']>(true)

  assertEqual<'a', Schema['a']>(true)
  assertEqual<string, Schema['a']>(false)
})

it('refinement Promise', async () => {
  const validationSchema = v
    .object({
      email: v.string.email(),
      password: v.string,
      confirmPassword: v.string,
    })
    .customAsyncValidation((data) =>
      Promise.resolve().then(() =>
        data.password === data.confirmPassword
          ? undefined
          : 'Both password and confirmation must match',
      ),
    )

  const x = await validationSchema.parseAsync({
    email: 'aaaa@gmail.com',
    password: 'password',
    confirmPassword: 'password',
  })
  debugger
})

it('custom path', async () => {
  const result = await v
    .object({
      password: v.string,
      confirm: v.string,
    })
    .customValidation((data) => (data.confirm === data.password ? undefined : 'confirm'))
    .safeParseAsync({ password: 'asdf', confirm: 'qewr' })
  expect(v.isError(result)).toEqual(true)
  if (v.isError(result)) expect(result[0].errors[0]).toEqual('confirm')
})

it.skip('use path in refinement context', async () => {
  //   const noNested = v.string.customValidation((value) => {
  //     if (ctx.path.length > 0) {
  //       ctx.addIssue({
  //         code: ZodIssueCode.custom,
  //         message: `schema cannot be nested. path: ${ctx.path.join('.')}`,
  //       })
  //       return false
  //     } else {
  //       return true
  //     }
  //   })
  //   const data = v.object({
  //     foo: noNested,
  //   })
  //   const t1 = await noNested.spa('asdf')
  //   const t2 = await data.spa({ foo: 'asdf' })
  //   expect(t1.success).toBe(true)
  //   expect(t2.success).toBe(false)
  //   if (t2.success === false) {
  //     expect(t2.error.issues[0].message).toEqual('schema cannot be nested. path: foo')
  //   }
})

it('superRefine', () => {
  const Strings = v.array(v.string).customValidation((val) => {
    if (val.length > 3) return 'Too many items 😡'
    if (val.length !== new Set(val).size) return `No duplicates allowed.`
    return undefined
  })

  const result = Strings.safeParse(['asfd', 'asfd', 'asfd', 'asfd'])

  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) expect(result[0].errors.length).toEqual(1)

  Strings.parse(['asfd', 'qwer'])
})

it('superRefine - type narrowing', () => {
  type NarrowType = { type: string; age: number }
  const schema = v
    .object({
      type: v.string,
      age: v.number,
    })
    .nullable()
    .customValidation((arg): arg is NarrowType => {
      if (!arg) return 'cannot be null'
      return undefined
    })

  assertEqual<v.Infer<typeof schema>, NarrowType>(true)

  expect(v.isResult(schema.safeParse({ type: 'test', age: 0 }))).toEqual(true)
  expect(v.isResult(schema.safeParse(null))).toEqual(false)
})

it('chained mixed refining types', () => {
  type firstRefinement = { first: string; second: number; third: true }
  type secondRefinement = { first: 'bob'; second: number; third: true }
  type thirdRefinement = { first: 'bob'; second: 33; third: true }
  const schema = v
    .object({
      first: v.string,
      second: v.number,
      third: v.boolean,
    })
    .nullable()
    .customValidation((arg): arg is firstRefinement => (!!arg?.third ? undefined : 'error'))
    .customValidation((arg): arg is secondRefinement => {
      assertEqual<typeof arg, firstRefinement>(true)
      if (arg.first !== 'bob') {
        return '`first` property must be `bob`'
      }
      return undefined
    })
    .customValidation((arg): arg is thirdRefinement => {
      assertEqual<typeof arg, secondRefinement>(true)
      return arg.second === 33 ? undefined : 'error3'
    })

  assertEqual<v.Infer<typeof schema>, thirdRefinement>(true)
})

it.skip('get inner type', () => {
  v.string
    .customValidation(() => undefined)
    .innerType()
    .parse('asdf')
})

it('chained refinements', () => {
  const objectSchema = v
    .object({
      length: v.number,
      size: v.number,
    })
    .customValidation(({ length }) => (length > 5 ? undefined : 'length greater than 5'))
    .customValidation(({ size }) => (size > 7 ? undefined : 'size greater than 7'))
  const r1 = objectSchema.safeParse({
    length: 4,
    size: 9,
  })
  expect(v.isResult(r1)).toEqual(false)
  if (v.isError(r1)) expect(r1[0].errors.length).toEqual(1)

  const r2 = objectSchema.safeParse({
    length: 4,
    size: 3,
  })
  expect(v.isResult(r2)).toEqual(false)
  if (v.isError(r2)) expect(r2[0].errors.length).toEqual(2)
})

it('fatal superRefine', () => {
  const Strings = v.string
    .customValidation((val) => {
      if (val === '') return 'foo'
    })
    .customValidation((val) => {
      if (val !== ' ') return 'bar'
    })

  const result = Strings.safeParse('')

  expect(v.isResult(result)).toEqual(false)
  if (v.isError(result)) expect(result[0].errors.length).toEqual(2)
})
