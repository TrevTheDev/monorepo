import { describe, it, expect } from 'vitest'
import { difference, intersection } from '../src/index'

describe('difference & intersection', () => {
  it('difference', () => {
    // can find the difference of two arrays
    expect(`${difference([1, 2, 3], [2, 30, 40])}`).toEqual('1,3')
    // avoids deep flattening of arrays
    expect(`${difference([1, 2, 3], [2, 30, 40, [1]])}`).toEqual('1,3')
    // preserves the order of the first array
    expect(`${difference([8, 9, 3, 1], [3, 8])}`).toEqual('9,1')
  })
  it('intersection', () => {
    const stooges = ['moe', 'curly', 'larry']
    const leaders = ['moe', 'groucho']
    // can find the set intersection of two arrays
    expect(`${intersection(stooges, leaders)}`).toEqual('moe')
    // returns a duplicate-free array
    expect(`${intersection(['moe', 'moe', 'curly', 'curly', 'larry', 'larry'], leaders)}`).toEqual(
      'moe',
    )
    // preserves the order of the first array
    expect(`${intersection([2, 4, 3, 1], [1, 2, 3])}`).toEqual('2,3,1')
    const u1 = difference([1, 2, 3, 4], [7, 6, 5, 4, 3]) //= > [1,2] type: (1 | 2)[]
    const u2 = difference([7, 6, 5, 4, 3], [1, 2, 3, 4]) //= > [7,6,5] type: (7 | 6 | 5)[]
    const u3 = difference([7, 6, 5, 4, 3] as number[], [1, 2, 3, 4]) //= > [7,6,5] type: (7 | 6 | 5)[]
    console.log(u1, u2, u3)
  })
})
