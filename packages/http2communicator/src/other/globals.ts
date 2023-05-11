interface SettingsBase {
  readonly browserStreams: string
  readonly listenerStreams: string
}

export interface BrowserSettings extends SettingsBase {
  readonly serverAddress: string
}

let BROWSER_SETTINGS: BrowserSettings

// eslint-disable-next-line no-shadow
enum MSG_TYPES {
  /** new question */
  question = 'question',
  /** reply to a question */
  reply = 'reply',
  /** default message type */
  message = 'message',
  /** answer was cancelled */
  cancelled = 'cancelled',
  /** an error occurred answering question */
  error = 'error',
  /** TBD */
  listening = 'listening',
  /** TBD */
  object = 'object',
  /** TBD */
  raw = 'raw',
}

export { BROWSER_SETTINGS, MSG_TYPES }
