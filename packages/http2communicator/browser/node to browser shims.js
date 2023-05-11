/**
 * required by esbuild to shim in Node variables
 */
import { Buffer } from 'buffer/'
import global from 'global'
import process from 'process'

export { global, process, Buffer }
