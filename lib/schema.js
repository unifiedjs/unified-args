/**
 * @typedef Field
 *   Field.
 * @property {'boolean' | 'string'} [type='string']
 *   Type of field (default: `'string'`).
 * @property {string} long
 *   Long flag.
 * @property {string} description
 *   Description of this field.
 * @property {string} [value]
 *   Description of value for this field.
 * @property {string} [short]
 *   Short flag.
 * @property {boolean | string} [default='']
 *   Default (default: `''`).
 * @property {boolean} [truelike=false]
 *   Whether this field is like `true`: the default is typically “on”, but that
 *   depends on a bit on what `unified-engine` does.
 */

/** @type {Array<Field>} */
export const schema = [
  {
    default: false,
    description: 'output usage information',
    long: 'help',
    short: 'h',
    type: 'boolean'
  },
  {
    default: false,
    description: 'output version number',
    long: 'version',
    short: 'v',
    type: 'boolean'
  },
  {
    description: 'specify output location',
    long: 'output',
    short: 'o',
    value: '[path]'
  },
  {
    description: 'specify configuration file',
    long: 'rc-path',
    short: 'r',
    type: 'string',
    value: '<path>'
  },
  {
    description: 'specify ignore file',
    long: 'ignore-path',
    short: 'i',
    type: 'string',
    value: '<path>'
  },
  {
    description: 'specify settings',
    long: 'setting',
    short: 's',
    type: 'string',
    value: '<settings>'
  },
  {
    description: 'specify extensions',
    long: 'ext',
    short: 'e',
    type: 'string',
    value: '<extensions>'
  },
  {
    description: 'use plugins',
    long: 'use',
    short: 'u',
    type: 'string',
    value: '<plugins>'
  },
  {
    default: false,
    description: 'watch for changes and reprocess',
    long: 'watch',
    short: 'w',
    type: 'boolean'
  },
  {
    default: false,
    description: 'output only warnings and errors',
    long: 'quiet',
    short: 'q',
    type: 'boolean'
  },
  {
    default: false,
    description: 'output only errors',
    long: 'silent',
    short: 'S',
    type: 'boolean'
  },
  {
    default: false,
    description: 'exit with 1 on warnings',
    long: 'frail',
    short: 'f',
    type: 'boolean'
  },
  {
    default: false,
    description: 'specify input and output as syntax tree',
    long: 'tree',
    short: 't',
    type: 'boolean'
  },
  {
    description: 'specify reporter',
    long: 'report',
    type: 'string',
    value: '<reporter>'
  },
  {
    description: 'specify path to process as',
    long: 'file-path',
    type: 'string',
    value: '<path>'
  },
  {
    default: 'dir',
    description: 'resolve patterns in `ignore-path` from its directory or cwd',
    long: 'ignore-path-resolve-from',
    type: 'string',
    value: 'cwd|dir'
  },
  {
    description: 'specify ignore patterns',
    long: 'ignore-pattern',
    type: 'string',
    value: '<globs>'
  },
  {
    default: false,
    description: 'do not fail when given ignored files',
    long: 'silently-ignore',
    type: 'boolean'
  },
  {
    description: 'specify input as syntax tree',
    long: 'tree-in',
    type: 'boolean'
  },
  {
    description: 'output syntax tree',
    long: 'tree-out',
    type: 'boolean'
  },
  {
    default: false,
    description: 'output formatted syntax tree',
    long: 'inspect',
    type: 'boolean'
  },
  {
    description: 'specify writing to stdout',
    long: 'stdout',
    truelike: true,
    type: 'boolean'
  },
  {
    default: true,
    description: 'specify color in report',
    long: 'color',
    type: 'boolean'
  },
  {
    default: true,
    description: 'search for configuration files',
    long: 'config',
    type: 'boolean'
  },
  {
    default: true,
    description: 'search for ignore files',
    long: 'ignore',
    type: 'boolean'
  }
]
