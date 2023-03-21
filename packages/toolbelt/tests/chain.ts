/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { vi, describe, it, expect, Mock } from 'vitest'

import { chain, times } from '../src/index'
import type { AwaitedChainController, Resolver, AsyncFunc } from '../src/index'

type StrictEqual<A1, A2> = [A1] extends [A2] ? ([A2] extends [A1] ? true : false) : false

const doNotCall = (() => expect(true).toBe(false) as unknown as never) as unknown as any
const checkType = <T>(arg: T) => arg
const typesMatch = <A, B>(match: StrictEqual<A, B>) => match

const autoResolvers = () => {
  const resolvers: ((...args: any) => any)[] = []
  const resultResolver = <I, O>(expectedInput: I, output: O) => {
    const resolver = vi.fn((x: I, resolve: Resolver<(out: O) => void>) => {
      if (expectedInput !== undefined) expect(x).toEqual(expectedInput)
      resolve(output)
    })
    resolvers.push(resolver)
    return resolver
  }
  const errorResolver = <I, O>(expectedInput: I, output: O) => {
    const resolver = vi.fn((x: I, resolve: Resolver<(out: O) => void, (err: O) => void>) => {
      expect(x).toEqual(expectedInput)
      resolve.error(output)
    })
    resolvers.push(resolver)
    return resolver
  }
  const matches = <T>(expectedResult: T, done?: (value: unknown) => void) => {
    const matcher = vi.fn((x: T) => {
      expect(x).toEqual(expectedResult)
      if (done) {
        resolvers.forEach((resolver) => expect(resolver).toBeCalled())
        done(undefined)
      }
    })
    resolvers.push(matcher as unknown as Mock<[x: unknown, resolve: unknown]>)
    return matcher
  }
  const createChainSegment = <T extends unknown[], S>(chainValues: T, chainy: S): S =>
    chainValues.reduce((previousValue, currentValue, index) => {
      if (index === 0) return previousValue
      const res = resultResolver(chainValues[index - 1], currentValue)
      return (previousValue as (arg: any) => any)(res)
    }, chainy) as S
  const createChainSegment2 = <T>(numberOfLinks: number, chainy: T): T => {
    let res: T = chainy
    times(numberOfLinks, () => {
      const resolver = vi.fn((x, resolve) => resolve(x + 1))
      resolvers.push(resolver)
      res = (res as unknown as (arg: any) => any)(resolver)
    })
    return res
  }
  return { resultResolver, errorResolver, matches, createChainSegment, createChainSegment2 }
}

