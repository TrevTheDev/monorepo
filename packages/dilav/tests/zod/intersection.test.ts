import { it, expect } from 'vitest'
import { v } from '../../src'

it('object intersection', () => {
  const BaseTeacher = v.object({
    subjects: v.array(v.string),
  })
  const HasID = v.object({ id: v.string })

  const Teacher = v.intersection([BaseTeacher.passThrough(), HasID.passThrough()]) // BaseTeacher.merge(HasID);
  const data = {
    subjects: ['math'],
    id: 'asdfasdf',
  }

  // type T = v.Infer<typeof Teacher>

  expect(Teacher.parse(data)).toEqual(data)
  expect(() => Teacher.parse({ subject: data.subjects })).toThrow()
  expect(Teacher.parse({ ...data, extra: 12 })).toEqual({ ...data, extra: 12 })

  expect(() =>
    v.intersection([BaseTeacher.strict(), HasID]).parse({ ...data, extra: 12 }),
  ).toThrow()
})

it('deep intersection', () => {
  const Animal = v.object({
    properties: v.object({
      is_animal: v.boolean,
    }),
  })
  const Cat = v
    .object({
      properties: v.object({
        jumped: v.boolean,
      }),
    })
    .and(Animal)

  type Cat = v.Infer<typeof Cat>
  // const x = Cat.parse(1)
  // const cat:Cat = 'asdf' as any;
  const cat = Cat.parse({ properties: { is_animal: true, jumped: true } })
  expect(cat.properties).toEqual({ is_animal: true, jumped: true })
})

// it('deep intersection of arrays2', async () => {
//   const a = v.array(v.object({ a: v.string }))
//   const b = v.array(v.object({ b: v.string }))
//   const ab = v.intersection([a, b]) // BaseTeacher.merge(HasID);
//   const x = ab.parse(1)
//   type X = v.Infer<typeof ab>
// })

it('deep intersection of arrays', async () => {
  const Author = v.object({
    posts: v.array(
      v.object({
        post_id: v.number,
      }),
    ),
  })
  const Registry = v
    .object({
      posts: v.array(
        v.object({
          title: v.string,
        }),
      ),
    })
    .and(Author)

  const posts = [
    { post_id: 1, title: 'Novels' },
    { post_id: 2, title: 'Fairy tales' },
  ]
  const cat = Registry.parse({ posts })
  expect(cat.posts).toEqual(posts)
  const asyncCat = await Registry.parseAsync({ posts })
  expect(asyncCat.posts).toEqual(posts)
})
// Daliv throws
it.skip('invalid intersection types', async () => {
  const numberIntersection = v.intersection([v.number, v.number.transform((x) => x + 1)])

  const syncResult = numberIntersection.safeParse(1234)
  expect(v.isResult(syncResult)).toEqual(false)
  if (v.isError(syncResult)) expect(syncResult[0].errors.length).toEqual(1)

  const asyncResult = await numberIntersection.safeParseAsync(1234)
  expect(v.isResult(asyncResult)).toEqual(false)
  if (v.isError(asyncResult)) expect(asyncResult[0].errors.length).toEqual(1)
})
// Daliv throws
it.skip('invalid array merge', async () => {
  const stringArrInt = v.intersection([
    v.string.array(),
    v.string.array().transform((val) => [...val, 'asdf']),
  ])
  const syncResult = stringArrInt.safeParse(['asdf', 'qwer'])
  expect(v.isResult(syncResult)).toEqual(false)
  if (v.isError(syncResult)) expect(syncResult[0].errors.length).toEqual(1)

  const asyncResult = await stringArrInt.safeParseAsync(['asdf', 'qwer'])
  expect(v.isResult(asyncResult)).toEqual(false)
  if (v.isError(asyncResult)) expect(asyncResult[0].errors.length).toEqual(1)
})
