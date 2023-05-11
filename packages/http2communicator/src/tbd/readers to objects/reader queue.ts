import { didError, enhancedMap, resultError } from '@trevthedev/toolbelt'
import HttpError from '../stream/http error'
import httpError from '../stream/http error'
import { Reader } from '../stream/reader'
import { readersToObjects } from './readers to objects'
import { ServerResponseCode } from '../stream/server stream'

export default function readerQueue<T extends Reader>(onError: (error: httpError) => void) {
  let awaitState: 'idle' | 'awaitingReader' | 'reading' | 'cancelled' | 'error' | 'ended'
  let readerState: 'wantReader' | 'haveReader' | 'reading' | 'stop'

  const isEnded = () => ['cancelled', 'error', 'done'].includes(awaitState)

  let wantedStreamIdx = 0

  const readerQueue = enhancedMap<
    [reader: T, doneWithReader: (serverResponseCode: ServerResponseCode) => void],
    number
  >()

  let sendReaderFn: ((reader: T, onDoneWithReader: () => void) => void) | undefined
  let currentReader: T | undefined
  let currentDoneWithReader: ((serverResponseCode: ServerResponseCode) => void) | undefined

  const endFn = (state: 'cancelled' | 'error' | 'ended') => {
    if (!isEnded()) {
      awaitState = state
      readerState = 'stop'
      currentReader = undefined
      currentDoneWithReader = undefined
      sendReaderFn = undefined
      readerQueue.forEach(([_reader, doneFn]) => {
        doneFn(state === 'ended' ? ServerResponseCode.ok : ServerResponseCode.internalServerError)
      })
      readerQueue.clear()
      readersToObj.cancel()
    }
  }

  const getNextReader = () => {
    if (readerState === 'wantReader') {
      const item = readerQueue.get(wantedStreamIdx)
      if (item) {
        ;[currentReader, currentDoneWithReader] = item
        readerState = 'haveReader'
        wantedStreamIdx += 1
        processNext()
      }
    } else if (awaitState === 'awaitingReader' && readerState === 'haveReader') processNext()
  }

  const processNext = () => {
    if (awaitState === 'awaitingReader' && readerState === 'haveReader') {
      awaitState = 'reading'
      readerState = 'reading'
      const reader = currentReader as T
      const doneFn = currentDoneWithReader as () => void
      ;(sendReaderFn as (reader: T, onDoneWithReader: () => void) => void)(reader, doneFn)
      if (awaitState === 'reading') readerState = 'wantReader'
      if (readerState === 'reading') awaitState = 'idle'
      getNextReader()
    }
  }

  const awaitReader = (sendReaderCb: (reader: T, onDoneWithReader: () => void) => void) => {
    const output = resultError<() => void, Error>()
    if (awaitState !== 'idle') return output.error(new Error('wrong state'))
    awaitState = 'awaitingReader'
    sendReaderFn = sendReaderCb
    processNext()
    return output(() => endFn('cancelled'))
  }

  const onReadersToObjectsError = (error: HttpError) => {
    console.log(error)
    endFn('error')
    onError(error)
  }

  const readersToObj = readersToObjects(awaitReader, onReadersToObjectsError)

  const obj = {
    addReader(
      reader: T,
      index: number,
      doneWithReader: (serverResponseCode: ServerResponseCode) => void,
    ) {
      const output = didError<HttpError>()
      if (isEnded())
        return output.error(new HttpError(ServerResponseCode.badRequest, 'already ended'))
      if (index < wantedStreamIdx)
        return output.error(new HttpError(ServerResponseCode.badRequest, 'index already processed'))
      if (!readerQueue.get(index))
        return output.error(new HttpError(ServerResponseCode.badRequest, 'stream already added'))
      readerQueue.add([reader, doneWithReader], index)
      getNextReader()
      return output()
    },
    await: readersToObj.awaitObject,
    cancel() {
      endFn('cancelled')
    },
    end() {
      const output = didError<Error>()
      if (!['idle', 'awaitingReader'].includes(awaitState))
        return output.error(new Error('wrong awaitState'))
      if (readerState !== 'wantReader') return output.error(new Error('wrong readerState'))
      if (readerQueue.size > 0) return output.error(new Error('unprocessed streams in queue'))
      endFn('ended')
      return output()
    },
  }
  return obj
}
