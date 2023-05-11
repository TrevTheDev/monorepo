// https://github.com/ramlmn/serv/blob/master/lib/static-serv.js
import path from 'path'
import fsPromises from 'fs/promises'
import fresh from 'fresh'
import mime from 'mime'
import { IncomingHttpHeaders, OutgoingHttpHeaders, ServerHttp2Stream } from 'http2'

// import etag from 'etag'
// import parseRange from 'range-parser'

// simple parser, base is required for constructor
const parseUrl = (s: string) => new URL(s, 'http://192.168.1.70')

// some globals
// const encoding = 'utf-8'

// const staticCache = 'public, max-age=31536000'

/**
 * Check if this is a conditional GET request
 *
 * @param {Object} requestHeader
 * @return {Boolean}
 */
const isConditionalGet = (requestHeader: IncomingHttpHeaders) =>
  requestHeader['if-match'] ||
  requestHeader['if-unmodified-since'] ||
  requestHeader['if-none-match'] ||
  requestHeader['if-modified-since']

/**
 * Parse a HTTP token list
 */
function parseTokenList(str: string) {
  let end = 0
  const list = []
  let start = 0

  for (let i = 0, len = str.length; i < len; i += 1) {
    switch (str.charCodeAt(i)) {
      case 0x20 /*   */:
        if (start === end) {
          end = i + 1
          start = end
        }

        break
      case 0x2c /* , */:
        list.push(str.substring(start, end))
        end = i + 1
        start = end
        break
      default:
        end = i + 1
        break
    }
  }

  list.push(str.substring(start, end))
  return list
}

/**
 * Parse an HTTP Date into a number
 */
function parseHttpDate(date: string) {
  const timestamp = date && Date.parse(date)
  return typeof timestamp === 'number' ? timestamp : NaN
}

/**
 * Check if the request preconditions failed
 */
function isPreconditionFailure(
  requestHeader: IncomingHttpHeaders,
  responseHeader: OutgoingHttpHeaders,
) {
  // if-match
  const ifMatch = responseHeader['if-match']
  if (ifMatch && typeof ifMatch === 'string') {
    const eTag = responseHeader.ETag
    return (
      !eTag ||
      (ifMatch !== '*' &&
        parseTokenList(ifMatch).every(
          (match) => match !== eTag && match !== `W/${eTag}` && `W/${match}` !== eTag,
        ))
    )
  }

  // if-unmodified-since
  if (requestHeader['if-unmodified-since']) {
    const unmodifiedSince = parseHttpDate(requestHeader['if-unmodified-since'])
    if (!Number.isNaN(unmodifiedSince)) {
      if (responseHeader['Last-Modified'] && typeof responseHeader['Last-Modified'] === 'string') {
        const lastModified = parseHttpDate(responseHeader['Last-Modified'])
        return Number.isNaN(lastModified) || lastModified > unmodifiedSince
      }
    }
  }

  return false
}

/**
 * http GET precondition fail check
 */
function preFail(requestHeader: IncomingHttpHeaders, responseHeader: OutgoingHttpHeaders) {
  return isConditionalGet(requestHeader) && isPreconditionFailure(requestHeader, responseHeader)
}

/**
 * Check if the cache is fresh.
 */
function isFresh(requestHeader: IncomingHttpHeaders, responseHeader: OutgoingHttpHeaders) {
  return fresh(requestHeader, {
    etag: responseHeader.ETag,
    'last-modified': responseHeader['Last-Modified'],
  })
}
/**
 * Returns a middleware for serving static files
 */
export default function fileServer(
  defaultResponseHeaders: OutgoingHttpHeaders,
  serveFilesFrom: string,
) {
  return function (
    stream: ServerHttp2Stream,
    requestHeader: IncomingHttpHeaders,
    _flags: number,
    _rawHeaders: Array<unknown>,
  ) {
    const sendCode = (status: number, message = '', resHeaders = { ...defaultResponseHeaders }) => {
      stream.respond({ ...resHeaders, ':status': status, 'Cache-Control': 'no-cache' })
      stream.end(message)
    }

    ;(async () => {
      if (!requestHeader[':path']) return sendCode(304, 'missing path header')
      const pathname = decodeURIComponent(parseUrl(requestHeader[':path']).pathname)

      // serve static files
      let filePath = path.join(serveFilesFrom, pathname)

      try {
        const stats = await fsPromises.stat(filePath)
        if (stats.isDirectory()) filePath = path.join(filePath, 'index.html')
        // stats = await fsPromises.stat(filePath)

        // send the requested file
        const responseHeader: OutgoingHttpHeaders = {
          ...defaultResponseHeaders,
          // ETag: etag(stats),
          // 'Last-Modified': stats.mtime,
          // 'Content-Length': stats.size,
          'Content-Type': `${mime.getType(filePath)}; charset=utf-8`,
          'Cache-Control': 'max-age=0, no-cache, must-revalidate, proxy-revalidate',
          // 'Cache-Control': staticCache,
        }
        // not-modified
        if (isFresh(requestHeader, responseHeader)) return sendCode(304, '', responseHeader)
        // preFail on conditional GET
        if (preFail(requestHeader, responseHeader)) return sendCode(412, '', responseHeader)
        if (requestHeader[':method'] === 'HEAD') return sendCode(200, '', responseHeader)

        // const streamOpts = {}

        // if (requestHeader.range && stats.size) {
        //   const range = parseRange(stats.size, requestHeader.range)
        //
        //   if (typeof range === 'object' && range.type === 'bytes') {
        //     const { start, end } = range[0]
        //     streamOpts.start = start
        //     streamOpts.end = end
        //     responseHeader[':status'] = 206 // Partial Content
        //   } else {
        //     requestHeader['Content-Range'] = `bytes */${stats.size}`
        //     responseHeader[':status'] = 416 // Requested Range Not Satisfiable
        //   }
        // }

        // if (streamOpts.start !== undefined && streamOpts.end !== undefined) {
        //   responseHeader['Content-Range']
        //   = `bytes ${streamOpts.start}-${streamOpts.end}/${stats.size}`
        //   responseHeader['Content-Length'] = streamOpts.end - streamOpts.start + 1
        // }

        // remove empty headers
        Object.keys(responseHeader).forEach((k) => responseHeader[k] || delete responseHeader[k])

        responseHeader[':status'] = responseHeader[':status'] || 200
        stream.respondWithFile(filePath, responseHeader)
      } catch (err) {
        console.log(err)
        sendCode(500, '500 Internal Error')
      }
    })()
    return true
  }
}
