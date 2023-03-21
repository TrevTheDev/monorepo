export function enhancedMap<V, K = number>(...iterable: readonly V[]) {
  const map = new Map<K, V>()
  let itemsAdded = 0
  const iFace = {
    /**
     * adds an item and an optional `key` can be supplied, otherwise insertion order is used.
     * @returns a function that removes the added item from the map.
     */
    add(item: V, key?: K) {
      const idx = (key || itemsAdded) as K
      if (map.get(idx)) throw new Error(`item with key '${idx}' already exists in map`)
      map.set(idx, item)
      itemsAdded += 1
      return () => map.delete(idx)
    },
    /**
     * adds an array of item to the map.
     * @returns a function that removes all of the added item from the map.
     */
    addItems(...items: V[]) {
      const removeItemFns = items.map((item) => this.add(item))
      return () => removeItemFns.forEach((removeItemFn) => removeItemFn())
    },
    /**
     *
     * @param basedOnInsertionOrder whether to shift based on insertion order, or key order
     * @returns V|undefined
     */
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
    /**
     * count of the total number of items added to the queue
     */
    get countOfItemsAdded() {
      return itemsAdded
    },
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
      reverseOrder = false,
    ) {
      const arr = reverseOrder ? [...map.entries()].reverse() : [...map.entries()]
      return arr.reduce((previousValue: U, currentValue: [K, V], currentIndex: number) => {
        const [key, value] = currentValue
        return callbackfn(previousValue, value, key, currentIndex)
      }, initialValue)
    },
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param reverseOrder whether items should be mapped in reverse order, default is `false`
     */
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
      return
      map.forEach(callbackfn, thisArg)
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
    /**
     * @returns the number of elements in the Map.
     */
    get size() {
      return map.size
    },
  }
  iterable.forEach((item) => iFace.add(item))
  return iFace
}

export type EnhancedMap<T, K = number> = ReturnType<typeof enhancedMap<T, K>>

export default enhancedMap
