/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from 'vitest'
import { vUnion, vLiteral, vIntersection } from '../../src/types/init'
// import { vBoolean } from '../../src/types/boolean'
// import { vString } from '../../src/types/string'

describe('adapted from zod intersection', () => {
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
  // it('object intersection', () => {
  //   const BaseTeacher = z.object({
  //     subjects: z.array(vString()),
  //   })
  //   const HasID = z.object({ id: vString() })
  //   const Teacher = vIntersection(BaseTeacher.passthrough(), HasID) // BaseTeacher.merge(HasID);
  //   const data = {
  //     subjects: ['math'],
  //     id: 'qwerty',
  //   }
  //   expect(Teacher.parse(data)).toEqual(data)
  //   expect(() => Teacher.parse({ subject: data.subjects })).toThrow()
  //   expect(Teacher.parse({ ...data, extra: 12 })).toEqual({ ...data, extra: 12 })
  //   expect(() => vIntersection(BaseTeacher.strict(), HasID).parse({ ...data, extra: 12 })).toThrow()
  // })
  // it('deep intersection', () => {
  //   const Animal = z.object({
  //     properties: z.object({
  //       is_animal: vBoolean(),
  //     }),
  //   })
  //   const Cat = z
  //     .object({
  //       properties: z.object({
  //         jumped: vBoolean(),
  //       }),
  //     })
  //     .and(Animal)
  //   type Cat = z.infer<typeof Cat>
  //   // const cat:Cat = 'asdf' as any;
  //   const cat = Cat.parse({ properties: { is_animal: true, jumped: true } })
  //   expect(cat.properties).toEqual({ is_animal: true, jumped: true })
  // })
  // it('deep intersection of arrays', async () => {
  //   const Author = z.object({
  //     posts: z.array(
  //       z.object({
  //         post_id: vNumber(),
  //       }),
  //     ),
  //   })
  //   const Registry = z
  //     .object({
  //       posts: z.array(
  //         z.object({
  //           title: vString(),
  //         }),
  //       ),
  //     })
  //     .and(Author)
  //   const posts = [
  //     { post_id: 1, title: 'Novels' },
  //     { post_id: 2, title: 'Fairy tales' },
  //   ]
  //   const cat = Registry.parse({ posts })
  //   expect(cat.posts).toEqual(posts)
  //   const asyncCat = await Registry.parseAsync({ posts })
  //   expect(asyncCat.posts).toEqual(posts)
  // })
  // it('invalid intersection types', async () => {
  //   const numberIntersection = vIntersection(
  //     vNumber(),
  //     vNumber().transform((x) => x + 1),
  //   )
  //   const syncResult = numberIntersection.safeParse(1234)
  //   expect(syncResult.success).toEqual(false)
  //   if (!syncResult.success) {
  //     expect(syncResult.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_intersection_types)
  //   }
  //   const asyncResult = await numberIntersection.spa(1234)
  //   expect(asyncResult.success).toEqual(false)
  //   if (!asyncResult.success) {
  //     expect(asyncResult.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_intersection_types)
  //   }
  // })
  // it('invalid array merge', async () => {
  //   const stringArrInt = vIntersection(
  //     vString().array(),
  //     vString()
  //       .array()
  //       .transform((val) => [...val, 'asdf']),
  //   )
  //   const syncResult = stringArrInt.safeParse(['asdf', 'qwerty'])
  //   expect(syncResult.success).toEqual(false)
  //   if (!syncResult.success) {
  //     expect(syncResult.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_intersection_types)
  //   }
  //   const asyncResult = await stringArrInt.spa(['asdf', 'qwerty'])
  //   expect(asyncResult.success).toEqual(false)
  //   if (!asyncResult.success) {
  //     expect(asyncResult.error.issues[0].code).toEqual(z.ZodIssueCode.invalid_intersection_types)
  //   }
  // })
})
