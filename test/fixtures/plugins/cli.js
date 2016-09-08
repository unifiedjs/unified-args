#!/usr/bin/env node
/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module foo
 * @fileoverview The plugin foo compiler!
 */

'use strict';

/* Dependencies */
var extend = require('xtend');
var start = require('../../..');
var config = require('../config');
var processor = require('../processor');

start(extend(config, {
  cwd: __dirname,
  processor: processor
}));
