#!/usr/bin/env node
import path from 'node:path'
import {args} from '../../../index.js'
import {config} from '../config.js'
import {processor} from '../processor.js'

// Note: the `path` usage is intentional: we want to make sure file paths in `string` form work too.
args({...config, cwd: path.join('test', 'fixtures', 'example'), processor})
