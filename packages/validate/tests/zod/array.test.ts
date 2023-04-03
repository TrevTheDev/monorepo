import { it, expect } from 'vitest'
import { isResult } from 'toolbelt'
import { vStringInstance } from '../../src/types/string'
import { VInfer } from '../../src/types/base'
import { vArray, vObject } from '../../src/types/init'
import { firstErrorFromResultError } from '../../src/types/shared'

// import { vAny, vNever, vUnknown } from '../../src/types/literal'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

const minTwo = vStringInstance.array().min(2)
const maxTwo = vStringInstance.array().max(2)
const justTwo = vStringInstance.array().length(2)
const intNum = vStringInstance.array().nonempty()
const nonEmptyMax = vStringInstance.array().nonempty().max(2)

// type t1 = z.infer<typeof nonEmptyMax>
// assertEqual<[string, ...string[]], t1>(true)

type t2 = VInfer<typeof minTwo>
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
    vArray(vStringInstance)
      .nonempty()
      .parse([] as unknown),
  ).toThrow()
})

it('get element', () => {
  justTwo.definition.itemParser.parse('asdf')
  expect(() => justTwo.definition.itemParser.parse(12)).toThrow()
})

it('continue parsing despite array size error', () => {
  const schema = vObject({
    people: vStringInstance.array().min(2),
  })

  const result = schema.safeParse({
    people: [123],
  })
  expect(isResult(result)).toEqual(false)
  expect(firstErrorFromResultError(result))
    .toEqual(`The object {"people":[123]} is not of type {people:string[]}.
"people": The array [123] is not of type string[].
at index 0: 123 is not a string`)
})

it('parse should fail given sparse array', () => {
  const schema = vArray(vStringInstance).nonempty().min(1).max(3)

  expect(() => schema.parse(new Array(3))).toThrow()
})
