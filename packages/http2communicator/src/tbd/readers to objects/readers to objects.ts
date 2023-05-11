import { ResultError } from '@trevthedev/toolbelt'
import HttpError from '../stream/http error'
import type { AwaitedReader, Reader } from '../stream/reader'
import { ServerResponseCode } from '../stream/server stream'
import { dataToObjects } from './data to objects'

export function readersToObjects<T extends Reader>(
  awaitReader: (
    onReader: (reader: T, doneWithReaderCb: () => void) => void,
  ) => ResultError<() => void, Error>,
  onError: (error: HttpError) => void,
) {
  const data2Objects = dataToObjects()
  let state: 'idle' | 'awaitingReader' | 'reading' | 'cancelled' | 'error' = 'idle'
  let cancelAwaitReader: (() => void) | undefined

  let currentReader: AwaitedReader | undefined

  const isEnded = () => state === 'error' || state === 'cancelled'

  const errorFn = (error: HttpError) => {
    if (state === 'cancelled') return
    if (state === 'error') return
    state = 'error'
    data2Objects.cancel()
    onError(error)
  }

  let doneWithReaderFn: (() => void) | undefined

  const doneProcessingReader = () => {
    if (doneWithReaderFn) doneWithReaderFn()
    doneWithReaderFn = undefined
  }

  const processNextReader = () => {
    if (state === 'idle') {
      state = 'awaitingReader'
      const result = awaitReader((reader, doneWithReader) => {
        doneWithReaderFn = doneWithReader
        cancelAwaitReader = undefined
        if (state === 'awaitingReader') {
          state = 'reading'
          const onReaderErrorFn = (error: HttpError) => {
            currentReader = undefined
            console.log(error)
            doneProcessingReader()
            errorFn(
              new HttpError(
                ServerResponseCode.internalServerError,
                'something went wrong reading the stream',
              ),
            )
          }
          const onReaderEndFn = () => {
            currentReader = undefined
            doneProcessingReader()
            if (!isEnded()) {
              state = 'idle'
              processNextReader()
            }
          }
          currentReader = reader(data2Objects.addData, onReaderErrorFn, onReaderEndFn)
        }
      })
      if (result.isError())
        errorFn(
          new HttpError(
            ServerResponseCode.internalServerError,
            (result as ResultError<() => void, Error, 'error'>).error.message,
          ),
        )
      else {
        cancelAwaitReader = (result as ResultError<() => void, Error, 'result'>)()
      }
    }
  }

  processNextReader()

  return {
    awaitObject: data2Objects.awaitObject,
    cancel: () => {
      if (!isEnded) {
        state = 'cancelled'
        data2Objects.cancel()
        if (cancelAwaitReader) cancelAwaitReader()
        if (currentReader) currentReader.cancel()
      }
      doneProcessingReader()
    },
  }
}
