/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module foo
 * @fileoverview Example plugin, logging its configuration!
 */

'use strict';

module.exports = function (processor, options) {
  console.log(JSON.stringify(options));
};
