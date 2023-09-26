export type CanError<E> = E | undefined

/**
 * Tests whether the returned result did error
 * @param result
 * @returns
 */
export function didError<E>(result: CanError<E>): result is E {
  return result !== undefined
}

/**
 * Tests whether the returned result did not error
 * @param result
 * @returns
 */
export function didNotError<E>(result: CanError<E>): result is undefined {
  return result === undefined
}

/**
 * throws the result, if it is anything other than undefined
 * @param result {CanError}
 */
export function throwOnError<E>(result: CanError<E>) {
  if (result !== undefined) throw result
}

/**
 * Converts a function which returns a void or throws to a function which returns `undefined`
 * if no error is thrown, or the `Error` if it is thrown
 * @param fn: (...args: T)=>undefined|Error
 * @returns (...args: T)=>void|never
 */
export function voidNeverToUndefinedError<T extends unknown[], ErrorTypes>(
  fn: (...args: T) => void,
): (...args: T) => CanError<ErrorTypes> {
  return function Fn(...args: T): undefined | ErrorTypes {
    try {
      fn(...args)
      return undefined
    } catch (e) {
      return e as ErrorTypes
    }
  }
}

/**
 * converts a function which returns undefined for success, and anything else to indicate
 * an error, to a function which throws the returned error
 * @param fn: (...args: T)=>undefined|Error
 * @returns (...args: T)=>void|never
 */
export function undefinedErrorToVoidNever<T extends unknown[]>(
  fn: (...args: T) => CanError<Error>,
): (...args: T) => void {
  return function Fn(...args: T) {
    throwOnError(fn(...args))
  }
}
