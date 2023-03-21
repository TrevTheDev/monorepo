export type DidError<T = never, IsError extends boolean = never> = [IsError] extends [never]
  ? [T] extends [never]
    ? {
        (): DidError<never, false>
        error(): DidError<never, true>
        isError(): boolean
      }
    : {
        (): DidError<T, false>
        error(error: T): DidError<T, true>
        isError(): boolean
        errorValue(): T
      }
  : IsError extends true
  ? {
      isError(): true
      errorValue(): T
    }
  : { isError(): false }

/**
 * @example
 *  const fn = (error: boolean) => {
      const output = didError<Error>()
      return error ? output.error(new Error('ERROR')) : output()
    }
    const results = fn(true)
    if (results.isError()) console.log((results as DidError<Error, true>).errorValue()) // Error('ERROR')
 * 
 * @returns DidError
 */
export function didError<T = never>() {
  let hasBeenSet = false
  let errored = false
  let errorStore: T

  const didErrorFn = function DidErrorFn() {
    hasBeenSet = true
    return didErrorFn
  } as unknown as DidError<T>

  return Object.defineProperties(didErrorFn, {
    error: {
      value: (error?: T) => {
        if (error) errorStore = error
        errored = true
        hasBeenSet = true
        return didErrorFn
      },
    },
    isError: {
      value: () => {
        if (!hasBeenSet) throw new Error('has not been set')
        return errored
      },
    },
    errorValue: {
      value: () => {
        if (!hasBeenSet) throw new Error('has not been set')
        return errorStore
      },
    },
  })
}

/**
 * @example
 * const fn = wrapTryCatchInDidError((error: boolean) => {
      if (error) throw new Error('ERROR')
    })
    const results = fn(true)
    if (results.isError()) console.log((results as DidError<Error, true>).errorValue()) // Error('ERROR')
 *  
 * @param fn (...args) => void | never    
 * @returns (...args) => DidError\<unknown\>
 */
export function wrapTryCatchInDidError<Args extends unknown[]>(
  fn: (...args: Args) => void,
): (...args: Args) => DidError<unknown, boolean> {
  const output = didError<unknown>()
  return (...args: Args) => {
    try {
      fn(...args)
      return output()
    } catch (e: unknown) {
      return output.error(e)
    }
  }
}
