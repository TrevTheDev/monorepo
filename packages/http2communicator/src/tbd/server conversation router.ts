import { DidError, EnhancedMap, enhancedMap, ResultError } from '@trevthedev/toolbelt'
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
import { v } from 'dilav'

function isPossibleNewConversationStream(
  eStream: ServerStream | StartServerStream,
): eStream is StartServerStream {
  return eStream.idx === 0
}

function isMessage(obj: object): obj is Message {
  return 'responseId' in obj && typeof obj.responseId === 'string'
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
  const getNextObject = () => {
    chat.await((obj) => {
      const isObject = v.object({
        
      })
      if (chat.isEnded) return

      if ('responseId' in obj && typeof obj.responseId === 'string') {
        const messageHandler = chat.messageHandlers.get(obj['responseId'])
        if (!messageHandler) {
          return chat.error(
            new HttpError(ServerResponseCode.badRequest, 'no messageHandlers found'),
          )
        }
        messageHandler(obj as Message)
        return getNextObject()
      }

      if (obj['type'] === 'question') {
        const res = response(chat, obj as Message, chat.end)
        if (res.isError()) chat.error((res as ResultError<Response, HttpError, 'error'>).error)
        const x = (res as ResultError<Response, HttpError, 'result'>).result
        questionHandler(x)
        return getNextObject()
      }
      chat.error(new HttpError(ServerResponseCode.badRequest, 'unrecognised object'))
    })
  }
  getNextObject()
}

function startConversation(
  questionHandler: QuestionHandler,
  startConversationFn: Conversations['startConversation'],
  eStream: ServerStream & { idx: 0 },
) {
  const output = startConversationFn(eStream)
  if (output.isError())
    eStream.respondError((output as ResultError<Conversation, HttpError, 'error'>).error)
  else {
    const chat = (output as ResultError<Conversation, HttpError, 'result'>).result
    objectRouter(questionHandler, chat)
  }
}

export function serverConversationRouter(
  defaultResponseHeaders: OutgoingHttpHeaders,
  questionHandler: QuestionHandler,
) {
  const conversations = conversationDb()
  return (
    stream: ServerHttp2Stream,
    headers: IncomingHttpHeaders,
    _flags: number,
    _rawHeaders: Array<unknown>,
  ) => {
    const eStream: ServerStream = serverStream(
      stream,
      headers,
      defaultResponseHeaders,
      (error: Error) => {},
      () => {},
    )

    if (eStream.uid)
      addStreamToConversation(conversations.get, eStream as ServerStream & { uid: string })
    else if (!isPossibleNewConversationStream(eStream))
      eStream.respondError(new HttpError(ServerResponseCode.badRequest, 'bad index'))
    else startConversation(questionHandler, conversations.startConversation, eStream)
    return true
  }
}
