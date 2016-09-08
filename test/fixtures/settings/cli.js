#!/usr/bin/env node
/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module foo
 * @fileoverview The setting foo compiler!
 */

'use strict';

/* Dependencies */
var extend = require('xtend');
var start = require('../../..');
var config = require('../config');
var processor = require('../processor');

start(extend(config, {
  cwd: __dirname,
  processor: processor().use(function (processor) {
    var Parser = processor.Parser;
    var Compiler = processor.Compiler;

    processor.Parser = function (file, settings) {
      console.log(JSON.stringify(settings));
      this.value = file.toString();
    };

    processor.Compiler = function (file, settings) {
      console.log(JSON.stringify(settings));
    };

    processor.Parser.prototype.parse = Parser.prototype.parse;
    processor.Compiler.prototype.compile = Compiler.prototype.compile;
  })
}));
