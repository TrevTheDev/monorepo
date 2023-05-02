import { it, expect } from 'vitest'
// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod'

// import {
//   beOneOf,
//   endsWith,
//   exactStringLength,
//   maximumStringLength,
//   minimumStringLength,
//   notEmptyString,
//   startsWith,
//   times,
//   validCuid,
//   validCuid2,
//   validEmail,
//   validUuid,
//   parseString,
// } from '../../src'
// import { vString } from '../../src/validate/string'

// describe('validate', () => {
//   it('parseString', () => {
//     ;[null, false, true, [], undefined, {}, 0, 1, NaN, Infinity, -Infinity, () => 'a'].forEach(
//       (reject) => {
//         const [error, result] = parseString()(reject)
//         expect(result).toEqual(undefined)
//         expect(error).toBeDefined()
//       },
//     )
//     ;['A', ''].forEach((value) => {
//       const [error, result] = parseString()(value)
//       expect(result).toEqual(value)
//       expect(error).toBeUndefined()
//     })
//   })
//   it('minimumStringLength', () => {
//     expect(minimumStringLength(3)('')).toBeDefined()
//     expect(minimumStringLength(3)('123')).toBeUndefined()
//     expect(minimumStringLength(3)('1234')).toBeUndefined()
//   })
//   it('maximumStringLength', () => {
//     expect(maximumStringLength(3)('')).toBeUndefined()
//     expect(maximumStringLength(3)('123')).toBeUndefined()
//     expect(maximumStringLength(3)('1234')).toBeDefined()
//   })
//   it('exactStringLength', () => {
//     expect(exactStringLength(3)('')).toBeDefined()
//     expect(exactStringLength(3)('123')).toBeUndefined()
//     expect(exactStringLength(3)('1234')).toBeDefined()
//   })
//   it('notEmptyString', () => {
//     expect(notEmptyString()('')).toBeDefined()
//     expect(notEmptyString()('1234')).toBeUndefined()
//   })
//   // it('defaultValue', () => {
//   //   ;[null, false, true, [], undefined, {}, 0, 1, NaN, Infinity, -Infinity, () => 'a', ''].forEach(
//   //     (reject) => {
//   //       const val = defaultValue('DEFAULT')(parseString(reject))
//   //       expect(val).toEqual('DEFAULT')
//   //     },
//   //   )
//   //   // expect(defaultValue('DEFAULT')(parseString('A')) === 'DEFAULT').toBeFalsy()
//   // })
//   it('beOneOf', () => {
//     const be = beOneOf(['A', 'B', 'C'])
//     expect(be('A')).toBeUndefined()
//     expect(be('C')).toBeUndefined()
//     expect(be('D')).toBeDefined()
//     expect(be('')).toBeDefined()
//   })
//   // it('optionStringParser', () => {
//   //   const be = resultErrorToResultNever(optionStringParser(['A', 'B', 'C'] as const))
//   //   const result = be('A')
//   //   expect(result).toEqual('A')
//   //   expect(() => be('D')).toThrow()
//   // })
//   it('validEmail', () => {
//     expect(validEmail()('abc@abc.com')).toBeUndefined()
//     expect(validEmail()('abcAbc.com')).toBeDefined()
//   })
//   it('startsWith', () => {
//     expect(startsWith('abc')('abc@abc.com')).toBeUndefined()
//     expect(startsWith('abc')('zabCAbc')).toBeDefined()
//   })
//   it('endsWith', () => {
//     expect(endsWith('abc')('abc@abc')).toBeUndefined()
//     expect(endsWith('abc')('zabCAbc')).toBeDefined()
//   })
//   it('tmp', () => {
//     // debugger
//     const x = vString().min(3)
//     const y = x.parse('abc')
//     const z = x.safeParse('ac')
//     // debugger
//     const mySchema = vString()
//       .min(6)
//       .endsWith(' ')
//       .trim()
//       .min(3)
//       .max(5)
//       .length(4)
//       // .email()
//       // .cuid()
//       // .uuid()
//       .startsWith('a')
//       .endsWith('z')
//       .trim()
//       .upperCase()
//     // .beOneOf(['A', 'B'] as const)
//     // .email()
//     // debugger
//     const res = mySchema.parse('abcz   ')
//     debugger
//     const mySchema2 = vString()
//       .min(3)
//       .catch((errors) => {
//         debugger
//         console.log(errors)
//         return 'abc'
//       })
//       .endsWith('abcd')
//       .catch((errors) => {
//         debugger
//         console.log(errors)
//         return 'abcd'
//       })
//       .endsWith('abcd')
//     const z1 = mySchema2.parse('a')
//     debugger

