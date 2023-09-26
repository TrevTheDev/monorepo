import { addStateMachine, asyncFunctionLinkedList } from '@trevthedev/toolbelt'
import type { ObjectWrappedWithStateMachine } from '@trevthedev/toolbelt'
import HttpError from '../stream/http error'
import type { Reader, ReaderController } from '../stream/reader'
import dataToObjects, { DataToObjects } from './data to objects'
import { SharedEvents, SharedIFace } from '../types'

export type R2OReaderEvents = SharedEvents

export interface ReadersToObjectsEvents extends SharedEvents {
  onNoReaders(): void
}

interface BaseReadersToObjects extends SharedIFace, Pick<DataToObjects, 'awaitObject'> {
  addReader(reader: Reader, readerEvents: R2OReaderEvents): void
  readonly isEnded: boolean
  readonly readerCount: number
}

export type ReadersToObjects = ObjectWrappedWithStateMachine<
  BaseReadersToObjects,
  'idle' | 'reading' | 'cancelled' | 'errored' | 'ended',
  'idle' | 'reading' | 'cancelled' | 'errored' | 'ended'
>

const activeStates = ['idle', 'reading'] as ('idle' | 'reading')[]

export function readersToObjects(events: ReadersToObjectsEvents): ReadersToObjects {
  const data2Objects = dataToObjects()
  const readerLinkList = asyncFunctionLinkedList()
  let currentReader: ReaderController | undefined
  let readerCount = 0
  let cancelReason: unknown
  let errorArgument: HttpError

  const readersToObj = addStateMachine({
    baseObject: {
      addReader(reader: Reader, readerEvents: R2OReaderEvents): void {
        readerCount += 1
        readersToObj.toState('reading')
        readerLinkList((doneCb) => {
          if (readersToObj.isEnded) {
            if (readersToObj.state === 'cancelled') readerEvents.onCancel(cancelReason)
            else if (readersToObj.state === 'errored') readerEvents.onError(errorArgument)
            else throw new Error('unexpected state')
          } else {
            currentReader = reader({
              onText: (data) => {
                currentReader = undefined
                readerCount -= 1
                data2Objects.addData(data)
                readerEvents.onDone()
                if (readerCount === 0) {
                  readersToObj.toState('idle')
                  events.onNoReaders()
                }
                doneCb()
              },
              onError: readersToObj.error,
              onCancel: readersToObj.cancel,
            })
          }
        })
      },
      awaitObject: data2Objects.awaitObject,
      cancel(reason: unknown): void {
        if (!readersToObj.isEnded) {
          if (currentReader && !currentReader.isEnded) currentReader.cancel(reason)
          if (!data2Objects.isEnded) data2Objects.cancel(reason)
          currentReader = undefined
          readersToObj.toState('cancelled')
          cancelReason = reason
          events.onCancel(reason)
        }
      },
      error(errorArg: HttpError): void {
        if (!readersToObj.isEnded) {
          if (currentReader && !currentReader.isEnded) currentReader.error(errorArg)
          if (!data2Objects.isEnded) data2Objects.error(errorArg)
          currentReader = undefined
          readersToObj.toState('errored')
          errorArgument = errorArg
          events.onError(errorArg)
        }
      },
      end(): void {
        if (readersToObj.isEnded) throw new Error('already in an end state')
        if (currentReader && !currentReader.isEnded) throw new Error('current reader not ended')
        if (readerCount !== 0) throw new Error('not all readers have been read')
        if (data2Objects.dataState !== 'noData') throw new Error('still has data in data2Object')
        if (!data2Objects.isEnded) data2Objects.end()
        currentReader = undefined
        readersToObj.toState('ended')
        events.onDone()
      },
      get readerCount(): number {
        return readerCount
      },
      get isEnded(): boolean {
        return ['cancelled', 'errored', 'ended'].includes(readersToObj.state)
      },
    },
    transitions: [
      ['idle', ['reading', 'cancelled', 'errored', 'ended']],
      ['reading', ['idle', 'cancelled', 'errored', 'ended']],
    ],
    beforeCallGuards: [
      ['addReader', activeStates],
      ['awaitObject', activeStates],
    ],
  })
  return readersToObj
}
