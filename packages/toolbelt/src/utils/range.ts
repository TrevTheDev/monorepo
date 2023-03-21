interface Stream<A> {
  (): Generator<A>
}

/**
 * Creates a range between an interval.
 *
 * *Note:* If `end` is not given, the range will be streaming the numbers
 * infinitely.
 *
 * @export
 * @param {number} start The start of the range.
 * @param {number} [end] The end of the range.
 * @return {Stream<number>} A {@link Stream} of numbers in the interval.
 *
 * @__PURE__
 */
export function range(start: number, end = Infinity): Stream<number> {
  return function* __range() {
    while (start < end) yield (start += 1)
  }
}

/**
 * Converts a {@link Stream} of type `A` to an array of `A`.
 *
 * @export
 * @template A The value type.
 * @param {Stream<A>} fa The stream source.
 * @return {A[]} The stream items as an array.
 *
 * @__PURE__
 */
export function toArray<A>(fa: Stream<A>): A[] {
  return Array.from(fa())
}

interface Predicate<A> {
  (a: A): boolean
}

interface Refinement<A, B extends A> {
  (a: A): a is B
}

/**
 * Returns a {@link Stream} that produces values that passes from the refinement
 * function.
 *
 * @export
 * @template A The value type.
 * @template B The refined output value type.
 * @param {Refinement<A, B>} refinement The refinement function.
 * @return {(fa: Stream<A>) => Stream<B>} A function that takes a stream
 * and returns another stream passing the filter.
 *
 * @category filtering
 * @__PURE__
 */
export function filter<A, B extends A>(refinement: Refinement<A, B>): (fa: Stream<A>) => Stream<B>

/**
 * Returns a {@link Stream} that produces values that passes from the predicate
 * function.
 *
 * @export
 * @template A The value type.
 * @param {Predicate<A>} predicate The predicate function.
 * @return {<B extends A>(fa: Stream<B>) => Stream<B>} A function that takes
 * a stream and returns another stream passing the filter.
 *
 * @category filtering
 * @__PURE__
 */
export function filter<A>(predicate: Predicate<A>): <B extends A>(fa: Stream<B>) => Stream<B>

/**
 * Returns a {@link Stream} that produces values that passes from the predicate
 * function.
 *
 * @export
 * @template A The value type.
 * @param {Predicate<A>} predicate The predicate function.
 * @return {(fa: Stream<A>) => Stream<A>} A function that takes
 * a stream and returns another stream passing the filter.
 *
 * @category filtering
 * @__PURE__
 */
export function filter<A>(predicate: Predicate<A>): (fa: Stream<A>) => Stream<A> {
  /**
   * Takes a {@link Stream} and returns another one that will yield the elements
   * of the given {@link Stream} which pass the previously given predicate.
   *
   * @param {Stream<A>} fa The input stream.
   * @return {Stream<A>} The output stream.
   *
   * @step 1
   * @category filtering
   * @__PURE__
   */
  return function _filter(fa: Stream<A>): Stream<A> {
    return function* __filter() {
      // eslint-disable-next-line no-restricted-syntax
      for (const a of fa()) if (predicate(a)) yield a
    }
  }
}
