'use strict'

var fs = require('fs')
var path = require('path')
var execa = require('execa')
var bail = require('bail')
var test = require('tape')
var touch = require('touch')
var strip = require('strip-ansi')
var figures = require('figures')

var join = path.join
var read = fs.readFileSync
var rm = fs.unlinkSync
var sep = path.sep

var fixtures = join(__dirname, 'fixtures')

var helpFlags = ['-h', '--help']
var versionFlags = ['-v', '--version']
var extFlags = ['-e', '--ext']
var settingsFlags = ['-s', '--setting']
var useFlags = ['-u', '--use']

var cwd = join(fixtures, 'example')
var bin = join(cwd, 'cli.js')

process.on('unhandledRejection', bail)

test('unified-args', function(t) {
  t.test('should fail on missing files', function(st) {
    var expected = [
      'missing.txt',
      '  1:1  error  No such file or directory',
      '',
      figures.cross + ' 1 error'
    ].join('\n')

    st.plan(1)

    execa(bin, ['missing.txt']).then(st.fail, onfail)

    function onfail(res) {
      st.deepEqual(
        [res.exitCode, strip(res.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.test('should accept a path to a file', function(st) {
    st.plan(1)

    execa(bin, ['one.txt']).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual(
        [res.stdout, strip(res.stderr)],
        ['one', 'one.txt: no issues found'],
        'should work'
      )
    }
  })

  t.test('should accept a path to a directory', function(st) {
    var expected = [
      'one.txt: no issues found',
      'three' + sep + 'five.txt: no issues found',
      'three' + sep + 'four.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    st.plan(1)

    execa(bin, ['.']).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual(
        [res.stdout, strip(res.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should accept a glob to files', function(st) {
    var expected = [
      'one.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    st.plan(1)

    execa(bin, ['*.txt']).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual(
        [res.stdout, strip(res.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should accept a glob to a directory', function(st) {
    var expected = [
      'three' + sep + 'five.txt: no issues found',
      'three' + sep + 'four.txt: no issues found'
    ].join('\n')

    st.plan(1)

    execa(bin, ['thr+(e)']).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual(
        [res.stdout, strip(res.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should fail on a bad short flag', function(st) {
    var expected = read(join(cwd, 'SHORT_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    st.plan(1)

    execa(bin, ['-n']).then(st.fail, onfail)

    function onfail(res) {
      st.deepEqual(
        [res.exitCode, strip(res.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.test('should fail on a bad grouped short flag', function(st) {
    var expected = read(join(cwd, 'SHORT_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    st.plan(1)

    execa(bin, ['-on']).then(st.fail, onfail)

    function onfail(res) {
      st.deepEqual(
        [res.exitCode, strip(res.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.test('should fail on a bad long flag', function(st) {
    var expected = read(join(cwd, 'LONG_FLAG'), 'utf8')
      .replace(/\r/g, '')
      .trim()

    st.plan(1)

    execa(bin, ['--no']).then(st.fail, onfail)

    function onfail(res) {
      st.deepEqual(
        [res.exitCode, strip(res.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  helpFlags.forEach(function(flag) {
    t.test('should show help on `' + flag + '`', function(st) {
      var expected = read(join(cwd, 'HELP'), 'utf8')
        .replace(/\r/g, '')
        .trim()

      st.plan(1)

      execa(bin, [flag]).then(onsuccess, st.fail)

      function onsuccess(res) {
        st.deepEqual([res.stdout, res.stderr], [expected, ''], 'should work')
      }
    })
  })

  versionFlags.forEach(function(flag) {
    t.test('should show help on `' + flag + '`', function(st) {
      st.plan(1)

      execa(bin, [flag]).then(onsuccess, st.fail)

      function onsuccess(res) {
        st.deepEqual([res.stdout, res.stderr], ['0.0.0', ''], 'should work')
      }
    })
  })

  t.test('should honour `--color`', function(st) {
    var expected =
      '\u001B[4m\u001B[32mone.txt\u001B[39m\u001B[24m: no issues found'

    st.plan(1)

    execa(bin, ['--color', 'one.txt']).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual([res.stdout, res.stderr], ['one', expected], 'should work')
    }
  })

  t.test('should honour `--no-color`', function(st) {
    var expected = 'one.txt: no issues found'

    st.plan(1)

    execa(bin, ['--no-color', 'one.txt']).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual([res.stdout, res.stderr], ['one', expected], 'should work')
    }
  })

  extFlags.forEach(function(flag) {
    t.test('should honour `' + flag + '`', function(st) {
      var expected = [
        'alpha.text: no issues found',
        'bravo.text: no issues found',
        'charlie' + sep + 'delta.text: no issues found',
        'charlie' + sep + 'echo.text: no issues found'
      ].join('\n')

      st.plan(1)

      execa(bin, ['.', flag, 'text']).then(onsuccess, st.fail)

      function onsuccess(res) {
        st.deepEqual(
          [res.stdout, strip(res.stderr)],
          ['', expected],
          'should work'
        )
      }
    })

    t.test('should fail on `' + flag + '` without value', function(st) {
      var expected =
        'Error: Missing value: -e --ext <extensions> specify extensions'

      st.plan(1)

      execa(bin, ['.', flag]).then(st.fail, onfail)

      function onfail(res) {
        st.deepEqual([res.stdout, res.stderr], ['', expected], 'should fail')
      }
    })

    t.test('should allow an extra `-e` after `' + flag + '`', function(st) {
      var expected = [
        'alpha.text: no issues found',
        'bravo.text: no issues found',
        'charlie' + sep + 'delta.text: no issues found',
        'charlie' + sep + 'echo.text: no issues found'
      ].join('\n')

      st.plan(1)

      execa(bin, ['.', flag, 'text', '-e']).then(onsuccess, st.fail)

      function onsuccess(res) {
        st.deepEqual(
          [res.stdout, strip(res.stderr)],
          ['', expected],
          'should work'
        )
      }
    })
  })

  settingsFlags.forEach(function(flag) {
    t.test('should catch syntax errors in `' + flag + '`', function(st) {
      var expected =
        "Error: Cannot parse `foo:bar` as JSON: JSON5: invalid character 'b' at 1:6"

      st.plan(1)

      // Should be quoted.
      execa(bin, ['.', flag, 'foo:bar']).then(st.fail, onfail)

      function onfail(res) {
        st.deepEqual(
          [res.exitCode, strip(res.stderr)],
          [1, expected],
          'should fail'
        )
      }
    })

    t.test('should honour `' + flag + '`', function(st) {
      var bin = join(fixtures, 'settings', 'cli.js')

      st.plan(1)

      execa(bin, ['one.txt', flag, '"foo-bar":"baz"']).then(onsuccess, st.fail)

      function onsuccess(res) {
        // Parser and Compiler both log stringified settings.
        st.deepEqual(
          [res.stdout, strip(res.stderr)],
          ['{"fooBar":"baz"}\none', 'one.txt: no issues found'],
          'should work'
        )
      }
    })
  })

  t.test('shouldn’t fail on property-like settings', function(st) {
    var expected = '{"foo":"https://example.com"}'
    var bin = join(fixtures, 'settings', 'cli.js')
    var setting = 'foo:"https://example.com"'

    st.plan(1)

    execa(bin, ['.', '--setting', setting]).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual(
        [res.stdout, strip(res.stderr)],
        [expected, 'one.txt: no issues found'],
        'should work'
      )
    }
  })

  useFlags.forEach(function(flag) {
    t.test('should load a plugin with `' + flag + '`', function(st) {
      var bin = join(fixtures, 'plugins', 'cli.js')

      st.plan(1)

      execa(bin, ['one.txt', flag, './plugin']).then(onsuccess, st.fail)

      function onsuccess(res) {
        // Attacher logs options, which are `undefined`.
        st.deepEqual(
          [res.stdout, strip(res.stderr)],
          ['undefined\none', 'one.txt: no issues found'],
          'should work'
        )
      }
    })

    t.test('should catch syntax errors in `' + flag + '`', function(st) {
      var expected =
        "Error: Cannot parse `foo:bar` as JSON: JSON5: invalid character 'b' at 1:6"

      st.plan(1)

      // Should be quoted.
      execa(bin, ['.', flag, './plugin=foo:bar']).then(st.fail, onfail)

      function onfail(res) {
        st.deepEqual(
          [res.exitCode, strip(res.stderr)],
          [1, expected],
          'should fail'
        )
      }
    })

    t.test('should honour `' + flag + '`', function(st) {
      var bin = join(fixtures, 'plugins', 'cli.js')
      var opts = './plugin=foo:{bar:"baz",qux:1,quux:true}'

      st.plan(1)

      execa(bin, ['one.txt', flag, opts]).then(onsuccess, st.fail)

      function onsuccess(res) {
        st.deepEqual(
          [res.stdout, strip(res.stderr)],
          [
            '{"foo":{"bar":"baz","qux":1,"quux":true}}\none',
            'one.txt: no issues found'
          ],
          'should fail'
        )
      }
    })
  })

  t.test('should honour `--report`', function(st) {
    var expected = JSON.stringify([
      {
        path: 'alpha.text',
        cwd: cwd,
        history: ['alpha.text'],
        messages: []
      }
    ])

    st.plan(1)

    execa(bin, ['alpha.text', '--report', 'json']).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual([res.stdout, res.stderr], ['alpha', expected], 'should work')
    }
  })

  t.test('should honour `--report` with options', function(st) {
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

    st.plan(1)

    execa(bin, ['alpha.text', '--report', setting]).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual([res.stdout, res.stderr], ['alpha', expected], 'should work')
    }
  })

  t.test('should fail on `--report` without value', function(st) {
    st.plan(1)

    execa(bin, ['.', '--report']).then(st.fail, onfail)

    function onfail(res) {
      st.deepEqual(
        [res.exitCode, res.stderr],
        [1, 'Error: Missing value:  --report <reporter> specify reporter'],
        'should fail'
      )
    }
  })

  t.test('should support `--ignore-pattern`', function(st) {
    var expected = [
      'alpha.text: no issues found',
      'bravo.text: no issues found',
      'one.txt: no issues found',
      'two.txt: no issues found'
    ].join('\n')

    st.plan(1)

    execa(bin, [
      '.',
      '--ext',
      'txt,text',
      '--ignore-pattern',
      'charlie/*,three/*.txt'
    ]).then(onsuccess, st.fail)

    function onsuccess(res) {
      st.deepEqual(
        [res.stdout, strip(res.stderr)],
        ['', expected],
        'should work'
      )
    }
  })

  t.test('should honour `--watch`', function(st) {
    var expected = [
      'Watching... (press CTRL+C to exit)',
      'watch.txt: no issues found',
      'watch.txt: no issues found'
    ].join('\n')
    var doc = join(cwd, 'watch.txt')
    var delay = 3000
    var resolved = false
    var proc

    st.plan(3)

    touch.sync(doc)

    proc = execa(bin, ['watch.txt', '-w'])

    if (process.platform === 'win32') {
      proc.then(st.fail, onsuccess)
    } else {
      proc.then(onsuccess, st.fail)
    }

    setTimeout(seeYouLaterAlligator, delay)

    function onsuccess(res) {
      resolved = true
      rm(doc)
      st.deepEqual(
        [res.stdout, strip(res.stderr).trim()],
        ['', expected],
        'should work'
      )
    }

    function seeYouLaterAlligator() {
      st.equal(resolved, false, 'should still be running (#1)')
      touch.sync(doc)
      setTimeout(afterAWhileCrocodile, delay)
    }

    function afterAWhileCrocodile() {
      st.equal(resolved, false, 'should still be running (#2)')
      proc.kill('SIGINT')
    }
  })

  t.test('should not regenerate when watching', function(st) {
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

    st.plan(3)

    touch.sync(doc)

    proc = execa(bin, ['watch.txt', '-w', '-o'])

    if (process.platform === 'win32') {
      proc.then(st.fail, onsuccess)
    } else {
      proc.then(onsuccess, st.fail)
    }

    setTimeout(seeYouLaterAlligator, delay)

    function onsuccess(res) {
      resolved = true

      rm(doc)

      st.deepEqual(
        [res.stdout, strip(res.stderr)],
        ['', expected],
        'should work'
      )
    }

    function seeYouLaterAlligator() {
      st.equal(resolved, false, 'should still be running (#1)')
      touch.sync(doc)
      setTimeout(afterAWhileCrocodile, delay)
    }

    function afterAWhileCrocodile() {
      st.equal(resolved, false, 'should still be running (#2)')
      proc.kill('SIGINT')
    }
  })

  t.test('should exit on fatal errors when watching', function(st) {
    var expected = [
      'Watching... (press CTRL+C to exit)',
      'Error: No input'
    ].join('\n')

    st.plan(1)

    execa(bin, ['-w']).then(st.fail, onfail)

    function onfail(res) {
      var actual = strip(res.stderr)
        .split('\n')
        .slice(0, 2)
        .join('\n')

      st.deepEqual([res.exitCode, actual], [1, expected], 'should fail')
    }
  })

  t.test('should report uncaught exceptions', function(st) {
    var bin = join(fixtures, 'uncaught-errors', 'cli.js')
    var expected = 'one.txt: no issues found\nfoo'

    st.plan(1)

    execa(bin, ['.', '-u', './plugin']).then(st.fail, onfail)

    function onfail(res) {
      st.deepEqual(
        [res.exitCode, strip(res.stderr)],
        [1, expected],
        'should fail'
      )
    }
  })

  t.end()
})
