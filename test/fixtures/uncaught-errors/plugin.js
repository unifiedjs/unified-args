'use strict';

module.exports = function () {};

setTimeout(thrower, 1000);

function thrower() {
  throw 'foo';
}
