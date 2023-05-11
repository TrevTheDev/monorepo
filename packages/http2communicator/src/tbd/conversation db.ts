import {
  didError,
  DidError,
  EnhancedMap,
  enhancedMap,
  resultError,
  ResultError,
} from '@trevthedev/toolbelt'

import readerQueue from './readers to objects/reader queue'
import HttpError from './stream/http error'
import { Reader } from './stream/reader'
import { ServerResponseCode, ServerStream } from './stream/server stream'
import { Writer } from './stream/writer'
import { Message, MessageId } from './types'

export type ConversationId = string

export type Conversations = ReturnType<typeof conversationDb>

export type Conversation = {
  readonly messageHandlers: EnhancedMap<(msg: Message) => void, MessageId>
  readonly startStream: ServerStream
  readonly writer: Writer
  readonly state: 'error' | 'ended' | 'init' | 'underway'
  readonly isEnded: boolean
  addStream(stream: ServerStream & { idx: number }): DidError<HttpError, boolean>
  await: (nextObjectCb: (message: Message) => void, noDataCb?: (() => void) | undefined) => void
  error(error: HttpError): void
  end(): void
}

export function conversationDb() {
  const conversationsDb = enhancedMap<Conversation, ConversationId>()

  return {
    startConversation(eStream: ServerStream & { idx: 0 }) {
      const output = resultError<Conversation, HttpError>()
      const possibleRespondedStream = eStream.respondConversation(() => conversation.end())
      if (possibleRespondedStream.isError())
        return output.error(
          (
            possibleRespondedStream as ResultError<
              { uid: string; writer: Writer },
              HttpError,
              'error'
            >
          ).error,
        )
      const { uid, writer } = (
        possibleRespondedStream as ResultError<{ uid: string; writer: Writer }, HttpError, 'result'>
      )()

      let state: 'init' | 'underway' | 'ended' | 'error' = 'init'

      const errorFn = (error: HttpError) => {
        if (!conversation.isEnded) {
          error.send(writer)
          toEndState('error')
        }
      }

      const readerQ = readerQueue<Reader>(errorFn)

      const toEndState = (endState: 'ended' | 'error') => {
        if (!conversation.isEnded) {
          state = endState
          readerQ.cancel()
          writer.end()
          conversationsDb.delete(uid)
        }
      }

      const conversation: Conversation = {
        messageHandlers: enhancedMap<(msg: Message) => void, QuestionId>(),
        writer,
        get startStream() {
          return eStream
        },
        get state() {
          return state
        },
        get isEnded() {
          return ['ended', 'error'].includes(state)
        },
        addStream(stream: ServerStream & { idx: number }) {
          const output = didError<HttpError>()
          if (conversation.isEnded)
            return output.error(
              new HttpError(ServerResponseCode.badRequest, 'conversation already ended'),
            )
          state = 'underway'
          return readerQ.addReader(
            stream.read,
            stream.idx,
            (serverResponseCode: ServerResponseCode) => {
              if (stream.idx !== 0) stream.respondEnd(serverResponseCode)
            },
          )
        },
        await: readerQ.await,
        error(error: HttpError) {
          return errorFn(error)
        },
        end() {
          state = 'ended'
          readerQ.cancel()
          writer.end()
          conversationsDb.delete(uid)
        },
      }

      conversationsDb.add(conversation)

      return output(conversation)
    },
    get(conversationId: ConversationId) {
      return conversationsDb.get(conversationId)
    },
  }
}
