/* eslint-disable max-classes-per-file */
/* eslint-disable no-useless-constructor */
import { it, expect } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('instanceOf', async () => {
  class Test {}
  class Subtest extends Test {}
  abstract class AbstractBar {
    constructor(public val: string) {}
  }
  class Bar extends AbstractBar {}

  const TestSchema = v.instanceOf(Test)
  const SubtestSchema = v.instanceOf(Subtest)
  const AbstractSchema = v.instanceOf(AbstractBar)
  const BarSchema = v.instanceOf(Bar)

  TestSchema.parse(new Test())
  TestSchema.parse(new Subtest())
  SubtestSchema.parse(new Subtest())
  AbstractSchema.parse(new Bar('asdf'))
  const bar = BarSchema.parse(new Bar('asdf'))
  expect(bar.val).toEqual('asdf')

  await expect(() => SubtestSchema.parse(new Test())).toThrow(/{} is not an instance of 'Subtest'/)
  await expect(() => TestSchema.parse(12)).toThrow(/12 is not an instance of 'Test'/)

  assertEqual<Test, v.Infer<typeof TestSchema>>(true)
})

it('instanceOf fatal', () => {
  const schema = v.instanceOf(Date).transform((d) => d.toString())
  const res = schema.safeParse(null)
  expect(v.isResult(res)).toBe(false)
})
