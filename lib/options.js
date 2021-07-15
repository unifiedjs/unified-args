import table from 'text-table'
import camelcase from 'camelcase'
import minimist from 'minimist'
import json5 from 'json5'
import {fault} from 'fault'
import {schema} from './schema.js'

const own = {}.hasOwnProperty

// Schema for `minimist`.
const minischema = {
  unknown: handleUnknownArgument,
  default: {},
  alias: {},
  string: [],
  boolean: []
}

let index = -1
while (++index < schema.length) {
  addEach(schema[index])
}

// Parse CLI options.
export function options(flags, configuration) {
  const extension = configuration.extensions[0]
  const name = configuration.name
  const config = toCamelCase(minimist(flags, minischema))
  let index = -1

  while (++index < schema.length) {
    const option = schema[index]
    if (option.type === 'string' && config[option.long] === '') {
      throw fault('Missing value:%s', inspect(option).join(' '))
    }
  }

  const ext = commaSeparated(config.ext)
  const report = reporter(config.report)
  const help = [
    inspectAll(schema),
    '',
    'Examples:',
    '',
    '  # Process `input.' + extension + '`',
    '  $ ' + name + ' input.' + extension + ' -o output.' + extension,
    '',
    '  # Pipe',
    '  $ ' + name + ' < input.' + extension + ' > output.' + extension,
    '',
    '  # Rewrite all applicable files',
    '  $ ' + name + ' . -o'
  ].join('\n')

  return {
    helpMessage: help,
    // “hidden” feature, makes testing easier.
    cwd: configuration.cwd,
    processor: configuration.processor,
    help: config.help,
    version: config.version,
    files: config._,
    filePath: config.filePath,
    watch: config.watch,
    extensions: ext.length === 0 ? configuration.extensions : ext,
    output: config.output,
    out: config.stdout,
    tree: config.tree,
    treeIn: config.treeIn,
    treeOut: config.treeOut,
    inspect: config.inspect,
    rcName: configuration.rcName,
    packageField: configuration.packageField,
    rcPath: config.rcPath,
    detectConfig: config.config,
    settings: settings(config.setting),
    ignoreName: configuration.ignoreName,
    ignorePath: config.ignorePath,
    ignorePathResolveFrom: config.ignorePathResolveFrom,
    ignorePatterns: commaSeparated(config.ignorePattern),
    silentlyIgnore: config.silentlyIgnore,
    detectIgnore: config.ignore,
    pluginPrefix: configuration.pluginPrefix,
    plugins: plugins(config.use),
    reporter: report[0],
    reporterOptions: report[1],
    color: config.color,
    silent: config.silent,
    quiet: config.quiet,
    frail: config.frail
  }
}

function addEach(option) {
  const value = option.default

  minischema.default[option.long] = value === undefined ? null : value

  if (option.type in minischema) {
    minischema[option.type].push(option.long)
  }

  if (option.short) {
    minischema.alias[option.short] = option.long
  }
}

// Parse `extensions`.
function commaSeparated(value) {
  return flatten(normalize(value).map((d) => splitList(d)))
}

// Parse `plugins`.
function plugins(value) {
  const result = {}
  const normalized = normalize(value).map((d) => splitOptions(d))
  let index = -1

  while (++index < normalized.length) {
    const value = normalized[index]
    result[value[0]] = value[1] ? parseConfig(value[1], {}) : null
  }

  return result
}

// Parse `reporter`: only one is accepted.
function reporter(value) {
  const all = normalize(value)
    .map((d) => splitOptions(d))
    .map((value) => {
      return [value[0], value[1] ? parseConfig(value[1], {}) : null]
    })

  return all[all.length - 1] || []
}

// Parse `settings`.
function settings(value) {
  const cache = {}
  const normalized = normalize(value)
  let index = -1

  while (++index < normalized.length) {
    parseConfig(normalized[index], cache)
  }

  return cache
}

// Parse configuration.
function parseConfig(flags, cache) {
  let flag
  let message

  try {
    flags = toCamelCase(parseJSON(flags))
  } catch (error) {
    // Fix position
    message = error.message.replace(/at(?= position)/, 'around')

    throw fault('Cannot parse `%s` as JSON: %s', flags, message)
  }

  for (flag in flags) {
    if (own.call(flags, flag)) {
      cache[flag] = flags[flag]
    }
  }

  return cache
}

// Handle an unknown flag.
function handleUnknownArgument(flag) {
  // Glob.
  if (flag.charAt(0) !== '-') {
    return
  }

  // Long options, always unknown.
  if (flag.charAt(1) === '-') {
    throw fault('Unknown option `%s`, expected:\n%s', flag, inspectAll(schema))
  }

  // Short options, can be grouped.
  const found = flag.slice(1).split('')
  const known = schema.filter((d) => d.short)
  const knownKeys = new Set(known.map((d) => d.short))
  let index = -1

  while (++index < found.length) {
    const key = found[index]
    if (!knownKeys.has(key)) {
      throw fault(
        'Unknown short option `-%s`, expected:\n%s',
        key,
        inspectAll(known)
      )
    }
  }
}

// Inspect all `options`.
function inspectAll(options) {
  return table(options.map((d) => inspect(d)))
}

// Inspect one `option`.
function inspect(option) {
  let description = option.description
  let long = option.long

  if (option.default === true || option.truelike) {
    description += ' (on by default)'
    long = '[no-]' + long
  }

  return [
    '',
    option.short ? '-' + option.short : '',
    '--' + long + (option.value ? ' ' + option.value : ''),
    description
  ]
}

// Normalize `value`.
function normalize(value) {
  if (!value) {
    return []
  }

  if (typeof value === 'string') {
    return [value]
  }

  return flatten(value.map((d) => normalize(d)))
}

// Flatten `values`.
function flatten(values) {
  // eslint-disable-next-line prefer-spread
  return [].concat.apply([], values)
}

function splitOptions(value) {
  return value.split('=')
}

function splitList(value) {
  return value.split(',')
}

// Transform the keys on an object to camel-case, recursivly.
function toCamelCase(object) {
  const result = {}
  let value
  let key

  for (key in object) {
    if (own.call(object, key)) {
      value = object[key]

      if (value && typeof value === 'object' && !('length' in value)) {
        value = toCamelCase(value)
      }

      result[camelcase(key)] = value
    }
  }

  return result
}

// Parse a (lazy?) JSON config.
function parseJSON(value) {
  return json5.parse('{' + value + '}')
}
