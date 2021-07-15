/**
 * @typedef {import('unist').Literal<string>} Literal
 */

import unified from 'unified'

export const processor = unified()
  .use(function () {
    Object.assign(this, {
      /**
       * @param {string} doc
       * @returns {Literal}
       */
      Parser(doc) {
        return {type: 'text', value: doc}
      },
      /**
       * @param {Literal} tree
       */
      Compiler(tree) {
        return tree.value
      }
    })
  })
  .freeze()
