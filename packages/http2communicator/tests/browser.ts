import { vi, describe, it, expect, Mock } from 'vitest'
import connection from '../browser/browser client'

describe('browser', () => {
  it('browser', () => {
    const cnn = connection()
    console.log(cnn)
  })
})
