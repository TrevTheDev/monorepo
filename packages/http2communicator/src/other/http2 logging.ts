import type { Http2Server, Http2Session, ServerHttp2Stream } from 'http2'

let streamId = 0

const trackedStreams = new Set()

interface LoggedStream extends ServerHttp2Stream {
  logId: number
}

export function logStream(
  stream: LoggedStream,
  headersToLog: Record<string, string>,
  tag: string,
  log: 'yes' | 'verbose' | 'all',
) {
  if (stream.logId) {
    console.log('two many times ')
    return
  }
  streamId += 1
  stream.logId = streamId
  trackedStreams.add(streamId)
  if (!['yes', 'verbose', 'all'].includes(log)) return
  const extra = headersToLog ? ` ${headersToLog[':method']}=>${headersToLog[':path']}` : ''
  console.log(`${tag} stream ${stream.logId}${extra}`)

  if (!['verbose', 'all'].includes(log)) return
  stream.on('aborted', () => console.log(`${tag} stream ${stream.logId} aborted`))
  stream.on('close', () => {
    trackedStreams.delete(stream.logId)
    const streamStats =
      trackedStreams.size === 0
        ? ' - *ALL CLOSED*'
        : `- open streams: ${Array.from(trackedStreams)}`
    console.log(`${tag} stream ${stream.logId} closed ${streamStats}`)
  })
  stream.on('error', (error) => console.log(`${tag} stream ${stream.logId} errored: ${error}`))
  stream.on('frameError', (type: string, code: string, id: string) =>
    console.log(`${tag} stream ${stream.logId} frameErrored: ${type} : ${code} : ${id}`),
  )
  stream.on('timeout', () => console.log(`${tag} stream ${stream.logId} timedOut`))
  stream.on('trailers', (headers, flags) =>
    console.log(`${tag} stream ${stream.logId} trailered: ${JSON.stringify(headers)} : ${flags}`),
  )
  stream.on('wantTrailers', () => console.log(`${tag} stream ${stream.logId} wanted trailers`))

  stream.on('drain', () => console.log(`${tag} stream ${stream.logId} drained`))
  stream.on('finish', () => console.log(`${tag} stream ${stream.logId} finished`))
  stream.on('pipe', (/* sourceReadableStream */) =>
    console.log(`${tag} stream ${stream.logId} piped`))
  stream.on('unpipe', (/* sourceReadableStream */) =>
    console.log(`${tag} stream ${stream.logId} unpiped`))
  stream.on('end', () => console.log(`${tag} stream ${stream.logId} ended`))
  stream.on('pause', () => console.log(`${tag} stream ${stream.logId} paused`))
  // stream.on(`readable`, () => console.log(`${tag} stream readable`))
  stream.on('resume', () => console.log(`${tag} stream ${stream.logId} resumed`))
  stream.on('continue', () => console.log(`${tag} stream ${stream.logId} continued`))
  stream.on('headers', (headers, flags) =>
    console.log(`${tag} stream ${stream.logId} headered: ${JSON.stringify(headers)} : ${flags}`),
  )
  stream.on('push', (headers, flags) =>
    console.log(`${tag} stream ${stream.logId} pushed: ${JSON.stringify(headers)} : ${flags}`),
  )
  stream.on('response', (headers, flags) =>
    console.log(`${tag} stream ${stream.logId} responded: ${JSON.stringify(headers)} : ${flags}`),
  )

  if (!['all'].includes(log)) return
  stream.on('data', (chunk) => console.log(`${tag} received data ${stream.logId}: ${chunk}`))
}

let sessionId = 0

interface LoggedSession extends Http2Session {
  logId: number
}

export function logSession(session: LoggedSession, tag: string, log: 'yes' | 'verbose' | 'all') {
  if (session.logId) {
    console.log('two many times ')
    return
  }
  sessionId += 1
  session.logId = sessionId
  if (!['yes', 'verbose', 'all'].includes(log)) return
  // console.log(`${tag} session ${session.logId}`)
  session.on('stream', (stream, headers /* , flags, rawHeaders */) =>
    logStream(stream, headers, `${tag} session ${session.logId}`, log),
  )

  if (!['verbose', 'all'].includes(log)) return
  session.on('close', () => console.log(`${tag} session ${session.logId} closed`))
  session.on('connect', (http2Session /* , socket */) =>
    console.log(`${tag} session ${http2Session.logId} connect`),
  )
  session.on('error', (error) => console.log(`${tag} session ${session.logId} errored: ${error}`))
  session.on('frameError', (type, code, id) =>
    console.log(`${tag} session ${session.logId} frameErrored: ${type}:${code}:${id}`),
  )
  session.on('goaway', (errorCode, lastStreamID, opaqueData) =>
    console.log(
      `${tag} session ${session.logId} goAwayed: ${errorCode}:${lastStreamID}:${opaqueData}`,
    ),
  )
  session.on('ping', (payload: string) =>
    console.log(`${tag} session ${session.logId} pinged: ${payload}`),
  )
  session.on('timeout', () => console.log(`${tag} session ${session.logId} timedOut`))

  // session.on(`localSettings`, (settings) =>
  //   console.log(`${tag} session localSettings: ${JSON.stringify(settings)}`)
  // )
  // session.on(`remoteSettings`, (settings) =>
  //   console.log(`${tag} session remoteSettings: ${JSON.stringify(settings)}`)
  // )
}

export function logServer(server: Http2Server, tag = 'server', log: 'yes' | 'verbose' | 'all') {
  if (!['yes', 'verbose', 'all'].includes(log)) return
  server.on('request', (request /* , response */) => {
    console.log(
      `${tag} requested: ${new Date().toLocaleString()}: BY: ${
        request.socket.remoteAddress
      }: ${tag} requested: ${request.headers[':method']}=>${request.headers[':path']}`,
    )
  })
  server.on('session', (session: LoggedSession) => logSession(session, tag, log))

  if (!['verbose', 'all'].includes(log)) return
  server.on('checkContinue', (/* request, response */) => console.log(`${tag} checkContinued`))
  server.on('request', (request, response) => {
    request.on('aborted', () => console.log(`${tag} request aborted`))
    request.on('close', () => console.log(`${tag} request closed`))
    response.on('close', () => console.log(`${tag} response closed`))
    response.on('finish', () => console.log(`${tag} response finished`))
  })
  server.on('sessionError', () => console.log(`${tag} sessionErrored`))
  // server.on('stream', (stream, headers, flags) => console.log(`${tag} streamed`))
  server.on('timeout', () => console.log(`${tag} timedOut`))

  server.on('unknownProtocol', () => console.log(`${tag} unknownProtocol`))

  server.on('close', () => console.log(`${tag} closed`))
  server.on('connection', (/* socket */) => console.log(`${tag} connectioned`))
  server.on('error', (error) => console.log(`${tag} errored: ${error}`))
  server.on('listening', () => console.log(`${tag} listening`))
}
