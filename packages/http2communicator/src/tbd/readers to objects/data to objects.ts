import { addStateMachine, asyncFunctionLinkedList } from '@trevthedev/toolbelt'
import type { ObjectWrappedWithStateMachine } from '@trevthedev/toolbelt'
import HttpError from '../stream/http error'
import { SharedEvents, SharedIFace } from '../types'

const NUMBER_OF_BYTES = 4

function fromBytesInt32(numString: string) {
  let result = 0
  for (let i = NUMBER_OF_BYTES - 1; i >= 0; i -= 1)
    // eslint-disable-next-line no-bitwise
    result += numString.charCodeAt(NUMBER_OF_BYTES - 1 - i) << (8 * i)
  return result
}

export interface AwaitObjectEvents extends SharedEvents {
  onNoData: () => void
}

export interface BaseDataToObjects extends SharedIFace {
  addData(dataToAdd: string): void
  awaitObject(
    nextObjectCb: (object: Record<string, unknown>) => void,
    awaitObjectEvents: AwaitObjectEvents,
  ): void
  readonly isEnded: boolean
}

export type DataToObjects = ObjectWrappedWithStateMachine<
  ObjectWrappedWithStateMachine<
    BaseDataToObjects,
    'idle' | 'beforeAwaitCb' | 'afterAwaitCb' | 'ended' | 'cancelled' | 'errored',
    'idle' | 'beforeAwaitCb' | 'afterAwaitCb' | 'ended' | 'cancelled' | 'errored',
    'awaitState',
    'setAwaitState'
  >,
  'noData' | 'data',
  'noData' | 'data',
  'dataState',
  'setDataState'
>

export default function dataToObjects(): DataToObjects {
  let data = ''
  let dataObj: DataToObjects
  let onNextObjectCb: ((object: Record<string, unknown>) => void) | undefined
  let onNoDataCb: (() => void) | undefined
  let onDoneCb: (() => void) | undefined
  let onErrorCb: ((error: HttpError) => void) | undefined
  let onCancelCb: ((reason: unknown) => void) | undefined
  let readyForNextAwaitFn: (() => void) | undefined

  const awaitLinkList = asyncFunctionLinkedList()

  function noDataFn() {
    dataObj.setDataState('noData')
    if (onNoDataCb) onNoDataCb()
  }

  function searchForNextObject() {
    if (dataObj.awaitState === 'beforeAwaitCb' && dataObj.dataState === 'data') {
      if (data.length > 3) {
        dataObj.setAwaitState('afterAwaitCb')
        const length = fromBytesInt32(data.substring(0, NUMBER_OF_BYTES))
        if (length <= data.length - NUMBER_OF_BYTES) {
          const cb = onNextObjectCb as (object: Record<string, unknown>) => void
          onNextObjectCb = undefined
          onNoDataCb = undefined
          const obj = JSON.parse(data.slice(NUMBER_OF_BYTES, length + NUMBER_OF_BYTES))
          data = data.slice(length + NUMBER_OF_BYTES)
          cb(obj)
          dataObj.setAwaitState('idle')
          const getNextAwaitFn = readyForNextAwaitFn as () => void
          readyForNextAwaitFn = undefined
          getNextAwaitFn()
        } else noDataFn()
      } else noDataFn()
    }
  }

  const activeStates = ['idle', 'beforeAwaitCb', 'afterAwaitCb'] as (
    | 'idle'
    | 'beforeAwaitCb'
    | 'afterAwaitCb'
  )[]

  const dataObject = addStateMachine({
    baseObject: {
      addData(dataToAdd: string) {
        dataObj.setDataState('data')
        data += dataToAdd
        searchForNextObject()
      },
      awaitObject(
        nextObjectCb: (object: Record<string, unknown>) => void,
        events: AwaitObjectEvents,
      ) {
        awaitLinkList((doneCb) => {
          onNoDataCb = events.onNoData
          onErrorCb = events.onError
          onCancelCb = events.onCancel
          onDoneCb = events.onDone
          if (dataObject.isEnded) dataObj.error(new HttpError('cannot await after end'))
          else if (dataObj.awaitState !== 'idle') dataObj.error(new HttpError('incorrect state'))
          else {
            dataObj.setAwaitState('beforeAwaitCb')
            onNextObjectCb = nextObjectCb
            readyForNextAwaitFn = doneCb
            searchForNextObject()
          }
        })
      },
      cancel(reason: unknown): void {
        dataObject.setAwaitState('cancelled')
        if (onCancelCb) onCancelCb(reason)
        else throw reason
      },
      error(error: HttpError): void {
        dataObject.setAwaitState('errored')
        if (onErrorCb) onErrorCb(error)
        else throw error
      },
      end(): void {
        if (dataObj.dataState !== 'noData') throw new Error('dataToObjects still contains data')
        dataObject.setAwaitState('ended')
        if (onDoneCb) onDoneCb()
      },
      get isEnded(): boolean {
        return ['cancelled', 'errored', 'ended'].includes(dataObject.awaitState)
      },
    },
    transitions: [
      ['idle', ['beforeAwaitCb', 'afterAwaitCb', 'ended', 'cancelled', 'errored']],
      ['beforeAwaitCb', ['afterAwaitCb', 'ended', 'cancelled', 'errored']],
      ['afterAwaitCb', ['idle', 'ended', 'cancelled', 'errored']],
    ],
    beforeCallGuards: [
      ['addData', activeStates],
      ['awaitObject', activeStates],
      ['end', activeStates],
      ['cancel', activeStates],
      ['error', activeStates],
    ],
    stateGetterKey: 'awaitState',
    toStateKey: 'setAwaitState',
  })
  dataObj = addStateMachine({
    baseObject: dataObject,
    transitions: [
      ['noData', ['data']],
      ['data', ['data', 'noData']],
    ],
    stateGetterKey: 'dataState',
    toStateKey: 'setDataState',
  })
  return dataObj
}
