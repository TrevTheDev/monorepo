/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

export type AnyKey = keyof any
export type UnknownObject = Record<AnyKey, unknown>
export type Fn<
  InputArgs extends unknown[] = any[],
  ReturnedType = any,
  Res = (...args: InputArgs) => ReturnedType,
> = Res

/**
 * extracts the call signatures from a type
 * Gotcha: doesn't yet work for no parameter call signatures and only 4 overloads
 * @example
 * type J = JustSignatures<{(a: string): void, a: number}> // {(a: string): void}
 */
export type JustSignatures<T> = T extends {
  (...args: infer A1): infer R1
  (...args: infer A2): infer R2
  (...args: infer A3): infer R3
  (...args: infer A4): infer R4
}
  ? { (...args: A1): R1; (...args: A2): R2; (...args: A3): R3; (...args: A4): R4 }
  : T extends {
      (...args: infer A1): infer R1
      (...args: infer A2): infer R2
      (...args: infer A3): infer R3
    }
  ? { (...args: A1): R1; (...args: A2): R2; (...args: A3): R3 }
  : T extends { (...args: infer A1): infer R1; (...args: infer A2): infer R2 }
  ? { (...args: A1): R1; (...args: A2): R2 }
  : T extends { (...args: infer A1): infer R1 }
  ? { (...args: A1): R1 }
  : void

/**
 * flattens a type
 */
export type Identity<T> = T extends object ? {} & { [P in keyof T]: T[P] } : T

// /**
//  * merges T1 with T2.  For duplicate properties, T2 overwrites T1.
//  * Gotcha: doesn't merge call signatures or constructors.
//  * @example
//  * type U = Union<{a: number}, {b: string}>     // {a: number, b: string}
//  * type U = Union<{ a: number }, { a: string }> // {a: string}
//  * type U = Union<{ a: 'a1'; b: 'b1'; c: 'c1' }, { a: 'a2', c: 'c2', d: 'd2' }> // { a: "a2"; c: "c2"; d: "d2"; b: "b1"; }
//  */
// export type Union<
//   T1 extends UnknownObject,
//   T2 extends UnknownObject,
//   R extends UnknownObject = {
//     [K in keyof T2 | keyof T1]: K extends keyof T2 ? T2[K] : K extends keyof T1 ? T1[K] : never
//   },
// > = R

// /**
//  * alternative implementation of Union
//  */
// export type Union2<T1 extends UnknownObject, T2 extends UnknownObject> = {
//   [K in keyof T1]: K extends keyof T2 ? T2[K] : T1[K]
// } & T2 extends infer O
//   ? { [K in keyof O]: O[K] }
//   : never

/**
 * merges an array of UnknownObject into a single object.
 * @example
 * type U = RecursiveUnion<[{ a: 'a' }, { b?: 'b' }, { c: 'c' }, { d?: 'd' }]>
 * { a: 'a'; b?: 'b'; c: 'c'; d?: 'd'; }
 */
// export type RecursiveUnion<T extends UnknownObject[]> = T extends [
//   infer H extends UnknownObject,
//   ...infer R extends UnknownObject[],
// ]
//   ? [] extends R
//     ? H
//     : Identity<H & RecursiveUnion<R>>
//   : never

// export type RecursiveUnion<
//   T extends [UnknownObject, UnknownObject, ...UnknownObject[]],
//   MergedObject01 extends UnknownObject = Union<T[0], T[1]>,
//   MergedObjects extends UnknownObject = T extends [
//     any,
//     any,
//     ...infer R extends [UnknownObject, ...UnknownObject[]],
//   ]
//     ? [MergedObject01, ...R] extends [UnknownObject, UnknownObject, ...UnknownObject[]]
//       ? RecursiveUnion<[MergedObject01, ...R]>
//       : MergedObject01
//     : MergedObject01,
// > = MergedObjects

/**
 * returns a union of keys where the value matches the Criteria
 * @example
 * type Foo1 = KeysMatching<{a: string, b: undefined, c: undefined, d: number}, undefined> // 'b'|'c'
 */
