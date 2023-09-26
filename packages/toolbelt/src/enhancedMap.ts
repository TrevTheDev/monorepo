export interface EnhancedMap<V, K = number> {
  /**
   * adds an item and an optional `key` can be supplied, otherwise insertion order is used.
   * a function can be called, if the item already exists in the `enhancedMap`.  This is useful
   * to throw any custom errors.
   * @returns a function that removes the added item from the map.
   */
  add(item: V): () => boolean
  add(item: V, key: K): () => boolean
  add(item: V, key: K, errorOnDuplicate: true): () => boolean
  // add(item, key?, errorOnDuplicate?: boolean): ResultError<Error, () => void> | (() => void)
  /**
   * adds an array of item to the map.
   * @returns a function that removes all of the added item from the map.
   */
  addItems(...items: V[]): () => void
  /**
   *
   * @param basedOnInsertionOrder whether to shift based on insertion order, or key order
   * @returns V|undefined
   */
  shift(basedOnInsertionOrder?: boolean): V | undefined
  set(key: K, value: V): this
  /**
   * count of the total number of items added to the queue
   */
  readonly countOfItemsAdded: number
  /**
   * Calls the specified callback function for all the elements in the EnhancedMap.
   * The return value of the callback function is the accumulated result, and is provided
   * as an argument in the next call to the callback function.
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
   *                   callbackfn function one time for each element in the array.
   * @param initialValue If initialValue is specified, it is used as the initial value to start
   *                     the accumulation. The first call to the callbackfn function provides
   *                     this value as an argument instead of an array value.
   * @param reverseOrder whether items should be mapped in reverse order, default is `false`
   */
  reduce<U>(
    callbackfn: (previousValue: U, currentValue: V, currentKey: K, index: number) => U,
    initialValue: U,
    reverseOrder?: boolean,
  ): U
  /**
   * Calls a defined callback function on each element of an array, and returns an array that contains the results.
   * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
   * @param reverseOrder whether items should be mapped in reverse order, default is `false`
   */
  map<U>(callbackfn: (value: V, key: K) => U, reverseOrder?: boolean): U[]
  clear(): void
  delete(key: K): boolean
  forEach(callbackfn: (value: V, key: K) => void, thisArg?: unknown): void
  get(key: K): V | undefined
  has(key: K): boolean
  [Symbol.iterator](): IterableIterator<[K, V]>
  readonly [Symbol.toStringTag]: string
  readonly entries: IterableIterator<[K, V]>
  readonly keys: IterableIterator<K>
  readonly values: IterableIterator<V>
  /**
   * @returns the number of elements in the Map.
   */
  readonly size: number
}

export function enhancedMap<V, K = number>(...itemsToAddToMap: V[]): EnhancedMap<V, K> {
  const map = new Map<K, V>()
  let itemsAdded = 0
  const iFace: EnhancedMap<V, K> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    add(item, key = itemsAdded as K, errorOnDuplicate = false): () => boolean {
      if (errorOnDuplicate && map.get(key)) throw new Error('item already exists in array')
      map.set(key, item)
      itemsAdded += 1
      return () => map.delete(key)
    },

    addItems(...items: V[]) {
      const removeItemFns = items.map((item) => this.add(item))
      return () => removeItemFns.forEach((removeItemFn) => removeItemFn())
    },

    shift(basedOnInsertionOrder = true) {
      const [firstKey] = basedOnInsertionOrder ? map.keys() : [...map.keys()].sort()
      if (firstKey === undefined) return undefined
      const result = map.get(firstKey)
      map.delete(firstKey)
      return result
    },

    set(key: K, value: V) {
      map.set(key, value)
      return this
    },

    get countOfItemsAdded() {
      return itemsAdded
    },

    reduce<U>(
      callbackfn: (previousValue: U, currentValue: V, currentKey: K, index: number) => U,
      initialValue: U,
      reverseOrder = false,
    ) {
      const arr = reverseOrder ? [...map.entries()].reverse() : [...map.entries()]
      return arr.reduce((previousValue: U, currentValue: [K, V], currentIndex: number) => {
        const [key, value] = currentValue
        return callbackfn(previousValue, value, key, currentIndex)
      }, initialValue)
    },

    map<U>(callbackfn: (value: V, key: K) => U, reverseOrder = false) {
      return this.reduce(
        (previousValue, currentValue, currentKey) => {
          previousValue.push(callbackfn(currentValue, currentKey))
          return previousValue
        },
        [] as U[],
        reverseOrder,
      )
    },

    clear() {
      return map.clear()
    },
    delete(key: K) {
      return map.delete(key)
    },
    forEach(callbackfn: (value: V, key: K) => void, thisArg?: unknown) {
      return map.forEach(callbackfn, thisArg)
    },
    get(key: K) {
      return map.get(key)
    },
    has(key: K) {
      return map.has(key)
    },
    [Symbol.iterator]() {
      return map[Symbol.iterator]()
    },
    get [Symbol.toStringTag]() {
      return 'EnhancedMap'
    },
    get entries() {
      return map.entries()
    },
    get keys() {
      return map.keys()
    },
    get values() {
      return map.values()
    },

    get size() {
      return map.size
    },
  }
  iFace.addItems(...itemsToAddToMap)
  return iFace
}

// export type EnhancedMap<T, K = number> = ReturnType<typeof enhancedMap<T, K>>

export default enhancedMap
