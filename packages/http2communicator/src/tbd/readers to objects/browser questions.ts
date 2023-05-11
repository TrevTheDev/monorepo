import { enhancedMap, runFunctionsOnlyOnce } from '@trevthedev/toolbelt'
import { FetchDuplex } from '../../../browser/duplex stream'
import {
  CancelQuestion,
  Events as QuestionEvents,
  MessagePayload,
  PossibleMessage,
  question,
  QuestionId,
} from '../objects/question'
import readerQueue from './reader queue'
import browserStream from '../stream/browser stream'

export default function browserQuestions() {
  const messageHandlers = enhancedMap<(msg: PossibleMessage) => void, QuestionId>()

  return function q(
    stream: FetchDuplex,
    json: Record<string, unknown>,
    events: QuestionEvents,
  ): CancelQuestion {
    let cancelQuestion: CancelQuestion
    let unexpectedClose = true

    const events_: QuestionEvents = {
      ...events,
      ...{
        onResponse<S extends MessagePayload>(message: S) {
          toEndState()
          events.onResponse(message)
        },
        onError(error: Error) {
          errorFn(error)
        },
        onEnd() {
          toEndState()
          if (events.onEnd) events.onEnd()
        },
      },
    }

    const toEndState = runFunctionsOnlyOnce(null)(() => {
      writeStream.end()
    })

    const errorFn = runFunctionsOnlyOnce(null)((error: Error) => {
      debugger
      unexpectedClose = false
      cancelQuestion() // use error instead?
      toEndState()
      events.onError(error)
    })

    const eStream = browserStream(stream, errorFn, () => {
      if (unexpectedClose) {
        cancelQuestion() // use error instead?
        errorFn(new Error('unexpected stream closure'))
      }
      unexpectedClose = false
      toEndState()
    })
    const writeStream = eStream.writer

    const rQueue = readerQueue(errorFn)
    rQueue.addReader(eStream.reader, 0, () => toEndState())

    cancelQuestion = question(messageHandlers, writeStream, json, events_)

    const getObjects = () => {
      rQueue.await((object) => {
        if (object.questionId !== undefined && typeof object.questionId === 'string') {
          const msgHandler = messageHandlers.get(object.questionId)
          if (msgHandler) msgHandler(object as PossibleMessage)
        }
      })
    }
    getObjects()
    return cancelQuestion
  }
}
