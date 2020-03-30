'use strict'

var fs = require('fs')
var path = require('path')
var execa = require('execa')
var bail = require('bail')
var test = require('tape')
var strip = require('strip-ansi')
var figures = require('figures')
var touch = require('touch')

var sep = path.sep
var join = path.join
var read = fs.readFileSync
var unlink = fs.unlinkSync

var fixtures = join(__dirname, 'fixtures')

var helpFlags = ['-h', '--help']
var versionFlags = ['-v', '--version']
var extFlags = ['-e', '--ext']
var settingsFlags = ['-s', '--setting']
var useFlags = ['-u', '--use']

var cwd = join(fixtures, 'example')
var bin = join(cwd, 'cli.js')

process.on('unhandledRejection', bail)

test('unified-args', function (t) {
  t.test('should fail on missing files', function (t) {
    var expected = [
      'missing.txt',
      '  1:1  error  No such file or directory',
      '',
      figures.cross + ' 1 error'
    ].join('\n')

    t.plan(1)

    execa(bin, ['missing.txt']).then(t.fail, onfail)

    function onfail(result) {
      t.deepEqual(
        [result.exitCode, strip(result.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.test('should accept a path to a file', function (t) {
    t.plan(1)

    execa(bin, ['one.txt']).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['one', 'one.txt: no issues found'],
        'should work'
      )
    }
  })

  t.test('should accept a path to a directory', function (t) {
    var expected = [
      'one.txt: no issues found',
      'three' + sep + 'five.txt: no issues found',
      'three' + sep + 'four.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, ['.']).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should accept a glob to files', function (t) {
    var expected = [
      'one.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, ['*.txt']).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should accept a glob to a directory', function (t) {
    var expected = [
      'three' + sep + 'five.txt: no issues found',
      'three' + sep + 'four.txt: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, ['thr+(e)']).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should fail on a bad short flag', function (t) {
    var expected = read(join(cwd, 'SHORT_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    t.plan(1)

    execa(bin, ['-n']).then(t.fail, onfail)

    function onfail(result) {
      t.deepEqual(
        [result.exitCode, strip(result.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.test('should fail on a bad grouped short flag', function (t) {
    var expected = read(join(cwd, 'SHORT_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    t.plan(1)

    execa(bin, ['-on']).then(t.fail, onfail)

    function onfail(result) {
      t.deepEqual(
        [result.exitCode, strip(result.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.test('should fail on a bad long flag', function (t) {
    var expected = read(join(cwd, 'LONG_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    t.plan(1)

    execa(bin, ['--no']).then(t.fail, onfail)

    function onfail(result) {
      t.deepEqual(
        [result.exitCode, strip(result.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  helpFlags.forEach(function (flag) {
    t.test('should show help on `' + flag + '`', function (t) {
      var expected = read(join(cwd, 'HELP'), 'utf8').replace(/\r/g, '').trim()

      t.plan(1)

      execa(bin, [flag]).then(onsuccess, t.fail)

      function onsuccess(result) {
        t.deepEqual(
          [result.stdout, result.stderr],
          [expected, ''],
          'should work'
        )
      }
    })
  })

  versionFlags.forEach(function (flag) {
    t.test('should show help on `' + flag + '`', function (t) {
      t.plan(1)

      execa(bin, [flag]).then(onsuccess, t.fail)

      function onsuccess(result) {
        t.deepEqual(
          [result.stdout, result.stderr],
          ['0.0.0', ''],
          'should work'
        )
      }
    })
  })

  t.test('should honour `--color`', function (t) {
    var expected =
      '\u001B[4m\u001B[32mone.txt\u001B[39m\u001B[24m: no issues found'

    t.plan(1)

    execa(bin, ['--color', 'one.txt']).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, result.stderr],
        ['one', expected],
        'should work'
      )
    }
  })

  t.test('should honour `--no-color`', function (t) {
    var expected = 'one.txt: no issues found'

    t.plan(1)

    execa(bin, ['--no-color', 'one.txt']).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, result.stderr],
        ['one', expected],
        'should work'
      )
    }
  })

  extFlags.forEach(function (flag) {
    t.test('should honour `' + flag + '`', function (t) {
      var expected = [
        'alpha.text: no issues found',
        'bravo.text: no issues found',
        'charlie' + sep + 'delta.text: no issues found',
        'charlie' + sep + 'echo.text: no issues found',
        'delta.text: no issues found'
      ].join('\n')

      t.plan(1)

      execa(bin, ['.', flag, 'text']).then(onsuccess, t.fail)

      function onsuccess(result) {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      }
    })

    t.test('should fail on `' + flag + '` without value', function (t) {
      var expected =
        'Error: Missing value: -e --ext <extensions> specify extensions'

      t.plan(1)

      execa(bin, ['.', flag]).then(t.fail, onfail)

      function onfail(result) {
        t.deepEqual(
          [result.stdout, result.stderr],
          ['', expected],
          'should fail'
        )
      }
    })

    t.test('should allow an extra `-e` after `' + flag + '`', function (t) {
      var expected = [
        'alpha.text: no issues found',
        'bravo.text: no issues found',
        'charlie' + sep + 'delta.text: no issues found',
        'charlie' + sep + 'echo.text: no issues found',
        'delta.text: no issues found'
      ].join('\n')

      t.plan(1)

      execa(bin, ['.', flag, 'text', '-e']).then(onsuccess, t.fail)

      function onsuccess(result) {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['', expected],
          'should work'
        )
      }
    })
  })

  settingsFlags.forEach(function (flag) {
    t.test('should catch syntax errors in `' + flag + '`', function (t) {
      var expected =
        "Error: Cannot parse `foo:bar` as JSON: JSON5: invalid character 'b' at 1:6"

      t.plan(1)

      // Should be quoted.
      execa(bin, ['.', flag, 'foo:bar']).then(t.fail, onfail)

      function onfail(result) {
        t.deepEqual(
          [result.exitCode, strip(result.stderr)],
          [1, expected],
          'should fail'
        )
      }
    })

    t.test('should honour `' + flag + '`', function (t) {
      var bin = join(fixtures, 'settings', 'cli.js')

      t.plan(1)

      execa(bin, ['one.txt', flag, '"foo-bar":"baz"']).then(onsuccess, t.fail)

      function onsuccess(result) {
        // Parser and Compiler both log stringified settings.
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['{"fooBar":"baz"}\none', 'one.txt: no issues found'],
          'should work'
        )
      }
    })
  })

  t.test('shouldn’t fail on property-like settings', function (t) {
    var expected = '{"foo":"https://example.com"}'
    var bin = join(fixtures, 'settings', 'cli.js')
    var setting = 'foo:"https://example.com"'

    t.plan(1)

    execa(bin, ['.', '--setting', setting]).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        [expected, 'one.txt: no issues found'],
        'should work'
      )
    }
  })

  useFlags.forEach(function (flag) {
    t.test('should load a plugin with `' + flag + '`', function (t) {
      var bin = join(fixtures, 'plugins', 'cli.js')

      t.plan(1)

      execa(bin, ['one.txt', flag, './plugin']).then(onsuccess, t.fail)

      function onsuccess(result) {
        // Attacher logs options, which are `undefined`.
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          ['undefined\none', 'one.txt: no issues found'],
          'should work'
        )
      }
    })

    t.test('should catch syntax errors in `' + flag + '`', function (t) {
      var expected =
        "Error: Cannot parse `foo:bar` as JSON: JSON5: invalid character 'b' at 1:6"

      t.plan(1)

      // Should be quoted.
      execa(bin, ['.', flag, './plugin=foo:bar']).then(t.fail, onfail)

      function onfail(result) {
        t.deepEqual(
          [result.exitCode, strip(result.stderr)],
          [1, expected],
          'should fail'
        )
      }
    })

    t.test('should honour `' + flag + '`', function (t) {
      var bin = join(fixtures, 'plugins', 'cli.js')
      var options = './plugin=foo:{bar:"baz",qux:1,quux:true}'

      t.plan(1)

      execa(bin, ['one.txt', flag, options]).then(onsuccess, t.fail)

      function onsuccess(result) {
        t.deepEqual(
          [result.stdout, strip(result.stderr)],
          [
            '{"foo":{"bar":"baz","qux":1,"quux":true}}\none',
            'one.txt: no issues found'
          ],
          'should fail'
        )
      }
    })
  })

  t.test('should honour `--report`', function (t) {
    var expected = JSON.stringify([
      {
        path: 'alpha.text',
        cwd: cwd,
        history: ['alpha.text'],
        messages: []
      }
    ])

    t.plan(1)

    execa(bin, ['alpha.text', '--report', 'json']).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, result.stderr],
        ['alpha', expected],
        'should work'
      )
    }
  })

  t.test('should honour `--report` with options', function (t) {
    var expected = JSON.stringify(
      [
        {
          path: 'alpha.text',
          cwd: cwd,
          history: ['alpha.text'],
          messages: []
        }
      ],
      null,
      '\t'
    )

    var setting = 'json=pretty:"\\t"'

    t.plan(1)

    execa(bin, ['alpha.text', '--report', setting]).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, result.stderr],
        ['alpha', expected],
        'should work'
      )
    }
  })

  t.test('should fail on `--report` without value', function (t) {
    t.plan(1)

    execa(bin, ['.', '--report']).then(t.fail, onfail)

    function onfail(result) {
      t.deepEqual(
        [result.exitCode, result.stderr],
        [1, 'Error: Missing value:  --report <reporter> specify reporter'],
        'should fail'
      )
    }
  })

  t.test('should support `--ignore-pattern`', function (t) {
    var expected = [
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
    ]).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should support `--ignore-path`', function (t) {
    var expected = [
      'alpha.text: no issues found',
      'bravo.text: no issues found',
      'charlie' + sep + 'echo.text: no issues found',
      'delta.text: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, [
      '.',
      '--ext',
      'text',
      '--ignore-path',
      join('charlie', 'ignore')
    ]).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should support `--ignore-path-resolve-from cwd`', function (t) {
    var expected = [
      'alpha.text: no issues found',
      'bravo.text: no issues found',
      'charlie' + sep + 'echo.text: no issues found'
    ].join('\n')

    t.plan(1)

    execa(bin, [
      '.',
      '--ext',
      'text',
      '--ignore-path',
      join('charlie', 'ignore'),
      '--ignore-path-resolve-from',
      'cwd'
    ]).then(onsuccess, t.fail)

    function onsuccess(result) {
      t.deepEqual(
        [result.stdout, strip(result.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should honour `--watch`', function (t) {
    var expected = [
      'Watching... (press CTRL+C to exit)',
      'watch.txt: no issues found',
      'watch.txt: no issues found'
    ].join('\n')
    var doc = join(cwd, 'watch.txt')
    var delay = 3000
    var resolved = false
    var proc

    t.plan(3)

    touch.sync(doc)

    proc = execa(bin, ['watch.txt', '-w'])

    if (process.platform === 'win32') {
      proc.then(t.fail, onsuccess)
    } else {
      proc.then(onsuccess, t.fail)
    }

    setTimeout(seeYouLaterAlligator, delay)

    function onsuccess(result) {
      resolved = true
      unlink(doc)
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

  t.test('should not regenerate when watching', function (t) {
    var lines = [
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

    var expected = lines.join('\n')
    var doc = join(cwd, 'watch.txt')
    var resolved = false
    var delay = 3000
    var proc

    t.plan(3)

    touch.sync(doc)

    proc = execa(bin, ['watch.txt', '-w', '-o'])

    if (process.platform === 'win32') {
      proc.then(t.fail, onsuccess)
    } else {
      proc.then(onsuccess, t.fail)
    }

    setTimeout(seeYouLaterAlligator, delay)

    function onsuccess(result) {
      resolved = true

      unlink(doc)

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

  t.test('should exit on fatal errors when watching', function (t) {
    var expected = [
      'Watching... (press CTRL+C to exit)',
      'Error: No input'
    ].join('\n')

    t.plan(1)

    execa(bin, ['-w']).then(t.fail, onfail)

    function onfail(result) {
      var actual = strip(result.stderr).split('\n').slice(0, 2).join('\n')

      t.deepEqual([result.exitCode, actual], [1, expected], 'should fail')
    }
  })

  t.test('should report uncaught exceptions', function (t) {
    var bin = join(fixtures, 'uncaught-errors', 'cli.js')
    var expected = 'one.txt: no issues found\nfoo'

    t.plan(1)

    execa(bin, ['.', '-u', './plugin']).then(t.fail, onfail)

    function onfail(result) {
      t.deepEqual(
        [result.exitCode, strip(result.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.end()
})
