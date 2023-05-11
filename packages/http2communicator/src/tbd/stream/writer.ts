import { runFunctionsOnlyOnce } from '@trevthedev/toolbelt'

import { Message } from '../objects/question'

const NUMBER_OF_BYTES = 4

const toBytesInt32 = (num: number): string => {
  let ascii = ''
  for (let i = NUMBER_OF_BYTES - 1; i >= 0; i -= 1)
    ascii += String.fromCharCode((num >> (8 * i)) & 255)

  return ascii
}

export type Writer = {
  readonly state: 'writing' | 'error' | 'done' | 'cancel'
  (msgObject: Message): boolean | void
  cancel(): void
  error(error: Error): void
  end(): void
  writeRaw(msgString: string): boolean | void
  write(msgObject: Message): boolean | void
}

export default function createWriter(
  stream: {
    write(
      chunk: any,
      encoding?: BufferEncoding | undefined,
      cb?: ((error: Error | null | undefined) => void) | undefined,
    ): boolean
  },
  errorFn: (error: Error) => void,
  endRequested: () => void,
) {
  let state: 'writing' | 'error' | 'done' | 'cancel' = 'writing'

  const toEndState = runFunctionsOnlyOnce(null)(
    (endState: 'error' | 'done' | 'cancel' = 'done') => {
      state = endState
      if (state === 'done') endRequested()
    },
  )

  const writeErrorFn = runFunctionsOnlyOnce(null)((error: Error) => {
    toEndState('error')
    errorFn(error)
    return false
  })

  const writer = function Writer(msgObject: Message) {
    const str = JSON.stringify(msgObject)
    return writer.writeRaw(toBytesInt32(str.length).concat(str))
  } as unknown as Writer

  Object.defineProperties(writer, {
    state: {
      get() {
        return state
      },
    },
    cancel: {
      value: () => {
        toEndState('cancel')
      },
    },
    error: {
      value: (error: Error) => {
        writeErrorFn(error)
      },
    },
    end: {
      value: () => {
        toEndState()
      },
    },
    writeRaw: {
      value: (msgString: string) => {
        if (state !== 'writing') return false
        stream.write(msgString)
        return true
      },
    },
    write: {
      value: (msgObject: Message) => {
        const str = JSON.stringify(msgObject)
        return writer.writeRaw(toBytesInt32(str.length).concat(str))
      },
    },
  })
  return writer
}
