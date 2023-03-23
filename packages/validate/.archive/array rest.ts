// import { MinimumSafeParsableArray, SingleArrayValidationError, StratifiedParsers } from './array'
// import { MinimumSafeParsableObject } from './base'

// export interface MinimumSafeParsableRestArray {
//   vArray: MinimumSafeParsableArray
//   isSpread: true
//   optional(): MinimumSafeParsableRestArray
//   required(): MinimumSafeParsableRestArray
//   deepPartial(): MinimumSafeParsableRestArray
//   deepRequired(): MinimumSafeParsableRestArray
//   stratifiedParsers: StratifiedParsers
//   type: string
// }

// export interface SafeParsableRestArray<T extends MinimumSafeParsableArray>
//   extends MinimumSafeParsableRestArray {
//   vArray: T
//   optional(): ReturnType<T['partial']>['spread']
//   deepPartial(): ReturnType<T['deepPartial']>['spread']
//   required(): ReturnType<T['required']>['spread']
//   deepRequired(): ReturnType<T['deepRequired']>['spread']
// }

// // function parseInfiniteRestArray(
// //   itemParser: MinimumSafeParsableObject,
// // ): (
// //   value: unknown[],
// //   [start, end]: [start: number, end: number],
// // ) => SingleArrayValidationError[] | undefined {
// //   return function parseInfiniteRestArrayFn(
// //     value: unknown[],
// //     [start, end]: [start: number, end: number],
// //   ): SingleArrayValidationError[] | undefined {
// //     // debugger
// //     for (let i = start; i <= end; i += 1) {
// //       const result = itemParser.safeParse(value[i])
// //       if (result[0] !== undefined) return [[i, result[0].errors]]
// //     }
// //     return undefined
// //   }
// // }