export type KeysMatching<T extends UnknownObject, Criteria> = keyof {
  [K in keyof T as T[K] extends Criteria ? K : never]: K
}

// /**
//  * Overwrites any properties in T1, that are also in T2.  Any extra properties in T2 are ignored.
//  * @example
//  * type U = LMerge<{ a: number }, { b: string }> // {a: number}
//  * type U = LMerge<{ a: number; c: boolean }, { a: string; b: number }> // {a: string, c:boolean}
//  */
// export type LMerge<
//   T1 extends UnknownObject,
//   T2 extends UnknownObject,
//   R extends UnknownObject = {
//     [k in keyof T1]: k extends keyof T2 ? T2[k] : T1[k]
//   },
// > = R

/**
 * Renames a property in a type object.
 * @example
 * type U = RenameProperty<{ a: number; c?: boolean; d?: string }, 'c', 'b'> // { a: number,  b?: boolean, d?: string }
 */
export type RenameProperty<
  T,
  OldPropertyName extends keyof T,
  NewPropertyName extends PropertyKey,
> = {
  [P in keyof T as P extends OldPropertyName ? NewPropertyName : P]: T[P]
}

/**
 * Omits call signature from a type
 * @example
 * type O = OmitCallSignature<{(): void, a: number}> // {a: number}
 */
export type OmitCallSignature<T> = { [K in keyof T]: T[K] } & (T extends new (
  ...args: infer R
) => infer S
  ? new (...args: R) => S
  : unknown)

/**
 * Omits constructor from a type
 * @example
 * type O = OmitConstructorSignature<{new (): void, a: number}> // {a: number}
 */
export type OmitConstructorSignature<T> = { [K in keyof T]: T[K] } & (T extends (
  ...args: infer R
) => infer S
  ? (...args: R) => S
  : unknown)

/**
 * Looks up T[K] and if not found returns Else
 * @example
 * type L = Lookup<{a: string, b: number}, 'a'> // string
 */
export type Lookup<T, K, Else = never> = K extends keyof T ? T[K] : Else

/**
 * Tests if T is strictly `any` else returns never
 */
export type IsStrictAny<T, Then = T, Else = never> = 0 extends 1 & T ? Then : Else

type IsNotStrictAny<T> = T extends IsStrictAny<T> ? never : T
type IsVoid<T> = T extends void ? T : never

/**
 * Tests if T is strictly `void`
 */
export type IsStrictVoid<T> = IsVoid<T> & IsNotStrictAny<T>

/**
 * Tests if T is strictly `never` return true or false
 */
export type IsStrictNever<T> = [T] extends [never] ? true : false

/**
 * Tests if T is a tuple vs array
 */
export type IsNotTuple<T> = T extends Array<any> ? (number extends T['length'] ? T : never) : never

/**
 * Tests if T is strictly `unknown` else returns never
 */
export type IsStrictUnknown<T> = T extends IsStrictAny<T> ? never : unknown extends T ? T : never

/**
 * Tests if T is strictly `any[]` else returns never
 */
export type IsStrictAnyArray<T> = T extends IsNotTuple<T>
  ? T extends Array<infer U>
    ? U extends IsStrictAny<U>
      ? T
      : never
    : never
  : never

/**
 * Tests if T is strictly `unknown[]` else returns never
 */
export type IsStrictUnknownArray<T> = T extends IsNotTuple<T>
  ? T extends Array<infer U>
    ? T extends IsStrictUnknown<U>
      ? T extends IsStrictAny<T>
        ? never
        : T
      : never
    : never
  : never

/**
 * Returns the last item from the array
 * @example
 * type L = Last<[1, 2, 3]> // 3
 */
export type Last<Array extends unknown[]> = Array extends [...unknown[], infer L] ? L : never

/**
 * Returns the index of the last item in an array
 * @example
 * type L = LastIndex<[1, 2, 3]> // 2
 */
export type LastIndex<Arr extends unknown[]> = Arr extends [any, ...infer Rest]
  ? Rest['length']
  : never

/**
 * @example
 * type T = Tail<[1, 2, 3]> // [2, 3]
 */
export type Tail<L extends unknown[]> = L extends [any, ...infer LTail] ? LTail : never

