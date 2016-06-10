/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module foo
 * @fileoverview Example plugin, logging its configuration!
 */

'use strict';

/* eslint-env node */
/* eslint-disable no-console */
/* jscs:disable jsDoc */

module.exports = function (processor, options) {
    console.log(JSON.stringify(options));
};
