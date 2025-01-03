/**
 * @typedef {import('unist').Literal} Literal
 * @typedef {import('unist').Node} Node
 */

import {unified} from 'unified'

export const processor = unified()
  .use(
    /** @type {import('unified').Plugin<[], string, Node>} */
    // @ts-expect-error: TS is wrong about `this`.
    function () {
      /** @type {import('unified').Parser<Node>} */
      this.parser = function (value) {
        /** @type {Literal} */
        const node = {type: 'text', value}
        return node
      }
    }
  )
  .use(
    /** @type {import('unified').Plugin<[], Node, string>} */
    // @ts-expect-error: TS is wrong about `this`.
    function () {
      /** @type {import('unified').Compiler<Node, string>} */
      this.compiler = function (tree) {
        const node = /** @type {Literal} */ (tree)
        return String(node.value)
      }
    }
  )
