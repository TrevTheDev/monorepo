import { describe, it, expect } from 'vitest'
import { enhancedChain } from '../src/index'
import type { Resolver } from '../src/index'

const doNotCall = () => expect(true).toBe(false) as unknown as never

describe('enhanced chain', () => {
  it('example usage', () =>
    new Promise((done) => {
      const eChainy = enhancedChain(
        {
          callbacks: { afterChainResolved: () => console.log('chain resolved') },
        },
        (x: 'start', resolve: Resolver<(arg: 'A') => void>) => {
          console.log(x) // 'start'
          resolve('A')
        },
      ).sync(
        (_x: 'A') => 'B' as const,
        (_x: 'B') =>
          new Promise((resolve) => {
            resolve('C')
          }) as unknown as 'C',
      )

      const eChainyMore = eChainy((x: 'C', resolve: Resolver<(arg: 'done') => void>) => {
        console.log(x) // 'C'
        resolve('done' as const)
      })

      eChainy.input('start').then((result) => {
        console.log(result) // 'C'
      })

      eChainyMore.await('start', (result) => {
        console.log(result) // 'done'
        done(undefined)
      })
    }))
  it('events1', () =>
    new Promise((done) => {
      const events: string[] = []
      const tracker = (callback: string) => () => events.push(callback)
      const chainA = enhancedChain({
        forceAsync: 'setImmediate',
        callbacks: {
          onItemAddedToChain: tracker('onItemAddedToChain'),
          beforeChainStart: tracker('beforeChainStart'),
          beforeNodeStart: tracker('beforeNodeStart'),
          beforeNodeResult: tracker('beforeNodeResult'),
          beforeChainResolved: tracker('beforeChainResolved'),
          beforeChainResult: tracker('beforeChainResult'),
          afterChainResult: tracker('afterChainResult'),
          afterChainResolved: tracker('afterChainResolved'),
          afterNodeResult: tracker('afterNodeResult'),

          beforeChainError: tracker('beforeChainError'),
          afterChainError: tracker('afterChainError'),
          beforeNodeError: tracker('beforeNodeError'),
          afterNodeError: tracker('afterNodeError'),
          onChainEmpty: tracker('onChainEmpty'),
        },
      })
      const chainy = chainA((x: string, resolve: Resolver<(arg: string) => void>) => {
        expect(x).toEqual('start')
        resolve('A')
      })

      const b = chainy(
        (x: string, resolve: Resolver<(arg: string) => void>) => {
          expect(x).toEqual('A')
          resolve('B')
        },
        (x: string, resolve: Resolver<(arg: string) => void>) => {
          expect(x).toEqual('B')
          resolve('C')
        },
      )

      b.await('start', (result) => {
        expect(result).toEqual('C')
        setImmediate(() => {
          console.log(`${events.toString()}`)
          // debugger
          expect(`${events.toString()}`).toEqual(
            // eslint-disable-next-line max-len
            'beforeChainStart,beforeNodeStart,beforeNodeResult,afterNodeResult,beforeNodeStart,beforeNodeResult,afterNodeResult,beforeNodeStart,beforeNodeResult,afterNodeResult,beforeChainResolved,beforeChainResult,afterChainResult,afterChainResolved',
          )
          done(undefined)
        })
      })
    }))
  it('events2', () =>
    new Promise((done) => {
      const events: string[] = []
      const tracker = (callback: string) => () => events.push(callback)

      const chainy = enhancedChain(
        {
          forceAsync: 'none',
          callbacks: {
            onItemAddedToChain: tracker('onItemAddedToChain'),
            beforeChainStart: tracker('beforeChainStart'),
            beforeNodeStart: tracker('beforeNodeStart'),
            beforeNodeResult: tracker('beforeNodeResult'),
            beforeChainResolved: tracker('beforeChainResolved'),
            beforeChainResult: tracker('beforeChainResult'),
            afterChainResult: tracker('afterChainResult'),
            afterChainResolved: tracker('afterChainResolved'),
            afterNodeResult: tracker('afterNodeResult'),

            beforeChainError: tracker('beforeChainError'),
            afterChainError: tracker('afterChainError'),
            beforeNodeError: tracker('beforeNodeError'),
            afterNodeError: tracker('afterNodeError'),
            onChainEmpty: tracker('onChainEmpty'),
          },
        },
        (x: string, resolve: Resolver<(arg: string) => void>) => {
          expect(x).toEqual('start')
          resolve('A')
        },
      )

      const b = chainy(
        (x: string, resolve: Resolver<(arg: string) => void>) => {
          expect(x).toEqual('A')
          resolve('B')
        },
        (x: string, resolve: Resolver<(arg: string) => void>) => {
          expect(x).toEqual('B')
          resolve('C')
        },
      )

      b.await('start', (result) => {
        expect(result).toEqual('C')

        setImmediate(() => {
          console.log(`${events.toString()}`)
          // debugger
          expect(`${events.toString()}`).toEqual(
            // eslint-disable-next-line max-len
            'beforeChainStart,beforeNodeStart,beforeNodeResult,beforeNodeStart,beforeNodeResult,beforeNodeStart,beforeNodeResult,beforeChainResolved,beforeChainResult,afterChainResult,afterChainResolved,afterNodeResult,afterNodeResult,afterNodeResult',
          )
          done(undefined)
        })
      })
    }))

  it('error to errorCb', () =>
    new Promise((done) => {
      const chainy = enhancedChain()((
        x: string,
        resolve: Resolver<(arg: string) => void, (error: Error) => void>,
      ) => {
        expect(x).toEqual('start')
        resolve('A')
      })

      const b = chainy(
        (x: string, resolve: Resolver<(arg: string) => void>) => {
          expect(x).toEqual('A')
          resolve('B')
        },

        (x: string, _resolve: Resolver<(arg: string) => void, (error: Error) => void>) => {
          expect(x).toEqual('B')
          throw new Error('C')
        },
      )

      b.await('start', doNotCall, (error) => {
        // debugger
        console.log(error)
        expect(error.message).toEqual('C')
        done(undefined)
      })
    }))
  // it('throw if no errorCb', () =>
  //   new Promise((done) => {
  //     const chainy = enhancedChain()((x: string, resolve: Resolver<(arg: string) => void>) => {
  //       expect(x).toEqual('start')
  //       debugger
  //       throw new Error('A')
  //     })
  //     try {
  //       chainy.await('start', doNotCall)
  //     } catch (e) {
  //       debugger
  //       done(undefined)
  //     }
  //   }))
  it('resolves promises', () =>
    new Promise((done) => {
      const chainy = enhancedChain(
        {},
        (x: 'start', resolve: Resolver<(arg: 'A') => void>) => {
          expect(x).toEqual('start')
          resolve(
            new Promise((res) => {
              res('A' as const)
            }) as unknown as 'A',
          )
        },
        (x: 'A', resolve: Resolver<(arg: 'B') => void>) => {
          expect(x).toEqual('A')
          resolve('B' as const)
        },
      )
      chainy.await('start', (result) => {
        // debugger
        expect(result).toEqual('B')
        done(undefined)
      })
    }))

  it('sync', () =>
    new Promise((done) => {
      const chainy = enhancedChain({}, (x: 'start', resolve: Resolver<(arg: 'A') => void>) => {
        expect(x).toEqual('start')
        resolve('A' as const)
      })
      const b = chainy.sync((_x: 'A') => 'B' as const)
      const c = b((x: 'B', resolve: Resolver<(arg: 'C') => void>) => {
        // debugger
        expect(x).toEqual('B')
        resolve('C' as const)
      })
      const d = c.sync(
        (_x: 'C') => 'D' as const,
        (_x: 'D') => 'E' as const,
        (_x: 'E') => 'F' as const,
      )
      d.await('start', (result) => {
        // debugger
        expect(result).toEqual('F')
        done(undefined)
      })
    }))

  it('thenable', () =>
    new Promise((done) => {
      const chainy = enhancedChain(
        { forceAsync: 'setImmediate' },
        (x: 'start', resolve: Resolver<(arg: 'A') => void>) => {
          expect(x).toEqual('start')
          resolve('A' as const)
        },
        (x: 'A', resolve: Resolver<(arg: 'B') => void>) => {
          expect(x).toEqual('A')
          resolve('B' as const)
        },
      )
      chainy.input('start').then((result) => {
        expect(result).toEqual('B')
        done(undefined)
      })
    }))

  it('enforceSingleResolution', () =>
    new Promise((done) => {
      const chainy = enhancedChain(
        { thrownErrorToErrorCb: false },
        (x: 'start', resolve: Resolver<(arg: 'A') => void, (err: 'A') => void>) => {
          resolve('A' as const)
          expect(() => resolve('A' as const)).toThrowError()
          expect(() => resolve.error('A' as const)).toThrowError()
        },
      )
      chainy.await(
        'start',
        (result) => {
          expect(result).toEqual('A')
          done(undefined)
        },
        (error) => {
          expect(error).toEqual('A')
          done(undefined)
        },
      )
    }))
})
