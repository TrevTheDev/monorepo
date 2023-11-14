/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DeduplicateUnion, FixedSizeTuple, IsFinite, Writeable } from './typescriptUtils'

type Diff<T extends unknown[], S extends unknown[]> = {
  bothFinite: Exclude<T[number], S[number]>[]
  oneFinite: DeduplicateUnion<T[number] | S[number]>[]
  bothInfinite: DeduplicateUnion<T[number] | S[number]>[]
}[IsFinite<T, IsFinite<S, 'bothFinite', 'oneFinite'>, 'oneFinite'>]

/**
 * Finds the set of all elements in the first array not
 * contained in the second array (i.e. non duplicated items).
 *
 * Note: typing is not battle tested and so unexpected edge cases may exist
 *
 * @param {Array} first The first list.
 * @param {Array} second The second list.
 * @return {Array} The elements in `first` that are not in `second`.
 * @example
 * ```typescript
 * const u1 = difference([1, 2, 3, 4], [7, 6, 5, 4, 3]) //=> [1,2] type: (1 | 2)[]
 * const u2 = difference([7, 6, 5, 4, 3], [1, 2, 3, 4]); //=> [7,6,5] type: (7 | 6 | 5)[]
 * const u3 = difference([7, 6, 5, 4, 3] as number[], [1, 2, 3, 4]); //=> [7,6,5] type: (7 | 6 | 5)[]
 * ```
 */
export function difference<const T extends readonly unknown[], const S extends readonly unknown[]>(
  first: T,
  second: S,
): Diff<Writeable<T>, Writeable<S>>
export function difference(first: unknown[], second: unknown[]): unknown[] {
  return first.filter((value) => !second.includes(value))
}

type Intersection<T extends unknown[], S extends unknown[]> = {
  bothFinite: Extract<T[number], S[number]>[]
  oneFinite: DeduplicateUnion<T[number] | S[number]>[]
  bothInfinite: DeduplicateUnion<T[number] | S[number]>[]
}[IsFinite<T, IsFinite<S, 'bothFinite', 'oneFinite'>, 'oneFinite'>]
/**
 * Given two arrays, intersection returns a set composed of the elements common to both arrays.
 *
 * Note: typing is not battle tested and so unexpected edge cases may exist
 *
 * @param {Array} first The first array.
 * @param {Array} second The second array.
 * @return {Array} The list of elements found in both `first` and `second`.
 * @example
 * ```typescript
 * const u1 = intersection([1, 2, 3, 4] as const, [7, 6, 5, 4, 3] as const) //=> (3 | 4)[]
 * const u2 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4] as const) //=> (3 | 4)[]
 * const u3 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a'] as const) //=> (3 | 4)[]
 * const u4 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4]) //=> [3,4] type: number[]
 * const u5 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
 * const u6 = intersection([7, 6, 5, 4, 3], [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
 * ```
 */
export function intersection<
  const T extends readonly unknown[],
  const S extends readonly unknown[],
>(first: T, second: S): Intersection<Writeable<T>, Writeable<S>>
export function intersection(first: unknown[], second: unknown[]): unknown[] {
  const uniqueFirst = Array.from(new Set(first))
  return uniqueFirst.filter((value) => second.includes(value))
}

/**
 * Given two arrays, contains returns boolean if `possibleSubSetArray` is a subset of `array1`.
 * @example
 * ```typescript
 * const foo1 = contains([1, 2, 3], [1, 2])    // true
 * const foo2 = contains([1, 2, 3], [1, 2, 4]) // false
 * ```
 */
export function contains(array1: PropertyKey[], possibleSubSetArray: PropertyKey[]): boolean {
  const asObject = Object.fromEntries(array1.map((key) => [key, true]))
  return possibleSubSetArray.every((el) => el in asObject)
}

/**
 * Executes a callback `nTimes` - if a startValue is provided, the callbackfn is `(previousResult: U, index: number) => U`
 * else it is `(index: number) => void`
 * @param nTimes - number of times to execute the callback
 * @param callbackfn - callback to execute
 * @param startValue - optional startValue
 * @returns U[] | void
 *
 * @example
 * ```typescript
 * times(10, (i) => {
 *   result = i
 * })
 * expect(result).toEqual(9)
 * ```
 * With a reducing return value:
 * ```typescript
 * expect(
 *   times(
 *     10,
 *     (previousResult, i) => {
 *       return previousResult + 1
 *     },
 *     0,
 *   ),
 * ).toEqual(10)
 * ```
 */
