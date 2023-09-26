/**
 * An error that can be sent via Http stream
 */
import { Message } from '../types'
import { ServerResponseCode } from './server stream'
import { Writer } from './writer'

class HttpError extends Error {
  statusCode: number

  override readonly name = 'HttpError'

  constructor(
    msg: string,
    statusCode: ServerResponseCode = ServerResponseCode.internalServerError,
  ) {
    super(msg)
    this.statusCode = statusCode
  }

  toJSON(): Message {
    return {
      type: 'error' as const,
      message: {
        code: this.statusCode,
        error: this.message,
      },
    } as unknown as Message
  }

  send(stream: Writer) {
    stream.write(this.toJSON())
  }
}

export function standardiseError(e: unknown | HttpError): HttpError {
  if (e instanceof HttpError) return e
  return new HttpError(`${e}`)
}

export type HttpErrorJson = ReturnType<InstanceType<typeof HttpError>['toJSON']>

export default HttpError
