import EventEmitter from 'events'
import http2 from 'http2'
import ObjectStream from './conversation/object stream.js'
import { logStream, logSession } from './other/http2 logging.js'
import { Question } from './conversation/question.js'
import { SETTINGS, MSG_TYPES, setDefaultSettings } from './other/globals.js'

/** @private */
class NodeClient extends EventEmitter {
  /**
   * @param {SETTINGS} settings
   * @returns {NodeClient}
   */
  constructor(settings) {
    super()
    setDefaultSettings(settings, false)
    this.session = http2.connect(SETTINGS.serverAddress, SETTINGS.http2ConnectionOptions)
    logSession(this.session, 'client', SETTINGS.log)

    this.stream = this.session.request({
      ':method': 'POST',
      ':path': SETTINGS.nodeStreams,
      'content-type': 'application/json',
    })

    logStream(this.stream, 'client', SETTINGS.log)

    this.objectStream = new ObjectStream(this.stream, this)

    this.on('object', async (object) => {
      const { questionId, originalQuestionId } = object
      if (this.objectStream.promiseDb[originalQuestionId])
        this.objectStream.promiseDb[originalQuestionId]._handleMessage(object)
      else if (this.objectStream.promiseDb[questionId])
        this.objectStream.promiseDb[questionId]._handleMessage(object)
      // else if (object.type === 'done')
      //   console.log('done')
      else throw new Error('unknown object')
    })

    this.session.on('stream', (pushedStream, requestHeaders) => {
      pushedStream.on('push', () => {
        const question = this.objectStream.promiseDb[requestHeaders['question-id']]
        if (question) {
          if (requestHeaders['speaker-type'] === MSG_TYPES.raw)
            question.emit(requestHeaders['speaker-name'], pushedStream)
          else {
            const oStream = new ObjectStream(pushedStream)
            oStream.headers = requestHeaders
            question.emit(requestHeaders['speaker-name'], oStream)
          }
        } else
          pushedStream.close(http2.constants.NGHTTP2_REFUSED_STREAM)
      })
    })

    this.stream.once('finish', () => {})
  }

  /**
   * @param {Object} json
   * @returns {Question}
   */
  ask(json) { return new Question(this.objectStream, json) }

  /**
   * @returns {Promise}
   */
  end() {
    return new Promise((resolve) => {
      this.once('end', () => {
        this.stream.close(undefined, () => {
          this.session.close(() => resolve())
        })
      })
      this.objectStream.end({ type: 'done' })
    })
  }
}

export default NodeClient
