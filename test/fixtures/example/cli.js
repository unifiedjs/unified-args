#!/usr/bin/env node
/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module foo
 * @fileoverview The foo compiler!
 */

'use strict';

/* eslint-env node */

/* Dependencies */
var extend = require('xtend')
var start = require('../../..');
var config = require('../config')
var processor = require('../processor')

start(extend(config, {
    /* Hidden feature, for tests. */
    'cwd': __dirname,
    'processor': processor
}));
