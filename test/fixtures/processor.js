/**
 * @import {Compiler, Parser, Plugin} from 'unified'
 * @import {Literal, Node} from 'unist'
 */

import {unified} from 'unified'

export const processor = unified().use(parse).use(compile)

/**
 * Add a parser.
 *
 * @type {Plugin<[], string, Literal>}
 */
function parse() {
  this.parser = parser
}

/**
 * Add a compiler.
 *
 * @type {Plugin<[], Node, string>}
 */
function compile() {
  this.compiler = compiler
}

/**
 * Parse a value into a text node.
 *
 * @type {Parser<Literal>}
 */
function parser(value) {
  return {type: 'text', value}
}

/**
 * Compile a literal into its value.
 *
 * @type {Compiler<Node, string>}
 */
function compiler(tree) {
  return 'value' in tree ? String(tree.value) : ''
}