describe('chain', () => {
  it.skip('type check - long chain', () => {
    const chainN0 = chain(
      (
        x: 'start',
        resolve: Resolver<(result: 'I1') => 'ResResolver1', (error: 'E01') => 'ErrResolver'>,
      ) => {
        typesMatch<'start', typeof x>(true)
        typesMatch<
          Resolver<(arg: 'I1') => 'ResResolver1', (arg: 'E01') => 'ErrResolver'>,
          typeof resolve
        >(true)
        const t = resolve('I1')
        typesMatch<'ResResolver1', typeof t>(true)
        return 'ResResolver00' as 'ResResolver00'
      },
    )

    const chainN2 = chainN0(
      (
        x: 'I1',
        resolve: Resolver<(result: 'I2') => 'ResResolver2', (error: 'E2') => 'ErrResolver'>,
      ) => {
        typesMatch<'I1', typeof x>(true)
        const t = resolve('I2')
        typesMatch<'ResResolver2', typeof t>(true)
        return 'ResResolver1' as 'ResResolver1'
      },
    )
    const chainN3 = chainN2(
      (
        x: 'I2',
        resolve: Resolver<(result: 'I3') => 'ResResolver3', (error: 'E3') => 'ErrResolver'>,
      ) => {
        typesMatch<'I2', typeof x>(true)
        const t = resolve('I3')
        typesMatch<'ResResolver3', typeof t>(true)
        return 'ResResolver2' as 'ResResolver2'
      },
    )
    const chainN4 = chainN3(
      (
        x: 'I3',
        resolve: Resolver<(result: 'I4') => 'ResResolver4', (error: 'E4') => 'ErrResolver'>,
      ) => {
        typesMatch<'I3', typeof x>(true)
        const t = resolve('I4')
        typesMatch<'ResResolver4', typeof t>(true)
        return 'ResResolver3' as 'ResResolver3'
      },
    )
    const chainN5 = chainN4(
      (
        x: 'I4',
        resolve: Resolver<(result: 'I5') => 'ResResolver5', (error: 'E5') => 'ErrResolver'>,
      ) => {
        typesMatch<'I4', typeof x>(true)
        const t = resolve('I5')
        typesMatch<'ResResolver5', typeof t>(true)
        return 'ResResolver4' as 'ResResolver4'
      },
    )
    const chainN6 = chainN5(
      (
        x: 'I5',
        resolve: Resolver<(result: 'I6') => 'ResResolver6', (error: 'E6') => 'ErrResolver'>,
      ) => {
        typesMatch<'I5', typeof x>(true)
        const t = resolve('I6')
        typesMatch<'ResResolver6', typeof t>(true)
        return 'ResResolver5' as 'ResResolver5'
      },
    )
    const chainN7 = chainN6(
      (
        x: 'I6',
        resolve: Resolver<(result: 'I7') => 'ResResolver7', (error: 'E7') => 'ErrResolver'>,
      ) => {
        typesMatch<'I6', typeof x>(true)
        const t = resolve('I7')
        typesMatch<'ResResolver7', typeof t>(true)
        return 'ResResolver6' as 'ResResolver6'
      },
    )
    const chainN8 = chainN7(
      (
        x: 'I7',
        resolve: Resolver<(result: 'I8') => 'ResResolver8', (error: 'E8') => 'ErrResolver'>,
      ) => {
        typesMatch<'I7', typeof x>(true)
        const t = resolve('I8')
        typesMatch<'ResResolver8', typeof t>(true)
        return 'ResResolver7' as 'ResResolver7'
      },
    )
    const chainN9 = chainN8(
      (
        x: 'I8',
        resolve: Resolver<(result: 'I9') => 'ResResolver9', (error: 'E9') => 'ErrResolver'>,
      ) => {
        typesMatch<'I8', typeof x>(true)
        const t = resolve('I9')
        typesMatch<'ResResolver9', typeof t>(true)
        return 'ResResolver8' as 'ResResolver8'
      },
    )
    const chainN10 = chainN9(
      (
        x: 'I9',
        resolve: Resolver<(result: 'I10') => 'ResResolver10', (error: 'E10') => 'ErrResolver'>,
      ) => {
        typesMatch<'I9', typeof x>(true)
        const t = resolve('I10')
        typesMatch<'ResResolver10', typeof t>(true)
        return 'ResResolver9' as 'ResResolver9'
      },
    )
    const chainN11 = chainN10(
      (
        x: 'I10',
        resolve: Resolver<(result: 'I11') => 'ResResolver11', (error: 'E11') => 'ErrResolver'>,
      ) => {
        typesMatch<'I10', typeof x>(true)
        const t = resolve('I11')
        typesMatch<'ResResolver11', typeof t>(true)
        return 'ResResolver10' as 'ResResolver10'
      },
    )
    const chainN12 = chainN11(
      (
        x: 'I11',
        resolve: Resolver<(result: 'I12') => 'ResResolver12', (error: 'E12') => 'ErrResolver'>,
      ) => {
        typesMatch<'I11', typeof x>(true)
        const t = resolve('I12')
        typesMatch<'ResResolver12', typeof t>(true)
        return 'ResResolver11' as 'ResResolver11'
      },
    )
    const chainN13 = chainN12(
      (
        x: 'I12',
        resolve: Resolver<(result: 'I13') => 'ResResolver13', (error: 'E13') => 'ErrResolver'>,
      ) => {
        typesMatch<'I12', typeof x>(true)
        const t = resolve('I13')
        typesMatch<'ResResolver13', typeof t>(true)
        return 'ResResolver12' as 'ResResolver12'
      },
    )
    const chainN14 = chainN13(
      (
        x: 'I13',
        resolve: Resolver<(result: 'I14') => 'ResResolver14', (error: 'E14') => 'ErrResolver'>,
      ) => {
        typesMatch<'I13', typeof x>(true)
        const t = resolve('I14')
        typesMatch<'ResResolver14', typeof t>(true)
        return 'ResResolver13' as 'ResResolver13'
      },
    )
    const chainN15 = chainN14(
      (
        x: 'I14',
        resolve: Resolver<(result: 'I15') => 'ResResolver15', (error: 'E15') => 'ErrResolver'>,
      ) => {
        typesMatch<'I14', typeof x>(true)
        const t = resolve('I15')
        typesMatch<'ResResolver15', typeof t>(true)
        return 'ResResolver14' as 'ResResolver14'
      },
    )
    const chainN16 = chainN15(
      (
        x: 'I15',
        resolve: Resolver<(result: 'I16') => 'ResResolver16', (error: 'E16') => 'ErrResolver'>,
      ) => {
        typesMatch<'I15', typeof x>(true)
        const t = resolve('I16')
        typesMatch<'ResResolver16', typeof t>(true)
        return 'ResResolver15' as 'ResResolver15'
      },
    )
    const chainN17 = chainN16(
      (
        x: 'I16',
        resolve: Resolver<(result: 'I17') => 'ResResolver17', (error: 'E17') => 'ErrResolver'>,
      ) => {
        typesMatch<'I16', typeof x>(true)
        const t = resolve('I17')
        typesMatch<'ResResolver17', typeof t>(true)
        return 'ResResolver16' as 'ResResolver16'
      },
    )
    const chainN18 = chainN17(
      (
        x: 'I17',
        resolve: Resolver<(result: 'I18') => 'ResResolver18', (error: 'E18') => 'ErrResolver'>,
      ) => {
        typesMatch<'I17', typeof x>(true)
        const t = resolve('I18')
        typesMatch<'ResResolver18', typeof t>(true)
        return 'ResResolver17' as 'ResResolver17'
      },
    )
    const chainN19 = chainN18(
      (
        x: 'I18',
        resolve: Resolver<(result: 'I19') => 'ResResolver19', (error: 'E19') => 'ErrResolver'>,
      ) => {
        typesMatch<'I18', typeof x>(true)
        const t = resolve('I19')
        typesMatch<'ResResolver19', typeof t>(true)
        return 'ResResolver18' as 'ResResolver18'
      },
    )
    const chainN20 = chainN19(
      (
        x: 'I19',
        resolve: Resolver<(result: 'I20') => 'ResResolver20', (error: 'E20') => 'ErrResolver'>,
      ) => {
        typesMatch<'I19', typeof x>(true)
        const t = resolve('I20')
        typesMatch<'ResResolver20', typeof t>(true)
        return 'ResResolver19' as 'ResResolver19'
      },
    )
    const chainN21 = chainN20(
      (
        x: 'I20',
        resolve: Resolver<(result: 'I21') => 'ResResolver21', (error: 'E21') => 'ErrResolver'>,
      ) => {
        typesMatch<'I20', typeof x>(true)
        const t = resolve('I21')
        typesMatch<'ResResolver21', typeof t>(true)
        return 'ResResolver20' as 'ResResolver20'
      },
    )
    const chainN22 = chainN21(
      (
        x: 'I21',
        resolve: Resolver<(result: 'I22') => 'ResResolver22', (error: 'E22') => 'ErrResolver'>,
      ) => {
        typesMatch<'I21', typeof x>(true)
        const t = resolve('I22')
        typesMatch<'ResResolver22', typeof t>(true)
        return 'ResResolver21' as 'ResResolver21'
      },
    )
    const chainN23 = chainN22(
      (
        x: 'I22',
        resolve: Resolver<(result: 'I23') => 'ResResolver23', (error: 'E23') => 'ErrResolver'>,
      ) => {
        typesMatch<'I22', typeof x>(true)
        const t = resolve('I23')
        typesMatch<'ResResolver23', typeof t>(true)
        return 'ResResolver22' as 'ResResolver22'
      },
    )
    const chainN24 = chainN23(
      (
        x: 'I23',
        resolve: Resolver<(result: 'I24') => 'ResResolver24', (error: 'E24') => 'ErrResolver'>,
      ) => {
        typesMatch<'I23', typeof x>(true)
        const t = resolve('I24')
        typesMatch<'ResResolver24', typeof t>(true)
        return 'ResResolver23' as 'ResResolver23'
      },
    )
    const chainN25 = chainN24(
      (
        x: 'I24',
        resolve: Resolver<(result: 'I25') => 'ResResolver25', (error: 'E25') => 'ErrResolver'>,
      ) => {
        typesMatch<'I24', typeof x>(true)
        const t = resolve('I25')
        typesMatch<'ResResolver25', typeof t>(true)
        return 'ResResolver24' as 'ResResolver24'
      },
    )
    const chainN26 = chainN25(
      (
        x: 'I25',
        resolve: Resolver<(result: 'I26') => 'ResResolver26', (error: 'E26') => 'ErrResolver'>,
      ) => {
        typesMatch<'I25', typeof x>(true)
        const t = resolve('I26')
        typesMatch<'ResResolver26', typeof t>(true)
        return 'ResResolver25' as 'ResResolver25'
      },
    )
    const chainN27 = chainN26(
      (
        x: 'I26',
        resolve: Resolver<(result: 'I27') => 'ResResolver27', (error: 'E27') => 'ErrResolver'>,
      ) => {
        typesMatch<'I26', typeof x>(true)
        const t = resolve('I27')
        typesMatch<'ResResolver27', typeof t>(true)
        return 'ResResolver26' as 'ResResolver26'
      },
    )
    const chainN28 = chainN27(
      (
        x: 'I27',
        resolve: Resolver<(result: 'I28') => 'ResResolver28', (error: 'E28') => 'ErrResolver'>,
      ) => {
        typesMatch<'I27', typeof x>(true)
        const t = resolve('I28')
        typesMatch<'ResResolver28', typeof t>(true)
        return 'ResResolver27' as 'ResResolver27'
      },
    )
    const chainN29 = chainN28(
      (
        x: 'I28',
        resolve: Resolver<(result: 'I29') => 'ResResolver29', (error: 'E29') => 'ErrResolver'>,
      ) => {
        typesMatch<'I28', typeof x>(true)
        const t = resolve('I29')
        typesMatch<'ResResolver29', typeof t>(true)
        return 'ResResolver28' as 'ResResolver28'
      },
    )
    const chainN30 = chainN29(
      (
        x: 'I29',
        resolve: Resolver<(result: 'I30') => 'ResResolver30', (error: 'E30') => 'ErrResolver'>,
      ) => {
        typesMatch<'I29', typeof x>(true)
        const t = resolve('I30')
        typesMatch<'ResResolver30', typeof t>(true)
        return 'ResResolver29' as 'ResResolver29'
      },
    )
    const chainN31 = chainN30(
      (
        x: 'I30',
        resolve: Resolver<(result: 'I31') => 'ResResolver31', (error: 'E31') => 'ErrResolver'>,
      ) => {
        typesMatch<'I30', typeof x>(true)
        const t = resolve('I31')
        typesMatch<'ResResolver31', typeof t>(true)
        return 'ResResolver30' as 'ResResolver30'
      },
    )
    const chainN32 = chainN31(
      (
        x: 'I31',
        resolve: Resolver<(result: 'I32') => 'ResResolver32', (error: 'E32') => 'ErrResolver'>,
      ) => {
        typesMatch<'I31', typeof x>(true)
        const t = resolve('I32')
        typesMatch<'ResResolver32', typeof t>(true)
        return 'ResResolver31' as 'ResResolver31'
      },
    )
    const chainN33 = chainN32(
      (
        x: 'I32',
        resolve: Resolver<(result: 'I33') => 'ResResolver33', (error: 'E33') => 'ErrResolver'>,
      ) => {
        typesMatch<'I32', typeof x>(true)
        const t = resolve('I33')
        typesMatch<'ResResolver33', typeof t>(true)
        return 'ResResolver32' as 'ResResolver32'
      },
    )
    const chainN34 = chainN33(
      (
        x: 'I33',
        resolve: Resolver<(result: 'I34') => 'ResResolver34', (error: 'E34') => 'ErrResolver'>,
      ) => {
        typesMatch<'I33', typeof x>(true)
        const t = resolve('I34')
        typesMatch<'ResResolver34', typeof t>(true)
        return 'ResResolver33' as 'ResResolver33'
      },
    )
    const chainN35 = chainN34(
      (
        x: 'I34',
        resolve: Resolver<(result: 'I35') => 'ResResolver35', (error: 'E35') => 'ErrResolver'>,
      ) => {
        typesMatch<'I34', typeof x>(true)
        const t = resolve('I35')
        typesMatch<'ResResolver35', typeof t>(true)
        return 'ResResolver34' as 'ResResolver34'
      },
    )
    const chainN36 = chainN35(
      (
        x: 'I35',
        resolve: Resolver<(result: 'I36') => 'ResResolver36', (error: 'E36') => 'ErrResolver'>,
      ) => {
        typesMatch<'I35', typeof x>(true)
        const t = resolve('I36')
        typesMatch<'ResResolver36', typeof t>(true)
        return 'ResResolver35' as 'ResResolver35'
      },
    )
    const chainN37 = chainN36(
      (
        x: 'I36',
        resolve: Resolver<(result: 'I37') => 'ResResolver37', (error: 'E37') => 'ErrResolver'>,
      ) => {
        typesMatch<'I36', typeof x>(true)
        const t = resolve('I37')
        typesMatch<'ResResolver37', typeof t>(true)
        return 'ResResolver36' as 'ResResolver36'
      },
    )
    const chainN38 = chainN37(
      (
        x: 'I37',
        resolve: Resolver<(result: 'I38') => 'ResResolver38', (error: 'E38') => 'ErrResolver'>,
      ) => {
        typesMatch<'I37', typeof x>(true)
        const t = resolve('I38')
        typesMatch<'ResResolver38', typeof t>(true)
        return 'ResResolver37' as 'ResResolver37'
      },
    )
    const chainN39 = chainN38(
      (
        x: 'I38',
        resolve: Resolver<(result: 'I39') => 'ResResolver39', (error: 'E39') => 'ErrResolver'>,
      ) => {
        typesMatch<'I38', typeof x>(true)
        const t = resolve('I39')
        typesMatch<'ResResolver39', typeof t>(true)
        return 'ResResolver38' as 'ResResolver38'
      },
    )
    const chainN40 = chainN39(
      (
        x: 'I39',
        resolve: Resolver<(result: 'I40') => 'ResResolver40', (error: 'E40') => 'ErrResolver'>,
      ) => {
        typesMatch<'I39', typeof x>(true)
        const t = resolve('I40')
        typesMatch<'ResResolver40', typeof t>(true)
        return 'ResResolver39' as 'ResResolver39'
      },
    )
    const chainN41 = chainN40(
      (
        x: 'I40',
        resolve: Resolver<(result: 'I41') => 'ResResolver41', (error: 'E41') => 'ErrResolver'>,
      ) => {
        typesMatch<'I40', typeof x>(true)
        const t = resolve('I41')
        typesMatch<'ResResolver41', typeof t>(true)
        return 'ResResolver40' as 'ResResolver40'
      },
    )
    const chainN42 = chainN41(
      (
        x: 'I41',
        resolve: Resolver<(result: 'I42') => 'ResResolver42', (error: 'E42') => 'ErrResolver'>,
      ) => {
        typesMatch<'I41', typeof x>(true)
        const t = resolve('I42')
        typesMatch<'ResResolver42', typeof t>(true)
        return 'ResResolver41' as 'ResResolver41'
      },
    )

    const awaits = chainN42.await(
      'start',
      (result) => {
        typesMatch<'I42', typeof result>(true)
        console.log(result)
        return 'RI' as 'ResResolver42'
      },
      (error) => {
        typesMatch<
          | 'E01'
          | 'E2'
          | 'E3'
          | 'E4'
          | 'E5'
          | 'E6'
          | 'E7'
          | 'E8'
          | 'E9'
          | 'E10'
          | 'E11'
          | 'E12'
          | 'E13'
          | 'E14'
          | 'E15'
          | 'E16'
          | 'E17'
          | 'E18'
          | 'E19'
          | 'E20'
          | 'E21'
          | 'E22'
          | 'E23'
          | 'E24'
          | 'E25'
          | 'E26'
          | 'E27'
          | 'E28'
          | 'E29'
          | 'E30'
          | 'E31'
          | 'E32'
          | 'E33'
          | 'E34'
          | 'E35'
          | 'E36'
          | 'E37'
          | 'E38'
          | 'E39'
          | 'E40'
          | 'E41'
          | 'E42',
          typeof error
        >(true)
        console.log(error)
        return 'ErrResolver' as 'ErrResolver'
      },
    )

    typesMatch<
      AwaitedChainController<
        | 'ResResolver00'
        | 'ResResolver1'
        | 'ResResolver2'
        | 'ResResolver3'
        | 'ResResolver4'
        | 'ResResolver5'
        | 'ResResolver6'
        | 'ResResolver7'
        | 'ResResolver8'
        | 'ResResolver9'
        | 'ResResolver10'
        | 'ResResolver11'
        | 'ResResolver12'
        | 'ResResolver13'
        | 'ResResolver14'
        | 'ResResolver15'
        | 'ResResolver16'
        | 'ResResolver17'
        | 'ResResolver18'
        | 'ResResolver19'
        | 'ResResolver20'
        | 'ResResolver21'
        | 'ResResolver22'
        | 'ResResolver23'
        | 'ResResolver24'
        | 'ResResolver25'
        | 'ResResolver26'
        | 'ResResolver27'
        | 'ResResolver28'
        | 'ResResolver29'
        | 'ResResolver30'
        | 'ResResolver31'
        | 'ResResolver32'
        | 'ResResolver33'
        | 'ResResolver34'
        | 'ResResolver35'
        | 'ResResolver36'
        | 'ResResolver37'
        | 'ResResolver38'
        | 'ResResolver39'
        | 'ResResolver40'
        | 'ResResolver41'
        | 'ResResolver42'
      >,
      typeof awaits
    >(true)
  })
  it('example usage', () =>
    new Promise((done) => {
      // import { chain } from '...'
      // import type { Resolver } from '....'

      // function to generate dummy asynchronous functions
      const addChar =
        <T extends string, C extends string>(c: C) =>
        (x: T, resolver: Resolver<(result: `${C}:${T}`) => void>) =>
          resolver(`${c}:${x}` as `${C}:${T}`)

      // adds three asynchronous functions to the chain
      const fooChain = chain(
        addChar<'start', 'A'>('A'),
        addChar<'A:start', 'B'>('B'),
        addChar<'B:A:start', 'C'>('C'),
      )
      // adds a further three asynchronous functions to the chain
      const fooBarChain = fooChain(
        addChar<'C:B:A:start', 'A'>('A'),
        addChar<'A:C:B:A:start', 'B'>('B'),
        addChar<'B:A:C:B:A:start', 'C'>('C'),
      )
      // awaits chain of asynchronous functions
      fooBarChain.await('start' as const, (result) => {
        expect(result).toEqual('C:B:A:C:B:A:start')
        done(undefined)

        // Resolver code:

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const validAsyncFn = (
          x: string,
          resolver: Resolver<(output: string) => void, (error: Error) => void>,
        ) => {
          resolver('a') // or
          resolver.result('a') // or
          resolver.error(new Error('a')) // or
        }
      })
    }))
  it('basic', () =>
    new Promise((done) => {
      const chainy = chain((x, resolve) => {
        expect(x).toEqual('start')
        resolve('done')
      })
      chainy.await(
        'start',
        (result) => {
          // debugger
          checkType<string>(result)
          expect(result).toEqual('done')
          done(undefined)
        },
        doNotCall,
      )

      const chainyNext = chain(
        (
          input: 'Input',
          resolver: Resolver<
            (arg: 'OutputFromNode1') => 'ResultResolverController',
            (argE: 'Error') => 'ErrorResolverController'
          >,
        ) => resolver('OutputFromNode1') as 'FirstNodeResultResolverController',
      )

      const chainyNext2 = chainyNext(
        (
          input: 'OutputFromNode1',
          resolver: Resolver<
            (arg: 'FinalOutput') => 'ResultResolverControllerB',
            (eArg: 'ErrorB') => 'ErrorResolverController'
          >,
        ) => resolver('FinalOutput') as 'ResultResolverController',
      )

      // checkType<
      //   (arg: string, resultCb: (result: string) => void, errorCb: (error: unknown) => void) => void
      // >(a.await)
      chainyNext2.await(
        'Input',
        (result) => {
          // debugger
          checkType<'FinalOutput'>(result)
          expect(result).toEqual('FinalOutput')
          return done(undefined) as unknown as 'ResultResolverControllerB'
        },
        doNotCall,
      )
    }))

  it('basic2', () =>
    new Promise((done) => {
      const chainy = chain(
        (x: string, resolve: Resolver<(arg: number) => void, (error: unknown) => unknown>) => {
          expect(x).toEqual('start')
          resolve(1)
        },
      )

      const b = chainy((x: number, resolve: Resolver<(arg: boolean) => void>) => {
        expect(x).toEqual(1)
        resolve(true)
      })

      checkType<
        (
          arg: string,
          resultCb: (result: boolean) => void,
          errorCb: (error: unknown) => unknown,
        ) => AwaitedChainController<void>
      >(b.await)
      b.await(
        'start',
        (result) => {
          expect(result).toEqual(true)
          done(undefined)
        },
        doNotCall,
      )
    }))
  it('basic3', () =>
    new Promise((done) => {
      const chainy = chain((x: 'start', resolve: Resolver<(arg: number) => void>) => {
        expect(x).toEqual('start')
        resolve.result(1)
      })

      const b = chainy((x: number, resolve: Resolver<(arg: boolean) => void>) => {
        expect(x).toEqual(1)
        resolve.result(true)
      })

      checkType<
        (arg: 'start', resultCb: (result: boolean) => void) => AwaitedChainController<void>
      >(b.await)
      b.await('start', (result) => {
        expect(result).toEqual(true)
        done(undefined)
      })
    }))
  it('basic4', () =>
    new Promise((done) => {
      const chainy = chain(
        (x: 'start', resolve: Resolver<(arg: number) => void, (error: boolean) => void>) => {
          expect(x).toEqual('start')
          resolve.result(1)
        },
      )

      const b = chainy(
        (x: number, resolve: Resolver<(arg: number) => void, (error: boolean) => void>) => {
          expect(x).toEqual(1)
          resolve.error(true)
        },
      )
      typesMatch<
        (
          input: 'start',
          resultCb: (result: number) => void,
          errorCb: (error: boolean) => void,
        ) => { controller: void },
        typeof b.await
      >(true)

      b.await('start', doNotCall, (error) => {
        expect(error).toEqual(true)
        done(undefined)
      })
    }))
  it('basic5', () =>
    new Promise((done) => {
      const { resultResolver, errorResolver, matches, createChainSegment } = autoResolvers()

      const chainy = chain(
        resultResolver('start', 'a') as unknown as AsyncFunc<
          string,
          (x: string) => void,
          (x: string) => void,
          void
        >,
      )

      const b = createChainSegment(['a', 'b'], chainy)

      const c = b(errorResolver('b', 'c'))

      const z = matches('c', done)

      const c1 = c.onError(z)

      const d = c1(doNotCall)

      d.await('start', doNotCall, doNotCall)
    }))
  it('basic6', () =>
    new Promise((done) => {
      const { resultResolver, errorResolver, matches, createChainSegment } = autoResolvers()
      const chainy = chain(
        resultResolver('start', 'a') as unknown as AsyncFunc<
          string,
          (x: string) => void,
          (x: string) => void,
          void
        >,
      )

      const seg = createChainSegment(['a', 'b', 'c'], chainy)
      const c1 = seg.onError(doNotCall)

      const x = errorResolver('c', 'd')

      const d = c1(x)

      const x2 = matches('d', done)

      d.await('start', doNotCall, x2)
    }))

  it('executes multiple times', () =>
    new Promise((done) => {
      const { createChainSegment2 } = autoResolvers()
      const chainy = chain((x, resolver) => resolver(x + 1))

      const seg = createChainSegment2(2, chainy)

      seg.await(
        1,
        (x) => {
          expect(x).toEqual(4)
          seg.await(
            2,
            (y) => {
              expect(y).toEqual(5)
              done(undefined)
            },
            doNotCall,
          )
        },
        doNotCall,
      )
    }))

  // it('sync', () =>
  //   new Promise((done) => {
  //     const { matches } = autoResolvers()
  //     const chainy = chain<{}, {}, { InputOutput: string; ResultResolverController: void }>(
  //       (x, resolve) => resolve(`a:${x}`),
  //     )
  //     const a = chainy.sync((x) => `b:${x}`)((x, resolve) => resolve(`c:${x}`))
  //     a.await('1', matches('c:b:a:1'), doNotCall)
  //     a.await('2', matches('c:b:a:2', done), doNotCall)
  //   }))

  it('splits onError throws', () =>
    new Promise((done) => {
      const { matches } = autoResolvers()
      const chainy = chain(
        (x: string, resolve: Resolver<(result: string) => void, (error: string) => void>) =>
          resolve.error(`a:${x}`),
      )
      const x = chainy.onError(matches('a:1'))
      const y = chainy.onError((result) => {
        expect(result).toEqual('a:2')
        done(undefined)
      })

      x.await('1', doNotCall, doNotCall)
      y.await('2', doNotCall, doNotCall)
    }))
  it('duplicate onError throws', () =>
    new Promise((done) => {
      const { resultResolver, matches } = autoResolvers()
      const chainy = chain(
        resultResolver('a', 'b') as unknown as AsyncFunc<
          string,
          (x: string) => void,
          (x: string) => void,
          void
        >,
      )
      const b1 = chainy(resultResolver('b', 'b1'))
      const b2 = chainy(resultResolver('b', 'b2'))

      b1.await('a', matches('b1'), doNotCall)
      b2.await('a', matches('b2'), doNotCall)

      const c = b2(resultResolver('b2', 'c'))
      c.await('a', matches('c', done), doNotCall)
    }))
  // it.skip('return types', () =>
  //   new Promise((done) => {
  //     let controller: AwaitedChainController<'cancelA' | 'cancelB' | 'cancelD' | 'done'>
  //     const chainy = chain(
  //       (x: string, resolve: Resolver<(out: string) => void, (error: 'errorA') => 'errorBR'>) => {
  //         setTimeout(() => {
  //           // debugger
  //           expect(controller.controller).toEqual('cancelA')
  //           const t = resolve(`a:${x}`) // 'b'
  //           // const e = resolve.error('A')
  //           typesMatch<'cancelB', typeof t>(true)
  //           console.log(t)
  //         }, 100)
  //         return 'cancelA'
  //       },
  //     )
  //     const b = chainy(
  //       (x: string, resolve: Resolver<(out: string) => never, (error: 'errorB') => 'errorBR'>) => {
  //         setTimeout(() => {
  //           expect(controller.controller).toEqual('cancelB')
  //           const t = resolve(`b:${x}`) // 'done'
  //           expect(controller.controller).toEqual('cancelD')
  //           typesMatch<never, typeof t>(true)
  //           console.log(t)
  //         }, 100)
  //         return 'cancelB'
  //       },
  //     )
  //     const c = b.sync<{ Output: string; Error: 'errorC'; ResultResolverController: 'cancelD' }>(
  //       () => {
  //         // debugger
  //         expect(controller.controller).toEqual(undefined)
  //         return 'cancelC'
  //       },
  //     )
  //     const d = c<{ Output: string; Error: 'errorD'; ResultResolverController: 'done' }>(
  //       (x, resolve) => {
  //         setTimeout(() => {
  //           // debugger
  //           expect(controller.controller).toEqual('cancelD')
  //           const t = resolve(`d:${x}`) // 'done'
  //           typesMatch<'done', typeof t>(true)
  //           console.log(t)
  //           done(undefined)
  //         }, 100)
  //         return 'cancelD'
  //       },
  //     )

  //     const controllerA = d.await(
  //       '1',
  //       () => {
  //         // debugger
  //         expect(controller.controller).toEqual(undefined)
  //         return 'done'
  //       },
  //       (_error) => _error as unknown as 'errorAR' | 'errorBR' | 'errorCR',
  //     )
  //     // debugger
  //     typesMatch<
  //       AwaitedChainController<'cancelA' | 'cancelB' | 'cancelD' | 'done'>,
  //       typeof controllerA
  //     >(true)
  //     controller = controllerA
  //     expect(controller.controller).toEqual('cancelA')
  //   }))
  // it('splicing chains', () =>
  //   new Promise((done) => {
  //     type AFnString = (input: string, resolver: Resolver<(out: string) => void>) => void
  //     const x1: AFnString = (x, resolve) => resolve(`A:${x}`)
  //     const x2: AFnString = (x, resolve) => resolve(`B:${x}`)
  //     const chainString = chain(x1, x2)

  //     const chainNumber = chain((x: string, resolve: Resolver<(out: number) => void>) =>
  //       resolve(1),
  //     )((x: number, resolve: Resolver<(out: number) => void>) => resolve(x + 1))

  //     const chainSplice = chainString.splice(chainNumber)

  //     chainSplice.await('a', (result) => expect(result).toEqual(2))

  //     const x3: AFnString = (x, resolve) => resolve(`C:${x}`)
  //     const chainB = chainString.splice(chainString)(x3)

  //     chainB.await('Start', (result) => {
  //       // debugger
  //       expect(result).toEqual('C:B:A:B:A:Start')
  //       done(undefined)
  //     })
  //   }))

  it('splicing chains2', () =>
    new Promise((done) => {
      type AFnString = (input: string, resolver: Resolver<(out: string) => void>) => void
      const x1: AFnString = (x, resolve) => resolve(`A:${x}`)
      const x2: AFnString = (x, resolve) => resolve(`B:${x}`)
      const chainString = chain(x1, x2)

      const chainNumber = chain((x: string, resolve: Resolver<(out: number) => void>) =>
        resolve(1),
      )((x: number, resolve: Resolver<(out: number) => void>) => resolve(x + 1))

      const chainSplice = chainString(chainNumber.asyncFn)

      chainSplice.await('a', (result) => expect(result).toEqual(2))

      const x3: AFnString = (x, resolve) => resolve(`C:${x}`)
      const chainB = chainString(chainString.asyncFn)(x3)

      chainB.await('Start', (result) => {
        // debugger
        expect(result).toEqual('C:B:A:B:A:Start')
        done(undefined)
      })
    }))

  // it.skip('transformed into a promise', () =>
  //   // eslint-disable-next-line no-async-promise-executor
  //   new Promise(async (done) => {
  //     const chainA = chain<
  //       {},
  //       {},
  //       {
  //         InputOutput: string
  //         ResultResolverController: void
  //       }
  //     >((x, resolve) => setTimeout(() => resolve(`A:${x}`), 100))((x, resolve) => resolve(`B:${x}`))
  //     const z = await chainA.input('Start')
  //     expect(z).toEqual('B:A:Start')
  //     done(undefined)
  //   }))

  it('benchmark', () =>
    new Promise((done) => {
      const max = 2000

      const benchChain = (promiseLapse: number) => {
        const t1 = Date.now()
        let chainy: any = chain((result: number, resolver: Resolver<(out: number) => void>) =>
          resolver(result + 1),
        )
        times(max - 1, () => {
          chainy = chainy((result: number, resolver: Resolver<(out: number) => void>) =>
            setImmediate(() => resolver(result + 1)),
          )
        })
        const t2 = Date.now()
        chainy.await(0, () => {
          const t3 = Date.now()
          console.log(`
          chained async calls:
          t1: start chain creation: ${t1}
          t2: chain created: ${t2}, lapsed ${t2 - t1}
          t3: chain resolved: ${t3}, lapsed ${t3 - t2}
          total lapsed ${t3 - t1}
          factor: ${promiseLapse / (t3 - t1)} times faster
          `)
          done(undefined)
        })
      }

      const benchPromiseAll = () => {
        const t1 = Date.now()
        // eslint-disable-next-line no-promise-executor-return
        const nPms = (x) => new Promise<number>((resolve) => setImmediate(() => resolve(x)))

        const tPms = (pms) =>
          pms.then((result) => {
            if (result < max) tPms(nPms(result + 1))
            else {
              const t2 = Date.now()
              console.log(`Promises:
            t1: start promise creation: ${t1}
            t2: all promises resolved: ${t2}, lapsed ${t2 - t1}
            total lapsed ${t2 - t1}
            `)
              benchChain(t2 - t1)
            }
          })
        tPms(nPms(0))
      }

      // const benchPromiseAll = async () => {
      //   const results2 = new Array<Promise<number>>(max)
      //   const t1 = Date.now()
      //   let i = 0
      //   times(max, () => {
      //     results2[i] = new Promise<number>((resolve) => {
      //       // debugger
      //       i += 1
      //       const y = i
      //       setImmediate(() => resolve(y))
      //     })
      //   })
      //   let res = 0
      //   // eslint-disable-next-line no-restricted-syntax
      //   for (const pms of results2) {
      //     // debugger
      //     res = await pms
      //   }
      //   console.log(res)
      //   const t2 = Date.now()
      //   // debugger
      //   console.log(`Promises:
      //   t1: ${t1}
      //   t2: ${t2}, lapsed ${t2 - t1}
      //   total lapsed ${t2 - t1}
      //   `)
      //   benchAsyncEffectsInParallel(t2 - t1)
      // }

      benchPromiseAll()
    }))
})

// (
//   input: string,
//   resultCb: ChainNodeResultCb<{ Error: never; ResultResolverController: void; ErrorResolverController: never; Output: string; }>,
//   errorCb: AccumulatedErrorCb<{ AccumulatedErrors: never; AccumulatedOutputs: string; AccumulatedResultResolverControllers: void; AccumulatedErrorResolverControllers: never; }>
// ) => AwaitedChainNodeController<void>

// ChainNodeAsyncFn<{
//   Error: never;
//   ResultResolverController: void;
//   ErrorResolverController: never;
//   Output: string;
// }, {
//   Error: never;
//   ResultResolverController: void;
//   ErrorResolverController: never;
//   Output: string;
// }, {
//   AccumulatedErrors: never;
//   AccumulatedOutputs: string;
//   AccumulatedResultResolverControllers: void;
//   AccumulatedErrorResolverControllers: never;
// }>'.

// const chain = asyncMapChain(getFile, splitFile, searchOnline, consolidateResults, formatResults)

// stream -> new stream -y-> new Conversation      -> process stream
//                      -n-> existing Conversation -> process stream
