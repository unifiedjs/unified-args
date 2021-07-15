import stream from 'stream'
import chalk from 'chalk'
import chokidar from 'chokidar'
import {engine} from 'unified-engine'
import {options} from './options.js'

const noop = Function.prototype

// Fake TTY stream.
const ttyStream = new stream.Readable()
ttyStream.isTTY = true

// Exit, lazily, with the correct exit status code.
let exitStatus = 0

process.on('exit', onexit)

// Handle uncaught errors, such as from unexpected async behaviour.
process.on('uncaughtException', fail)

// Start the CLI.
export function args(cliConfig) {
  let config
  let output
  let watcher

  try {
    config = options(process.argv.slice(2), cliConfig)
  } catch (error) {
    return fail(error, true)
  }

  if (config.help) {
    process.stdout.write(
      [
        'Usage: ' + cliConfig.name + ' [options] [path | glob ...]',
        '',
        '  ' + cliConfig.description,
        '',
        'Options:',
        '',
        config.helpMessage,
        ''
      ].join('\n'),
      noop
    )

    return
  }

  if (config.version) {
    process.stdout.write(cliConfig.version + '\n', noop)

    return
  }

  // Modify `config` for watching.
  if (config.watch) {
    output = config.output

    // Do not read from stdin(4).
    config.streamIn = ttyStream

    // Do not write to stdout(4).
    config.out = false

    process.stderr.write(
      chalk.bold('Watching...') + ' (press CTRL+C to exit)\n',
      noop
    )

    // Prevent infinite loop if set to regeneration.
    if (output === true) {
      config.output = false

      process.stderr.write(
        chalk.yellow('Note') + ': Ignoring `--output` until exit.\n',
        noop
      )
    }
  }

  // Initial run.
  engine(config, done)

  // Handle complete run.
  function done(error, code, context) {
    if (error) {
      clean()
      fail(error)
    } else {
      exitStatus = code

      if (config.watch && !watcher) {
        subscribe(context)
      }
    }
  }

  // Clean the watcher.
  function clean() {
    if (watcher) {
      watcher.close()
      watcher = null
    }
  }

  // Subscribe a chokidar watcher to all processed files.
  function subscribe(context) {
    watcher = chokidar
      .watch(context.fileSet.origins, {cwd: config.cwd, ignoreInitial: true})
      .on('error', done)
      .on('change', onchange)

    process.on('SIGINT', onsigint)

    function onchange(filePath) {
      config.files = [filePath]

      engine(config, done)
    }

    function onsigint() {
      // Hide the `^C` in terminal.
      process.stderr.write('\n', noop)

      clean()

      // Do another process if `output` specified regeneration.
      if (output === true) {
        config.output = output
        config.watch = false
        engine(config, done)
      }
    }
  }
}

// Print an error, optionally with stack.
function fail(error, pretty) {
  // Old versions of Node
  /* c8 ignore next 1 */
  const message = (pretty ? String(error).trim() : error.stack) || error

  exitStatus = 1

  process.stderr.write(message.trim() + '\n', noop)
}

function onexit() {
  /* eslint-disable unicorn/no-process-exit */
  process.exit(exitStatus)
  /* eslint-enable unicorn/no-process-exit */
}
