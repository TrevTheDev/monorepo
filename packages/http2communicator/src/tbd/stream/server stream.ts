import { createUid, resultError, runFunctionsOnlyOnce } from '@trevthedev/toolbelt'
import { IncomingHttpHeaders, OutgoingHttpHeaders, ServerHttp2Stream } from 'http2'
import HttpError from './http error'
import { Message } from '../objects/question'
import createReader, { AwaitedReader, Reader } from './reader'
import createWriter, { Writer } from './writer'

// eslint-disable-next-line no-shadow
export enum ServerResponseCode {
  ok = 200,
  badRequest = 400,
  unauthorised = 401,
  notFound = 404,
  methodNotAllowed = 405,
  ImATeapot = 418,
  internalServerError = 500,
}

function isValidUid(uidHeader: string | string[] | undefined): uidHeader is string {
  if (typeof uidHeader !== 'string') return false
  return true
}

function validateIdx(uidHeader: string, idxHeader: string | string[] | undefined) {
  if (typeof idxHeader !== 'string') return undefined
  const idx = parseInt(idxHeader, 10)
  return idx
}

const createResponseHeaders = (
  defaultResponseHeaders: OutgoingHttpHeaders,
  headerOverrides: OutgoingHttpHeaders,
  status: number,
  uid: string | undefined,
  idx: number | undefined,
) => {
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

export type ServerStream = ReturnType<typeof serverStream>
export interface StartServerStream extends ServerStream {
  idx: 0
}

export default function serverStream(
  stream: ServerHttp2Stream,
  requestHeaders: IncomingHttpHeaders,
  defaultResponseHeaders: OutgoingHttpHeaders,
  streamErrorCb: (error: Error) => void,
  streamEndedCb: () => void,
) {
  let state: 'init' | 'communicating' | 'error' | 'done' | 'cancel' = 'init'

  let writer: Writer | undefined
  let reader: AwaitedReader | undefined

  const toStreamEndState = runFunctionsOnlyOnce(null)(
    (endState: 'error' | 'done' | 'cancel' = 'done') => {
      state = endState
      if (writer && writer.state === 'writing') writer.cancel()
      if (reader && reader.state === 'reading') reader.cancel()
      stream.end(undefined, stream.close)
      streamEndedCb()
    },
  )

  const streamErrorFn = runFunctionsOnlyOnce(null)((error: Error) => {
    toStreamEndState('error')
    streamErrorCb(error)
    return false
  })

  let uid = isValidUid(requestHeaders['http2-duplex-id'])
    ? requestHeaders['http2-duplex-id']
    : undefined

  const idx = uid === undefined ? undefined : validateIdx(uid, requestHeaders['http2-duplex-idx'])

  const serverStream = {
    stream,
    requestHeaders,
    method: requestHeaders[':method'],
    idx,
    endRequested: requestHeaders['http2-duplex-end'] === 'true',
    session: stream.session as unknown as ServerHttp2Stream,

    get uid() {
      return uid
    },

    respond(
      code: ServerResponseCode = ServerResponseCode.ok,
      headerOverrides: OutgoingHttpHeaders = {},
    ) {
      if (state !== 'init')
        throw new Error('already responded on eStream steam - unable to respond twice')
      state = 'communicating'
      const responseHeaders = createResponseHeaders(
        defaultResponseHeaders,
        headerOverrides,
        code,
        serverStream.uid,
        serverStream.idx,
      )
      stream.respond(responseHeaders)
      writer = createWriter(stream, streamErrorFn, toStreamEndState)
      return writer
    },

    respondConversation(doneCb: () => void) {
      const output = resultError<{ uid: string; writer: Writer }, HttpError>()
      uid = createUid()
      if (serverStream.idx !== 0)
        return output.error(new HttpError(ServerResponseCode.badRequest, 'invalid idx'))
      const writer = serverStream.respond()
      writer.writeRaw('a') // firefox requires a body to resolve fetch promise
      stream.once('close', doneCb)
      return output({ uid, writer })
    },

    respondEnd(code: ServerResponseCode = ServerResponseCode.ok, msg?: Message) {
      const writer = serverStream.respond(code)
      if (msg) writer.write(msg)
      writer.end()
    },

    respondError(httpError: HttpError) {
      const writer = serverStream.respond(httpError.statusCode)
      writer.write(httpError.toJSON())
      writer.end()
      return false
    },

    read(onData: (data: string) => void, onError: (error: HttpError) => void, onEnd: () => void) {
      reader = createReader(stream, streamErrorFn)(onData, onError, onEnd)
      return reader as AwaitedReader
    },
  }

  return serverStream
}
