import { vi, describe, it, expect, Mock } from 'vitest'
import type { Http2Stream } from 'http2'
import Stream from 'stream'

import http2 from 'node:http2'
import fs from 'node:fs'

import { streamsToObjects } from '../browser/tbd/streamsToObjects'

const NUMBER_OF_BYTES = 4

const toBytesInt32 = (num: number) => {
  let ascii = ''
  for (let i = NUMBER_OF_BYTES - 1; i >= 0; i -= 1)
    ascii += String.fromCharCode((num >> (8 * i)) & 255)

  return ascii
}

describe('streamsToObjects', () => {
  it('streamsToObjects', () =>
    new Promise((done) => {
      debugger
      const str = JSON.stringify({ hello: 'world' })
      const obj = toBytesInt32(str.length) + str

      const sToObjects = streamsToObjects()
      const stream = Stream.Duplex.from(obj + obj)
      sToObjects.addStream(
        stream as unknown as Http2Stream,
        0,
        () => {
          console.log('done')
        },
        () => {
          console.log('error')
        },
      )
      const cancel = sToObjects.await((obj) => {
        debugger
        console.log(obj)
        sToObjects.await((obj) => {
          debugger
          console.log(obj)
          done(undefined)
        })
      })

      //   stream.push(obj)
      //   stream.end(obj)
    }))

  it.only(
    'srver',
    () =>
      new Promise((done) => {
        const server = http2.createSecureServer({
          key: fs.readFileSync('dev certificate/localhost-privkey.pem'),
          cert: fs.readFileSync('dev certificate/localhost-cert.pem'),
        })
        server.on('error', (err) => console.error(err))

        server.on('stream', (stream, headers) => {
          debugger
          const sToObjects = streamsToObjects()

          sToObjects.addStream(
            stream,
            0,
            () => {
              debugger
              stream.respond({
                'content-type': 'text/html; charset=utf-8',
                ':status': 200,
              })
              stream.end('<h1>Hello World</h1>')
              console.log('done')
            },
            () => {
              console.log('error')
            },
          )

          const cancel = sToObjects.await((obj) => {
            debugger
            console.log(obj)
            sToObjects.await((obj) => {
              debugger
              console.log(obj)

              //   stream.respond({
              //     'content-type': 'text/html; charset=utf-8',
              //     ':status': 200,
              //   })

              //   stream.end('<h1>Hello World</h1>')
            })
          })
        })

        server.listen(8443)

        const client = http2.connect('https://localhost:8443', {
          ca: fs.readFileSync('dev certificate/localhost-cert.pem'),
        })
        client.on('error', (err) => console.error(err))

        const str = JSON.stringify({ hello: 'world' })
        const obj = toBytesInt32(str.length) + str
        debugger
        const options = {
          [http2.constants.HTTP2_HEADER_PATH]: '/',
          [http2.constants.HTTP2_HEADER_METHOD]: 'POST',
          [http2.constants.HTTP2_HEADER_CONTENT_TYPE]: 'application/json',
          [http2.constants.HTTP2_HEADER_CONTENT_LENGTH]: Buffer.byteLength(obj + obj),
        }
        const req = client.request(options)
        req.write(obj)
        req.write(obj)
        req.end()
        //   setTimeout(() => {

        //   }, 500)
        req.on('response', (headers, flags) => {
          for (const name in headers) {
            //   debugger
            console.log(`${name}: ${headers[name]}`)
          }
        })

        req.setEncoding('utf8')
        let data = ''
        req.on('data', (chunk) => {
          data += chunk
        })
        req.on('end', () => {
          debugger
          console.log(`\n${data}`)
          client.close()
          done(undefined)
        })
        req.end()
      }),
    50000,
  )
})
