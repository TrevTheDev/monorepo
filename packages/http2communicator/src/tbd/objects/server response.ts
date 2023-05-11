import { Message, MessagePayload, MessageTypes } from './question'

import { createUid, didError, DidError, resultError, ResultError } from '@trevthedev/toolbelt'
import HttpError from '../stream/http error'
import { Conversation } from '../conversation db'
import { ServerResponseCode } from '../stream/server stream'

type Events = {
  onMessage?<S extends MessagePayload>(message: S, continues: boolean): void
  onError?<S extends MessagePayload>(message: S): void
}

type State =
  | 'responding'
  | 'conversing'
  | 'error'
  | 'endMessage'
  | 'forceEnd'
  | 'replied'
  | 'replyReceived'

const END_STATES = ['endMessage', 'forceEnd', 'error', 'replied', 'replyReceived']

// export type Response = ReturnType<typeof response>

type Converse = {
  say(json: MessagePayload): DidError<Error, boolean>
  error(code: number, message: string): false
  end(json: MessagePayload): DidError<Error, boolean>
}

export type Response = {
  reply(json: MessagePayload, onResponseReceived?: () => void): DidError<Error, boolean>
  converse(events?: Events): ResultError<Converse, Error>
  end(): DidError<Error, boolean>
  responseId: string
  questionId: string | undefined
}

export function response(
  conversation: Conversation,
  questionMessage: Message,
  onEnded: () => void,
) {
  const output = resultError<Response, HttpError>()

  let state: State = 'responding'

  const { messageHandlers, writer, error } = conversation

  const isEnded = () => END_STATES.includes(state)

  const endResponse = (finalState: 'endMessage' | 'error' | 'replyReceived' | 'forceEnd'): true => {
    if (!isEnded()) {
      state = finalState
      messageHandlers.delete(responseId)
      onEnded()
    }
    return true
  }

  const errorFn = (code: ServerResponseCode, msg: string): false => {
    if (!isEnded()) {
      endResponse('error')
      error(new HttpError(code, msg))
    }
    return false
  }
  const questionId = questionMessage.questionId as string
  if (!questionId) return output.error(new HttpError(418, 'no questionId'))
  const responseId = createUid()

  const write = (message: MessagePayload, type: MessageTypes) =>
    writer({ message, type, questionId, responseId })

  messageHandlers.add(
    (msg) => errorFn(418, `unhandled response message : ${msg.toString()} received`),
    responseId,
  )
  const isConversing = () => state === 'conversing'

  const resp: Response = {
    reply(json: MessagePayload, onResponseReceived?: () => void) {
      const output = didError<Error>()
      if (state !== 'responding' && state !== 'conversing')
        return output.error(
          new Error(`state is: '${state}' and it should be 'responding' or 'conversing'`),
        )
      messageHandlers.set(responseId, (msg: Message) => {
        if (msg.type !== 'replyReceived') return errorFn(418, 'unrecognised message type')
        if (state !== 'replied') return errorFn(418, 'wrong state')
        if (msg.questionId !== questionId) return errorFn(418, 'wrong questionId')
        endResponse('replyReceived')
        if (onResponseReceived) onResponseReceived()
      })
      state = 'replied'
      write(json, 'reply')
      return output()
    },
    converse(events?: Events) {
      const output = resultError<Converse, Error>()
      if (state !== 'responding')
        return output.error(new Error(`state is: ${state} and it should be 'responding'`))
      write({ responseId }, 'questionReceived')
      state = 'conversing'
      if (events) {
        messageHandlers.set(responseId, (msg: Message) => {
          if (!isConversing())
            return errorFn(
              ServerResponseCode.badRequest,
              'wrong state to handle a incoming message',
            )
          if (msg.questionId !== questionId)
            return errorFn(ServerResponseCode.badRequest, 'wrong questionId')
          switch (msg.type) {
            case 'continueMessage':
              if (!events.onMessage)
                return errorFn(ServerResponseCode.badRequest, `no 'onMessage' provided`)
              return events.onMessage(msg.message, true)
            case 'endMessage':
              endResponse('endMessage')
              if (!events.onMessage)
                return errorFn(ServerResponseCode.badRequest, `no 'onMessage' provided`)
              return events.onMessage(msg.message, false)
            case 'error':
              endResponse('error')
              if (!events.onError)
                return errorFn(ServerResponseCode.badRequest, `no 'onError' provided`)
              return events.onError(msg.message)
            default:
              return errorFn(418, 'unrecognised type')
          }
        })
      }

      return output({
        say(json: MessagePayload): DidError<Error, boolean> {
          const output = didError<Error>()
          if (!isConversing())
            return output.error(new Error(`state is: ${state} and it should be 'conversing'`))
          write(json, 'continueMessage')
          return output()
        },
        error(code: number, message: string) {
          return errorFn(code, message)
        },
        end(json: MessagePayload): DidError<Error, boolean> {
          const output = didError<Error>()
          if (!isConversing())
            return output.error(new Error(`state is: ${state} and it should be 'conversing'`))
          write(json, 'endMessage')
          endResponse('endMessage')
          return output()
        },
      })
    },
    end(): DidError<Error, boolean> {
      const output = didError<Error>()
      if (state !== 'responding')
        return output.error(new Error(`state is: ${state} and it should be 'conversing'`))
      endResponse('forceEnd')
      return output()
    },
    responseId,
    questionId,
  }

  return output(resp)
}

