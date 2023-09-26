import {
  ObjectWrappedWithStateMachine,
  addStateMachine,
  runFunctionsOnlyOnce,
} from '@trevthedev/toolbelt'
import HttpError from './http error'
import { ServerStreamN } from './server stream'
import { SharedEvents, SharedIFace } from '../types'

export interface ReaderEvents extends Omit<SharedEvents, 'onDone'> {
  onText(text: string): void // onDone
}

export interface ReaderController
  extends ObjectWrappedWithStateMachine<
    Omit<SharedIFace, 'end'>,
    'cancelled' | 'errored' | 'ended',
    'reading' | 'cancelled' | 'errored' | 'ended'
  > {
  readonly idx: number
  readonly isEnded: boolean
}

export type Reader = (readerEvents: ReaderEvents) => ReaderController

export default function streamToText(stream: ServerStreamN): Reader {
  function streamToTextFn(readerEvents: ReaderEvents): ReaderController {
    const http2Stream = stream.stream
    let text: string

    const cleanUp = runFunctionsOnlyOnce(null)(() => {
      http2Stream.removeListener('data', dataCb)
      http2Stream.removeListener('end', endCb)
      http2Stream.removeListener('aborted', abortedFn)
      http2Stream.removeListener('error', errorFn)
      http2Stream.removeListener('close', closeCb)
      http2Stream.removeListener('timeout', timeOutCb)
    })

    function toErrorState(error: HttpError) {
      if (readerObj.state === 'reading') {
        readerObj.toState('errored')
        cleanUp()
        readerEvents.onError(error)
      }
    }

    const toErrorStateFn = (msg: string) => toErrorState(new HttpError(msg))

    const abortedFn = () => toErrorStateFn('unexpected stream aborted')
    const errorFn = () => toErrorStateFn('unexpected stream error')

    function dataCb(chunk: Buffer) {
      if (readerObj.state !== 'reading')
        toErrorStateFn('data received, but stream is in the wrong state')
      else text += chunk.toString()
    }

    function endCb() {
      if (readerObj.state === 'reading') {
        readerObj.toState('ended')
        cleanUp()
        readerEvents.onText(text)
      } else toErrorStateFn('data received, but stream is in the wrong state')
    }

    function closeCb() {
      if (readerObj.state === 'reading') toErrorStateFn('unexpected stream closure')
    }

    const timeOutCb = () => toErrorStateFn('timed out')

    http2Stream.on('data', dataCb)
    // The 'end' event is emitted when there is no more data to be consumed from the stream.
    http2Stream.once('end', endCb)
    // The 'aborted' event is emitted whenever a Http2Stream instance is abnormally aborted in mid-communication.
    http2Stream.once('aborted', abortedFn)
    // The 'error' event is emitted when an error occurs during the processing of an Http2Stream.
    http2Stream.once('error', errorFn)
    // The 'close' event is emitted when the Http2Stream is destroyed. Once this event is emitted, the Http2Stream instance is no longer usable.
    http2Stream.once('close', closeCb)
    // The 'timeout' event is emitted after no activity is received for this Http2Stream within the number of milliseconds set using http2stream.setTimeout()
    http2Stream.once('timeout', timeOutCb)

    const readerObj = addStateMachine({
      baseObject: {
        cancel(reason: unknown): void {
          readerObj.toState('cancelled')
          cleanUp()
          readerEvents.onCancel(reason)
        },
        error(error: HttpError): void {
          toErrorState(error)
        },
        get idx(): number {
          return stream.idx as number
        },
        get isEnded(): boolean {
          return ['cancelled', 'errored', 'ended'].includes(readerObj.state)
        },
      },
      transitions: [['reading', ['cancelled', 'errored', 'ended']]],
    })
    return readerObj
  }
  return runFunctionsOnlyOnce()(streamToTextFn)
}
