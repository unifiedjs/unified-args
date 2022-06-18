/**
 * @typedef {import('execa').ExecaReturnValue} ExecaReturnValue
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {execa} from 'execa'
import {bail} from 'bail'
import test from 'tape'
import strip from 'strip-ansi'
import touch from 'touch'

const cross = process.platform === 'win32' ? '×' : '✖'

const fixtures = path.join('test', 'fixtures')
const cwd = path.join(fixtures, 'example')
const bin = path.join(cwd, 'cli.js')

process.on('unhandledRejection', bail)

test('unified-args', (t) => {
  t.test('should fail on missing files', (t) => {
    const expected = [
      'missing.txt',
      '  1:1  error  No such file or directory',
      '',
      cross + ' 1 error'
    ].join('\n')

    t.plan(1)

    execa(bin, ['missing.txt']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        t.deepEqual(
          [error.exitCode, strip(error.stderr)],
          [1, expected],
          'should fail'
        )
      }
    )
  })

  t.test('should accept a path to a file', (t) => {
    t.plan(1)

    execa(bin, ['one.txt']).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['one', 'one.txt: no issues found'],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should accept a path to a directory', (t) => {
    const expected = [
      'one.txt: no issues found',
      'three' + path.sep + 'five.txt: no issues found',
      'three' + path.sep + 'four.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, ['.']).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should accept a glob to files', (t) => {
    const expected = [
      'one.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, ['*.txt']).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should accept a glob to a directory', (t) => {
    const expected = [
      'three' + path.sep + 'five.txt: no issues found',
      'three' + path.sep + 'four.txt: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, ['thr+(e)']).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should fail on a bad short flag', (t) => {
    const expected = fs
      .readFileSync(path.join(cwd, 'SHORT_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    t.plan(1)

    execa(bin, ['-n']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        t.deepEqual(
          [error.exitCode, strip(error.stderr)],
          [1, expected],
          'should fail'
        )
      }
    )
  })

  t.test('should fail on a bad grouped short flag', (t) => {
    const expected = fs
      .readFileSync(path.join(cwd, 'SHORT_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    t.plan(1)

    execa(bin, ['-on']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        t.deepEqual(
          [error.exitCode, strip(error.stderr)],
          [1, expected],
          'should fail'
        )
      }
    )
  })

  t.test('should fail on a bad long flag', (t) => {
    const expected = fs
      .readFileSync(path.join(cwd, 'LONG_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    t.plan(1)

    execa(bin, ['--no']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        t.deepEqual(
          [error.exitCode, strip(error.stderr)],
          [1, expected],
          'should fail'
        )
      }
    )
  })

  helpFlag('-h')
  helpFlag('--help')

  function helpFlag(/** @type {string} */ flag) {
    t.test('should show help on `' + flag + '`', (t) => {
      const expected = fs
        .readFileSync(path.join(cwd, 'HELP'), 'utf8')
        .replace(/\r/g, '')
        .trim()

      t.plan(1)

      execa(bin, [flag]).then(
        (result) => {
          t.deepEqual(
            [result.stdout, result.stderr],
            [expected, ''],
            'should work'
          )
        },
        () => t.fail()
      )
    })
  }

  versionFlag('-v')
  versionFlag('--version')

  function versionFlag(/** @type {string} */ flag) {
    t.test('should show help on `' + flag + '`', (t) => {
      t.plan(1)

      execa(bin, [flag]).then(
        (result) => {
          t.deepEqual(
            [result.stdout, result.stderr],
            ['0.0.0', ''],
            'should work'
          )
        },
        () => t.fail()
      )
    })
  }

  t.test('should honour `--color`', (t) => {
    const expected =
      '\u001B[4m\u001B[32mone.txt\u001B[39m\u001B[24m: no issues found'

    t.plan(1)

    execa(bin, ['--color', 'one.txt']).then(
      (result) => {
        t.deepEqual(
          [result.stdout, result.stderr],
          ['one', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should honour `--no-color`', (t) => {
    const expected = 'one.txt: no issues found'

    t.plan(1)

    execa(bin, ['--no-color', 'one.txt']).then(
      (result) => {
        t.deepEqual(
          [result.stdout, result.stderr],
          ['one', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  extFlag('-e')
  extFlag('--ext')

  function extFlag(/** @type {string} */ flag) {
    t.test('should honour `' + flag + '`', (t) => {
      const expected = [
        'alpha.text: no issues found',
        'bravo.text: no issues found',
        'charlie' + path.sep + 'delta.text: no issues found',
        'charlie' + path.sep + 'echo.text: no issues found',
        'delta.text: no issues found'
      ].join('\n')

      t.plan(1)

      execa(bin, ['.', flag, 'text']).then(
        (result) => {
          t.deepEqual(
            [result.stdout, strip(result.stderr)],
            ['', expected],
            'should work'
          )
        },
        () => t.fail()
      )
    })

    t.test('should fail on `' + flag + '` without value', (t) => {
      const expected =
        'Error: Missing value: -e --ext <extensions> specify extensions'

      t.plan(1)

      execa(bin, ['.', flag]).then(
        () => t.fail(),
        (/** @type {ExecaReturnValue} */ error) => {
          t.deepEqual(
            [error.stdout, error.stderr],
            ['', expected],
            'should fail'
          )
        }
      )
    })

    t.test('should allow an extra `-e` after `' + flag + '`', (t) => {
      const expected = [
        'alpha.text: no issues found',
        'bravo.text: no issues found',
        'charlie' + path.sep + 'delta.text: no issues found',
        'charlie' + path.sep + 'echo.text: no issues found',
        'delta.text: no issues found'
      ].join('\n')

      t.plan(1)

      execa(bin, ['.', flag, 'text', '-e']).then(
        (result) => {
          t.deepEqual(
            [result.stdout, strip(result.stderr)],
            ['', expected],
            'should work'
          )
        },
        () => t.fail()
      )
    })
  }

  settingsFlag('-s')
  settingsFlag('--setting')

  function settingsFlag(/** @type {string} */ flag) {
    t.test('should catch syntax errors in `' + flag + '`', (t) => {
      const expected =
        "Error: Cannot parse `foo:bar` as JSON: JSON5: invalid character 'b' at 1:6"

      t.plan(1)

      // Should be quoted.
      execa(bin, ['.', flag, 'foo:bar']).then(
        () => t.fail(),
        (/** @type {ExecaReturnValue} */ error) => {
          t.deepEqual(
            [error.exitCode, strip(error.stderr)],
            [1, expected],
            'should fail'
          )
        }
      )
    })

    t.test('should honour `' + flag + '`', (t) => {
      const bin = path.join(fixtures, 'settings', 'cli.js')

      t.plan(1)

      execa(bin, ['one.txt', flag, '"foo-bar":"baz"']).then(
        (result) => {
          // Parser and Compiler both log stringified settings.
          t.deepEqual(
            [result.stdout, strip(result.stderr)],
            ['{"fooBar":"baz"}\none', 'one.txt: no issues found'],
            'should work'
          )
        },
        () => t.fail()
      )
    })
  }

  t.test('shouldn’t fail on property-like settings', (t) => {
    const expected = '{"foo":"https://example.com"}'
    const bin = path.join(fixtures, 'settings', 'cli.js')
    const setting = 'foo:"https://example.com"'

    t.plan(1)

    execa(bin, ['.', '--setting', setting]).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          [expected, 'one.txt: no issues found'],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  useFlag('-u')
  useFlag('--use')

  function useFlag(/** @type {string} */ flag) {
    t.test('should load a plugin with `' + flag + '`', (t) => {
      const bin = path.join(fixtures, 'plugins', 'cli.js')

      t.plan(1)

      execa(bin, ['one.txt', flag, './plugin.js']).then(
        (result) => {
          // Attacher logs options, which are `undefined`.
          t.deepEqual(
            [result.stdout, strip(result.stderr)],
            ['undefined\none', 'one.txt: no issues found'],
            'should work'
          )
        },
        () => t.fail()
      )
    })

    t.test('should catch syntax errors in `' + flag + '`', (t) => {
      const expected =
        "Error: Cannot parse `foo:bar` as JSON: JSON5: invalid character 'b' at 1:6"

      t.plan(1)

      // Should be quoted.
      execa(bin, ['.', flag, './plugin.js=foo:bar']).then(
        () => t.fail(),
        (/** @type {ExecaReturnValue} */ error) => {
          t.deepEqual(
            [error.exitCode, strip(error.stderr)],
            [1, expected],
            'should fail'
          )
        }
      )
    })

    t.test('should honour `' + flag + '`', (t) => {
      const bin = path.join(fixtures, 'plugins', 'cli.js')
      const options = './plugin.js=foo:{bar:"baz",qux:1,quux:true}'

      t.plan(1)

      execa(bin, ['one.txt', flag, options]).then(
        (result) => {
          t.deepEqual(
            [result.stdout, strip(result.stderr)],
            [
              '{"foo":{"bar":"baz","qux":1,"quux":true}}\none',
              'one.txt: no issues found'
            ],
            'should fail'
          )
        },
        () => t.fail()
      )
    })
  }

  t.test('should honour `--report`', (t) => {
    const expected = JSON.stringify([
      {path: 'alpha.text', cwd, history: ['alpha.text'], messages: []}
    ])

    t.plan(1)

    execa(bin, ['alpha.text', '--report', 'json']).then(
      (result) => {
        t.deepEqual(
          [result.stdout, result.stderr],
          ['alpha', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should honour `--report` with options', (t) => {
    const expected = JSON.stringify(
      [{path: 'alpha.text', cwd, history: ['alpha.text'], messages: []}],
      null,
      '\t'
    )

    const setting = 'json=pretty:"\\t"'

    t.plan(1)

    execa(bin, ['alpha.text', '--report', setting]).then(
      (result) => {
        t.deepEqual(
          [result.stdout, result.stderr],
          ['alpha', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should fail on `--report` without value', (t) => {
    t.plan(1)

    execa(bin, ['.', '--report']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        t.deepEqual(
          [error.exitCode, error.stderr],
          [1, 'Error: Missing value:  --report <reporter> specify reporter'],
          'should fail'
        )
      }
    )
  })

  t.test('should support `--ignore-pattern`', (t) => {
    const expected = [
      'alpha.text: no issues found',
      'bravo.text: no issues found',
      'one.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, [
      '.',
      '--ext',
      'txt,text',
      '--ignore-pattern',
      'charlie/*,three/*.txt,delta.*'
    ]).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should support `--ignore-path`', (t) => {
    const expected = [
      'alpha.text: no issues found',
      'bravo.text: no issues found',
      'charlie' + path.sep + 'echo.text: no issues found',
      'delta.text: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, [
      '.',
      '--ext',
      'text',
      '--ignore-path',
      path.join('charlie', 'ignore')
    ]).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should support `--ignore-path-resolve-from cwd`', (t) => {
    const expected = [
      'alpha.text: no issues found',
      'bravo.text: no issues found',
      'charlie' + path.sep + 'echo.text: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, [
      '.',
      '--ext',
      'text',
      '--ignore-path',
      path.join('charlie', 'ignore'),
      '--ignore-path-resolve-from',
      'cwd'
    ]).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should fail when given an ignored path', (t) => {
    const expected = [
      'one.txt',
      '  1:1  error  Cannot process specified file: it’s ignored',
      '',
      'two.txt: no issues found',
      '',
      cross + ' 1 error'
    ].join('\n')

    t.plan(1)

    execa(bin, ['one.txt', 'two.txt', '--ignore-pattern', 'one.txt']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        t.deepEqual(
          [error.exitCode, strip(error.stderr)],
          [1, expected],
          'should fail'
        )
      }
    )
  })

  t.test('should support `--silently-ignore`', (t) => {
    t.plan(1)

    execa(bin, [
      'one.txt',
      'two.txt',
      '--ignore-pattern',
      'one.txt',
      '--silently-ignore'
    ]).then(
      (result) => {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', 'two.txt: no issues found'],
          'should work'
        )
      },
      () => t.fail()
    )
  })

  t.test('should honour `--watch`', (t) => {
    const expected = [
      'Watching... (press CTRL+C to exit)',
      'watch.txt: no issues found',
      'watch.txt: no issues found'
    ].join('\n')
    const doc = path.join(cwd, 'watch.txt')
    const delay = 3000
    let resolved = false

    t.plan(3)

    touch.sync(doc)

    const proc = execa(bin, ['watch.txt', '-w'])

    if (process.platform === 'win32') {
      proc.then(() => t.fail(), onsuccess)
    } else {
      proc.then(onsuccess, () => t.fail())
    }

    setTimeout(seeYouLaterAlligator, delay)

    function onsuccess(/** @type {ExecaReturnValue} */ result) {
      resolved = true
      fs.unlinkSync(doc)
      t.deepEqual(
        [result.stdout, strip(result.stderr).trim()],
        ['', expected],
        'should work'
      )
    }

    function seeYouLaterAlligator() {
      t.equal(resolved, false, 'should still be running (#1)')
      touch.sync(doc)
      setTimeout(afterAWhileCrocodile, delay)
    }

    function afterAWhileCrocodile() {
      t.equal(resolved, false, 'should still be running (#2)')
      proc.kill('SIGINT')
    }
  })

  t.test('should not regenerate when watching', (t) => {
    const lines = [
      'Watching... (press CTRL+C to exit)',
      'Note: Ignoring `--output` until exit.',
      'watch.txt: no issues found',
      'watch.txt: no issues found'
    ]

    // Windows immediatly quits.
    // Other OSes support cleaning up things.
    if (process.platform !== 'win32') {
      lines.push('', 'watch.txt: written')
    }

    const expected = lines.join('\n')
    const doc = path.join(cwd, 'watch.txt')
    let resolved = false
    const delay = 3000

    t.plan(3)

    touch.sync(doc)

    const proc = execa(bin, ['watch.txt', '-w', '-o'])

    if (process.platform === 'win32') {
      proc.then(() => t.fail(), onsuccess)
    } else {
      proc.then(onsuccess, () => t.fail())
    }

    setTimeout(seeYouLaterAlligator, delay)

    function onsuccess(/** @type {ExecaReturnValue} */ result) {
      resolved = true

      fs.unlinkSync(doc)

      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['', expected],
        'should work'
      )
    }

    function seeYouLaterAlligator() {
      t.equal(resolved, false, 'should still be running (#1)')
      touch.sync(doc)
      setTimeout(afterAWhileCrocodile, delay)
    }

    function afterAWhileCrocodile() {
      t.equal(resolved, false, 'should still be running (#2)')
      proc.kill('SIGINT')
    }
  })

  t.test('should exit on fatal errors when watching', (t) => {
    const expected = [
      'Watching... (press CTRL+C to exit)',
      'Error: No input'
    ].join('\n')

    t.plan(1)

    execa(bin, ['-w']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        const actual = strip(error.stderr).split('\n').slice(0, 2).join('\n')

        t.deepEqual([error.exitCode, actual], [1, expected], 'should fail')
      }
    )
  })

  t.test('should report uncaught exceptions', (t) => {
    const bin = path.join(fixtures, 'uncaught-errors', 'cli.js')
    const expected = 'one.txt: no issues found\nfoo'

    t.plan(1)

    execa(bin, ['.', '-u', './plugin.js']).then(
      () => t.fail(),
      (/** @type {ExecaReturnValue} */ error) => {
        t.deepEqual(
          [error.exitCode, strip(error.stderr)],
          [1, expected],
          'should fail'
        )
      }
    )
  })

  t.end()
})
