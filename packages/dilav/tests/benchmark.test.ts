import { it } from 'vitest'
// eslint-disable-next-line import/no-extraneous-dependencies
import { z } from 'zod'

import { times } from 'toolbelt'
import { v } from '../src'

// it('benchmark against zod2', () => {
//   const zodInit = () => {
//     const fn = (i: number) => {
//       const schema = z.number().gt(0)
//       const res = schema.safeParse(i)
//       if (res.success === true) expect(res.data).toEqual(i)
//     }
//     return fn
//   }

//   const mineInit = () => {
//     const fn = (i: number) => {
//       const schema = vNumberInstance.gt(0)
//       const res = schema.safeParse(i)
//       if (res[0] === undefined) expect(res[1]).toEqual(i)
//     }
//     return fn
//   }
//   const mineInit2 = () => {
//     const fn = (i: number) => {
//       const schema = compose(parseNumber(), (result) => result[1], greaterThan(0))
//       const res = schema(i)
//       if (res === undefined) expect(i).toEqual(i)
//     }
//     return fn
//   }
//   const runNTimes = 50000
//   const start1 = Date.now()
//   const fn1 = zodInit()
//   times(runNTimes, (i) => fn1(i))
//   const end1 = Date.now()
//   const fn2 = mineInit()
//   times(runNTimes, (i) => fn2(i))
//   const end2 = Date.now()
//   const fn3 = mineInit2()
//   times(runNTimes, (i) => fn3(i))
//   const end3 = Date.now()
//   console.log(`zod: ${end1 - start1}`)
//   console.log(`mine: ${end2 - end1}`)
//   console.log(`times faster: ${(end1 - start1) / (end2 - end1)}`)
//   console.log(`mine2: ${end3 - end2}`)
//   console.log(`times faster: ${(end1 - start1) / (end3 - end2)}`)
//   debugger
// })

it('benchmark 1', () => {
  const warmUpTimes = 1000
  const runTimes = 10000
  const numberOfTimesToSucceed = 20
  const numberOfTimesToFail = 5
  const passData = {
    a: '12345',
    b: 1,
    c: ['a', 'b', 'c'],
    d: ['a', 1],
  }
  const failData = {
    a: '1234',
    b: 101,
    c: ['a', 'b', 1],
    d: [1, 'a'],
  }
  const zodRun = () => {
    const oneRun = () => {
      const schema = z.object({
        a: z.string().min(5),
        b: z.number().max(100),
        c: z.array(z.string()),
        d: z.tuple([z.string(), z.number()]),
      })
      times(numberOfTimesToSucceed, () => {
        const result = schema.parse(passData)
        if (typeof result !== 'object') throw new Error()
      })
      times(numberOfTimesToFail, () => {
        const result = schema.safeParse(failData)
        if (!result.success) {
          const { error } = result
          if (error === undefined) throw new Error()
        }
      })
    }
    times(warmUpTimes, oneRun)
    const start = Date.now()
    times(runTimes, oneRun)
    const end = Date.now()
    return [start, end, end - start]
  }

  const dilavRun = () => {
    const oneRun = () => {
      const schema = v.object({
        a: v.string.min(5),
        b: v.number.max(100),
        c: v.array(v.string),
        d: v.array([v.string, v.number]),
      })
      times(numberOfTimesToSucceed, () => {
        const result = schema.parse(passData)
        if (typeof result !== 'object') throw new Error()
      })
      times(numberOfTimesToFail, () => {
        const result = schema.safeParse(failData)
        if (v.isError(result)) {
          const error = result[0]
          if (error === undefined) throw new Error()
        }
      })
    }
    times(warmUpTimes, oneRun)
    const start = Date.now()
    times(runTimes, oneRun)
    const end = Date.now()
    return [start, end, end - start]
  }

  const zod = zodRun()
  const dilav = dilavRun()
  console.log(`zod: ${zod}`)
  console.log(`dilav: ${dilav}`)
  console.log(`times faster: ${zod[2] / dilav[2]}`)
  debugger
})

it('benchmark 2', () => {
  const warmUpTimes = 1000
  const runTimes = 10000
  const numberOfTimesToSucceed = 20
  const numberOfTimesToFail = 5

  const zodRun = () => {
    const oneRun = () => {
      const schema = z.string().max(3)
      times(numberOfTimesToSucceed, () => {
        const result = schema.parse(Math.random().toString(36).slice(2, 5))
        if (typeof result !== 'string') throw new Error()
      })
      times(numberOfTimesToFail, () => {
        const result = schema.safeParse(Math.random().toString(36).slice(2, 6))
        if (!result.success) {
          const { error } = result
          if (error === undefined) throw new Error()
        }
      })
    }
    times(warmUpTimes, oneRun)
    const start = Date.now()
    times(runTimes, oneRun)
    const end = Date.now()
    return [start, end, end - start]
  }

  const dilavRun = () => {
    const oneRun = () => {
      const schema = v.string.max(3)
      times(numberOfTimesToSucceed, () => {
        const result = schema.parse(Math.random().toString(36).slice(2, 5))
        if (typeof result !== 'string') throw new Error()
      })
      times(numberOfTimesToFail, () => {
        const result = schema.safeParse(Math.random().toString(36).slice(2, 6))
        if (v.isError(result)) {
          const error = result[0]
          if (error === undefined) throw new Error()
        }
      })
    }
    times(warmUpTimes, oneRun)
    const start = Date.now()
    times(runTimes, oneRun)
    const end = Date.now()
    return [start, end, end - start]
  }

  const dilav = dilavRun()
  const zod = zodRun()
  console.log(`zod: ${zod}`)
  console.log(`dilav: ${dilav}`)
  console.log(`times faster: ${zod[2] / dilav[2]}`)
  debugger
})

it('benchmark 3', () => {
  const warmUpTimes = 1000
  const runTimes = 10000
  const numberOfTimesToSucceed = 20
  const numberOfTimesToFail = 0
  const passData = 'abc'
  const failData = 'abcd'
  const zodRun = () => {
    const oneRun = () => {
      const schema = z.string().max(3)
      times(numberOfTimesToSucceed, () => {
        const result = schema.parse(passData)
        if (typeof result !== 'string') throw new Error()
      })
      times(numberOfTimesToFail, () => {
        const result = schema.safeParse(failData)
        if (!result.success) {
          const { error } = result
          if (error === undefined) throw new Error()
        }
      })
    }
    times(warmUpTimes, oneRun)
    const start = Date.now()
    times(runTimes, oneRun)
    const end = Date.now()
    return [start, end, end - start]
  }

  const dilavRun = () => {
    const oneRun = () => {
      const schema = v.string.max(3)
      times(numberOfTimesToSucceed, () => {
        const result = schema.parse(passData)
        if (typeof result !== 'string') throw new Error()
      })
      times(numberOfTimesToFail, () => {
        const result = schema.safeParse(failData)
        if (v.isError(result)) {
          const error = result[0]
          if (error === undefined) throw new Error()
        }
      })
    }
    times(warmUpTimes, oneRun)
    const start = Date.now()
    times(runTimes, oneRun)
    const end = Date.now()
    return [start, end, end - start]
  }

  const dilav = dilavRun()
  const zod = zodRun()
  console.log(`zod: ${zod}`)
  console.log(`dilav: ${dilav}`)
  console.log(`times faster: ${zod[2] / dilav[2]}`)
  debugger
})