// export default class ServerResponse extends Response {
//   /**
//    * @param {ObjectStream} objectStream
//    * @param {object} questionJSON
//    * @returns {ServerResponse}
//    */
//   constructor(objectStream, questionJSON) {
//     super(objectStream, questionJSON)
//     this._speakers = []
//     this._listeners = []
//   }

//   /**
//    * replies to Question
//    * @param {Object} json
//    * @param {String} type
//    */
//   reply(json, type) {
//     if (this._speakers.length > 0) throw new Error('response still has open _speakers')
//     if (this._listeners.length > 0) throw new Error('response still has open listeners')
//     super.reply(json, type)
//   }

//   /**
//    * @param {String} speakerName
//    * @param {String} speakerType = SETTINGS.speakerTypeObject
//    * @param {Boolean} optional = false
//    * @returns {Speaker|Promise}
//    */
//   createSpeaker(speakerName, speakerType = MSG_TYPES.object, optional = false) {
//     const speaker = new Speaker(speakerType)
//     let successCb
//     const result = optional
//       ? speaker
//       : new Promise((success) => {
//           successCb = success
//         })

//     this.objectStream.stream.pushStream(
//       {
//         ':path': SETTINGS.listenerStreams,
//         'question-id': this.id,
//         'speaker-name': speakerName,
//         'speaker-type': speakerType,
//       },
//       (err, stream) => {
//         if (err) throw err
//         if (speakerType === MSG_TYPES.object) {
//           speaker._setStream(stream)
//           this._speakers.push(speaker)
//           speaker.once('ended', () => this._speakers.splice(this._speakers.indexOf(speaker), 1))
//           if (!optional) successCb(speaker)
//         } else if (speakerType === MSG_TYPES.raw) {
//           this._speakers.push(stream)
//           stream.once('finish', () => this._speakers.splice(this._speakers.indexOf(stream), 1))
//           if (!optional) successCb(stream)
//         } else throw new Error('unknown speaker type')
//       },
//     )
//     return result
//   }

//   /**
//    * @param {String} speakerName
//    * @param {String} speakerType = SETTINGS.speakerTypeObject
//    * @returns {ListenerPromise}
//    */
//   createListener(speakerName, speakerType = MSG_TYPES.object) {
//     return new ListenerPromise(this, speakerName, speakerType)
//   }
// }
