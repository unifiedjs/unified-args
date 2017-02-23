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
  .use(function () {
    this.Parser = parser;
    this.Compiler = compiler;

    function parser(doc) {
      return {type: 'text', value: doc};
    }

    function compiler(tree) {
      return tree.value;
    }
  })
  .freeze();
