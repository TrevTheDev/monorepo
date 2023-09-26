import { createUid, runFunctionsOnlyOnce } from '@trevthedev/toolbelt'
import { OutgoingHttpHeaders, ServerHttp2Stream } from 'http2'
import HttpError from './http error'

import createReader, { ReaderController, ReaderEvents } from './reader'
import createWriter, { Writer } from './writer'
import { FirstHeaderSchema, HeaderSchema, SharedEvents } from '../types'
import { ConversationId } from '../conversation db'

export enum ServerResponseCode {
  ok = 200,
  badRequest = 400,
  unauthorised = 401,
  notFound = 404,
  methodNotAllowed = 405,
  ImATeapot = 418,
  internalServerError = 500,
}

// function isValidUid(uidHeader: string | string[] | undefined): uidHeader is string {
//   if (typeof uidHeader !== 'string') return false
//   return true
// }

// function validateIdx(uidHeader: string, idxHeader: string | string[] | undefined) {
//   if (typeof idxHeader !== 'string') return undefined
//   const idx = parseInt(idxHeader, 10)
//   return idx
// }

function createResponseHeaders(
  defaultResponseHeaders: OutgoingHttpHeaders,
  headerOverrides: OutgoingHttpHeaders,
  status: number,
  uid: ConversationId | undefined,
  idx: number | undefined,
) {
  const headers: OutgoingHttpHeaders = {
    ...defaultResponseHeaders,
    'Content-Type': 'text/plain; charset=UTF-8',
    ...headerOverrides,
    ':status': status,
  }
  if (uid) headers['http2-duplex-id'] = uid
  if (idx) headers['http2-duplex-idx'] = idx
  return headers
}

export type ServerStreamN = {
  readonly session: ServerHttp2Stream
  readonly stream: ServerHttp2Stream
  readonly requestHeaders: HeaderSchema
  readonly method: string
  readonly idx: number
  readonly uid: ConversationId
  readonly endRequested: boolean
  respond(
    writerEvents: SharedEvents,
    code?: ServerResponseCode | undefined,
    headerOverrides?: OutgoingHttpHeaders | undefined,
  ): Writer
  respondError(httpError: HttpError, headerOverrides?: OutgoingHttpHeaders | undefined): void
  respondEnd(headerOverrides?: OutgoingHttpHeaders | undefined): void
  respondCancel(reason: unknown, headerOverrides?: OutgoingHttpHeaders | undefined): void
  read(readerEvents: ReaderEvents): ReaderController
}

