// import * as devcert from 'devcert'

import fs from 'node:fs'

import { createSecureServer, Http2SecureServer } from 'http2'
import type { OutgoingHttpHeaders, SecureServerSessionOptions } from 'http2'
import { logServer } from './other/http2 logging'
import { trackServer } from './other/http2 tracking'
import router, { RoutesDb } from './router'

import fileServer from './file server'

import { Response } from './tbd/objects/server response'
import { serverConversationRouter } from './tbd/server conversation router'

// const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultSettings = {
  serverPort: 8443,
  serverHostName: '0.0.0.0',
  serverAddress: 'https://192.168.1.70:8443',
  http2ConnectionOptions: {
    rejectUnauthorized: false,
    enablePush: true,
  } as Partial<SecureServerSessionOptions & { enablePush: boolean }>,
  browserStreams: '/browserStreams',
  nodeStreams: '/nodeStreams',
  serveFilesFrom: `${process.cwd()}/dist`,
  defaultResponseHeaders: {
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': 86400,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'http2-duplex-id, http2-duplex-idx',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/ecmascript',
    'Cache-Control': 'max-age=0, no-cache, must-revalidate, proxy-revalidate',
  } as OutgoingHttpHeaders,
  log: 'verbose' as 'yes' | 'verbose' | 'all',
}

interface ServerSettings extends Exclude<typeof defaultSettings, 'serverAddress'> {
  http2Server?: Http2SecureServer
}

type PartialSettings = Partial<ServerSettings>

export type QuestionHandler = (response: Response) => void

export default function startServer(
  questionHandler: QuestionHandler,
  serverUpCb: (
    server: Http2SecureServer,
    gracefulShutdown: (shutdownDone?: () => void) => void,
  ) => void,
  settings: PartialSettings = {},
) {
  const finalSettings: ServerSettings = {
    ...defaultSettings,
    ...settings,
    defaultResponseHeaders: {
      ...defaultSettings.defaultResponseHeaders,
      ...settings.defaultResponseHeaders,
    },
    http2ConnectionOptions: {
      ...defaultSettings.http2ConnectionOptions,
      ...settings.http2ConnectionOptions,
    },
  }

  // const onServer = (server: Server) => {
  //   const handleObjectStreams = (objectStream: ObjectStream) => {
  //     objectStream.on('object', (object: CommsObject) => {
  //       const { type, questionId } = object
  //       if (objectStream.promiseDb[questionId])
  //         objectStream.promiseDb[questionId]._handleMessage(object)
  //       else if (type === 'question') questionHandler(new ServerResponse(objectStream, object))
  //       else if (type === 'done') objectStream.end()
  //       else throw new Error('unknown object')
  //     })
  //   }

  const routes: RoutesDb = []

  const conversationRouter = serverConversationRouter(
    finalSettings.defaultResponseHeaders,
    questionHandler,
  )

  if (finalSettings.browserStreams)
    routes.push([new RegExp(finalSettings.browserStreams), conversationRouter])

  if (finalSettings.nodeStreams)
    routes.push([new RegExp(finalSettings.nodeStreams), conversationRouter])

  if (finalSettings.serveFilesFrom) {
    const fServer = fileServer(finalSettings.defaultResponseHeaders, finalSettings.serveFilesFrom)
    routes.push([/.*/, fServer])
  } else {
    routes.push([
      /.*/,
      (stream) => {
        stream.respond({ ':status': 404, 'Cache-Control': 'no-cache' })
        return false
      },
    ])
  }

  ;(async () => {
    const http2Server = !finalSettings.http2Server
      ? createSecureServer({
          key: fs.readFileSync('dev-certificates/localhost-privkey.pem'),
          cert: fs.readFileSync('dev-certificates/localhost-cert.pem'),
        })
      : finalSettings.http2Server

    router(http2Server, routes)
    logServer(http2Server, 'server', finalSettings.log)
    const shutdown = trackServer(http2Server)
    http2Server.listen(finalSettings.serverPort, finalSettings.serverHostName)
    console.log(`listening on https://${finalSettings.serverHostName}:${finalSettings.serverPort}`)
    serverUpCb(http2Server, shutdown)
  })()
}

// class ServerNode extends EventEmitter {
//   http2Server: Http2SecureServer

//   gracefulShutdown?: (doneCb: () => void) => void

//   _router: Router

//   constructor(userQuestionHandler: ServerAnswerFn, http2Server?: Http2SecureServer) {
//     super()
//     this.http2Server = http2Server

//     logServer(this.http2Server, 'server', SETTINGS.log)
//     trackServer(<CommsServer>(<unknown>this))

//     const handleObjectStreams = (objectStream) => {
//       objectStream.on('object', async (object) => {
//         const { type, questionId } = object
//         if (objectStream.promiseDb[questionId])
//           objectStream.promiseDb[questionId]._handleMessage(object)
//         else if (type === 'question')
//           this.emit('question', new ServerResponse(objectStream, object))
//         else if (type === 'done') objectStream.end()
//         else throw new Error('unknown object')
//       })
//       // objectStream.on('end', () => this.emit('done'))
//     }