/**
 * @example
 * type T = Head<[1, 2, 3]> // 1
 */
export type Head<L extends unknown[]> = L extends [infer H, ...any] ? H : never

/**
 * @example
 * type P = Permutation<1 | 2 | 3>
 * [1, 2, 3] | [1, 3, 2] | [2, 1, 3] | [2, 3, 1] | [3, 1, 2] | [3, 2, 1]
 * type P = Permutation<"a" | string> // [string] - gotcha
 */
export type Permutation<U, T = U> = [U] extends [never]
  ? []
  : T extends unknown
  ? [T, ...Permutation<Exclude<U, T>>]
  : never

/**
 * Counts the number of items in a union
 * @example
 * type C = UnionCount<'a' | 'b' | 'c'>    // 3
 * type C = UnionCount<'a' | 'b' | string> // 1 - gotcha
 */
export type UnionCount<U> = Permutation<U>['length']

/**
 * Counts the keys of an object
 * @example
 * type C = KeyCount<{ x: 1, y: 2 }> // 2
 */
export type KeyCount<T extends UnknownObject> = UnionCount<keyof T>

/**
 * removes generic array properties from an array such as '.length' - returning only
 * the array elements
 * @example
 * type T = CleanArray<[ x: string, y: number ]> // { 0: string; 1: number;}
 */
export type CleanArray<T extends any[]> = Omit<T, keyof any[]>

/**
 * converts a tuple of type [string, any][] to an object
 * Yuck!  Why not able to use tuple names?
 * @example
 * type T = TupleToObject<["foo", string] | ["bar", boolean] >  //{ foo: string; bar: boolean; }
 */
export type TupleToObject<T extends [string, any]> = { [key in T[0]]: Extract<T, [key, any]>[1] }

/**
 * concatenates a tuple of tuples.
 * @example
 * type T = ConcatTupleOfTuples<[[a: 'a', c: 'c1'], [c: `c2`], [d: `d`]]>  // [a: "a", c: "c1", c: "c2", d: "d"]
 */
export type ConcatTupleOfTuples<
  Tuple extends unknown[],
  _ConcatenatedTuple extends unknown[] = [],
  _H extends unknown[] = Head<Tuple> extends unknown[] ? Head<Tuple> : never,
  _T extends unknown[] = Tail<Tuple>,
  _N extends unknown[] = [..._ConcatenatedTuple, ..._H],
> = _T extends [any, ...any] ? ConcatTupleOfTuples<_T, _N> : _N

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

/**
 * test if type is a union - A|B|C
 * @example
 * type U = IsUnion<'a'|'b'|'c'>   // 'a'|'b'|'c'
 * type U = IsUnion<true | false>  // boolean - gotcha
 * type U = IsUnion<boolean>       // boolean - gotcha
 * type U = IsUnion<true>          // never
 * type U = IsUnion<'a'|string>    // never - gotcha
 */
export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? never : T

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false

/**
 * compares two tuples, returning a tuple of 1s or 0s for matched elements
 * Gotcha: first tuple must be longest
 * @example
 * type T = TupleElementComparison<[1, 2, 3], [1, 2, 3]> // [1,1,1]
 * type T = TupleElementComparison<[1, 0, 3], [1, 2, 3]> // [1,0,1]
 * type T = TupleElementComparison<[], [1, 2, 3]> // []
 */
export type TupleElementComparison<T1 extends unknown[], T2 extends unknown[]> = {
  [K in keyof T1]: Equals<T1[K], T2[K & keyof T2]> extends true ? 1 : 0
}

/**
 * Converts a tuple of types into a union of types
 * @example
 * type T = TupleToUnion< [a: string, b: number, c: void]> // string | number | void
 * type T = TupleToUnion< [a: string, b: number, c: any]> // any
 */
export type TupleToUnion<T extends unknown[]> = T[number]

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
  ? R
  : never
/**
 * Converts a union of types to a tuple - do not do this!
 * @example
 * type U = UnionToTuple<true | 1 | "a">  // [true, 1, "a"]
 * type U = UnionToTuple<true | "a" | 1 > // [true, 1, "a"]
 * type U = UnionToTuple<"a" | string>    // [string] - gotcha
 * type U = UnionToTuple<boolean>         // [false, true] - gotcha
 */
