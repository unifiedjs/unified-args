#!/usr/bin/env node
import {args} from '../../../index.js'
import {config} from '../config.js'
import {processor} from '../processor.js'

args({...config, cwd: new URL('.', import.meta.url), processor})