//     // const stringToNumber = z.string().transform((val:string) => val.length).

//     // const z2 = stringToNumber.parse('string') // => 6
//   })
//   it('inParallel', () => {
//     const res = inParallel([
//       minimumStringLength(10),
//       maximumStringLength(1),
//       exactStringLength(15),
//       beOneOf(['A', 'B']),
//       validEmail(),
//       validCuid(),
//       validCuid2(),
//       validUuid(),
//       startsWith('a'),
//       endsWith('z'),
//       () => 'custom validation',
//     ])
//     // expect(res('az')).toBeUndefined()
//     const res2 = res('za1+')
//     if (res2) expect(res2.length).toEqual(11)
//   })
it.only('benchmark against zod', () => {
  const myUnion = z.discriminatedUnion('status', [
    z.object({ status: z.literal('success'), data: z.string() }),
    z.object({ status: z.literal('failed'), error: z.instanceof(Error) }),
  ])
  const x = myUnion.parse({ status: 'success', data: 'yippie ki yay' })

  const tuna = z.literal('tuna')
  const x = tuna.parse('tuna')
  const numberWithCatch = z.number().catch('x')
  const x = numberWithCatch.parse('a')
  const zodFn = (i: number) => {
    const val = `${i}zE+`
    const mySchema = z
      .string()
      .min(10)
      .max(1)
      .length(15)
      .email()
      .cuid()
      .uuid()
      .startsWith('a')
      .endsWith('z')
    const res = mySchema.safeParse(val)
    if (res.error) expect(res.error.issues.length).toEqual(8)
    // debugger
  }
  const mine2 = (i: number) => {
    const val = `${i}zE+`
    const res = inParallel(
      [
        minimumStringLength(10),
        maximumStringLength(1),
        exactStringLength(15),
        // beOneOf(['A', 'B']),
        validEmail(),
        validCuid(),
        // validCuid2(),
        validUuid(),
        startsWith('a'),
        endsWith('z'),
      ],
      // () => 'custom validation',
    )
    const [, result] = parseString()(val)
    if (result) {
      const out = res(result)
      if (out) expect(out.length).toEqual(8)
    }
  }
  const mine = (i: number) => {
    const val = `${i}zE+`
    const mySchema = vString()
      .min(10)
      .max(1)
      .length(15)
      .email()
      .cuid()
      .uuid()
      .startsWith('a')
      .endsWith('z')
    const [errors] = mySchema.safeParse(val)
    if (errors) expect(errors.errors.length).toEqual(8)
    // debugger
  }
  const start1 = Date.now()
  times(10000, (i) => mine(i))
  const end1 = Date.now()
  times(10000, (i) => zodFn(i))
  const end2 = Date.now()
  times(10000, (i) => mine2(i))
  const end3 = Date.now()
  console.log(`zod: ${end2 - end1}`)
  console.log(`mine: ${end1 - start1}`)
  console.log(`times faster: ${(end2 - end1) / (end1 - start1)}`)
  console.log(`mine2: ${end3 - end2}`)
  console.log(`times faster: ${(end2 - end1) / (end3 - end2)}`)
  // debugger
})
//   it.skip('typechecking', () => {
//     type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false
//     const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

//     const z01 = vString().beOneOf(['A']).parse('A')
//     typesMatch<'A', typeof z01>(true)
//     const z02 = vString()
//       .beOneOf(['A', 'B'] as const)
//       .parse('A')
//     typesMatch<'A' | 'B', typeof z02>(true)
//     const z03 = vString().email().parse('A')
//     typesMatch<`${string}@${string}`, typeof z03>(true)
//     const z04 = vString().startsWith('abc').parse('A')
//     typesMatch<`abc${string}`, typeof z04>(true)
//     const z05 = vString().endsWith('xyz').parse('A')
//     typesMatch<`${string}xyz`, typeof z05>(true)
//     const z06 = vString()
//       .customValidation(() => 'x' as 'HELLO')
//       .parse('A')
//     typesMatch<'HELLO', typeof z06>(true)
//     // limitation
//     const z07 = vString().startsWith('abc').endsWith('xyz').parse('A')
//     typesMatch<`${string}xyz`, typeof z07>(true)
//   })
// })

// // debugger
// // const stringOrNumber = z.union([z.string(), z.string(), z.string(), z.boolean()])
// // const y = stringOrNumber.parse(true)
// // stringOrNumber.
// // console.log(y)
// // z.boolean().
// // // stringOrNumber.parse('foo') // passes
// // // stringOrNumber.parse(14) // passes
// // stringOrNumber.z.string().or(z.N)
