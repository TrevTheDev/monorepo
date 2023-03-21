import { describe, it, expect } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import '../src/reverseForEach'
import { globalReverseForEach as reverseForEach } from '../src'

describe('reverseForEach', () => {
  it('reverseForEach', () => {
    const arr = [1, 2, 3, 4, 5, 10]
    let i = arr.length - 1
    arr[reverseForEach]((num, index) => {
      console.log(`${num}, ${arr[i]}`)
      expect(index).to.equal(i)
      expect(num).to.equal(arr[i])
      i -= 1
    })
  })
})