export type UnionToTuple<
  T,
  L = LastOf<T>,
  Res = [T] extends [never] ? [] : [...UnionToTuple<Exclude<T, L>>, L],
> = Res
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
 * Converts the values of an object to a tuple.
 * @example
 * type U = ObjectValuesToTuple<{ a: 'a' | 'b'; b: 'b'; c: 'c' }> // ["a" | "b", "b", "c"]
 */
export type ObjectValuesToTuple<
  T extends object,
  KS extends any[] = UnionToTuple<keyof T>,
  R extends any[] = [],
  RT = KS extends [infer K, ...infer KT] ? ObjectValuesToTuple<T, KT, [...R, T[K & keyof T]]> : R,
> = RT

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

/**
 * Converts a tuple to an intersection
 * @example
 * type U1 = TupleToIntersectionAlt<['a'|'b'|'c', 'a'|'b', 'b'|'c']> // 'b'
 * type U2 = TupleToIntersectionAlt<['a']> // 'a'
 * type U3 = TupleToIntersectionAlt<[]> // never
 * type U4 = TupleToIntersectionAlt<[string, any, number]>  // any
 * type U5 = TupleToIntersectionAlt<[{ a: string }, { a: number }]> // { a: string; } & { a: number; }
 */
export type TupleToIntersectionAlt<
  Rest extends any[],
  T = Rest extends [any, ...any[]] ? Rest['0'] : never,
> = Rest extends [infer H, ...infer S] ? TupleToIntersectionAlt<S, H & T> : T

// export type TupleToIntersectionAlt<T extends any[], PreviousItem = never> = T extends [
//   infer H,
//   ...infer Rest,
// ]
//   ? H & TupleToIntersectionAlt<Rest, H>
//   : PreviousItem

/**
 * removes the `readonly` attribute from a type
 * @example
 */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export type Primitive = string | number | boolean | bigint | symbol | undefined | null
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

declare const Sigil: unique symbol

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

// type TupleSplitHead<T extends any[], N extends number> = T['length'] extends N
//   ? T
//   : T extends [...infer R, any]
//   ? TupleSplitHead<R, N>
//   : never

// type TupleSplitTail<T, N extends number, O extends any[] = []> = O['length'] extends N
//   ? T
//   : T extends [infer F, ...infer R]
//   ? TupleSplitTail<[...R], N, [...O, F]>
//   : never

// type TupleSplit<T extends any[], N extends number> = [TupleSplitHead<T, N>, TupleSplitTail<T, N>]

// type A = SpliceTuple<[1, 2, 3], 0> // [2,3]
// type B = TupleSplit<[a: 1, b: 2, c: 3, d: 4, e: 5], 2> // [1,3]
// type E = TupleSplit<[a: 1, b: 2, c: 3, d: 4, e: 5], 4> // [1,3]
// type C = SpliceTuple<[1, 2, 3], 2> // [1,2]
// type D = SpliceTuple<[1, 2, 3], 3> // [ 1,2,3]

// type TupleSplit3<
//   T extends any[],
//   N extends number,
//   HeadA extends any[] = [],
//   TailA extends any[] = [],
//   FinalHead extends any[] = never,
//   FinalTail extends any[] = never,
//   NewHead extends any[] = T extends [...infer R extends any[], any] ? R : never,
//   NewTail extends any[] = T extends [any, ...infer R extends any[]] ? R : never,
// > = {
//   headOnly: TupleSplit3<NewHead, N, NewHead, never, never, FinalTail>
//   both: TupleSplit3<NewHead, N, NewHead, NewTail, never, never>
//   tailOnly: TupleSplit3<NewHead, N, never, NewTail, FinalHead, never>
//   done: TupleSplit3<[], N, [], [], FinalHead, FinalTail>
//   result: [FinalHead, FinalTail]
// }[[FinalHead] extends [never] ? ([FinalTail] extends [never] ? 'both' : 'tailOnly') : 'result']

