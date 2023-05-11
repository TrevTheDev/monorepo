/**
 * An error that can be sent via Http stream
 */

import { ServerResponseCode } from './server stream'
import { Writer } from './writer'

class HttpError extends Error {
  statusCode: number

  readonly name = 'HttpError'

  constructor(statusCode: ServerResponseCode, msg: string) {
    super(msg)
    this.statusCode = statusCode
  }

  toJSON() {
    return {
      type: 'error' as const,
      message: {
        code: this.statusCode,
        error: this.message,
      },
    }
  }

  send(stream: Writer) {
    stream.write(this.toJSON())
  }
}

export function standardiseError(e: unknown | HttpError) {
  if (e instanceof HttpError) {
    return e
  } else {
    return new HttpError(500, `${e}`)
  }
}

export type HttpErrorJson = ReturnType<InstanceType<typeof HttpError>['toJSON']>

export default HttpError
