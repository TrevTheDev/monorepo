import { enhancedMap } from '@trevthedev/toolbelt'

/**
 * buffers 'await' calls, ensuring only one await call to `awaitFn` is made at a time
 *
 * @param awaitFn
 * @returns
 */
export function bufferAwaitCalls<
  T extends (awaitCb: any, readyForNextAwait: () => void, ...otherArgs: any[]) => void,
>(awaitFn: T) {
  type AwaitCb = Parameters<T>[0]
  type OtherArgs = Parameters<T> extends [any, any, ...infer R] ? R : never
  let idle = true
  const buffer = enhancedMap<[AwaitCb, OtherArgs]>()

  const onAwaitDone = () => {
    const bufferItem = buffer.shift()
    if (bufferItem) {
      const [nextCb, otherArgs] = bufferItem
      awaitFn(nextCb, onAwaitDone, ...otherArgs)
    } else idle = true
  }

  return (awaitCb: AwaitCb, ...otherArgs: OtherArgs) => {
    if (idle) {
      idle = false
      awaitFn(awaitCb, onAwaitDone, ...otherArgs)
    } else buffer.add([awaitCb, otherArgs])
  }
}
