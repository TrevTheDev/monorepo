import { addStateMachine, EnhancedMap, enhancedMap } from '@trevthedev/toolbelt'

import HttpError from './stream/http error'
import { ServerStream0, ServerStreamN } from './stream/server stream'
import { Writer } from './stream/writer'
import { Message, MessageId, QuestionId } from './types'
import { readersToObjects } from './readers to objects/readers to objects'
import { AwaitObjectEvents } from './readers to objects/data to objects'

export type ConversationId = string

export type Conversations = ReturnType<typeof conversationDb>

// export type Conversation = {
//   readonly messageHandlers: EnhancedMap<(msg: Message) => void, MessageId>
//   readonly startStream: ServerStream0
//   readonly writer: Writer
//   readonly state: 'error' | 'ended' | 'init' | 'underway'
//   readonly isEnded: boolean
//   addStream(stream: ServerStream0): HttpError | undefined
//   await: (nextObjectCb: (message: object) => void, noDataCb?: (() => void) | undefined) => void
//   error(error: HttpError): void
//   end(): void
// }

export type Conversation = {
  readonly uid: string
  messageHandlers: EnhancedMap<(msg: Message) => void, MessageId>
  writer: Writer
  readonly startStream: ServerStream0
  readonly isEnded: boolean
  readonly state: 'cancelled' | 'errored' | 'ended' | 'init' | 'underway'
  addStream: (stream: ServerStreamN) => void
  await: (
    nextObjectCb: (object: Record<string, unknown>) => void,
    awaitObjectEvents: AwaitObjectEvents,
  ) => void
  toState: (state: 'cancelled' | 'errored' | 'ended' | 'underway') => Conversation
  error: (error: HttpError) => void
  cancel: (reason: unknown) => void
  end: () => void
}

export function conversationDb() {
  const conversationsDb = enhancedMap<Conversation, ConversationId>()

  return {
    startConversation(eStream: ServerStream0): Conversation {
      // function toEndState(endState: 'ended' | 'error') {
      //   if (!conversation.isEnded) {
      //     conversation.toState(endState)
      //     if (!readerQ.isEnded) readerQ.end()
      //     writer.end()
      //     conversationsDb.delete(conversation.uid)
      //   }
      // }

      const writer = eStream.respondConversation({
        onCancel(reason) {
          conversation.cancel(reason)
        },
        onDone() {
          if (!conversation.isEnded) conversation.end()
        },
        onError(error) {
          conversation.error(error)
        },
      })

      const readerQ = readersToObjects({
        onCancel(reason) {
          conversation.cancel(reason)
        },
        onError(error) {
          conversation.error(error)
        },
        onDone() {
          console.log('done')
        },
        onNoReaders() {
          console.log('no readers')
        },
      })

      const conversation = addStateMachine({
        baseObject: {
          get uid(): ConversationId {
            return eStream.uid
          },
          messageHandlers: enhancedMap<(msg: Message) => void, QuestionId>(),
          writer,
          get startStream(): ServerStream0 {
            return eStream
          },
          get isEnded(): boolean {
            return ['ended', 'error'].includes(conversation.state)
          },
          addStream(stream: ServerStreamN): void {
            conversation.toState('underway')
            readerQ.addReader(stream.read, {
              onCancel(reason) {
                stream.respondCancel(reason)
              },
              onError(error) {
                stream.respondError(error)
              },
              onDone() {
                stream.respondEnd()
              },
            })
          },
          await: readerQ.awaitObject,
          error(error: HttpError): void {
            if (!conversation.isEnded) {
              conversation.toState('errored')
              if (!readerQ.isEnded) readerQ.error(error)
              if (!writer.isEnded) {
                error.send(writer)
                writer.error(error)
              }
              conversationsDb.delete(conversation.uid)
            }
          },
          cancel(reason: unknown) {
            if (!conversation.isEnded) {
              conversation.toState('cancelled')
              if (!readerQ.isEnded) readerQ.cancel(reason)
              if (!writer.isEnded) writer.cancel(reason)
              conversationsDb.delete(conversation.uid)
            }
          },
          end() {
            if (conversation.isEnded) throw new Error('conversation already ended')
            conversation.toState('ended')
            if (!readerQ.isEnded) readerQ.end()
            if (!writer.isEnded) writer.end()
            conversationsDb.delete(conversation.uid)
          },
        },
        transitions: [
          ['init', ['underway', 'ended', 'errored', 'cancelled']],
          ['underway', ['ended', 'errored', 'cancelled']],
        ],
        beforeCallGuards: [
          ['writer', ['init', 'underway']],
          ['addStream', ['init', 'underway']],
          ['await', ['init', 'underway']],
        ],
      })

      conversationsDb.add(conversation)

      conversation.addStream(eStream)

      return conversation
    },
    get(conversationId: ConversationId) {
      return conversationsDb.get(conversationId)
    },
  }
}
