#!/usr/bin/env node
'use strict'

var start = require('../../../index.js')
var config = require('../config.json')
var processor = require('../processor.js')

start(
  Object.assign({}, config, {
    cwd: __dirname,
    processor: processor().use(logger)
  })
)

function logger() {
  console.log(JSON.stringify(this.data('settings')))
}
