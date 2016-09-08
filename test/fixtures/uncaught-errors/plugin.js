/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module foo
 * @fileoverview Example plugin, throwing an uncaught exception.
 */

'use strict';

module.exports = function () {};

setTimeout(function () {
  throw 'foo';
}, 1000);
