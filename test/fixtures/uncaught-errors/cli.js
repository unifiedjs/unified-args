#!/usr/bin/env node
'use strict'

var start = require('../../../index.js')
var processor = require('../processor.js')
var config = require('../config.json')

start(
  Object.assign({}, config, {
    cwd: __dirname,
    processor: processor
  })
)
