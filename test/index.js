/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module unified:args
 * @fileoverview Test suite for `unified-args`.
 */

'use strict';

/* Dependencies. */
var fs = require('fs');
var path = require('path');
var execa = require('execa');
var bail = require('bail');
var test = require('tape');
var touch = require('touch');
var strip = require('strip-ansi');

/* Methods. */
var join = path.join;
var read = fs.readFileSync;
var rm = fs.unlinkSync;

/* Constants. */
var fixtures = join(__dirname, 'fixtures');

process.on('unhandledRejection', bail);

/* Tests. */
test('unified-args', function (t) {
  t.test('should fail on missing files', function (st) {
    var bin = join(fixtures, 'example', 'cli.js');

    st.plan(2);

    execa.stderr(bin, ['missing.txt']).catch(function (err) {
      st.equal(err.code, 1, 'should exit with `1`');
      st.equal(
        strip(err.stderr),
        [
          'missing.txt',
          '  1:1  error  No such file or directory',
          '',
          '✖ 1 error',
          ''
        ].join('\n'),
        'should report'
      );
    });
  });

  t.test('should accept a path to a file', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');

    st.plan(2);

    execa(bin, ['one.txt']).then(function (result) {
      st.equal(result.stdout, 'one', 'should output');

      st.equal(
        strip(result.stderr),
        'one.txt: no issues found',
        'should report'
      );
    });
  });

  t.test('should accept a path to a directory', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');

    st.plan(2);

    execa(bin, ['.']).then(function (result) {
      st.equal(result.stdout, '', 'should not output');

      st.equal(
        strip(result.stderr),
        [
          'one.txt: no issues found',
          'three/five.txt: no issues found',
          'three/four.txt: no issues found',
          'two.txt: no issues found'
        ].join('\n'),
        'should report'
      );
    });
  });

  t.test('should accept a glob to files', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');

    st.plan(2);

    execa(bin, ['*.txt']).then(function (result) {
      st.equal(result.stdout, '', 'should not output');

      st.equal(
        strip(result.stderr),
        [
          'one.txt: no issues found',
          'two.txt: no issues found'
        ].join('\n'),
        'should report'
      );
    });
  });

  t.test('should accept a glob to a directory', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');

    st.plan(2);

    execa(bin, ['thr+(e)']).then(function (result) {
      st.equal(result.stdout, '', 'should not output');

      st.equal(
        strip(result.stderr),
        [
          'three/five.txt: no issues found',
          'three/four.txt: no issues found'
        ].join('\n'),
        'should report'
      );
    });
  });

  t.test('should fail on a bad short flag', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');
    var output = read(join(cwd, 'SHORT_FLAG'), 'utf8');

    st.plan(2);

    execa(bin, ['-n']).catch(function (err) {
      st.equal(err.code, 1, 'should exit with `1`');
      st.equal(
        strip(err.stderr),
        output,
        'should report with a list of good short flags'
      );
    });
  });

  t.test('should fail on a bad grouped short flag', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');
    var output = read(join(cwd, 'SHORT_FLAG'), 'utf8');

    st.plan(2);

    execa(bin, ['-on']).catch(function (err) {
      st.equal(err.code, 1, 'should exit with `1`');
      st.equal(
        strip(err.stderr),
        output,
        'should report with a list of good short flags'
      );
    });
  });

  t.test('should fail on a bad long flag', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');
    var output = read(join(cwd, 'LONG_FLAG'), 'utf8');

    st.plan(2);

    execa(bin, ['--no']).catch(function (err) {
      st.equal(err.code, 1, 'should exit with `1`');
      st.equal(
        strip(err.stderr),
        output,
        'should report with a list of good long flags'
      );
    });
  });

  ['-h', '--help'].forEach(function (flag) {
    t.test('should show help on `' + flag + '`', function (st) {
      var cwd = join(fixtures, 'example');
      var bin = join(cwd, 'cli.js');
      var help = read(join(cwd, 'HELP'), 'utf8').trim();

      st.plan(1);

      execa.stderr(bin, [flag]).then(function (result) {
        st.equal(result, help, 'should show help');
      });
    });
  });

  ['-v', '--version'].forEach(function (flag) {
    t.test('should show help on `' + flag + '`', function (st) {
      var bin = join(fixtures, 'example', 'cli.js');

      st.plan(1);

      execa.stderr(bin, [flag]).then(function (result) {
        st.equal(result, '0.0.0', 'should show version');
      });
    });
  });

  t.test('should honour `--color`', function (st) {
    var bin = join(fixtures, 'example', 'cli.js');

    st.plan(1);

    execa.stderr(bin, ['--color', 'one.txt']).then(function (result) {
      st.equal(
        result,
        '\x1b[4m\x1b[32mone.txt\x1b[39m\x1b[24m: no issues found',
        'should report'
      );
    });
  });

  t.test('should honour `--no-color`', function (st) {
    var bin = join(fixtures, 'example', 'cli.js');

    st.plan(1);

    execa.stderr(bin, ['--no-color', 'one.txt']).then(function (result) {
      st.equal(
        result,
        'one.txt: no issues found',
        'should report'
      );
    });
  });

  ['-e', '--ext'].forEach(function (flag) {
    t.test('should honour `' + flag + '`', function (st) {
      var cwd = join(fixtures, 'example');
      var bin = join(cwd, 'cli.js');

      st.plan(2);

      execa(bin, ['.', flag, 'text']).then(function (result) {
        st.equal(result.stdout, '', 'should not output');

        st.equal(
          strip(result.stderr),
          [
            'alpha.text: no issues found',
            'bravo.text: no issues found',
            'charlie/delta.text: no issues found',
            'charlie/echo.text: no issues found'
          ].join('\n'),
          'should report'
        );
      });
    });

    t.test('should fail on `' + flag + '` without value', function (st) {
      var cwd = join(fixtures, 'example');
      var bin = join(cwd, 'cli.js');

      st.plan(2);

      execa(bin, ['.', flag]).catch(function (err) {
        st.equal(err.code, 1, 'should exit with `1`');

        st.equal(
          strip(err.stderr),
          'Error: Missing value: -e --ext <extensions> ' +
          'specify extensions\n',
          'should report'
        );
      });
    });

    t.test('should allow an extra `-e` after `' + flag + '`',
      function (st) {
        var cwd = join(fixtures, 'example');
        var bin = join(cwd, 'cli.js');

        st.plan(1);

        execa(bin, ['.', flag, 'text', '-e']).then(function (result) {
          st.equal(
            strip(result.stderr),
            [
              'alpha.text: no issues found',
              'bravo.text: no issues found',
              'charlie/delta.text: no issues found',
              'charlie/echo.text: no issues found'
            ].join('\n'),
            'should report'
          );
        });
      }
    );
  });

  ['-s', '--setting'].forEach(function (flag) {
    t.test('should catch syntax errors in `' + flag + '`', function (st) {
      var cwd = join(fixtures, 'settings');
      var bin = join(cwd, 'cli.js');

      st.plan(2);

      /* Should be quoted. */
      execa(bin, ['.', flag, 'foo:bar']).catch(function (err) {
        var stderr = err.stderr;

        st.equal(err.code, 1, 'should exit with `1`');

        st.equal(
          stderr.slice(0, stderr.indexOf(' in ')),
          'Error: Cannot parse `foo:bar` as JSON: ' +
          'Unexpected token f',
          'should report'
        );
      });
    });

    t.test('should honour `' + flag + '`', function (st) {
      var cwd = join(fixtures, 'settings');
      var bin = join(cwd, 'cli.js');

      st.plan(2);

      execa(bin, [
        'one.txt', flag, 'foo-bar:"baz"'
      ]).then(function (result) {
        /* Parser and Compiler both log stringified settings. */
        st.equal(
          result.stdout,
          [
            '{"fooBar":"baz"}',
            'one'
          ].join('\n'),
          'should pass settings and output'
        );

        st.equal(
          strip(result.stderr),
          [
            'one.txt: no issues found'
          ].join('\n'),
          'should report'
        );
      });
    });
  });

  t.test('shouldn’t fail on property-like settings', function (st) {
    var cwd = join(fixtures, 'settings');
    var bin = join(cwd, 'cli.js');

    st.plan(1);

    /* Should be quoted. */
    execa(bin, ['.', '--setting', 'foo:"https://example.com"']).then(function (result) {
      st.equal(result.stdout, '{"foo":"https://example.com"}', 'should work');
    });
  });

  ['-u', '--use'].forEach(function (flag) {
    t.test('should load a plugin with `' + flag + '`', function (st) {
      var cwd = join(fixtures, 'plugins');
      var bin = join(cwd, 'cli.js');

      st.plan(2);

      execa(bin, ['one.txt', flag, './plugin']).then(function (result) {
        /* Attacher logs options, which are `undefined`. */
        st.equal(
          result.stdout,
          [
            'undefined',
            'one'
          ].join('\n'),
          'should pass settings and output'
        );

        st.equal(
          strip(result.stderr),
          [
            'one.txt: no issues found'
          ].join('\n'),
          'should report'
        );
      });
    });

    t.test('should catch syntax errors in `' + flag + '`', function (st) {
      var cwd = join(fixtures, 'plugins');
      var bin = join(cwd, 'cli.js');

      st.plan(2);

      /* Should be quoted. */
      execa(bin, ['.', flag, './plugin=foo:bar']).catch(function (err) {
        var stderr = strip(err.stderr);

        st.equal(err.code, 1, 'should exit with `1`');

        st.equal(
          stderr.slice(0, stderr.indexOf(' in ')),
          'Error: Cannot parse `foo:bar` as JSON: ' +
          'Unexpected token f',
          'should report'
        );
      });
    });

    t.test('should honour `' + flag + '`', function (st) {
      var cwd = join(fixtures, 'plugins');
      var bin = join(cwd, 'cli.js');
      var opts = './plugin=foo:{bar:"baz",qux:1,quux:true}';

      st.plan(2);

      execa(bin, ['one.txt', flag, opts]).then(function (result) {
        /* Attacher log JSON.stringified options. */
        st.equal(
          result.stdout,
          [
            '{"foo":{"bar":"baz","qux":1,"quux":true}}',
            'one'
          ].join('\n'),
          'should pass settings and output'
        );

        st.equal(
          strip(result.stderr),
          [
            'one.txt: no issues found'
          ].join('\n'),
          'should report'
        );
      });
    });
  });

  t.test('should honour `--watch`', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');
    var doc = join(cwd, 'watch.txt');
    var resolved = false;
    var proc;

    st.plan(4);

    touch.sync(doc);

    proc = execa(bin, ['watch.txt', '-w']);

    proc.then(function (result) {
      rm(doc);

      resolved = true;

      st.equal(result.stdout, '', 'should not output');

      st.equal(
        strip(result.stderr),
        [
          'Watching... (press CTRL+C to exit)',
          'watch.txt: no issues found',
          'watch.txt: no issues found',
          ''
        ].join('\n'),
        'should debug and report'
      );
    });

    setTimeout(function () {
      st.equal(resolved, false, 'should still be running (#1)');

      touch.sync(doc);

      setTimeout(function () {
        st.equal(resolved, false, 'should still be running (#2)');

        proc.kill('SIGINT');
      }, 3000);
    }, 3000);
  });

  t.test('should not regenerate when watching', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');
    var doc = join(cwd, 'watch.txt');
    var resolved = false;
    var proc;

    st.plan(4);

    touch.sync(doc);

    proc = execa(bin, ['watch.txt', '-wo']);

    proc.then(function (result) {
      rm(doc);

      resolved = true;

      st.equal(result.stdout, '', 'should not output');

      st.equal(
        strip(result.stderr),
        [
          'Watching... (press CTRL+C to exit)',
          'Note: Ignoring `--output` until exit.',
          'watch.txt: no issues found',
          'watch.txt: no issues found',
          '',
          'watch.txt: written'
        ].join('\n'),
        'should debug and report'
      );
    });

    setTimeout(function () {
      st.equal(resolved, false, 'should still be running (#1)');

      touch.sync(doc);

      setTimeout(function () {
        st.equal(resolved, false, 'should still be running (#2)');

        proc.kill('SIGINT');
      }, 3000);
    }, 3000);
  });

  t.test('should exit on fatal errors when watching', function (st) {
    var cwd = join(fixtures, 'example');
    var bin = join(cwd, 'cli.js');

    st.plan(2);

    execa(bin, ['-w']).catch(function (err) {
      var stderr = strip(err.stderr);

      st.equal(err.code, 1, 'should exit with 1');

      st.equal(
        stderr.split('\n').slice(0, 2).join('\n'),
        [
          'Watching... (press CTRL+C to exit)',
          'Error: No input'
        ].join('\n'),
        'should show the error'
      );
    });
  });

  t.test('should report uncaught exceptions', function (st) {
    var cwd = join(fixtures, 'uncaught-errors');
    var bin = join(cwd, 'cli.js');

    st.plan(2);

    execa(bin, ['.', '-u', './plugin']).catch(function (err) {
      st.equal(err.code, 1, 'should exit with `1`');

      st.equal(
        strip(err.stderr),
        [
          'one.txt: no issues found',
          'foo',
          ''
        ].join('\n'),
        'should report uncaught exceptions'
      );
    });
  });

  t.end();
});