export function times(nTimes: number, callbackfn: (index: number) => void): void
export function times<U>(
  nTimes: number,
  callbackfn: (previousResult: U, index: number) => U,
  startValue: U,
): U
export function times<U>(
  nTimes: number,
  callbackfn: (previousResult: U, index: number) => U,
  startValue?: U,
): U | void
export function times(
  nTimes: number,
  callbackfn: ((previousResult: unknown, index: number) => unknown) | ((index: number) => unknown),
  startValue?: unknown,
): unknown {
  if (arguments.length === 3) {
    let rV = startValue
    for (let step = 0; step < nTimes; step += 1)
      rV = (callbackfn as (previousResult: unknown, index: number) => unknown)(rV, step)
    return rV
  }
  for (let step = 0; step < nTimes; step += 1) (callbackfn as (index: number) => unknown)(step)
  return undefined
}

// type OptionalFixedSizeType<T, N extends number> = FixedSizeTuple<T, N> extends infer O
//   ? { [I in keyof O]?: O[I] }
//   : never

// /**
//  * Similar to `forEach` except instead of returning one item from the array, it returns `n`
//  * items from the array
//  * @param arrayOfItems
//  * @param callbackfn
//  * @param strideSize
//  * @param throwOnMisalignment - if true, this throws if array can't be divided by n
//  *
//  * @example
//  * ```typescript
//  * const arr = [1, 2, 3, 1, 2, 3]
//  * forN(arr, (items) => console.log(items), 3) // [1,2,3]\n[1,2,3]
//  * ```
//  */
// export function forN<T, N extends number>(
//   arrayOfItems: T[],
//   callbackfn: (nItems: FixedSizeTuple<T, N>, startIndex: number, chunkCount: number) => void,
//   strideSize: N,
//   throwOnMisalignment?: true,
// ): void
// export function forN<T, N extends number>(
//   arrayOfItems: T[],
//   callbackfn: (nItems: OptionalFixedSizeType<T, N>, startIndex: number, chunkCount: number) => void,
//   strideSize: N,
//   throwOnMisalignment: false,
// ): void
// export function forN(
//   arrayOfItems: unknown[],
//   callbackfn: (nItems: unknown[], startIndex: number, chunkCount: number) => void,
//   strideSize: number,
//   throwOnMisalignment: boolean,
// ): void
// export function forN(
//   arrayOfItems: unknown[],
//   callbackfn: (nItems: any, startIndex: number, chunkCount: number) => void,
//   strideSize: number,
//   throwOnMisalignment: boolean = true,
// ): void {
//   const itemsLength = arrayOfItems.length
//   const outerLoop = Math.ceil(itemsLength / strideSize)
//   let absIdx = -1
//   for (let step = 0; step < outerLoop; step += 1) {
//     const chunk = [] as unknown[]
//     const startIndex = absIdx + 1
//     for (let innerI = 0; innerI < strideSize; innerI += 1) {
//       absIdx += 1
//       if (absIdx >= itemsLength)
//         if (throwOnMisalignment)
//           throw new Error('insufficient items in array to return chunk of required size')
//         else break
//       chunk.push(arrayOfItems[absIdx])
//     }
//     callbackfn(chunk, startIndex, step)
//   }
// }

