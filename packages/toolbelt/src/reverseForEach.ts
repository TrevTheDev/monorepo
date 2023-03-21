/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * `forEach` loop but in reverse order
 * @param this - array
 * @param callbackFn  -(value: unknown, index: number, array: unknown[])
 */
function reverseForEach(
  this: unknown[],
  callbackFn: (value: unknown, index: number, array: unknown[]) => void,
) {
  let i: number
  const len = this.length - 1
  for (i = len; i >= 0; i -= 1) callbackFn(this[i], i, this)
}

export default reverseForEach

export const globalReverseForEach = Symbol('reverseForEach')
declare global {
  interface Array<T> {
    [globalReverseForEach]: (callbackFn: (value: T, index: number, array: T[]) => void) => void
  }
}

if (!(globalReverseForEach in Array.prototype)) {
  // eslint-disable-next-line no-extend-native
  ;(Array.prototype[globalReverseForEach] as unknown as any) = reverseForEach
}