/**
 * Whether two function? types are equal -don't understand this
 * @example
 * type E = StrictEqual<string, string> // true
 * type E = StrictEqual<string, number> // false
 * type E = StrictEqual<string, any>    // false
 * type E = StrictEqual<string, any>    // false
 * type E = StrictEqual<{ a: unknown} & { a:string }, { a: string }> // false ????
 */
// export type StrictEqual<A1, A2> = (<A>() => A extends A2 ? true : false) extends <
//   A,
// >() => A extends A1 ? true : false
//   ? true
//   : false

/**
 * Assert than can both narrow and broaden - it requires reassignment to work.
 * const a:'a' = 'a'
 * const b = assert<string>(a) // type string
 * similar to doing:
 * const b = a as string
 * @param toBeAsserted variable to be assert
 * @returns toBeAsserted as type T
 */
export function assert<T>(toBeAsserted: any) {
  return toBeAsserted as unknown as T
}

/**
 * Assert than can narrow without reassignment:
 * const foo:'a'|'b' = 'a'
 * narrowingAssert<'a'>(foo) // foo's type is 'a' going forward
 * @param toBeAsserted variable to be assert
 * @returns toBeAsserted as type T
 */
export function narrowingAssert<T>(toBeAsserted: any): asserts toBeAsserted is T {
  return undefined
}

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
 * Prepends item(s) to the front of a tuple
 * @example
 * type Foo1 = Prepend<['c','d'], ['a','b']>  // ["a", "b", "c", "d"]
 */
export type Prepend<Tuple extends any[], NewHead extends any[]> = [
  ...newHead: NewHead,
  ...tail: Tuple,
]

/**
 * Reverses the order of the supplied tuple
 *
 * @example
 * type U = ReverseTuple<['a', 'b', 'c']> // ["c", "b", "a"]
 * type U = ReverseTuple<['a']> // ["a"]
 */
export type ReverseTuple<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [...ReverseTuple<Rest>, First]
  : []

/**
 * Returns the length of a string
 * @example
 * type U = LengthOfString<'123456'> // 6
 */
export type LengthOfString<
  S extends string,
  T extends string[] = [],
> = S extends `${string}${infer R}` ? LengthOfString<R, [...T, string]> : T['length']

/**
 * Joins an array of strings into a single string, with a separator in between
 * @example
 * type U1 = Join<['A', 'B', 'C']> // "A,B,C"
 * type U2 = Join<['A', 'B', 'C'], '|'> // "A|B|C"
 * type U3 = Join<[]> // ""
 * type U4 = Join<['', '', '']> // ""
 */
export type Join<T extends string[], Separator extends string = ','> = T extends [
  infer H extends string,
  ...infer Rest extends string[],
]
  ? `${H}${Join<Rest, Separator> extends '' ? '' : `${Separator}${Join<Rest, Separator>}`}`
  : ''

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

/** ***********************************************************************************************************************************************************************
 * To delete?
 * ************************************************************************************************************************************************************************
 */

/**
 * type Foo1 = Reverse<['c','d'], ['a','b']>  // ["d", "c", "a", "b"]
 */
export type Reverse<Tuple extends any[], Prefix extends any[] = []> = {
  empty: Prefix
  nonEmpty: Tuple extends [infer First, ...infer Next]
    ? Reverse<Next, Prepend<Prefix, [First]>>
    : never
  infinite: { ERROR: 'Cannot reverse an infinite tuple' }
}[Tuple extends [any, ...any[]] ? IsFinite<Tuple, 'nonEmpty', 'infinite'> : 'empty']

/**
 * @example
 * type Foo1 = Concat<[a: 'a', c: 'c1'], [c: `c2`, d:'d' ]> // ["a", "c1", "c2", "d"]
 */
