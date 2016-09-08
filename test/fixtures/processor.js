/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module foo
 * @fileoverview The foo compiler!
 */

'use strict';

var unified = require('unified');

module.exports = unified()
  .use(function (processor) {
    processor.Parser = Parser;
    Parser.prototype.parse = parse;

    function Parser(file) {
      this.value = String(file);
    }

    function parse() {
      return {type: 'text', value: this.value};
    }
  })
  .use(function (processor) {
    processor.Compiler = Compiler;
    Compiler.prototype.compile = compile;

    function Compiler() {}

    function compile(tree) {
      return tree.value;
    }
  })
  .abstract();
