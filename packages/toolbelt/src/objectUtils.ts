/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Equivalent to Pick in typescript.  Returns a new object that includes
 * the picked properties
 * @example
 * ```typescript
 * const foo1 = pick({ a: 'a', b: 'b' }, ['a'])    // { a: 'a' }
 * ```
 */
export function pick<T extends object, Keys extends [keyof T, ...(keyof T)[]]>(
  object: T,
  keys: Keys,
): Pick<T, Keys[number]>
export function pick(object: object, keys: [PropertyKey, ...PropertyKey[]]): object {
  return Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key)))
}

/**
 * Equivalent to Omit in typescript.  Returns a new object that excludes
 * the specified properties
 * @example
 * ```typescript
 * const foo1 = pick({ a: 'a', b: 'b' }, ['a'])    // {  b: 'b }
 * ```
 */
export function omit<T extends object, Keys extends [keyof T, ...(keyof T)[]]>(
  object: T,
  keys: Keys,
): Omit<T, Keys[number]>
export function omit(object: object, keys: [PropertyKey, ...PropertyKey[]]): object {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)))
}

type ObjectWithExecutableProperty<P extends string> = { [K in P]: (...args: any[]) => any }

export function isObjectAndHasExecutableProperty<P extends string>(
  object: unknown,
  property: P,
): object is ObjectWithExecutableProperty<P> {
  if (object === null || !['object', 'function'].includes(typeof object)) return false
  const descriptor = Object.getOwnPropertyDescriptor(object, property)
  if (descriptor === undefined) return false
  return typeof descriptor.get === 'function' || typeof descriptor.value === 'function'
}

/**
 * whether a property of `obj` is a getter.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isGetter<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  return !!(Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).get
}
/**
 * whether a property of `obj` is a setter.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isSetter<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  return !!(Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).set
}
/**
 * whether a property of `obj` is a value - i.e. a non-callable property.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 */
export function isValue<P extends PropertyKey, O extends { [Property in P]: any }>(
  obj: O,
  prop: P,
): boolean {
  const x = (Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).value
  return x !== undefined && typeof x !== 'function'
}
/**
 * whether a property of `obj` is a callable function.  prop is assumed to exist.
 *
 * @param obj
 * @param prop
 * @returns boolean
 *
 * @example
 * type Foo = { foo: unknown }
 * const foo1:Foo = { foo: () => 1 }
 * foo1.foo() // errors
 * if(isFunction(foo1, 'foo')) foo1.foo() // doesn't error
 */
export function isFunction<P extends PropertyKey>(
  obj: { [Property in P]: unknown } | { [Property in P]: (...args: any[]) => any },
  prop: P,
): obj is { [Property in P]: (...args) => any } {
  const x = (Object.getOwnPropertyDescriptor(obj, prop) as PropertyDescriptor).value
  return x !== undefined && typeof x === 'function'
}
