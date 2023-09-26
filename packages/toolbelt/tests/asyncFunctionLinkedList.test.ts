import { it, expect } from 'vitest'
import { asyncFunctionLinkedList } from '../src'

it('example asyncFunctionLinkedList', () =>
  new Promise((finalDone) => {
    const linkedList = asyncFunctionLinkedList()
    let data = ''
    linkedList((done) => {
      data += 'A'
      setTimeout(() => {
        linkedList((done3) => {
          data += 'C'
          done3()
          expect(data).toBe('ABC')
          finalDone(undefined)
        })
        done()
      }, 50)
    })
    linkedList((done2) => {
      data += 'B'
      done2()
    })
  }))

it('asyncFunctionLinkedList', () =>
  new Promise((finalDone) => {
    const linkedList = asyncFunctionLinkedList()
    let data = ''
    linkedList((done) => {
      data += 'A'
      linkedList((done2) => {
        data += 'B'
        done2()
      })
      linkedList((done3) => {
        data += 'C'
        linkedList((done5) => {
          data += 'E'
          setTimeout(() => {
            done5()
            setTimeout(() => {
              linkedList((done6) => {
                data += 'F'
                done6()
                expect(data).toBe('ABCDEF')
                finalDone(undefined)
              })
            }, 50)
          }, 50)
        })
        setTimeout(() => {
          done3()
        }, 50)
      })
      linkedList((done4) => {
        data += 'D'
        done4()
      })
      setTimeout(() => {
        done()
      }, 50)
    })
  }))
