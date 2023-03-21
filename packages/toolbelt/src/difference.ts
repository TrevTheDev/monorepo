import type { DeduplicateUnion, IsFinite, Writeable } from './typescript utils'

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
    const u1 = difference([1, 2, 3, 4], [7, 6, 5, 4, 3]) //=> [1,2] type: (1 | 2)[]
    const u2 = difference([7, 6, 5, 4, 3], [1, 2, 3, 4]); //=> [7,6,5] type: (7 | 6 | 5)[]
    const u3 = difference([7, 6, 5, 4, 3] as number[], [1, 2, 3, 4]); //=> [7,6,5] type: (7 | 6 | 5)[]
 */
// TODO: change to `const` when able
export function difference<T extends readonly unknown[], S extends readonly unknown[]>(
  first: T,
  second: S,
): Diff<Writeable<T>, Writeable<S>>
export function difference<T extends unknown[], S extends unknown[]>(
  first: T,
  second: S,
): Diff<T, S> {
  return first.filter((value) => !second.includes(value)) as Diff<T, S>
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
 * const u1 = intersection([1, 2, 3, 4] as const, [7, 6, 5, 4, 3] as const) //=> (3 | 4)[]
 * const u2 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4] as const) //=> (3 | 4)[]
 * const u3 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a'] as const) //=> (3 | 4)[]
 * const u4 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4]) //=> [3,4] type: number[]
 * const u5 = intersection([7, 6, 5, 4, 3] as const, [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
 * const u6 = intersection([7, 6, 5, 4, 3], [1, 2, 3, 4, 'a']) //=> [3,4] type: (string | number)[]
 */
// TODO: change to `const` when able
export function intersection<T extends readonly unknown[], S extends readonly unknown[]>(
  first: T,
  second: S,
): Intersection<Writeable<T>, Writeable<S>>
export function intersection(first, second) {
  const uniqueFirst = Array.from(new Set(first))
  return uniqueFirst.filter((value) => second.includes(value))
}
