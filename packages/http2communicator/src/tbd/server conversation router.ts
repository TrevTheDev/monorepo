import { isError } from '@trevthedev/toolbelt'
import type { IncomingHttpHeaders, OutgoingHttpHeaders, ServerHttp2Stream } from 'http2'
import { v } from 'dilav'
import HttpError from './stream/http error'
import { response } from './objects/server response'
import { Conversation, conversationDb, Conversations } from './conversation db'
import { QuestionHandler } from '../server'
import {
  ServerResponseCode,
  ServerStream0,
  ServerStreamN,
  serverStream0,
  serverStreamN,
} from './stream/server stream'
import { firstHeaderSchema, headerSchema, messageSchema } from './types'

function addStreamToConversation(conversationGetFn: Conversations['get'], eStream: ServerStreamN) {
  const chat = conversationGetFn(eStream.uid)
  if (chat === undefined)
    eStream.respondError(new HttpError('not found', ServerResponseCode.notFound))
  else if (eStream.idx === undefined)
    eStream.respondError(new HttpError('not found', ServerResponseCode.badRequest))
  else chat.addStream(eStream)
}

function objectRouter(questionHandler: QuestionHandler, chat: Conversation) {
  function getNextObject() {
    chat.await(
      (object) => {
        const parseResult = messageSchema.safeParse(object)
        if (isError(parseResult)) return chat.error(new HttpError(v.firstError(parseResult[0])))
        const message = parseResult[1]
        if (message.type === 'question') {
          const createResponseResult = response(chat, message)
          if (isError(createResponseResult)) return chat.error(createResponseResult[0])
          questionHandler(createResponseResult[1])
          return getNextObject()
        }

        const createMessageHandlerResult = chat.messageHandlers.get(message.id)
        if (isError(createMessageHandlerResult)) {
          return chat.error(
            new HttpError('no messageHandlers found', ServerResponseCode.badRequest),
          )
        }
        messageHandler(createMessageHandlerResult[1])
        return getNextObject()
      },
      {
        onCancel(reason) {
          console.log(reason)
        },
        onDone() {
          console.log('done')
        },
        onError(error) {
          console.log(error)
        },
        onNoData() {
          console.log('done')
        },
      },
    )
  }
  getNextObject()
}

function startConversation(
  questionHandler: QuestionHandler,
  startConversationFn: Conversations['startConversation'],
  eStream: ServerStream0,
) {
  const startConversationResult = startConversationFn(eStream)
  return objectRouter(questionHandler, startConversationResult)
}

export const conversations = conversationDb()

export default function serverConversationRouter(
  defaultResponseHeaders: OutgoingHttpHeaders,
  questionHandler: QuestionHandler,
) {
  return function ServerStreamReceiverFn(
    stream: ServerHttp2Stream,
    headers: IncomingHttpHeaders,
    _flags: number,
    _rawHeaders: Array<unknown>,
  ) {
    const header0 = firstHeaderSchema.safeParse(headers)
    if (isError(header0)) {
      const headerN = headerSchema.safeParse(headers)
      if (isError(headerN)) {
        stream.respond({ ':status': ServerResponseCode.badRequest })
        stream.end()
        stream.close()
      } else {
        const eStreamN = serverStreamN(stream, headerN[1], defaultResponseHeaders)
        addStreamToConversation(conversations.get, eStreamN)
      }
    } else {
      const eStream0 = serverStream0(stream, header0[1], defaultResponseHeaders)
      startConversation(questionHandler, conversations.startConversation, eStream0)
    }
  }
}
