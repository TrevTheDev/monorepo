/* eslint-disable @typescript-eslint/no-empty-function */
import { it, expect } from 'vitest'
import { v } from '../../src'

/// string
const stringSchema = v.string

it('string async parse', async () => {
  const goodData = 'XXX'
  const badData = 12

  const goodResult = await stringSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await stringSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// number
const numberSchema = v.number
it('number async parse', async () => {
  const goodData = 1234.2353
  const badData = '1234'

  const goodResult = await numberSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await numberSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// bigInt
const bigIntSchema = v.bigInt
it('bigInt async parse', async () => {
  const goodData = BigInt(145)
  const badData = 134

  const goodResult = await bigIntSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await bigIntSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// boolean
const booleanSchema = v.boolean
it('boolean async parse', async () => {
  const goodData = true
  const badData = 1

  const goodResult = await booleanSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await booleanSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// date
const dateSchema = v.date
it('date async parse', async () => {
  const goodData = new Date()
  const badData = new Date().toISOString

  const goodResult = await dateSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await dateSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// undefined
const undefinedSchema = v.undefined
it('undefined async parse', async () => {
  const goodData = undefined
  const badData = 'XXX'

  const goodResult = await undefinedSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(undefined)

  const badResult = await undefinedSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// null
const nullSchema = v.null
it('null async parse', async () => {
  const goodData = null
  const badData = undefined

  const goodResult = await nullSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await nullSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// any
const anySchema = v.any
it('any async parse', async () => {
  const goodData = [{}]
  // const badData = 'XXX';

  const goodResult = await anySchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  // const badResult = await anySchema.safeParseAsync(badData);
  // expect(v.isResult(badResult)).toBe(false);
  // expect(v.errorFromResultError(badResult)).not.be.equal(undefined);
})

/// unknown
const unknownSchema = v.unknown
it('unknown async parse', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const goodData = ['asdf', 124, () => {}]
  // const badData = 'XXX';

  const goodResult = await unknownSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  // const badResult = await unknownSchema.safeParseAsync(badData);
  // expect(v.isResult(badResult)).toBe(false);
  // expect(v.errorFromResultError(badResult)).not.be.equal(undefined);
})

/// void
const voidSchema = v.void
it('void async parse', async () => {
  const goodData = undefined
  const badData = 0

  const goodResult = await voidSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await voidSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// array
const arraySchema = v.array(v.string)
it('array async parse', async () => {
  const goodData = ['XXX']
  const badData = 'XXX'

  const goodResult = await arraySchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await arraySchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// object
const objectSchema = v.object({ string: v.string })
it('object async parse', async () => {
  const goodData = { string: 'XXX' }
  const badData = { string: 12 }

  const goodResult = await objectSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await objectSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// union
const unionSchema = v.union([v.string, v.undefined])
it('union async parse', async () => {
  const goodData = undefined
  const badData = null

  const goodResult = await unionSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await unionSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// record
const recordSchema = v.record(v.object({}))
it('record async parse', async () => {
  const goodData = { adsf: {}, asdf: {} }
  const badData = [{}]
  recordSchema.safeParseAsync(goodData)
  const goodResult = await recordSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await recordSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// function
const functionSchema = v.function()
it('function async parse', async () => {
  const goodData = () => {}
  const badData = 'XXX'

  const goodResult = await functionSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(typeof v.resultFromResultError(goodResult)).toEqual('function')

  const badResult = await functionSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// literal
const literalSchema = v.literal('asdf')
it('literal async parse', async () => {
  const goodData = 'asdf'
  const badData = 'asdff'

  const goodResult = await literalSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await literalSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// enum
const enumSchema = v.enum(['fish', 'whale'])
it('enum async parse', async () => {
  const goodData = 'whale'
  const badData = 'leopard'

  const goodResult = await enumSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await enumSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// nativeEnum
// eslint-disable-next-line no-shadow
enum nativeEnumTest {
  asdf = 'qwer',
}

const nativeEnumSchema = v.enum(nativeEnumTest)
it('nativeEnum async parse', async () => {
  const goodData = nativeEnumTest.asdf
  const badData = 'asdf'

  const goodResult = await nativeEnumSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  expect(v.resultFromResultError(goodResult)).toEqual(goodData)

  const badResult = await nativeEnumSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(false)
  expect(v.errorFromResultError(badResult)).not.be.equal(undefined)
})

/// promise
const promiseSchema = v.promise(v.number)
it('promise async parse good', async () => {
  const goodData = Promise.resolve(123)

  const goodResult = await promiseSchema.safeParseAsync(goodData)
  expect(v.isResult(goodResult)).toBe(true)
  if (v.isResult(goodResult)) {
    // expect(v.resultFromResultError(goodResult)).toBeInstanceOf(Promise)
    const data = await v.resultFromResultError(goodResult)
    expect(data).toEqual(123)
    // expect(v.resultFromResultError(goodResult)).resolves.toEqual(124);
    // return v.resultFromResultError(goodResult);
  } else throw new Error('success should be true')
})

it('promise async parse bad', async () => {
  const badData = Promise.resolve('XXX')
  const badResult = await promiseSchema.safeParseAsync(badData)
  expect(v.isResult(badResult)).toBe(true)
  try {
    await badResult[1]
  } catch (e) {
    expect(e).toBeInstanceOf(v.ValidationError)
  }

  // else throw new Error('success should be true')
})

it('async validation non-empty strings', async () => {
  const base = v.object({
    hello: v.string.customValidation((x) => (x && x.length > 0 ? undefined : 'error')),
    foo: v.string.customValidation((x) => (x && x.length > 0 ? undefined : 'error')),
  })

  const testval = { hello: '', foo: '' }
  const result1 = base.safeParse(testval)
  const result2 = base.safeParseAsync(testval)

  const r1 = result1
  await result2.then((r2) => {
    debugger
    if (v.isError(r1) && v.isError(r2)) expect(r1[0].errors.length).toBe(r2[0].errors.length) // <--- r1 has length 2, r2 has length 1
  })
})

it('async validation multiple errors 1', async () => {
  const base = v.object({
    hello: v.string,
    foo: v.number,
  })

  const testval = { hello: 3, foo: 'hello' }
  const result1 = base.safeParse(testval)
  const result2 = base.safeParseAsync(testval)

  const r1 = result1
  await result2.then((r2) => {
    if (v.isError(r1) && v.isError(r2)) expect(r1[0].errors.length).toBe(r2[0].errors.length)
  })
})

// TODO: consider

// test("async validation multiple errors 2", async () => {
//   const base = (is_async?: boolean) =>
//     z.object({
//       hello: z.string(),
//       foo: z.object({
//         bar: z.number().refine(is_async ? async () => false : () => false),
//       }),
//     });

//   const testval = { hello: 3, foo: { bar: 4 } };
//   const result1 = base().safeParse(testval);
//   const result2 = base(true).safeParseAsync(testval);

//   const r1 = result1;
//   await result2.then((r2) => {
//     if (r1.success === false && r2.success === false)
//       expect(r2.error.issues.length).toBe(r1.error.issues.length);
//   });
// });

// TODO: consider

// it('ensure early async failure prevents follow-up refinement checks', async () => {
//   let count = 0
//   const base = v.object({
//     hello: v.string,
//     foo: z.number
//       .refine(async () => {
//         count++
//         return true
//       })
//       .refine(async () => {
//         count++
//         return true
//       }, 'Good'),
//   })

//   const testval = { hello: 'bye', foo: 3 }
//   const result = await base.safeParseAsync(testval)
//   if (result.success === false) {
//     expect(result.error.issues.length).toBe(1)
//     expect(count).toBe(1)
//   }

//   // await result.then((r) => {
//   //   if (r.success === false) expect(r.error.issues.length).toBe(1);
//   //   expect(count).toBe(2);
//   // });
// })
