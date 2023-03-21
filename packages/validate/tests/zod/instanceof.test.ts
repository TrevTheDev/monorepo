/* eslint-disable max-classes-per-file */
/* eslint-disable no-useless-constructor */
import { it, expect } from 'vitest'
import { vInstanceOf } from '../../src/types/instanceof'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('instanceof', () => {
  class Test {}
  class SubTest extends Test {}
  abstract class AbstractBar {
    constructor(public val: string) {}
  }
  class Bar extends AbstractBar {}

  const TestSchema = vInstanceOf(Test)
  const SubTestSchema = vInstanceOf(SubTest)
  const AbstractSchema = vInstanceOf(Bar)
  const BarSchema = vInstanceOf(Bar)

  TestSchema.parse(new Test())
  const x = TestSchema.parse(new SubTest())
  SubTestSchema.parse(new SubTest())
  AbstractSchema.parse(new Bar('asdf'))
  const bar = BarSchema.parse(new Bar('asdf'))
  expect(bar.val).toEqual('asdf')
  debugger
  expect(() => SubTestSchema.parse(new Test())).toThrow()
  expect(() => TestSchema.parse(12)).toThrow()

  assertEqual<Test, typeof x>(true)
})

// it('instanceof fatal', () => {
//   const schema = vInstanceOf(Date).refine((d) => d.toString())
//   const res = schema.safeParse(null)
//   expect(res.success).toBe(false)
// })
