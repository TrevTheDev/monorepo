// eslint-disable-next-line max-classes-per-file
import { EnhancedMap } from '@trevthedev/toolbelt'
import { createUid } from '../../other/shared functions.js'
import { Writer } from '../stream/writer.js'
import { Message, MessagePayload, QuestionId } from '../types.js'

// | 'question' /** new question */
// | 'reply' /** reply to a question */
// | 'listening'
// | 'continueMessage' /** default message type */
// | 'endMessage' /** default message type */
// | 'error' /** an error occurred answering question */
// | 'questionReceived'
// | 'replyReceived'

export type MessageHandlers = EnhancedMap<(msg: Message) => void, QuestionId>
export type QuestionMessageHandlers = EnhancedMap<(msg: PossibleMessage) => void, QuestionId>

export type CancelQuestion = () => void

export type Events = {
  onResponse<S extends MessagePayload>(message: S): void
  onError(error: Error): void
  onQuestionReceived?(conversation: {
    say(json: MessagePayload): void
    error(json: MessagePayload): void
    end(json: MessagePayload): void
  }): void
  onMessage?<S extends MessagePayload>(message: S, continues: boolean): void
  onEnd?(): void
}

export type Question = typeof question

export function question(
  messageHandlers: QuestionMessageHandlers,
  writer: Writer,
  json: Record<string, unknown>,
  events: Events,
): CancelQuestion {
  let state: 'asked' | 'questionReceived' | 'error' | 'end' | 'cancelled' = 'asked'

  const questionId = createUid()

  const ifNotEnded =
    <Args extends unknown[], R, Z>(fn: (...args: Args) => R, ifEndedFn?: () => Z) =>
    (...args: Args) => {
      if (['error', 'end', 'cancelled'].includes(state)) return ifEndedFn ? ifEndedFn() : undefined

      return fn(...args)
    }

  const endQuestion = ifNotEnded((finalState: 'error' | 'end' | 'cancelled') => {
    state = finalState
    messageHandlers.delete(questionId)
    if (events.onEnd) events.onEnd()
  })

  const errorFn = ifNotEnded((error: Error) => {
    events.onError(error)
    endQuestion('error')
  })

  messageHandlers.add(
    ifNotEnded((msg: PossibleMessage) => {
      let responseId: ResponseId | undefined
      if (msg.type === undefined && typeof msg.type !== 'string')
        return errorFn(new Error(`unrecognised response from server '${msg}'`))
      if (msg.message === undefined)
        return errorFn(new Error(`unrecognised response from server '${msg}'`))

      if (state === 'asked') {
        switch (msg.type) {
          case 'questionReceived':
            if (!events.onQuestionReceived)
              return errorFn(new Error(`no 'onQuestionReceived' provided`))
            state = 'questionReceived'
            if (!msg.responseId) return errorFn(new Error(`no 'responseId' received`))
            responseId = msg.responseId
            const beforeAction = () => {
              if (state !== 'questionReceived')
                return errorFn(new Error(`state is: ${state} and it should be 'questionReceived'`))
            }
            events.onQuestionReceived({
              say(json: MessagePayload) {
                beforeAction()
                writer({ message: json, type: 'continueMessage', questionId, responseId })
              },
              error(json: MessagePayload) {
                beforeAction()
                writer({ message: json, type: 'error', questionId, responseId })
                endQuestion('error')
              },
              end(json: MessagePayload) {
                beforeAction()
                writer({ message: json, type: 'endMessage', questionId, responseId })
                endQuestion('end')
              },
            })
            return
          default:
        }
      }

      if (['asked', 'questionReceived'].includes(state)) {
        switch (msg.type) {
          case 'reply':
            if (responseId === undefined) {
              if (!msg.responseId) return errorFn(new Error(`no 'responseId' received`))
              responseId = msg.responseId
            } else if (msg.responseId !== responseId)
              return errorFn(new Error(`responseIds do not match`))
            writer({
              message: { status: 'ok' },
              type: 'replyReceived',
              questionId,
              responseId,
            })
            endQuestion('end')
            return events.onResponse(msg.message)
          default:
        }
      }
      if (responseId === undefined) return errorFn(new Error(`no 'responseId' received`))
      if (msg.responseId !== responseId) return errorFn(new Error(`responseIds do not match`))
      if (state === 'questionReceived') {
        switch (msg.type) {
          case 'continueMessage':
            if (!events.onMessage) return errorFn(new Error(`no 'onMessage' provided`))
            events.onMessage(msg.message, true)
            return
          case 'endMessage':
            endQuestion('end')
            if (!events.onMessage) return errorFn(new Error(`no 'onMessage' provided`))
            events.onMessage(msg.message, false)
            return
          case 'error':
            endQuestion('error')
            events.onError(new Error(`${msg.message}`))
            return
          default:
        }
      }
      return errorFn(new Error(`unable to handle message '${msg}' whilst in state ${state}`))
    }),
    questionId,
  )

  writer({ message: json, type: 'question', questionId })

  return (() => endQuestion('cancelled')) as CancelQuestion
}
