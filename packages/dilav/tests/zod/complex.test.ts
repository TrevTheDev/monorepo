import { it } from 'vitest'

import { v } from '../../src'

const crazySchema = v.object({
  tuple: v.array([
    v.string.nullable().optional(),
    v.number.nullable().optional(),
    v.boolean.nullable().optional(),
    v.null.nullable().optional(),
    v.undefined.nullable().optional(),
    v.literal('1234').nullable().optional(),
  ]),
  merged: v
    .object({
      k1: v.string.optional(),
    })
    .merge(v.object({ k1: v.string.nullable(), k2: v.number })),
  union: v.array(v.union([v.literal('asdf'), v.literal(12)])).nonEmpty(),
  array: v.array(v.number),
  // sumTransformer: v.transformer(v.array(v.number), v.number, (arg) => {
  //   return arg.reduce((a, b) => a + b, 0);
  // }),
  sumMinLength: v.array(v.number).customValidation((arg) => (arg.length > 5 ? undefined : 'error')),
  intersection: v.intersection([
    v.object({ p1: v.string.optional() }),
    v.object({ p1: v.number.optional() }),
  ]),
  union2: v.union([v.object({ p1: v.string.optional() }), v.object({ p1: v.number.optional() })]),
  enum: v.intersection([v.enum(['zero', 'one']), v.enum(['one', 'two'])]),
  nonstrict: v.object({ points: v.number }).passThrough(),
  numProm: v.promise(v.number),
  lenfun: v.function({ parameters: v.array([v.string]), returns: v.boolean }),
})

// export const asyncCrazySchema = crazySchema.extends({
//   // async_transform: v.transformer(
//   //   v.array(v.number),
//   //   v.number,
//   //   async (arg) => {
//   //     return arg.reduce((a, b) => a + b, 0);
//   //   }
//   // ),
//   async_refine: v.array(v.number).refine(async (arg) => arg.length > 5),
// })

it('parse', () => {
  // const i = v.intersection([
  //   v.object({ p1: v.string.optional() }),
  //   v.object({ p1: v.number.optional() }),
  // ])
  // type X = v.Infer<typeof i>
  // const x = i.safeParse({})

  crazySchema.parse({
    tuple: ['asdf', 1234, true, null, undefined, '1234'],
    merged: { k1: 'asdf', k2: 12 },
    union: ['asdf', 12, 'asdf', 12, 'asdf', 12],
    array: [12, 15, 16],
    // sumTransformer: [12, 15, 16],
    sumMinLength: [12, 15, 16, 98, 24, 63],
    intersection: {},
    union2: {},
    enum: 'one',
    nonstrict: { points: 1234 },
    numProm: Promise.resolve(12),
    lenfun: (x: string) => x.length,
  })
})
