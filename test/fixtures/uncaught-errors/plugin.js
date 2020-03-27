'use strict'

module.exports = function () {}

setTimeout(thrower, 1000)

function thrower() {
  /* eslint-disable no-throw-literal */
  throw 'foo'
  /* eslint-enable no-throw-literal */
}
