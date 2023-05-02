import { it, expect } from 'vitest'
import { v } from '../../src'

// import { firstErrorFromResultError } from '../../src/types/shared'

// import { vAny, vNever, vUnknown } from '../../src/types/literal'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const minTwo = v.string.array().min(2)
const maxTwo = v.string.array().max(2)
const justTwo = v.string.array().length(2)
const intNum = v.string.array().nonEmpty()
const nonEmptyMax = v.string.array().nonEmpty().max(2)

// TODO: consider
type t1 = v.Infer<typeof nonEmptyMax>
assertEqual<[string, ...string[]], t1>(true)

type t2 = v.Infer<typeof minTwo>
assertEqual<string[], t2>(true)

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
    v
      .array(v.string)
      .nonEmpty()
      .parse([] as any),
  ).toThrow()
})

it('get element', () => {
  justTwo.definition.itemSchema.parse('asdf')
  expect(() => justTwo.definition.itemSchema.parse(12)).toThrow()
})

it('continue parsing despite array size error', () => {
  const schema = v.object({
    people: v.string.array().min(2),
  })

  const result = schema.safeParse({
    people: [123],
  })
  expect(v.isResult(result)).toEqual(false)
  if (!v.isResult(result)) expect(result[0].errors.length).toEqual(1)
})

it('parse should fail given sparse array', () => {
  const schema = v.array(v.string).nonEmpty().min(1).max(3)

  expect(() => schema.parse(new Array(3))).toThrow()
})
