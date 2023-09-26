export type ResultError<E, R> = [error: E, result?: undefined] | [error: undefined, result: R]

export function toResult<T>(result: T): [undefined, T] {
  return [undefined, result]
}

export function toError<T>(error: T): [T, undefined] {
  return [error, undefined]
}

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

/**
 * Unwraps a ResultError, throwing any Error, or returning the Result
 *
 * @param fn : (...args)=>ResultError<Result, Error>
 * @returns (...args)=>Result|never
 */
export function resultErrorToResultNever<A extends unknown[], E, R>(
  fn: (...args: A) => ResultError<E, R>,
): (...args: A) => R {
  return (...args: A): R => {
    const [error, result] = fn(...args)
    if (error) throw error
    return result as R
  }
}

/**
 * converts a function that may throw, to a resultError, by try catching
 * any errors.
 *
 * @param fn : (...args)=>ResultError<Result, Error>
 * @returns (...args)=>Result|never
 */
export function resultNeverToResultError<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => ResultError<unknown, R> {
  return (...args: A): ResultError<unknown, R> => {
    try {
      return [undefined, fn(...args)]
    } catch (e) {
      return [e]
    }
  }
}

/**
 * takes as input a function `fn` which has one input returning a `ResultError` and
 * returns a new function which takes one input of type `ResultError` and if that
 * is an error then it returns the `ResultError`, and if it is a result
 * it executes and returns `fn` with the result
 *
 * Useful for chaining together functions which return `ResultError`
 *
 * @param fn : (input:any)=>ResultError
 * @returns (resultOrError: ResultError)=>ResultError
 */
export function onlyExecuteOnResult<E1, R1, E2, R2>(fn: (input: R1) => ResultError<E2, R2>) {
  return ([error, result]: ResultError<E1, R1>): ResultError<E1 | E2, R2> => {
    if (error) return [error]
    return fn(result as R1) //  as ResultError<E1 | E2, R2>
  }
}
