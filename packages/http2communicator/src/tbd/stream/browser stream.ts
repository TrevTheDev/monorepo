import { runFunctionsOnlyOnce } from '@trevthedev/toolbelt'
import createReader, { AwaitedReader } from './reader'
import createWriter, { Writer } from './writer'
import { FetchDuplex } from '../../../browser/duplex stream'

export default function browserStream(
  stream: FetchDuplex,
  streamErrorCb: (error: Error) => void,
  streamEndedCb: () => void,
) {
  let state: 'communicating' | 'error' | 'done' | 'cancel' = 'communicating'

  let writer: Writer | undefined
  let reader: AwaitedReader | undefined

  const toStreamEndState = runFunctionsOnlyOnce(null)(
    (endState: 'error' | 'done' | 'cancel' = 'done') => {
      state = endState
      if (writer && writer.state === 'writing') writer.cancel()
      if (reader && reader.state === 'reading') reader.cancel()
      stream.end()
      streamEndedCb()
    },
  )

  const streamErrorFn = runFunctionsOnlyOnce(null)((error: Error) => {
    toStreamEndState('error')
    streamErrorCb(error)
    return false
  })

  const browserStream = {
    stream: stream,
    writer: createWriter(stream, streamErrorFn, toStreamEndState),
    reader: createReader(stream, streamErrorFn),
    cancel: () => toStreamEndState('cancel'),
  }

  return browserStream
}
