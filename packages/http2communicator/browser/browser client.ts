/* eslint-env browser */
import connectToServer from './duplex stream'
import type { Events, MessagePayload } from './tbd/objects/question'
import browserQuestions from '../src/tbd/readers to objects/browser questions'

const defaultSettings = {
  serverAddress: 'https://192.168.1.70:8443',
  browserStreams: 'browserStreams',
}

export default function connection(settings?: Partial<typeof defaultSettings>) {
  const set = { ...defaultSettings, ...settings }

  return async (json: MessagePayload, events: Events) => {
    let connected = false
    const stream = await connectToServer(
      `${set.serverAddress}/${set.browserStreams}`,
      undefined,
      undefined,
      (error: unknown) => {
        connected = false
        throw error
      },
    )
    connected = true
    stream.once('end', () => {
      debugger
      connected = false
    })

    const question = browserQuestions()
    // if (once) throw new Error('only one question can be instantiated.
    // Either ask sub questions or create more connections')
    // once = true
    if (!connected) throw new Error('connection already closed')
    return question(stream, json, events)
  }
}
