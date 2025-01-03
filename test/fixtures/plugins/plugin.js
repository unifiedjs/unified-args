/**
 * @import {Plugin} from 'unified'
 */

/** @type {Plugin<[unknown?]>} */
export default function plugin(options) {
  console.log(JSON.stringify(options))
}
