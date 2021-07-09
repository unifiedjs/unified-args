#!/usr/bin/env node
import path from 'path'
import {args} from '../../../index.js'
import {processor} from '../processor.js'
import {config} from '../config.js'

args(
  Object.assign({}, config, {
    cwd: path.join('test', 'fixtures', 'settings'),
    processor: processor().use(logger)
  })
)

function logger() {
  console.log(JSON.stringify(this.data('settings')))
}
