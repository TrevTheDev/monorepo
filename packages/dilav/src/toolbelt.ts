/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
export type ResultError<E, R> = [error: E, result?: undefined] | [error: undefined, result: R]

export function isResult<E, R>(
  output: [error: E, result?: undefined] | [error: undefined, result: R],
): output is [error: undefined, result: R] {
  return output[0] === undefined
}

export function isError<E, R>(
  output: [error: E, result?: undefined] | [error: undefined, result: R],
): output is [error: E, result?: undefined] {
  return output[0] !== undefined
}

type TupleExclude<T extends any[], V, A extends any[] = []> = T extends [infer F, ...infer R]
  ? TupleExclude<R, V, F extends V ? A : T extends [...infer FF, ...R] ? [...A, ...FF] : [...A, F]>
  : A

/**
 * Removes element(s) from a tuple
 * @example
 * type A = OmitTuple<[1, 2, 3], 0> // [2,3]
 * type B = OmitTuple<[1, 2, 3], 1> // [1,3]
 * type C = OmitTuple<[1, 2, 3], 2> // [1,2]
 * type D = OmitTuple<[1, 2, 3], 3> // [ 1,2,3]
 * type E = OmitTuple<[1, 2, 3], 0 | 2> // [2]
 */
export type OmitTuple<T extends any[], N extends number | `${number}`> = TupleExclude<
  { [K in keyof T]: `${K}` extends `${N}` ? typeof Sigil : T[K] },
  typeof Sigil
>

/**
 * Picks element(s) from a tuple
 * @example
 * type A = PickTuple<[1, 2, 3], 0>     // [1]
 * type B = PickTuple<[1, 2, 3], 1>     // [2]
 * type C = PickTuple<[1, 2, 3], 3>     // []
 * type d = PickTuple<[1, 2, 3], 0 | 2> // [1,3]
 */
export type PickTuple<T extends any[], N extends number | `${number}`> = TupleExclude<
  { [K in keyof T]: `${K}` extends `${N}` ? T[K] : typeof Sigil },
  typeof Sigil
>

declare const Sigil: unique symbol

export type Primitive = string | number | boolean | bigint | symbol | undefined | null
// eslint-disable-next-line @typescript-eslint/ban-types
export type Builtin = Primitive | Function | Date | Error | RegExp
/**
 * removes the `readonly` attribute recursively from a type
 * @example
 */
export type DeepWriteable<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? Map<DeepWriteable<K>, DeepWriteable<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? Map<DeepWriteable<K>, DeepWriteable<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepWriteable<K>, DeepWriteable<V>>
  : T extends Set<infer U>
  ? Set<DeepWriteable<U>>
  : T extends ReadonlySet<infer U>
  ? Set<DeepWriteable<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepWriteable<U>>
  : T extends Promise<infer U>
  ? Promise<DeepWriteable<U>>
  : T extends {}
  ? { -readonly [K in keyof T]: DeepWriteable<T[K]> }
  : T

export type ObjectArray = [object, object, ...object[]]

/**
 * In [ A, B , ...] A and B are merged, with B taking precedence: { ...A, ...B }
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = Identity<RMerge<[{ a?: 'a'; c?: 'a' }, { b: 'b'; c: 'b' }]>> // { a?: 'a'; b: 'b'; c: 'b'; }
 */
export type RMerge<T extends ObjectArray, MergedObject = Omit<T[0], keyof T[1]> & T[1]> = [
  MergedObject,
  ...(T extends [any, any, ...infer R extends object[]] ? R : []),
] extends infer NewT extends ObjectArray
  ? RMerge<NewT>
  : MergedObject

/**
 * flattens a type
 */
export type Identity<T> = T extends object ? {} & { [P in keyof T]: T[P] } : T

/**
 * Converts a tuple to an intersection
 * @example
 * type U1 = TupleToIntersection<['a'|'b'|'c', 'a'|'b', 'b'|'c']> // 'b'
 * type U2 = TupleToIntersection<['a']> // 'a'
 * type U4 = TupleToIntersection<[string, any, number]>  // never
 * type U5 = TupleToIntersection<[{ a: string }, { a: number }]> // { a: string; } & { a: number; }
 */
export type TupleToIntersection<T extends [any, ...any[]]> = {
  [I in keyof T]: (x: T[I]) => void
}[number] extends (x: infer I) => void
  ? I
  : never

// type ProhibitExtra<T, K extends PropertyKey> = T & { [P in Exclude<K, keyof T>]?: never }
type SealUnion<T, K extends PropertyKey = T extends unknown ? keyof T : never> = T extends unknown
  ? T & { [P in Exclude<K, keyof T>]?: never }
  : never
/**
 * Flattens an union of objects into a single object
 *
 * Based on : https://stackoverflow.com/a/76092753/3091013
 * @example
 * type U1 = FlattenObjectUnion<{ a: string } | { b: number }> // { a?: string; b?: number }
 * type U2 = FlattenObjectUnion<{ a: string } | { a: number }> // { a: string | number }
 * type U3 = FlattenObjectUnion<
 *   { a?: string, b: number, c: boolean, d?: Date } |
 *   { c: string, d?: number, e: boolean, f?: Date }
 * >
 * // => type F3 =
 * //   a?: string;
 * //   b?: number;
 * //   c: string | boolean;
 * //   d?: number | Date;
 * //   e?: boolean;
 * //   f?: Date;
 * // }
 */
export type FlattenObjectUnion<T extends object> = Omit<SealUnion<T>, never>

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

/**
 * removes the `readonly` attribute from a type
 * @example
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] }
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
  ? R
  : never
/**
 * Deduplicate and simplifies a union
 *
 * see https://stackoverflow.com/questions/74697633/how-does-one-deduplicate-a-union
 * type T = DeduplicateUnion<number | number | 1 | 2 | 3> // number
 * type T = DeduplicateUnion<number | number | 1 | 2 | 3 | string> // string|number
 */
export type DeduplicateUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? never : DeduplicateUnion<Exclude<T, L>> | L

/**
 * Tests whether a type is finite
 * @example
 * type Foo1 = IsFinite<[string], 'yes', 'no'>                          // 'yes'
 * type Foo2 = IsFinite<[], 'yes', 'no'>                                // 'yes'
 * type Foo3 = IsFinite<string[], 'yes', 'no'>                          // 'no'
 * type Foo4 = IsFinite<[arg1: string, ...args: string[]], 'yes', 'no'> // 'no'
 */
export type IsFinite<T extends any[], Finite = true, Infinite = false> = number extends T['length']
  ? Finite
  : Infinite

/**
 * Converts a Union type (|) to an Intersection of the union (&)
 * @example
 * type U = UnionToIntersection< (() => void) | ((p: string) => void)> // (() => void) & ((p: string) => void)
 */
export type UnionToIntersection<U> = (U extends any ? (arg0: U) => void : never) extends (
  arg0: infer I,
) => void
  ? I
  : never
