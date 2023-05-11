import { DidError, EnhancedMap, enhancedMap, isError, ResultError } from '@trevthedev/toolbelt'
import type { IncomingHttpHeaders, OutgoingHttpHeaders, ServerHttp2Stream } from 'http2'
import HttpError from './stream/http error'
import type { Message, QuestionId } from './objects/question'
import { response } from './objects/server response'
import type { Response } from './objects/server response'
import { Conversation, conversationDb, Conversations } from './conversation db'
import { QuestionHandler } from '../server'
import serverStream, {
  ServerResponseCode,
  ServerStream,
  StartServerStream,
} from './stream/server stream'
import { messageSchema } from './types'
import { v } from 'dilav'

function isPossibleNewConversationStream(
  eStream: ServerStream | StartServerStream,
): eStream is StartServerStream {
  return eStream.idx === 0
}

function addStreamToConversation(
  conversationGetFn: Conversations['get'],
  eStream: ServerStream & { uid: string },
) {
  const chat = conversationGetFn(eStream.uid)
  if (chat === undefined)
    eStream.respondError(new HttpError(ServerResponseCode.notFound, 'not found'))
  else if (eStream.idx === undefined)
    eStream.respondError(new HttpError(ServerResponseCode.badRequest, 'not found'))
  else {
    const addStreamResult = chat.addStream(eStream as ServerStream & { idx: number })
    if (addStreamResult.isError())
      eStream.respondError((addStreamResult as DidError<HttpError, true>).errorValue())
  }
}

function objectRouter(questionHandler: QuestionHandler, chat: Conversation) {
  function getNextObject() {
    chat.await((object) => {
      const parseResult = messageSchema.safeParse(object)
      if (isError(parseResult)) return chat.error(parseResult[0])
      const message = parseResult[1]
      if (message.type === 'question') {
        const createResponseResult = response(chat, message)
        if (isError(createResponseResult)) return chat.error(createResponseResult[0])
        questionHandler(createResponseResult[1])
        return getNextObject()
      }

      const createMessageHandlerResult = chat.messageHandlers.get(message.id)
      if (isError(createMessageHandlerResult))
        return chat.error(new HttpError(ServerResponseCode.badRequest, 'no messageHandlers found'))
      messageHandler(createMessageHandlerResult[1])
      return getNextObject()
    })
  }
  getNextObject()
}

function startConversation(
  questionHandler: QuestionHandler,
  startConversationFn: Conversations['startConversation'],
  eStream: ServerStream & { idx: 0 },
) {
  const startConversationResult = startConversationFn(eStream)
  if (isError(startConversationResult)) return eStream.respondError(startConversationResult[0])
  return objectRouter(questionHandler, startConversationResult[0])
}

export default function serverConversationRouter(
  defaultResponseHeaders: OutgoingHttpHeaders,
  questionHandler: QuestionHandler,
) {
  const conversations = conversationDb()
  return function ServerStreamReceiverFn (
    stream: ServerHttp2Stream,
    headers: IncomingHttpHeaders,
    _flags: number,
    _rawHeaders: Array<unknown>,
  ) {
    const eStream: ServerStream = serverStream(
      stream,
      headers,
      defaultResponseHeaders,
      (error: Error) => {},
      () => {},
    )

    if (eStream.uid)
      addStreamToConversation(conversations.get, eStream)
    else if (!isPossibleNewConversationStream(eStream))
      eStream.respondError(new HttpError(ServerResponseCode.badRequest, 'bad index'))
    else startConversation(questionHandler, conversations.startConversation, eStream)
    return true
  }
}
