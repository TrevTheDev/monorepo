import { it } from 'vitest'
import { v } from '../../src'

type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
  ? true
  : false
const assertEqual = <A, B>(val2: AssertEqual<A, B>) => val2

it('generics', () => {
  async function stripOuter<TData extends v.MinimumSchema>(schema: TData, data: unknown) {
    return (
      v
        .object({
          nested: schema, // as z.ZodTypeAny,
        })
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .transform((data1) => data1.nested!)
        .parse({ nested: data })
    )
  }

  const result = stripOuter(v.object({ a: v.string }), { a: 'asdf' })
  assertEqual<typeof result, Promise<{ a: string }>>(true)
})
