/**
 * @import {ExecaError} from 'execa'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import {EOL} from 'node:os'
import {platform} from 'node:process'
import test from 'node:test'
import {fileURLToPath} from 'node:url'
import {execa} from 'execa'
import stripAnsi from 'strip-ansi'

const base = new URL('fixtures/example/', import.meta.url)
const binaryUrl = new URL('fixtures/example/cli.js', import.meta.url)
const binaryPath = fileURLToPath(binaryUrl)

test('args', async function (t) {
  // Clean from last run.
  try {
    await fs.unlink(new URL('watch.txt', base))
  } catch {}

  const help = String(await fs.readFile(new URL('HELP', base)))
    .replace(/\r\n/g, '\n')
    .trimEnd()
  const longFlag = String(await fs.readFile(new URL('LONG_FLAG', base)))
    .replace(/\r\n/g, '\n')
    .trimEnd()
  const shortFlag = String(await fs.readFile(new URL('SHORT_FLAG', base)))
    .replace(/\r\n/g, '\n')
    .trimEnd()

  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('unified-args')).sort(), ['args'])
  })

  await t.test('should fail on missing files', async function () {
    try {
      await execa(binaryPath, ['missing.txt'])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)
      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr)],
        [
          1,
          [
            'missing.txt',
            ' error No such file or folder',
            '  [cause]:',
            '    Error: ENOENT:…',
            '',
            '✖ 1 error'
          ].join('\n')
        ]
      )
    }
  })

  await t.test('should accept a path to a file', async function () {
    const result = await execa(binaryPath, ['one.txt'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      ['one', 'one.txt: no issues found']
    )
  })

  await t.test('should accept a path to a directory', async function () {
    const result = await execa(binaryPath, ['.'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      [
        '',
        [
          'one.txt: no issues found',
          'three' + path.sep + 'five.txt: no issues found',
          'three' + path.sep + 'four.txt: no issues found',
          'two.txt: no issues found'
        ].join('\n')
      ]
    )
  })

  await t.test('should accept a glob to files', async function () {
    const result = await execa(binaryPath, ['*.txt'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      ['', 'one.txt: no issues found\ntwo.txt: no issues found']
    )
  })

  await t.test('should accept a glob to a directory', async function () {
    const result = await execa(binaryPath, ['thr+(e)'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      [
        '',
        [
          'three' + path.sep + 'five.txt: no issues found',
          'three' + path.sep + 'four.txt: no issues found'
        ].join('\n')
      ]
    )
  })

  await t.test('should fail on a bad short flag', async function () {
    try {
      await execa(binaryPath, ['-n'])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)

      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr, 14)],
        [1, shortFlag]
      )
    }
  })

  await t.test('should fail on a bad grouped short flag', async function () {
    try {
      await execa(binaryPath, ['-on'])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)

      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr, 14)],
        [1, shortFlag]
      )
    }
  })

  await t.test('should fail on a bad long flag', async function () {
    try {
      await execa(binaryPath, ['--no'])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)

      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr, 27)],
        [1, longFlag]
      )
    }
  })

  await helpFlag('-h')
  await helpFlag('--help')

  /**
   * @param {string} flag
   *   Flag.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  async function helpFlag(flag) {
    await t.test('should show help on `' + flag + '`', async function () {
      const result = await execa(binaryPath, [flag])
      assert.deepEqual([result.stdout, result.stderr], [help, ''])
    })
  }

  await versionFlag('-v')
  await versionFlag('--version')

  /**
   * @param {string} flag
   *   Flag.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  async function versionFlag(flag) {
    await t.test('should show version on `' + flag + '`', async function () {
      const result = await execa(binaryPath, [flag])

      assert.deepEqual([result.stdout, result.stderr], ['0.0.0', ''])
    })
  }

  await t.test('should support `--color`', async function () {
    const result = await execa(binaryPath, ['--color', 'one.txt'])

    assert.deepEqual(
      [result.stdout, result.stderr],
      ['one', '\u001B[4m\u001B[32mone.txt\u001B[39m\u001B[24m: no issues found']
    )
  })

  await t.test('should support `--no-color`', async function () {
    const result = await execa(binaryPath, ['--no-color', 'one.txt'])

    assert.deepEqual(
      [result.stdout, result.stderr],
      ['one', 'one.txt: no issues found']
    )
  })

  await extensionFlag('-e')
  await extensionFlag('--ext')

  /**
   * @param {string} flag
   *   Flag.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  async function extensionFlag(flag) {
    await t.test('should support `' + flag + '`', async function () {
      const result = await execa(binaryPath, ['.', flag, 'text'])

      assert.deepEqual(
        [result.stdout, cleanError(result.stderr)],
        [
          '',
          [
            'alpha.text: no issues found',
            'bravo.text: no issues found',
            'charlie' + path.sep + 'delta.text: no issues found',
            'charlie' + path.sep + 'echo.text: no issues found',
            'delta.text: no issues found'
          ].join('\n')
        ]
      )
    })

    await t.test(
      'should fail on `' + flag + '` without value',
      async function () {
        try {
          await execa(binaryPath, ['.', flag])
          assert.fail()
        } catch (error) {
          const result = /** @type {ExecaError} */ (error)

          assert.deepEqual(
            [result.exitCode, cleanError(result.stderr, 1)],
            [
              1,
              'Error: Missing value: -e --ext <extensions> specify extensions'
            ]
          )
        }
      }
    )

    await t.test(
      'should allow an extra `-e` after `' + flag + '`',
      async function () {
        const result = await execa(binaryPath, ['.', flag, 'text', '-e'])

        assert.deepEqual(
          [result.stdout, cleanError(result.stderr)],
          [
            '',
            [
              'alpha.text: no issues found',
              'bravo.text: no issues found',
              'charlie' + path.sep + 'delta.text: no issues found',
              'charlie' + path.sep + 'echo.text: no issues found',
              'delta.text: no issues found'
            ].join('\n')
          ]
        )
      }
    )
  }

  await settingsFlag('-s')
  await settingsFlag('--setting')

  /**
   * @param {string} flag
   *   Flag.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  async function settingsFlag(flag) {
    await t.test(
      'should catch syntax errors in `' + flag + '`',
      async function () {
        try {
          // Should be quoted.
          await execa(binaryPath, ['.', flag, 'foo:bar'])
          assert.fail()
        } catch (error) {
          const result = /** @type {ExecaError} */ (error)

          assert.deepEqual(
            [result.exitCode, cleanError(result.stderr, 1)],
            [1, 'Error: Cannot parse `foo:bar` as JSON']
          )
        }
      }
    )

    await t.test('should support `' + flag + '`', async function () {
      const binaryPath = fileURLToPath(
        new URL('fixtures/settings/cli.js', import.meta.url)
      )

      const result = await execa(binaryPath, [
        'one.txt',
        flag,
        '"foo-bar":"baz"'
      ])

      // Parser and Compiler both log stringified settings.
      assert.deepEqual(
        [result.stdout, cleanError(result.stderr)],
        ['{"foo-bar":"baz"}\none', 'one.txt: no issues found']
      )
    })
  }

  await t.test('should not fail on property-like settings', async function () {
    const binaryPath = fileURLToPath(
      new URL('fixtures/settings/cli.js', import.meta.url)
    )

    const result = await execa(binaryPath, [
      '.',
      '--setting',
      'foo:"https://example.com"'
    ])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      ['{"foo":"https://example.com"}', 'one.txt: no issues found']
    )
  })

  await t.test('should ignore boolean settings', async function () {
    const binaryPath = fileURLToPath(
      new URL('fixtures/settings/cli.js', import.meta.url)
    )

    const result = await execa(binaryPath, ['.', '--no-setting'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      ['{}', 'one.txt: no issues found']
    )
  })

  await useFlag('-u')
  await useFlag('--use')

  /**
   * @param {string} flag
   *   Flag.
   * @returns {Promise<undefined>}
   *   Nothing.
   */
  async function useFlag(flag) {
    await t.test('should load a plugin with `' + flag + '`', async function () {
      const binaryPath = fileURLToPath(
        new URL('fixtures/plugins/cli.js', import.meta.url)
      )

      const result = await execa(binaryPath, ['one.txt', flag, './plugin.js'])

      // Plugin logs options, which are `undefined`.
      assert.deepEqual(
        [result.stdout, cleanError(result.stderr)],
        ['undefined\none', 'one.txt: no issues found']
      )
    })

    await t.test(
      'should catch syntax errors in `' + flag + '`',
      async function () {
        // Should be quoted.
        try {
          await execa(binaryPath, ['.', flag, './plugin.js=foo:bar'])
          assert.fail()
        } catch (error) {
          const result = /** @type {ExecaError} */ (error)

          assert.deepEqual(
            [result.exitCode, cleanError(result.stderr, 1)],
            [1, 'Error: Cannot parse `foo:bar` as JSON']
          )
        }
      }
    )

    await t.test('should support `' + flag + '`', async function () {
      const binaryPath = fileURLToPath(
        new URL('fixtures/plugins/cli.js', import.meta.url)
      )

      const result = await execa(binaryPath, [
        'one.txt',
        flag,
        './plugin.js=foo:{bar:"baz",qux:1,quux:true}'
      ])

      assert.deepEqual(
        [result.stdout, cleanError(result.stderr)],
        [
          '{"foo":{"bar":"baz","qux":1,"quux":true}}\none',
          'one.txt: no issues found'
        ]
      )
    })
  }

  await t.test('should support `--report`', async function () {
    const result = await execa(binaryPath, ['alpha.text', '--report', 'json'])

    assert.deepEqual(
      [result.stdout, result.stderr],
      [
        'alpha',
        JSON.stringify([
          {
            path: 'alpha.text',
            cwd: 'test' + path.sep + 'fixtures' + path.sep + 'example',
            history: ['alpha.text'],
            messages: []
          }
        ])
      ]
    )
  })

  await t.test('should support `--report` with options', async function () {
    const result = await execa(binaryPath, [
      'alpha.text',
      '--report',
      'json=pretty:"\t"'
    ])

    assert.deepEqual(
      [result.stdout, result.stderr],
      [
        'alpha',
        JSON.stringify(
          [
            {
              path: 'alpha.text',
              cwd: 'test' + path.sep + 'fixtures' + path.sep + 'example',
              history: ['alpha.text'],
              messages: []
            }
          ],
          undefined,
          '\t'
        )
      ]
    )
  })

  await t.test('should fail on `--report` without value', async function () {
    try {
      await execa(binaryPath, ['.', '--report'])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)

      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr, 1)],
        [1, 'Error: Missing value: --report <reporter> specify reporter']
      )
    }
  })

  await t.test('should support `--no-stdout`', async function () {
    const result = await execa(binaryPath, ['one.txt', '--no-stdout'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      ['', 'one.txt: no issues found']
    )
  })

  await t.test('should support `--tree-in`', async function () {
    const result = await execa(binaryPath, ['tree.json', '--tree-in'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      ['hi!', 'tree.json: no issues found']
    )
  })

  await t.test('should support `--tree-out`', async function () {
    const result = await execa(binaryPath, ['one.txt', '--tree-out'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      [
        JSON.stringify({type: 'text', value: 'one' + EOL}, undefined, 2),
        'one.txt: no issues found'
      ]
    )
  })

  await t.test('should support `--tree`', async function () {
    const result = await execa(binaryPath, ['tree.json', '--tree'])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      [
        '{\n  "type": "text",\n  "value": "hi!"\n}',
        'tree.json: no issues found'
      ]
    )
  })

  await t.test('should support `--ignore-pattern`', async function () {
    const result = await execa(binaryPath, [
      '.',
      '--ext',
      'txt,text',
      '--ignore-pattern',
      'charlie/*,three/*.txt,delta.*'
    ])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      [
        '',
        [
          'alpha.text: no issues found',
          'bravo.text: no issues found',
          'one.txt: no issues found',
          'two.txt: no issues found'
        ].join('\n')
      ]
    )
  })

  await t.test('should support `--ignore-path`', async function () {
    const result = await execa(binaryPath, [
      '.',
      '--ext',
      'text',
      '--ignore-path',
      'charlie' + path.sep + 'ignore'
    ])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      [
        '',
        [
          'alpha.text: no issues found',
          'bravo.text: no issues found',
          'charlie' + path.sep + 'echo.text: no issues found',
          'delta.text: no issues found'
        ].join('\n')
      ]
    )
  })

  await t.test('should ignore non-last `--ignore-path`s', async function () {
    const result = await execa(binaryPath, [
      '.',
      '--ext',
      'text',
      '--ignore-path',
      'missing',
      '--ignore-path',
      'charlie' + path.sep + 'ignore'
    ])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      [
        '',
        [
          'alpha.text: no issues found',
          'bravo.text: no issues found',
          'charlie' + path.sep + 'echo.text: no issues found',
          'delta.text: no issues found'
        ].join('\n')
      ]
    )
  })

  await t.test(
    'should support `--ignore-path-resolve-from cwd`',
    async function () {
      const result = await execa(binaryPath, [
        '.',
        '--ext',
        'text',
        '--ignore-path',
        'charlie' + path.sep + 'ignore',
        '--ignore-path-resolve-from',
        'cwd'
      ])

      assert.deepEqual(
        [result.stdout, cleanError(result.stderr)],
        [
          '',
          [
            'alpha.text: no issues found',
            'bravo.text: no issues found',
            'charlie' + path.sep + 'echo.text: no issues found'
          ].join('\n')
        ]
      )
    }
  )

  await t.test('should fail when given an ignored path', async function () {
    try {
      await execa(binaryPath, [
        'one.txt',
        'two.txt',
        '--ignore-pattern',
        'one.txt'
      ])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)

      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr)],
        [
          1,
          [
            'one.txt',
            ' error Cannot process specified file: it’s ignored',
            '',
            'two.txt: no issues found',
            '',
            '✖ 1 error'
          ].join('\n')
        ]
      )
    }
  })

  await t.test(
    'should fail when given an incorrect `ignore-path-resolve-from`',
    async function () {
      try {
        await execa(binaryPath, [
          'one.txt',
          '--ignore-path-resolve-from',
          'xyz'
        ])
        assert.fail()
      } catch (error) {
        const result = /** @type {ExecaError} */ (error)

        assert.deepEqual(
          [result.exitCode, cleanError(result.stderr, 1)],
          [
            1,
            "Error: Expected `'cwd'` or `'dir'` for `ignore-path-resolve-from`, not: `xyz`"
          ]
        )
      }
    }
  )

  await t.test('should support `--silently-ignore`', async function () {
    const result = await execa(binaryPath, [
      'one.txt',
      'two.txt',
      '--ignore-pattern',
      'one.txt',
      '--silently-ignore'
    ])

    assert.deepEqual(
      [result.stdout, cleanError(result.stderr)],
      ['', 'two.txt: no issues found']
    )
  })

  await t.test('should support `--watch`', async function () {
    // On Windows, `SIGINT` crashes immediately and results in an error.
    // Hence `reject: false`, `exitCode`, and extra lines when non-windows.
    const delay = 3000
    const url = new URL('watch.txt', base)

    await fs.writeFile(url, 'alpha')

    const processPromise = execa(binaryPath, ['watch.txt', '-w'], {
      reject: false
    })

    setTimeout(seeYouLaterAlligator, delay)

    const result = await processPromise

    await fs.unlink(url)

    const lines = [
      'Watching... (press CTRL+C to exit)',
      'watch.txt: no issues found',
      'watch.txt: no issues found'
    ]

    if (platform === 'win32') {
      // Empty.
    } else {
      lines.push('')
    }

    assert.equal(result.exitCode, platform === 'win32' ? undefined : 0)
    assert.equal(result.stdout, '')
    assert.equal(cleanError(result.stderr), lines.join('\n'))

    async function seeYouLaterAlligator() {
      await fs.writeFile(url, 'bravo')
      setTimeout(afterAWhileCrocodile, delay)
    }

    function afterAWhileCrocodile() {
      processPromise.kill('SIGINT')
    }
  })

  await t.test('should not regenerate when watching', async function () {
    const delay = 3000
    const url = new URL('watch.txt', base)

    await fs.writeFile(url, 'alpha')

    const processPromise = execa(binaryPath, ['watch.txt', '-w', '-o'], {
      reject: false
    })

    setTimeout(seeYouLaterAlligator, delay)

    const result = await processPromise

    await fs.unlink(url)

    const lines = [
      'Watching... (press CTRL+C to exit)',
      'Note: Ignoring `--output` until exit.',
      'watch.txt: no issues found',
      'watch.txt: no issues found'
    ]

    if (platform !== 'win32') {
      lines.push('', 'watch.txt: written')
    }

    assert.equal(result.exitCode, platform === 'win32' ? undefined : 0)
    assert.equal(result.stdout, '')
    assert.equal(cleanError(result.stderr), lines.join('\n'))

    async function seeYouLaterAlligator() {
      await fs.writeFile(url, 'bravo')
      setTimeout(afterAWhileCrocodile, delay)
    }

    function afterAWhileCrocodile() {
      processPromise.kill('SIGINT')
    }
  })

  await t.test('should exit on fatal errors when watching', async function () {
    try {
      await execa(binaryPath, ['-w'])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)

      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr, 2)],
        [1, 'Watching... (press CTRL+C to exit)\nError: No input']
      )
    }
  })

  await t.test('should report uncaught exceptions', async function () {
    const binaryPath = fileURLToPath(
      new URL('fixtures/uncaught-errors/cli.js', import.meta.url)
    )

    try {
      await execa(binaryPath, ['.', '-u', './plugin.js'])
      assert.fail()
    } catch (error) {
      const result = /** @type {ExecaError} */ (error)

      assert.deepEqual(
        [result.exitCode, cleanError(result.stderr)],
        [1, 'one.txt: no issues found\nfoo']
      )
    }
  })
})

/**
 * Clean an error so that it’s easier to test.
 *
 * This particularly removed error cause messages, which change across Node
 * versions.
 * It also drops file paths, which differ across platforms.
 *
 * @param {string} value
 *   Error, report, or stack.
 * @param {number | undefined} [max=Infinity]
 *   Lines to include.
 * @returns {string}
 *   Clean error.
 */
function cleanError(value, max) {
  return (
    stripAnsi(value)
      // Clean syscal errors
      .replace(/( *Error: [A-Z]+:)[^\n]*/g, '$1…')

      .replace(/\(.+[/\\]/g, '(')
      .replace(/file:.+\//g, '')
      .replace(/\d+:\d+/g, '1:1')
      .split('\n')
      .slice(0, max || Number.POSITIVE_INFINITY)
      .join('\n')
  )
}
