import unified from 'unified'

export const processor = unified().use(main).freeze()

function main() {
  this.Parser = parser
  this.Compiler = compiler
}

function parser(doc) {
  return {type: 'text', value: doc}
}

function compiler(tree) {
  return tree.value
}
