import { ObjectWrappedWithStateMachine, addStateMachine } from '@trevthedev/toolbelt'
import { Message, SharedEvents, SharedIFace } from '../types'
import HttpError from './http error'

const NUMBER_OF_BYTES = 4

const toBytesInt32 = (num: number): string => {
  let ascii = ''
  for (let i = NUMBER_OF_BYTES - 1; i >= 0; i -= 1)
    // eslint-disable-next-line no-bitwise
    ascii += String.fromCharCode((num >> (8 * i)) & 255)

  return ascii
}

export interface Writer
  extends ObjectWrappedWithStateMachine<
    SharedIFace,
    'cancelled' | 'errored' | 'ended',
    'writing' | 'cancelled' | 'errored' | 'ended'
  > {
  writeRaw(msgString: string): boolean | void
  write(msgObject: Message): boolean | void
  writeEnd(msgObject: Message): boolean | void
  readonly isEnded: boolean
}

const activeStates = ['writing'] as 'writing'[]

export default function createWriter(
  stream: {
    write(
      chunk: string,
      encoding?: BufferEncoding | undefined,
      cb?: ((error: Error | null | undefined) => void) | undefined,
    ): boolean
  },
  events: SharedEvents,
): Writer {
  const writer = addStateMachine({
    baseObject: {
      writeRaw(msgString: string): void {
        stream.write(msgString)
      },
      write(msgObject: Message): void {
        const str = JSON.stringify(msgObject)
        return writer.writeRaw(toBytesInt32(str.length).concat(str))
      },
      writeEnd(msgObject: Message): void {
        writer.write(msgObject)
        writer.end()
      },
      end(): void {
        writer.toState('ended')
        events.onDone()
      },
      cancel(reason: unknown): void {
        writer.toState('cancelled')
        events.onCancel(reason)
      },
      error(error: HttpError): void {
        writer.toState('errored')
        events.onError(error)
      },
      get isEnded(): boolean {
        return !activeStates.includes(writer.state as unknown as 'writing')
      },
    },
    transitions: [['writing', ['cancelled', 'errored', 'ended']]],
    beforeCallGuards: [
      ['writeRaw', activeStates],
      ['write', activeStates],
      // ['end', activeStates],
      // ['cancel', activeStates],
      // ['error', activeStates],
    ],
  })

  return writer
}
