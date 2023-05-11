"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const stream_1 = __importDefault(require("stream"));
const node_http2_1 = __importDefault(require("node:http2"));
const node_fs_1 = __importDefault(require("node:fs"));
const streamsToObjects_1 = require("../src/tbd/streamsToObjects");
const NUMBER_OF_BYTES = 4;
const toBytesInt32 = (num) => {
    let ascii = '';
    for (let i = NUMBER_OF_BYTES - 1; i >= 0; i -= 1)
        ascii += String.fromCharCode((num >> (8 * i)) & 255);
    return ascii;
};
(0, vitest_1.describe)('streamsToObjects', () => {
    (0, vitest_1.it)('streamsToObjects', () => new Promise((done) => {
        debugger;
        const str = JSON.stringify({ hello: 'world' });
        const obj = toBytesInt32(str.length) + str;
        const sToObjects = (0, streamsToObjects_1.streamsToObjects)();
        const stream = stream_1.default.Duplex.from(obj + obj);
        sToObjects.addStream(stream, 0, () => {
            console.log('done');
        }, () => {
            console.log('error');
        });
        const cancel = sToObjects.await((obj) => {
            debugger;
            console.log(obj);
            sToObjects.await((obj) => {
                debugger;
                console.log(obj);
                done(undefined);
            });
        });
        //   stream.push(obj)
        //   stream.end(obj)
    }));
    vitest_1.it.only('srver', () => new Promise((done) => {
        const server = node_http2_1.default.createSecureServer({
            key: node_fs_1.default.readFileSync('dev certificate/localhost-privkey.pem'),
            cert: node_fs_1.default.readFileSync('dev certificate/localhost-cert.pem'),
        });
        server.on('error', (err) => console.error(err));
        server.on('stream', (stream, headers) => {
            debugger;
            const sToObjects = (0, streamsToObjects_1.streamsToObjects)();
            sToObjects.addStream(stream, 0, () => {
                debugger;
                stream.respond({
                    'content-type': 'text/html; charset=utf-8',
                    ':status': 200,
                });
                stream.end('<h1>Hello World</h1>');
                console.log('done');
            }, () => {
                console.log('error');
            });
            const cancel = sToObjects.await((obj) => {
                debugger;
                console.log(obj);
                sToObjects.await((obj) => {
                    debugger;
                    console.log(obj);
                    //   stream.respond({
                    //     'content-type': 'text/html; charset=utf-8',
                    //     ':status': 200,
                    //   })
                    //   stream.end('<h1>Hello World</h1>')
                });
            });
        });
        server.listen(8443);
        const client = node_http2_1.default.connect('https://localhost:8443', {
            ca: node_fs_1.default.readFileSync('dev certificate/localhost-cert.pem'),
        });
        client.on('error', (err) => console.error(err));
        const str = JSON.stringify({ hello: 'world' });
        const obj = toBytesInt32(str.length) + str;
        debugger;
        const options = {
            [node_http2_1.default.constants.HTTP2_HEADER_PATH]: '/',
            [node_http2_1.default.constants.HTTP2_HEADER_METHOD]: 'POST',
            [node_http2_1.default.constants.HTTP2_HEADER_CONTENT_TYPE]: 'application/json',
            [node_http2_1.default.constants.HTTP2_HEADER_CONTENT_LENGTH]: Buffer.byteLength(obj + obj),
        };
        const req = client.request(options);
        req.write(obj);
        req.write(obj);
        req.end();
        //   setTimeout(() => {
        //   }, 500)
        req.on('response', (headers, flags) => {
            for (const name in headers) {
                //   debugger
                console.log(`${name}: ${headers[name]}`);
            }
        });
        req.setEncoding('utf8');
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            debugger;
            console.log(`\n${data}`);
            client.close();
            done(undefined);
        });
        req.end();
    }), 50000);
});