// /**
//  * Similar to `map` except instead of returning one item from the array, it returns `n`
//  * items from the array.  Similar to `chunk` in lodash, C++
//  * @param arrayOfItems
//  * @param callbackfn
//  * @param strideSize
//  * @param throwOnMisalignment - if true, this throws if array can't be divided by n
//  *
//  * @example
//  * ```typescript
//  * const arr = [1, 2, 3, 1, 2, 3]
//  * mapN(arr, (items) => console.log(items), 3) // [1,2,3]\n[1,2,3]
//  * ```
//  */
// export function mapN<T, N extends number, RT>(
//   arrayOfItems: T[],
//   callbackfn: (nItems: FixedSizeTuple<T, N>, startIndex: number, chunkCount: number) => RT,
//   strideSize: N,
//   throwOnMisalignment?: true,
// ): RT[]
// export function mapN<T, RT>(
//   arrayOfItems: T[],
//   callbackfn: (nItems: T, startIndex: number, chunkCount: number) => RT,
//   strideSize: number,
//   throwOnMisalignment?: true,
// ): RT[]
// export function mapN<T, N extends number, RT>(
//   arrayOfItems: T[],
//   callbackfn: (nItems: OptionalFixedSizeType<T, N>, startIndex: number, chunkCount: number) => RT,
//   strideSize: N,
//   throwOnMisalignment: false,
// ): RT[]
// export function mapN(
//   arrayOfItems: unknown[],
//   callbackfn: (nItems: unknown[], startIndex: number, chunkCount: number) => void,
//   strideSize: number,
//   throwOnMisalignment: boolean,
// ): unknown[]
// export function mapN(
//   arrayOfItems: unknown[],
//   callbackfn: (nItems: any, startIndex: number, chunkCount: number) => void,
//   strideSize: number,
//   throwOnMisalignment: boolean = true,
// ): unknown[] {
//   const itemsLength = arrayOfItems.length
//   const outerLoop = Math.ceil(itemsLength / strideSize)
//   let absIdx = -1
//   const returnValues = [] as unknown[]
//   for (let step = 0; step < outerLoop; step += 1) {
//     const chunk = [] as unknown[]
//     const startIndex = absIdx + 1
//     for (let innerI = 0; innerI < strideSize; innerI += 1) {
//       absIdx += 1
//       if (absIdx >= itemsLength)
//         if (throwOnMisalignment)
//           throw new Error('insufficient items in array to return chunk of required size')
//         else break
//       chunk.push(arrayOfItems[absIdx])
//     }
//     returnValues.push(callbackfn(chunk, startIndex, step))
//   }
//   return returnValues
// }

/**
 * Returns an array of number from `from` to `to`
 * @param from
 * @param to
 * @example
 * ```typescript
 * expect(`${rangeOfNumbers(3, 5)}`).toEqual('3,4,5')
 * ```
 */
export function rangeOfNumbers(from: number, to: number): number[] {
  const arr = [] as number[]
  for (from; from <= to; from += 1) {
    arr.push(from)
  }
  return arr
}

/**
 * Splits an array into an array of multiple arrays of size `stride`
 * ```typescript
 * console.log(chunk([1, 2, 3, 4, 5], 2)) // [[1,2],[3,4],[5]]
 * ```
 */
export function chunk<const T, N extends number>(array: T[], stride: N): FixedSizeTuple<T, N>[]
export function chunk<const T>(array: T[], stride: number): [T, ...rest: T[]]
export function chunk(array: unknown[], stride: number): unknown[][] {
  const { length } = array
  if (!length || stride < 1) {
    return []
  }
  let index = 0
  let resIndex = 0
  const result = Array(Math.ceil(length / stride))

  while (index < length) {
    // eslint-disable-next-line no-plusplus
    result[resIndex++] = array.slice(index, (index += stride))
  }
  return result
}

/**
 * Splits an array into an array of multiple arrays based on
 * whether the `comparator` return true or false
 * ```typescript
 * console.log(chunkBy([1, 1, 2, 2, 3], (p,i)=>p===i)) // [[1, 1], [2, 2], [3]]
 * ```
 */
export function chunkBy<T>(
  array: [T, T, ...T[]],
  comparator: (previousItem: T, Item: T, index: number) => boolean,
): T[][]
export function chunkBy(
  array: [unknown, unknown, ...unknown[]],
  comparator: (previousItem: unknown, Item: unknown, index: number) => boolean,
): unknown[][] {
  const { length } = array

  const result = [] as unknown[][]
  let previousItem = array[0]
  let currentMiniArray = [previousItem] as unknown[]
  for (let i = 1; i < length; i += 1) {
    const currentItem = array[i]
    if (comparator(previousItem, currentItem, i)) {
      currentMiniArray.push(currentItem)
      previousItem = currentItem
    } else {
      result.push(currentMiniArray)
      currentMiniArray = [currentItem]
      previousItem = currentItem
    }
  }
  result.push(currentMiniArray)
  return result
}
