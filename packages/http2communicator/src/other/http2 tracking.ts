import { EnhancedMap, enhancedMap } from '@trevthedev/toolbelt'
import type { Http2Server, ServerHttp2Session, ServerHttp2Stream } from 'http2'

export function trackServer(server: Http2Server) {
  const trackedSessions = enhancedMap<[ServerHttp2Session, EnhancedMap<ServerHttp2Stream>]>()
  server.on('session', (session: ServerHttp2Session) => {
    const trackedStreams = enhancedMap<ServerHttp2Stream>()
    const removeSession = trackedSessions.add([session, trackedStreams])
    session.once('close', removeSession)
    session.on('stream', (stream: ServerHttp2Stream) => {
      const removeStream = trackedStreams.add(stream)
      stream.once('close', removeStream)
    })
  })

  let streamCount = 0

  return (cb?: () => void) => {
    ;(async () => {
      console.log(`graceful forced shutdown started: ${trackedSessions.size} sessions active`)
      await Promise.all(
        trackedSessions.map(([session, trackedStreams]) => {
          streamCount += trackedStreams.size
          return new Promise((resolveSession) => {
            ;(async () => {
              await Promise.all(
                trackedStreams.map(
                  (stream) =>
                    new Promise((resolve) => {
                      if (stream.closed) resolve(undefined)
                      else stream.close(undefined, () => resolve(undefined))
                    }),
                ),
              )
              session.close(() => resolveSession(undefined))
            })()
          })
        }),
      )

      server.close(() => {
        console.log(`gracefulShutdown done: ${streamCount} streams closed`)
        if (cb) cb()
      })
    })()
  }
}
