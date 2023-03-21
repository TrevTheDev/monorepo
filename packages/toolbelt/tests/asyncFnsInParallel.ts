/* eslint-disable @typescript-eslint/no-explicit-any */
// import { expect } from 'chai'

import { describe, it, expect } from 'vitest'
import type { AsyncFnResolver, ValidResolver } from '../src/index'

import { asyncFnsInParallel, asyncFnsInParallelShort } from '../src/index'
import { times } from '../src/smallUtils'

type DoneCb<T> = (result: T) => void
type ErrorCb<T> = (error: T) => void

const doNotCall = () => expect(true).toBe(false) as unknown as never

describe('asyncFnsInParallel', () => {
  it('example usage', () =>
    new Promise((done) => {
      // import { asyncFnsInParallel } from '...'
      // import type { Resolver } from '...'
      const parallelFns = asyncFnsInParallel(
        (a: 1, resolver: AsyncFnResolver<(value: 1) => void>) =>
          setTimeout(() => resolver((a * 1) as 1), 100),
        (a: 1, resolver: AsyncFnResolver<(value: 2) => void>) =>
          setTimeout(() => resolver((a * 2) as 2), 100),
      )
      parallelFns.await(1, (results) => {
        console.log(results) // [1,2]
        done(undefined)
      })
    }))
  it('asyncFnsInParallel', () =>
    new Promise((done) => {
      const itemFn =
        <T>(value: T, doneCb: (res: T) => void) =>
        () => {
          console.log(value)
          doneCb(value)
        }
      const x = asyncFnsInParallel(
        (a: 1, resolver: AsyncFnResolver<(res: 1) => void>) => itemFn((a * 1) as 1, resolver)(),
        (a: 1, resolver: AsyncFnResolver<(res: 2) => void>) =>
          setTimeout(itemFn((a * 2) as 2, resolver), 100),
        (a: 1, resolver: AsyncFnResolver<(res: 3) => void>) =>
          setTimeout(itemFn((a * 3) as 3, resolver), 200),
        (a: 1, resolver: AsyncFnResolver<(res: 4) => void>) =>
          setTimeout(itemFn((a * 4) as 4, resolver), 100),
        (a: 1, resolver: AsyncFnResolver<(res: 5) => void>) => itemFn((a * 5) as 5, resolver)(),
      )
      x.await(1, (results) => {
        // debugger
        expect(`${results}`).toEqual('1,2,3,4,5')
        done(undefined)
      })
    }))
  it('errors', () =>
    new Promise((done) => {
      const possiblyAsyncFn = <T, R extends ValidResolver & { error: any }>(
        value: T,
        resolver: R,
        timeOut,
        errors = false,
      ) => {
        const fn = () => {
          console.log(value)
          if (errors) resolver.error(value)
          else resolver(value)
        }
        if (timeOut) setTimeout(fn, timeOut)
        else fn()
        return undefined as unknown as T
      }

      const x = asyncFnsInParallelShort(
        [
          (a: 1, resolver: AsyncFnResolver<DoneCb<1>, ErrorCb<unknown>>) =>
            possiblyAsyncFn((a * 1) as 1, resolver, undefined),
          (a: 1, resolver: AsyncFnResolver<DoneCb<2>, ErrorCb<unknown>>) =>
            possiblyAsyncFn((a * 2) as 2, resolver, 100),
          (a: 1, resolver: AsyncFnResolver<DoneCb<undefined>, ErrorCb<3>>) =>
            possiblyAsyncFn((a * 3) as 3, resolver, 200, true),
          (a: 1, resolver: AsyncFnResolver<DoneCb<4>, ErrorCb<unknown>>) =>
            possiblyAsyncFn((a * 4) as 4, resolver, 300),
          (a: 1, resolver: AsyncFnResolver<DoneCb<5>, ErrorCb<unknown>>) =>
            possiblyAsyncFn((a * 5) as 5, resolver, undefined),
        ],
        1,
        doNotCall,
        (errors, results) => {
          // debugger
          console.log(`${results}`)
          expect(`${errors}`).toEqual(',,3,,')
          expect(`${results}`).toEqual('1,2,,4,5')
          // debugger
          done(undefined)
        },
      )
      console.log(x.state)
    }))
  it('cancels', () =>
    new Promise((done) => {
      const possiblyAsyncFn = <T>(
        value: T,
        resolver: ValidResolver,
        timeOut,
        // throws,
        shouldCancel,
        canCancel = false,
        doDone = false,
      ) => {
        let cancelled = false
        const fn = () => {
          console.log(value)
          if (!cancelled) {
            // if (throws) resolver.error(value)
            resolver(value)
          }
        }
        if (timeOut) setTimeout(fn, timeOut)
        else fn()
        return canCancel
          ? (reason) => {
              // debugger
              expect(shouldCancel).to.equal(true)
              expect(reason).to.equal('xc')
              cancelled = true
              if (doDone) done(undefined)
            }
          : undefined
      }

      const controllers = asyncFnsInParallelShort(
        [
          (a: 1, resolver: AsyncFnResolver<DoneCb<1>>) =>
            possiblyAsyncFn((a * 1) as 1, resolver, undefined, false, true),
          (a: 1, resolver: AsyncFnResolver<DoneCb<2>>) =>
            possiblyAsyncFn((a * 2) as 2, resolver, 200, true, true),
          (a: 1, resolver: AsyncFnResolver<DoneCb<3>>) =>
            possiblyAsyncFn((a * 3) as 3, resolver, 100, true, true),
          (a: 1, resolver: AsyncFnResolver<DoneCb<4>>) =>
            possiblyAsyncFn((a * 4) as 4, resolver, 300, true, true, true),
          (a: 1, resolver: AsyncFnResolver<DoneCb<5>>) =>
            possiblyAsyncFn((a * 5) as 5, resolver, undefined, false),
        ],
        1,
        doNotCall,
        (errors, results) => {
          debugger
          expect(`${errors}`).to.equal('')
          expect(`${results}`).to.equal('1')
        },
      )
      // debugger
      expect(controllers.controllers.length).toEqual(3)
      controllers.halt()
      controllers.controllers.forEach((ctrl) => ctrl('xc'))
    }))
  it('benchmark', () =>
    new Promise((done) => {
      const max = 100000

      const benchAsyncEffectsInParallel = (promiseLapse: number) => {
        const results = new Array(max) as [
          asyncEffects: (x: any, resolver: AsyncFnResolver<DoneCb<string>>) => void,
          ...asyncEffects: ((x: any, resolver: AsyncFnResolver<DoneCb<string>>) => void)[],
        ]
        const t1 = Date.now()
        times(max, (i) => {
          results[i] = (a, resolver: AsyncFnResolver<DoneCb<string>>) => resolver.result(`${i}`)
        })
        const t2 = Date.now()
        const y = asyncFnsInParallel(...results)
        y.await(undefined, (_res) => {
          const t3 = Date.now()
          // debugger
          console.log(`
          asyncEffectsInParallel:
          t1: ${t1}
          t2: ${t2}, lapsed ${t2 - t1}
          t3: ${t3}, lapsed ${t3 - t2}
          total lapsed ${t3 - t1}
          factor: ${promiseLapse / (t3 - t1)} times faster
          `)
          done(undefined)
        })
      }

      const benchPromiseAll = () => {
        const results2 = new Array<Promise<string>>(max)
        const t1 = Date.now()
        times(max, (i) => {
          results2[i] = new Promise<string>((resolve) => {
            resolve(`${i}`)
          })
        })
        const t2 = Date.now()
        const y = Promise.all(results2)
        y.then((_res) => {
          const t3 = Date.now()
          // debugger
          console.log(`Promises:
          t1: ${t1}
          t2: ${t2}, lapsed ${t2 - t1}
          t3: ${t3}, lapsed ${t3 - t2}
          total lapsed ${t3 - t1}
          `)
          benchAsyncEffectsInParallel(t3 - t1)
        })
      }
      benchPromiseAll()
    }))
})
