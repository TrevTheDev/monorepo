// import { enhancedMap } from '@trevthedev/toolbelt'

// /**
//  * buffers 'await' calls, ensuring only one await call to `awaitFn` is made at a time
//  *
//  * @param awaitFn
//  * @returns
//  */
// export default function bufferAwaitCalls<AwaitCb, OtherArgs extends unknown[]>(
//   awaitFn: (awaitCb: AwaitCb, readyForNextAwait: () => void, ...otherArgs: OtherArgs) => void,
// ): (awaitCb: AwaitCb, ...otherArgs: OtherArgs) => void {
//   let idle = true
//   const buffer = enhancedMap<[AwaitCb, OtherArgs]>()

//   function onAwaitDone() {
//     const bufferItem = buffer.shift()
//     if (bufferItem) {
//       const [nextCb, otherArgs] = bufferItem
//       awaitFn(nextCb, onAwaitDone, ...otherArgs)
//     } else idle = true
//   }

//   return (awaitCb: AwaitCb, ...otherArgs: OtherArgs) => {
//     if (idle) {
//       idle = false
//       awaitFn(awaitCb, onAwaitDone, ...otherArgs)
//     } else buffer.add([awaitCb, otherArgs])
//   }
// }

// export function bufferAwaitCalls2<AwaitCb, OtherArgs extends unknown[]>(
//   awaitFn: (awaitCb: AwaitCb, readyForNextAwait: () => void, ...otherArgs: OtherArgs) => void,
// ): (awaitCb: AwaitCb, ...otherArgs: OtherArgs) => void {

//   return (awaitCb: AwaitCb, ...otherArgs: OtherArgs) => {
//     return bufferAwaitCalls2(awaitCb, () => {
//       awaitFn(awaitCb,   , ...otherArgs)
//   }
// }
