/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest'
import { vUnion, vLiteral, vIntersection, vArray } from '../../src/types/init'
import { vStringInstance } from '../../src/types/string'
import { vObject } from '../../src/types/object'
import { vBooleanInstance } from '../../src/types/boolean'
import { VInfer, firstError, firstErrorFromResultError } from '../../src/types/base'
import { vNumberInstance } from '../../src/types/number'
import { isResult } from 'toolbelt'
// import { vBoolean } from '../../src/types/boolean'
// import { vString } from '../../src/types/string'

it('vIntersection', () => {
  const litA = vLiteral('A' as const)
  const litB = vLiteral('B' as const)
  const litC = vLiteral('C' as const)
  const litD = vLiteral('D' as const)
  const A = [litA, litB, litC, litD] as const
  const B = [litB, litC, litD] as const
  const C = [litA, litB, litD] as const
  const vU1 = vUnion(A)
  const vU2 = vUnion(B)
  const vU3 = vUnion(C)
  const intersection = vIntersection([vU1, vU2, vU3] as const)
  // debugger
  const x = intersection.parse('B')
  expect(intersection.parse('B')).toEqual('B')
  expect(() => intersection.parse('A')).toThrow()
})
it('object intersection', () => {
  const BaseTeacher = vObject({
    subjects: vArray(vStringInstance),
  })
  const HasID = vObject({ id: vStringInstance })
  const Teacher = vIntersection([BaseTeacher.passThrough(), HasID.passThrough()]) // BaseTeacher.merge(HasID);
  const data = {
    subjects: ['math'],
    id: 'qwerty',
  }
  expect(Teacher.parse(data)).toEqual(data)
  expect(() => Teacher.parse({ subject: data.subjects })).toThrow()
  expect(Teacher.parse({ ...data, extra: 12 })).toEqual({ ...data, extra: 12 })
  expect(() => vIntersection([BaseTeacher, HasID]).parse({ ...data, extra: 12 })).toThrow()
})
it('deep intersection', () => {
  const Animal = vObject({
    properties: vObject({
      is_animal: vBooleanInstance,
    }).passThrough(),
  }).passThrough()
  const Cat = vObject({
    properties: vObject({
      jumped: vBooleanInstance,
    }).passThrough(),
  })
    .passThrough()
    .and(Animal)
  type Cat = VInfer<typeof Cat>
  // const cat:Cat = 'asdf' as any;
  const cat = Cat.parse({ properties: { is_animal: true, jumped: true } })
  expect(cat.properties).toEqual({ is_animal: true, jumped: true })
})
it('deep intersection of arrays', () => {
  const Author = vObject({
    posts: vArray(
      vObject({
        post_id: vNumberInstance,
      }).passThrough(),
    ),
  }).passThrough()
  const Registry = vObject({
    posts: vArray(
      vObject({
        title: vStringInstance,
      }).passThrough(),
    ),
  })
    .passThrough()
    .and(Author)
  const posts = [
    { post_id: 1, title: 'Novels' },
    { post_id: 2, title: 'Fairy tales' },
  ]
  const cat = Registry.parse({ posts })
  expect(cat.posts).toEqual(posts)
})
it('invalid intersection types', () => {
  const numberIntersection = vIntersection([vNumberInstance, vStringInstance])
  const syncResult = numberIntersection.safeParse(1234)
  expect(isResult(syncResult)).toEqual(false)
  if (!isResult(syncResult))
    expect(firstErrorFromResultError(syncResult)).toEqual('1234 is not a string')

  // const asyncResult = await numberIntersection.spa(1234)
  // expect(isResult(syncResult)).toEqual(false)
  // if (!isResult(syncResult))
  //   expect(asyncResult.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_intersection_types)
})
// it('invalid array merge', () => {
//   const stringArrInt = vIntersection([
//     vStringInstance.array(),
//     vStringInstance.array().transform((val) => [...val, 'asdf']),
//   ])
//   const syncResult = stringArrInt.safeParse(['asdf', 'qwerty'])
//   expect(isResult(syncResult)).toEqual(false)
//   if (!isResult(syncResult)) {
//     expect(syncResult.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_intersection_types)
//   }
//   // const asyncResult = await stringArrInt.spa(['asdf', 'qwerty'])
//   // expect(aisResult(syncResult)).toEqual(false)
//   // if (!aisResult(syncResult)) {
//   //   expect(asyncResult.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_intersection_types)
//   // }
// })
