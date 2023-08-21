export default function plugin() {}

setTimeout(thrower, 1000)

function thrower() {
  // eslint-disable-next-line no-throw-literal -- intentional.
  throw 'foo'
}
