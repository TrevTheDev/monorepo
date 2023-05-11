import { runFunctionsOnlyOnce } from '@trevthedev/toolbelt'
import { ServerHttp2Stream } from 'http2'
import { FetchDuplex } from '../../../browser/duplex stream'
import httpError from './http error'
import HttpError from './http error'
import { ServerResponseCode } from './server stream'

export type Reader = ReturnType<typeof createReader>
export type AwaitedReader = ReturnType<Reader>

export default function createReader<T extends ServerHttp2Stream>(
  stream: T,
  onStreamError: (error: HttpError) => void,
) {
  const reader = runFunctionsOnlyOnce()(
    (onData: (data: string) => void, onError: (error: HttpError) => void, onEnd: () => void) => {
      let state: 'reading' | 'error' | 'done' | 'cancel' = 'reading'

      const toEndState = runFunctionsOnlyOnce(null)(
        (endState: 'error' | 'done' | 'cancel' = 'done') => {
          state = endState
          stream.removeListener('data', dataCb)
          stream.removeListener('end', endCb)
          stream.removeListener('aborted', abortedFn)
          stream.removeListener('error', errorFn)
          stream.removeListener('close', closeCb)
          if (state === 'done') onEnd()
        },
      )

      const readErrorFn = runFunctionsOnlyOnce(null)((error: HttpError) => {
        toEndState('error')
        onError(error)
        onStreamError(error)
        return false
      })

      const throwErrorFn = (msg: string) => () =>
        readErrorFn(new httpError(ServerResponseCode.internalServerError, msg))
      const abortedFn = throwErrorFn('unexpected stream aborted')
      const errorFn = throwErrorFn('unexpected stream error')

      const dataCb = (chunk: Buffer) => {
        if (state === 'reading') onData(chunk.toString())
        else if (state === 'done')
          readErrorFn(
            new httpError(
              ServerResponseCode.internalServerError,
              'data received, but stream is in the wrong state',
            ),
          )
      }

      const endCb = runFunctionsOnlyOnce(null)(() => {
        if (state === 'reading') toEndState()
      })

      const closeCb = () => {
        if (state === 'reading')
          readErrorFn(
            new httpError(ServerResponseCode.internalServerError, 'unexpected stream closure'),
          )
      }

      stream.on('data', dataCb)
      // The 'end' event is emitted when there is no more data to be consumed from the stream.
      stream.once('end', endCb)
      // The 'finish' event is emitted after the stream.end() method has been called, and all data has been flushed to the underlying system.
      stream.once('finished', () => {
        debugger
      })
      // The 'aborted' event is emitted whenever a Http2Stream instance is abnormally aborted in mid-communication.
      stream.once('aborted', abortedFn)
      // The 'error' event is emitted when an error occurs during the processing of an Http2Stream.
      stream.once('error', errorFn)
      // The 'close' event is emitted when the Http2Stream is destroyed. Once this event is emitted, the Http2Stream instance is no longer usable.
      stream.once('close', closeCb)
      return {
        get state() {
          return state
        },
        cancel() {
          toEndState('cancel')
        },
        // error(error: HttpError) {
        //   readErrorFn(error)
        // },
        // end() {
        //   toEndState('done')
        // },
      }
    },
  )
  return reader
}
