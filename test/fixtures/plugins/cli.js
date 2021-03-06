#!/usr/bin/env node
'use strict'

var start = require('../../..')
var config = require('../config')
var processor = require('../processor')

start(
  Object.assign({}, config, {
    cwd: __dirname,
    processor: processor
  })
)
