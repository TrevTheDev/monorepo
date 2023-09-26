// // import type stream from 'stream'
// import { runFunctionsOnlyOnce } from '@trevthedev/toolbelt'
// import type stream from 'stream'
// import Stream from 'stream-browserify'

// const Duplex = Stream.Duplex

// type StreamUid = string

// class FetchDuplex extends Duplex {
//   readonly #fetchOptions: RequestInit

//   readonly #url: string

//   readonly #reader: ReadableStreamDefaultReader<Uint8Array>

//   #streamUid: StreamUid

//   #idx = 0

//   #reading = false

//   #first = true

//   #state: 'init' | 'first' | 'connected' | 'error' | 'done' = 'init'

//   readonly #errorFn: (error: Error) => void

//   constructor(
//     url: string,
//     reader: ReadableStreamDefaultReader<Uint8Array>,
//     streamUid: StreamUid,
//     fetchOptions: RequestInit = {},
//     duplexOptions: stream.DuplexOptions,
//     errorCb: (error: Error) => void,
//   ) {
//     super(duplexOptions)
//     this.#fetchOptions = fetchOptions
//     this.#reader = reader
//     this.#streamUid = streamUid
//     this.#url = url
//     this.#errorFn = runFunctionsOnlyOnce()((error: Error) => {
//       debugger
//       errorCb(error)
//     })

//     this.on('end', () => {
//       debugger
//     })

//     this.on('finish', () => {
//       debugger
//     })

//     this.on('close', () => {
//       debugger
//     })
//   }

//   _read(): void {
//     if (this.#reading) return
//     this.#reading = true
//     ;(async () => {
//       try {
//         let done = false
//         do {
//           // eslint-disable-next-line no-await-in-loop
//           const { value, done: done_ } = await this.#reader.read()
//           done = done_
//           if (done) this.push(null)
//           else if (value === undefined) this.push(null)
//           else if (this.#first) {
//             // Sometimes fetch waits for first byte before resolving
//             // so comms server-side sends initial dummy byte
//             this.#first = false
//             const data = new TextDecoder('utf-8').decode(Buffer.from(value.subarray(1)))
//             done = !this.push(data)
//           } else done = !this.push(new TextDecoder('utf-8').decode(Buffer.from(value)))
//         } while (!done)
//         this.#reading = false
//         debugger
//       } catch (error) {
//         console.log(`error duplex stream _read ${error}`)
//         if (error instanceof Error) return this.#errorFn(error)
//         throw error
//       }
//     })()
//   }

//   _write(
//     chunk: Iterable<number>,
//     encoding: BufferEncoding,
//     callback: (error?: Error | null) => void,
//   ): void {
//     this.fetch({}, chunk, (error) => {
//       callback(error)
//     })
//   }

//   fetch(
//     additionalRequestInit: Partial<RequestInit>,
//     data: Iterable<number>,
//     errorCb: (error: Error) => void,
//     doneCb?: () => void,
//     readerCb?: (readableStream: ReadableStream<Uint8Array>) => void,
//   ) {
//     const requestInit: RequestInit = {
//       method: 'POST',
//       cache: 'no-store',
//       headers: {},
//       body: Uint8Array.from(data),
//       ...this.#fetchOptions,
//       ...additionalRequestInit,
//     }
//     const idx = this.#idx
//     this.#idx += 1
//     requestInit.headers = {
//       'Content-Type': 'application/octet-stream',
//       ...requestInit.headers,
//       'http2-duplex-id': this.#streamUid,
//       'http2-duplex-idx': this.#idx.toString(),
//     }
//     fetch(this.#url, requestInit)
//       .then((response) => {
//         if (!response.ok) return errorCb(new Error('error fetching data'))
//         const rIdx = response.headers.get('http2-duplex-idx')
//         if (!rIdx) return errorCb(new Error('header not to requirements'))
//         if (parseInt(rIdx) !== idx) return errorCb(new Error('header not in sequence'))
//         const rId = response.headers.get('http2-duplex-id')
//         if (!rId) return errorCb(new Error('header not to requirements'))
//         if (rId !== this.#streamUid) return errorCb(new Error('header id incorrect'))
//         if (readerCb) {
//           if (!response.body) return errorCb(new Error('no body received'))
//           readerCb(response.body)
//         }
//         if (doneCb) doneCb()
//       })
//       .catch((e) => errorCb(e))
//   }

//   /**
//    * @param {Function} callBack
//    */
//   // _final(callBack) {
//   //   try {
//   //     // if (this.writer) {
//   //     //   await this.writer.ready
//   //     //   await this.writer.close()
//   //     // } else {
//   //     // { headers: { 'http2-duplex-end': 'true' } }
//   //     // const str = JSON.stringify({ type: 'done' })
//   //     // let ascii = ''
//   //     // for (let i = 3; i >= 0; i -= 1)
//   //     //   // eslint-disable-next-line no-bitwise
//   //     //   ascii += String.fromCharCode((str.length >> (8 * i)) & 255)
//   //     // const send = ascii + str
//   //     // const response = await this._fetch({ body: send })
//   //     // if (!response.ok) throw new Error(JSON.stringify(response))
//   //     //
//   //     // await response.arrayBuffer()
//   //     debugger
//   //     callBack()
//   //     // }
//   //   } catch (error) {
//   //     callBack(error)
//   //   }
//   // }
// }

// const connectToServer = async (
//   url: string,
//   fetchOptions: RequestInit = {},
//   duplexOptions: stream.DuplexOptions = {},
//   errorCb: (error: unknown) => void,
// ): Promise<FetchDuplex> => {
//   const response = await fetch(url, { ...fetchOptions, cache: 'no-store' })
//   if (!response.ok) throw new Error(response.statusText) // @TODO: test
//   if (response.body === null) throw new Error('no body returned from server')
//   if (response.headers === null) throw new Error('no headers returned from server')
//   const id = response.headers.get('http2-duplex-id')
//   if (id === null) throw new Error(`no 'http2-duplex-id' found in header`)
//   return new FetchDuplex(url, response.body.getReader(), id, fetchOptions, duplexOptions, errorCb)
// }

// export type { FetchDuplex }
// export default connectToServer