//     const duplexServer = new DuplexServer()
//     duplexServer.on('duplex', (duplex) => {
//       handleObjectStreams(new ObjectStream(duplex))
//     })

//     const browserConversationFn: StreamHandler = serverStreamsRouter(userQuestionHandler)
//     /**
//      * @param {module:http2.ServerHttp2Stream} stream
//      * @param {module:http2.IncomingHttpHeaders} headers
//      * @returns {boolean}
//      */
//     const handleBrowserStreams = (stream, headers /* , flags, rawHeaders */) => {
//       browserConversationFn(stream, headers)
//       return true
//     }

//     const handleNodeStreams = (stream /* , headers, flags, rawHeaders */) => {
//       stream.respond({
//         ':status': 200,
//         'content-type': 'application/json; charset=utf-8',
//       })
//       handleObjectStreams(new ObjectStream(stream))
//       return true
//     }

//     const handleListeners = (stream, headers /* , flags, rawHeaders */) => {
//       listeners[headers['listener-id']].resolve(stream)
//       return true
//     }
//     const routes = []

//     if (SETTINGS.browserStreams)
//       routes.push([new RegExp(SETTINGS.browserStreams), handleBrowserStreams])

//     if (SETTINGS.nodeStreams) routes.push([new RegExp(SETTINGS.nodeStreams), handleNodeStreams])

//     if (SETTINGS.listenerStreams)
//       routes.push([new RegExp(SETTINGS.listenerStreams), handleListeners])

//     if (SETTINGS.serveFilesFrom) routes.push([/.*/, FileServer])
//     else {
//       routes.push([
//         /.*/,
//         (stream) => {
//           stream.respond({ ':status': 404, 'Cache-Control': 'no-cache' })
//         },
//       ])
//     }

//     this._router = new Router(this.http2Server, routes)
//   }

//   shutdown(cb?: () => void): void {
//     if (this.gracefulShutdown) this.gracefulShutdown(cb)
//     else this.http2Server.close(cb)
//   }
// }

// const startServer = (
//   userQuestionHandler: ServerAnswerFn,
//   settings?: Record<string, unknown>,
//   http2Server?: Http2SecureServer,
// ): Promise<ServerNode> => {
//   setDefaultSettings(settings, false)
//   return new Promise<ServerNode>((resolve) => {
//     ;(async () => {
//       if (!http2Server) {
//         const ssl = await devcert.certificateFor('LOCALHOST')
//         http2Server = createSecureServer({
//           key: ssl.key,
//           cert: ssl.cert,
//         })
//         http2Server.listen(SETTINGS.serverPort, SETTINGS.serverHostName)
//         console.log(`listening on https://${SETTINGS.serverHostName}:${SETTINGS.serverPort}`)
//       }

//       resolve(new ServerNode(userQuestionHandler, http2Server))
//     })()
//   })
// }

// export type { ServerNode }

// export default startServer

// (async () => {
//   const serverNode = await (new ServerNode(undefined,
//   { serverHostName: '0.0.0.0', serverPort: 8443 }))
//
//   serverNode.on('question', async (serverResponse) => {
//     console.log(`SERVER: LOG STEP 1: ${JSON.stringify(serverResponse.json)}`)
//     // handles any messages sent by client of type 'message' to this serverResponse
//     serverResponse.on('message', (msg) => console.log(`SERVER: LOG STEP 4:
//     ${JSON.stringify(msg)}`))
//     // sends 'hello' JSON message to client's question
//     serverResponse.say({ first: 'your', name: 'please', step: 2 }, 'hello')
//     // asks a question of client's question
//     const question = serverResponse.ask({
//       do: 'you', like: 'your', name: ['yes', 'no'], step: 3,
//     })
//     // handles any messages sent by client of type 'message' to this question
//     question.on('message', (msg) => {
//       console.log(`SERVER: LOG STEP 5: ${JSON.stringify(msg)}`)
//       question.say({ and: 'I', say: 'more', step: 6 }, 'more')
//     })
//     // waits for client to respond to question
//     console.log(`SERVER: LOG STEP 7: ${JSON.stringify(await question)}`)
//
//     // establishes a new stream from client to comms server (opposite of Push Stream)
//     // streams can also stream objects - known as Speaker
//     const incomingStream = await serverResponse.createListener('uploadFile', 'raw')
//     incomingStream.pipe(process.stdout)
//
//     // stream file to client - Push Stream
//     // streams can also stream objects - known as Speaker
//     const fileSpeaker = await serverResponse.createSpeaker('downloadFile', 'raw')
//     fs.createReadStream('./package.json').pipe(fileSpeaker)
//
//     // after file has been streamed, reply to the original question
//     fileSpeaker.on('finish', () => serverResponse.reply({ my: 'name', is: 'server' }))
//   })
//
//   // gracefully shuts down the server
//   await serverNode.gracefulShutdown()
// })()
