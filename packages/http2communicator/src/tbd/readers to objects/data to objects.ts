import { bufferAwaitCalls } from '../tools/buffer await calls'

const NUMBER_OF_BYTES = 4

function fromBytesInt32(numString: string) {
  let result = 0
  for (let i = NUMBER_OF_BYTES - 1; i >= 0; i -= 1)
    result += numString.charCodeAt(NUMBER_OF_BYTES - 1 - i) << (8 * i)
  return result
}

type DataToObjects = {
  addData(dataToAdd: string): void
  awaitObject(nextObjectCb: (object: Record<string, unknown>) => void, noDataCb?: () => void): void
  cancel(): void
}

export function dataToObjects(): DataToObjects {
  let data: string = ''
  let nextObjectCb_: ((object: Record<string, unknown>) => void) | undefined
  let noDataCb_: (() => void) | undefined
  let awaitState: 'idle' | 'beforeAwaitCb' | 'afterAwaitCb' | 'cancelled' = 'idle'
  let dataState: 'noData' | 'data' = 'noData'
  let readyForNextAwaitFn: (() => void) | undefined
  const noDateFn = () => {
    dataState = 'noData'
    if (noDataCb_) noDataCb_()
  }
  const searchForNextObject = () => {
    if (awaitState === 'beforeAwaitCb' && dataState === 'data') {
      if (data.length > 3) {
        awaitState = 'afterAwaitCb'
        const length = fromBytesInt32(data.substring(0, NUMBER_OF_BYTES))
        if (length <= data.length - NUMBER_OF_BYTES) {
          const cb = nextObjectCb_ as (object: Record<string, unknown>) => void
          nextObjectCb_ = undefined
          noDataCb_ = undefined
          const obj = JSON.parse(data.slice(NUMBER_OF_BYTES, length + NUMBER_OF_BYTES))
          data = data.slice(length + NUMBER_OF_BYTES)
          cb(obj)
          awaitState = 'idle'
          const getNextAwaitFn = readyForNextAwaitFn as () => void
          readyForNextAwaitFn = undefined
          getNextAwaitFn()
        } else noDateFn()
      } else noDateFn()
    }
  }

  const awaitObject = bufferAwaitCalls(
    (
      nextObjectCb: (object: Record<string, unknown>) => void,
      readyForNextAwait: () => void,
      onNoData?: () => void,
    ) => {
      if (awaitState === 'cancelled') throw new Error('cannot await after cancel')
      if (awaitState !== 'idle') throw new Error('incorrect state')
      awaitState = 'beforeAwaitCb'
      nextObjectCb_ = nextObjectCb
      noDataCb_ = onNoData
      readyForNextAwaitFn = readyForNextAwait
      searchForNextObject()
    },
  )

  return {
    addData(dataToAdd: string) {
      if (awaitState !== 'cancelled') {
        dataState = 'data'
        data = data + dataToAdd
        searchForNextObject()
      }
    },
    awaitObject,
    cancel() {
      awaitState = 'cancelled'
      dataState = 'noData'
      data = ''
      nextObjectCb_ = undefined
      noDataCb_ = undefined
    },
  }
}
