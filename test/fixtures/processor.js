/**
 * @import {Compiler, Parser, Plugin} from 'unified'
 * @import {Literal, Node} from 'unist'
 */

import {unified} from 'unified'

export const processor = unified()
  .use(
    /** @type {Plugin<[], string, Node>} */
    // @ts-expect-error: TS is wrong about `this`.
    function () {
      /** @type {Parser<Node>} */
      this.parser = function (value) {
        /** @type {Literal} */
        const node = {type: 'text', value}
        return node
      }
    }
  )
  .use(
    /** @type {Plugin<[], Node, string>} */
    // @ts-expect-error: TS is wrong about `this`.
    function () {
      /** @type {Compiler<Node, string>} */
      this.compiler = function (tree) {
        const node = /** @type {Literal} */ (tree)
        return String(node.value)
      }
    }
  )