export function serverStreamN(
  stream: ServerHttp2Stream,
  requestHeaders: HeaderSchema,
  defaultResponseHeaders: OutgoingHttpHeaders,
): ServerStreamN {
  const once = runFunctionsOnlyOnce()

  const serverStreamObj = {
    get stream() {
      return stream
    },
    get requestHeaders() {
      return requestHeaders
    },
    get method() {
      return requestHeaders[':method'] as string
    },
    get idx() {
      return requestHeaders['http2-duplex-idx']
    },
    get uid() {
      return requestHeaders['http2-duplex-id']
    },
    get endRequested() {
      return requestHeaders['http2-duplex-end'] === 'true'
    },
    get session() {
      return stream.session as unknown as ServerHttp2Stream
    },

    respond: once(
      (
        writerEvents: SharedEvents,
        code: ServerResponseCode = ServerResponseCode.ok,
        headerOverrides: OutgoingHttpHeaders = {},
      ): Writer => {
        const responseHeaders = createResponseHeaders(
          defaultResponseHeaders,
          headerOverrides,
          code,
          serverStreamObj.uid,
          serverStreamObj.idx,
        )
        stream.respond(responseHeaders)
        const writer = createWriter(stream, writerEvents)

        function cleanUp() {
          stream.removeListener('finished', finished)
          stream.removeListener('aborted', error)
          stream.removeListener('error', error)
          stream.removeListener('timeout', error)
          stream.removeListener('close', close)
        }

        function finished() {
          cleanUp()
        }

        function error() {
          if (writer.state === 'writing') writer.error(new HttpError('stream errored'))

          cleanUp()
        }

        function close() {
          cleanUp()
        }

        stream.once('finished', finished)
        // The 'aborted' event is emitted whenever a Http2Stream instance is abnormally aborted in mid-communication.
        stream.once('aborted', error)
        // The 'error' event is emitted when an error occurs during the processing of an Http2Stream.
        stream.once('error', error)
        // The 'close' event is emitted when the Http2Stream is destroyed. Once this event is emitted, the Http2Stream instance is no longer usable.
        stream.once('close', close)
        // The 'timeout' event is emitted after no activity is received for this Http2Stream within the number of milliseconds set using http2stream.setTimeout()
        stream.once('timeout', error)

        return writer
      },
    ),

    respondError: once((httpError: HttpError, headerOverrides: OutgoingHttpHeaders = {}): void => {
      stream.respond(
        createResponseHeaders(
          defaultResponseHeaders,
          headerOverrides,
          httpError.statusCode,
          serverStreamObj.uid,
          serverStreamObj.idx,
        ),
      )
      stream.write(httpError.toJSON())
      stream.end()
    }),

    respondCancel: once((reason: unknown, headerOverrides: OutgoingHttpHeaders = {}): void => {
      stream.respond(
        createResponseHeaders(
          defaultResponseHeaders,
          headerOverrides,
          ServerResponseCode.ok,
          serverStreamObj.uid,
          serverStreamObj.idx,
        ),
      )
      stream.write(reason)
      stream.end()
    }),

    respondEnd: once((headerOverrides: OutgoingHttpHeaders = {}): void => {
      stream.respond(
        createResponseHeaders(
          defaultResponseHeaders,
          headerOverrides,
          ServerResponseCode.ok,
          serverStreamObj.uid,
          serverStreamObj.idx,
        ),
      )
      stream.end()
    }),

    read: runFunctionsOnlyOnce()(
      (readerEvents: ReaderEvents): ReaderController => createReader(serverStreamObj)(readerEvents),
    ),
  }

  return serverStreamObj
}

// export type ServerStream0 = {
//   readonly uid: ConversationId
//   read(readerEvents: ReaderEvents): ReaderController
//   respondError(httpError: HttpError, headerOverrides?: OutgoingHttpHeaders | undefined): void
//   respondConversation(writerEvents: SharedEvents): Writer
// }
export interface ServerStream0 extends ServerStreamN {
  readonly idx: 0
  respondConversation(writerEvents: SharedEvents): Writer
}

export function serverStream0(
  stream: ServerHttp2Stream,
  requestHeaders: FirstHeaderSchema,
  defaultResponseHeaders: OutgoingHttpHeaders,
): ServerStream0 {
  const uid = createUid() as ConversationId

  const serverStreamS = serverStreamN(
    stream,
    { ...requestHeaders, 'http2-duplex-id': uid },
    defaultResponseHeaders,
  )
  let writer: Writer | undefined

  const once = runFunctionsOnlyOnce()

  Object.defineProperties(serverStreamS, {
    uid: {
      get() {
        return uid
      },
    },
    respondConversation: {
      value: once((writerEvents: SharedEvents) => {
        writer = serverStreamS.respond(writerEvents)
        writer.writeRaw('a') // firefox requires a body to resolve fetch promise
        return writer
      }),
    },
    respondEnd: {
      value: once(() => undefined),
    },
    respondError: {
      value: once((httpError: HttpError) => {
        if (writer && !writer.isEnded) {
          writer.write(httpError.toJSON())
          writer.end()
        }
      }),
    },
    respondCancel: {
      value: once((reason: unknown, _headerOverrides: OutgoingHttpHeaders = {}) => {
        if (writer && !writer.isEnded) {
          writer.writeRaw(String(reason))
          writer.end()
        }
      }),
    },
  })

  return serverStreamS as ServerStream0
}
