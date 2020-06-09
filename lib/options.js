'use strict'

var table = require('text-table')
var camelcase = require('camelcase')
var minimist = require('minimist')
var json5 = require('json5')
var fault = require('fault')
var schema = require('./schema')

module.exports = options

// Schema for `minimist`.
var minischema = {
  unknown: handleUnknownArgument,
  default: {},
  alias: {},
  string: [],
  boolean: []
}

schema.forEach(addEach)

// Parse CLI options.
function options(flags, configuration) {
  var extension = configuration.extensions[0]
  var name = configuration.name
  var config = toCamelCase(minimist(flags, minischema))
  var help
  var ext
  var report

  schema.forEach(function (option) {
    if (option.type === 'string' && config[option.long] === '') {
      throw fault('Missing value:%s', inspect(option).join(' '))
    }
  })

  ext = commaSeparated(config.ext)
  report = reporter(config.report)

  help = [
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
  var value = option.default

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
  return flatten(normalize(value).map(splitList))
}

// Parse `plugins`.
function plugins(value) {
  var result = {}

  normalize(value)
    .map(splitOptions)
    .forEach(function (value) {
      result[value[0]] = value[1] ? parseConfig(value[1], {}) : null
    })

  return result
}

// Parse `reporter`: only one is accepted.
function reporter(value) {
  var all = normalize(value)
    .map(splitOptions)
    .map(function (value) {
      return [value[0], value[1] ? parseConfig(value[1], {}) : null]
    })

  return all[all.length - 1] || []
}

// Parse `settings`.
function settings(value) {
  var cache = {}

  normalize(value).forEach(function (value) {
    parseConfig(value, cache)
  })

  return cache
}

// Parse configuration.
function parseConfig(flags, cache) {
  var flag
  var message

  try {
    flags = toCamelCase(parseJSON(flags))
  } catch (error) {
    // Fix position
    message = error.message.replace(/at(?= position)/, 'around')

    throw fault('Cannot parse `%s` as JSON: %s', flags, message)
  }

  for (flag in flags) {
    cache[flag] = flags[flag]
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
  flag.slice(1).split('').forEach(each)

  function each(key) {
    var length = schema.length
    var index = -1
    var option

    while (++index < length) {
      option = schema[index]

      if (option.short === key) {
        return
      }
    }

    throw fault(
      'Unknown short option `-%s`, expected:\n%s',
      key,
      inspectAll(schema.filter(short))
    )
  }

  function short(option) {
    return option.short
  }
}

// Inspect all `options`.
function inspectAll(options) {
  return table(options.map(inspect))
}

// Inspect one `option`.
function inspect(option) {
  var description = option.description
  var long = option.long

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

  return flatten(value.map(normalize))
}

// Flatten `values`.
function flatten(values) {
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
  var result = {}
  var value
  var key

  for (key in object) {
    value = object[key]

    if (value && typeof value === 'object' && !('length' in value)) {
      value = toCamelCase(value)
    }

    result[camelcase(key)] = value
  }

  return result
}

// Parse a (lazy?) JSON config.
function parseJSON(value) {
  return json5.parse('{' + value + '}')
}