export type Concat<Left extends any[], Right extends any[]> = {
  emptyLeft: Right
  singleLeft: Left extends [unknown] ? Prepend<Right, Left> : never
  multiLeft: Reverse<Left> extends [infer LeftLast, ...infer ReversedLeftRest]
    ? Concat<Reverse<ReversedLeftRest>, Prepend<Right, [LeftLast]>>
    : never
  infiniteLeft: {
    ERROR: 'Left is not finite'
    CODENAME: 'InfiniteLeft' & 'Infinite'
  }
}[Left extends []
  ? 'emptyLeft'
  : Left extends [any]
  ? 'singleLeft'
  : IsFinite<Left, 'multiLeft', 'infiniteLeft'>]

/**
 * Equivalent of [...Tuple1, ...Tuple2]
 * @example
 * type Foo1 = ConcatTuple<[a: 'a', c: 'c1'], [c: `c2`, d:'d' ]> // [a: "a", c: "c1", c: "c2", d: "d"]
 */
export type ConcatTuple<Tuple1 extends unknown[], Tuple2 extends unknown[]> = [...Tuple1, ...Tuple2]

// export type ConvertAnyTypeToAString<T> = T extends
//   | string
//   | number
//   | boolean
//   | bigint
//   | undefined
//   | null
//   ? `${T}`
//   : T extends symbol
//   ? 'symbol'
//   : T extends Function
//   ? 'function'
//   : T extends Date
//   ? 'Date'
//   : T extends Error
//   ? 'Error'
//   : T extends RegExp
//   ? 'RegExp'
//   : T extends Map<infer K, infer V>
//   ? `Map<${ConvertAnyTypeToAString<K>},${ConvertAnyTypeToAString<V>}>`
//   : T extends WeakMap<infer K, infer V>
//   ? `WeakMap<${ConvertAnyTypeToAString<K>},${ConvertAnyTypeToAString<V>}>`
//   : T extends Set<infer K>
//   ? `Set<${ConvertAnyTypeToAString<K>}>`
//   : T extends WeakSet<infer K>
//   ? `WeakSet<${ConvertAnyTypeToAString<K>}>`
//   : T extends Promise<infer K>
//   ? `Promise<${ConvertAnyTypeToAString<K>}>`
//   : T extends object
//   ? ObjectToString<T>
//   : 'not handled'

// export type ObjectToString<
//   T extends object,
//   RemainingKeys extends (keyof any)[] = UnionToTuple<keyof T> extends (keyof any)[]
//     ? UnionToTuple<keyof T>
//     : never,
//   Separator extends string = ',',
//   Result extends string = '',
// > = RemainingKeys extends [infer H extends keyof T, ...infer Rest extends (keyof any)[]]
//   ? ObjectToString<
//       T,
//       Rest,
//       Separator,
//       '' extends Result
//         ? `{${ConvertAnyTypeToAString<H>}:${ConvertAnyTypeToAString<T[H]>}`
//         : `${Result}${Separator}${ConvertAnyTypeToAString<H>}:${ConvertAnyTypeToAString<T[H]>}`
//     >
//   : `${Result}}`
// type U1 = ObjectToString<{ a: 1; b: 2; c: 3; 1: 2 }>

// const d = Date()

// type TypeToString<T> = string & T

// type Z = `${TypeToString<{ a: 1; b: 2; c: 3; 1: 2 }>}`

/**
 * In [ A, B , ...] A and B are merged, with B taking precedence
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = Identity<RMerge<[{ a?: 'a'; c?: 'a' }, { b: 'b'; c: 'b' }]>> // { a?: 'a'; b: 'b'; c: 'b'; }
 */
export type ObjectArray = [object, object, ...object[]]

export type RMerge<T extends ObjectArray, MergedObject = Omit<T[0], keyof T[1]> & T[1]> = [
  MergedObject,
  ...(T extends [any, any, ...infer R extends object[]] ? R : []),
] extends infer NewT extends ObjectArray
  ? RMerge<NewT>
  : MergedObject

// NewT extends ObjectArray ? RMerge<NewT> : MergedObject

/**
 * In [ A, B , ...] A and B are merged, with A taking precedence
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = Identity<LMerge2<[{ a?: 'a', c: 'a'}, { b: 'b', c?: 'b' }]>> // { b: 'b'; a?: 'a'; c: 'a'; }
 */
