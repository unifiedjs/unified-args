#!/usr/bin/env node
'use strict'

/* eslint-disable import/no-extraneous-dependencies */
var xtend = require('xtend')
/* eslint-enable import/no-extraneous-dependencies */

var start = require('../../..')
var config = require('../config')
var processor = require('../processor')

start(
  xtend(config, {
    cwd: __dirname,
    processor: processor
  })
)
