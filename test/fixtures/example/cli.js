#!/usr/bin/env node
'use strict'

var xtend = require('xtend')
var start = require('../../..')
var config = require('../config')
var processor = require('../processor')

start(xtend(config, {cwd: __dirname, processor: processor}))