export type LMerge<
  T extends ObjectArray,
  MergedObject extends object = Omit<T[1], keyof T[0]> & T[0],
  NewT = [MergedObject, ...(T extends [any, any, ...infer R extends object[]] ? R : [])],
> = NewT extends ObjectArray ? LMerge<NewT> : MergedObject

/**
 * In [ A, B , ... ] A and B are merged limited to A's properties, with B taking precedence
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = Identity<RMergeL2<[{ a?: 'a', c: 'a'}, { b: 'b', c?: 'b' }]>> // { a: "a" | undefined; c?: 'b'; }
 */
export type RMergeLimited<
  T extends ObjectArray,
  MergedObject extends object = Pick<T[1], keyof T[1] & keyof T[0]> & Omit<T[0], keyof T[1]>,
  NewT = [MergedObject, ...(T extends [any, any, ...infer R extends object[]] ? R : [])],
> = NewT extends ObjectArray ? RMergeLimited<NewT> : MergedObject

/**
 * In [ A, B , ... ] A and B are merged limited to B's properties, with A taking precedence
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = Identity<LMergeL2<[{ a: 'a'; c?: 'a' }, { b?: 'b'; c: 'b' }]>> // { c?: 'a'; b?: 'b'; }
 */
export type LMergeLimited<
  T extends ObjectArray,
  MergedObject extends object = Pick<T[0], keyof T[1] & keyof T[0]> & Omit<T[1], keyof T[0]>,
  NewT = [MergedObject, ...(T extends [any, any, ...infer R extends object[]] ? R : [])],
> = NewT extends ObjectArray ? LMergeLimited<NewT> : MergedObject

/**
 * In [ A, B , ... ] where properties exist in both A and B, return A's matched properties
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = MatchA2<[{ a: 'a', c?: 'a'}, { b: 'b', c: 'b' }]> // { c?: 'a'; }
 */
export type MatchA<
  T extends ObjectArray,
  MergedObject extends object = Pick<T[0], keyof T[1] & keyof T[0]>,
  NewT = [MergedObject, ...(T extends [any, any, ...infer R extends object[]] ? R : [])],
> = NewT extends ObjectArray ? MatchA<NewT> : MergedObject

/**
 * In [ A, B , ... ] where properties exist in both A and B, return B's matched properties
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = MatchB<[{ a: 'a', c: 'a'}, { b: 'b', c?: 'b' }]> // { c?: 'b'; }
 */
export type MatchB<
  T extends ObjectArray,
  MergedObject extends object = Pick<T[1], keyof T[1] & keyof T[0]>,
  NewT = [MergedObject, ...(T extends [any, any, ...infer R extends object[]] ? R : [])],
> = NewT extends ObjectArray ? MatchB<NewT> : MergedObject

/**
 * In [ A, B, C, ... ] returns A & B & C & ...
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = Identity<IntersectType1<[{ a: 'a' }, { b?: 'b' }, { c: 'c' }]>> // { a: 'a'; b?: 'b'; c: 'c'; }
 */
export type IntersectType1<T extends [object, ...object[]]> = {
  [I in keyof T]: (x: T[I]) => void
}[number] extends (x: infer I) => void
  ? I
  : never

/**
 * In [ A, B, C, ... ] returns (( A & B ) & C ) & ...)
 * Gotcha: doesn't merge call signatures or constructors.
 * @example
 * type U = IntersectType2<[{ a: string }, { a: any; b: 'b' }, { a: number }]> // { a: any; b: 'b }
 * type U = IntersectType2<[{ a: 'a' }, { b?: 'b' }, { c: 'c' }]> // { a: 'a'; b?: 'b'; c: 'c'; }
 */
export type IntersectType2<T extends [object, ...object[]]> = T extends [
  infer T1 extends object,
  infer T2 extends object,
  ...infer R extends object[],
]
  ? IntersectType2<[Identity<T1 & T2>, ...R]>
  : T[0]

// // A union B
// type Union<T1 extends object,T2 extends object> = T1 | T2 extends infer O ? { [K in keyof O]: O[K] }: never
// type UnionX1 = Union<A,B> // { a: 'a'; c: 'a'; } | { b: 'b'; c: 'b'; }
