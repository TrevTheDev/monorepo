import { describe, it, expect } from 'vitest'
import { vString } from '../../../src/validate/string'
import { VInfer } from '../../../src/validate/base'
import { vArray } from '../../../src/validate/array'

// import { vAny, vNever, vUnknown } from '../../../src/validate/literal'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const minTwo = vString().array().min(2)
const maxTwo = vString().array().max(2)
const justTwo = vString().array().length(2)
const intNum = vString().array().nonempty()
const nonEmptyMax = vString().array().nonempty().max(2)

// type t1 = z.infer<typeof nonEmptyMax>
// assertEqual<[string, ...string[]], t1>(true)

type t2 = VInfer<typeof minTwo>
assertEqual<string[], t2>(true)

describe('adapted from zod anyunknown', () => {
  it('passing validations', () => {
    minTwo.parse(['a', 'a'])
    minTwo.parse(['a', 'a', 'a'])
    maxTwo.parse(['a', 'a'])
    maxTwo.parse(['a'])
    justTwo.parse(['a', 'a'])
    intNum.parse(['a'])
    nonEmptyMax.parse(['a'])
  })

  it('failing validations', () => {
    expect(() => minTwo.parse(['a'])).toThrow()
    expect(() => maxTwo.parse(['a', 'a', 'a'])).toThrow()
    expect(() => justTwo.parse(['a'])).toThrow()
    expect(() => justTwo.parse(['a', 'a', 'a'])).toThrow()
    expect(() => intNum.parse([])).toThrow()
    expect(() => nonEmptyMax.parse([])).toThrow()
    expect(() => nonEmptyMax.parse(['a', 'a', 'a'])).toThrow()
  })

  it('parse empty array in nonempty', () => {
    expect(() =>
      vArray(vString())
        .nonempty()
        .parse([] as unknown),
    ).toThrow()
  })

  // it('get element', () => {
  //   justTwo.element.parse('asdf')
  //   expect(() => justTwo.element.parse(12)).toThrow()
  // })

  // it('continue parsing despite array size error', () => {
  //   const schema = z.object({
  //     people: z.string().array().min(2),
  //   })

  //   const result = schema.safeParse({
  //     people: [123],
  //   })
  //   expect(result.success).toEqual(false)
  //   if (!result.success) expect(result.error.issues.length).toEqual(2)
  // })

  it('parse should fail given sparse array', () => {
    const schema = vArray(vString()).nonempty().min(1).max(3)

    expect(() => schema.parse(new Array(3))).toThrow()
  })
})
