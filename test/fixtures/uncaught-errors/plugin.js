import process from 'node:process'

export default function plugin() {}

// Throw once everything else is done.
process.once('beforeExit', thrower)

function thrower() {
  // eslint-disable-next-line no-throw-literal -- intentional.
  throw 'foo'
}
