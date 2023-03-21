const Mocha = require('mocha')
const path = require('path')
const fs = require('fs')
const _ = require('underscore')

const testsDir = path.resolve(__dirname, 'tests')

function normalizeAdapter(adapter) {
  if (!adapter.resolved) {
    adapter.resolved = function (value) {
      const d = adapter.deferred()
      d.resolve(value)
      return d.promise
    }
  }

  if (!adapter.rejected) {
    adapter.rejected = function (reason) {
      const d = adapter.deferred()
      d.reject(reason)
      return d.promise
    }
  }
}

module.exports = function (adapter, mochaOpts, cb) {
  if (typeof mochaOpts === 'function') {
    cb = mochaOpts
    mochaOpts = {}
  }
  if (typeof cb !== 'function')
    cb = function () { }

  normalizeAdapter(adapter)
  mochaOpts = _.defaults(mochaOpts, { timeout: 200, slow: Infinity })

  fs.readdir(testsDir, (err, testFileNames) => {
    if (err) {
      cb(err)
      return
    }

    const mocha = new Mocha(mochaOpts)
    testFileNames.forEach((testFileName) => {
      if (path.extname(testFileName) === '.js') {
        const testFilePath = path.resolve(testsDir, testFileName)
        mocha.addFile(testFilePath)
      }
    })

    global.adapter = adapter
    mocha.run((failures) => {
      delete global.adapter
      if (failures > 0) {
        const err = new Error(`Test suite failed with ${failures} failures.`)
        err.failures = failures
        cb(err)
      } else
        cb(null)
    })
  })
}

module.exports.mocha = function (adapter) {
  normalizeAdapter(adapter)

  global.adapter = adapter

  require('./testFiles')

  delete global.adapter
}
