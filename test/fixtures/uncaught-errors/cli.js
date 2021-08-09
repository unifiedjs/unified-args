#!/usr/bin/env node
import path from 'node:path'
import {args} from '../../../index.js'
import {processor} from '../processor.js'
import {config} from '../config.js'

args(
  Object.assign({}, config, {
    cwd: path.join('test', 'fixtures', 'uncaught-errors'),
    processor: processor()
  })
)
