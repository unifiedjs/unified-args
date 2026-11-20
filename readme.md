# unified-args

[![Build][badge-build-image]][badge-build-url]
[![Coverage][badge-coverage-image]][badge-coverage-url]
[![Downloads][badge-downloads-image]][badge-downloads-url]

**[unified][github-unified]** engine to create a command line interface from
a unified processor.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`Options`](#options)
  * [`args(options)`](#argsoptions)
* [CLI](#cli)
  * [Files](#files)
  * [`--color`](#--color)
  * [`--config`](#--config)
  * [`--ext <extensions>`](#--ext-extensions)
  * [`--file-path <path>`](#--file-path-path)
  * [`--frail`](#--frail)
  * [`--help`](#--help)
  * [`--ignore`](#--ignore)
  * [`--ignore-path <path>`](#--ignore-path-path)
  * [`--ignore-path-resolve-from cwd|dir`](#--ignore-path-resolve-from-cwddir)
  * [`--ignore-pattern <globs>`](#--ignore-pattern-globs)
  * [`--inspect`](#--inspect)
  * [`--output [path]`](#--output-path)
  * [`--quiet`](#--quiet)
  * [`--rc-path <path>`](#--rc-path-path)
  * [`--report <reporter>`](#--report-reporter)
  * [`--setting <settings>`](#--setting-settings)
  * [`--silent`](#--silent)
  * [`--silently-ignore`](#--silently-ignore)
  * [`--stdout`](#--stdout)
  * [`--tree`](#--tree)
  * [`--tree-in`](#--tree-in)
  * [`--tree-out`](#--tree-out)
  * [`--use <plugin>`](#--use-plugin)
  * [`--verbose`](#--verbose)
  * [`--version`](#--version)
  * [`--watch`](#--watch)
* [Diagnostics](#diagnostics)
* [Debugging](#debugging)
* [Compatibility](#compatibility)
* [Security](#security)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package wraps [`unified-engine`][github-unified-engine] so that it can be
used to create a command line interface.
It’s what you use underneath when you use [`remark-cli`][github-remark-cli].

## When should I use this?

You can use this to let users process multiple files from the command line,
letting them configure from the file system.

## Install

This package is [ESM only][github-gist-esm].
In Node.js (version 22.19+), install with [npm][npmjs-install]:

```sh
npm install unified-args
```

## Use

The following example creates a CLI for [remark][github-remark],
which will search for files in folders with a markdown extension,
allows [configuration][github-unified-engine-config-files]
from `.remarkrc` and `package.json` files,
[ignoring files][github-unified-engine-ignore-files]
from `.remarkignore` files,
and more.

Say our module `example.js` looks as follows:

```js
import {remark} from 'remark'
import {args} from 'unified-args'

args({
  description:
    'Command line interface to inspect and change markdown files with remark',
  extensions: [
    'md',
    'markdown',
    'mdown',
    'mkdn',
    'mkd',
    'mdwn',
    'mkdown',
    'ron'
  ],
  ignoreName: '.remarkignore',
  name: 'remark',
  packageField: 'remarkConfig',
  pluginPrefix: 'remark',
  processor: remark,
  rcName: '.remarkrc',
  version: '11.0.0'
})
```

…now running `node example.js --help` yields:

```text
Usage: remark [options] [path | glob ...]

  Command line interface to inspect and change markdown files with remark

Options:

      --[no-]color                        specify color in report (on by default)
      --[no-]config                       search for configuration files (on by default)
  -e  --ext <extensions>                  specify extensions
  …
```

## API

This package exports the identifier
[`args`][api-args].
It exports the additional [TypeScript][] type
[`Options`][api-options].
There is no default export.

### `Options`

Configuration (TypeScript type).

###### Fields

<!-- Note: `cwd` excluded in docs, it’s for testing. -->

* `description` (`string`, required)
  — description of executable
* `extensions` (`Array<string>`, required)
  — default file extensions to include
  (engine: `options.extensions`)
* `ignoreName` (`string`, required)
  — name of [ignore files][github-unified-engine-ignore-files] to load
  (engine: `options.ignoreName`)
* `name` (`string`, required)
  — name of executable
* `packageField` (`string`, required)
  — field where [configuration][github-unified-engine-config-files] can be
  found in `package.json`s
  (engine: `options.packageField`)
* `pluginPrefix` (`string`, required)
  — prefix to use when searching for plugins
  (engine: `options.pluginPrefix`)
* `processor` ([`Processor`][github-unified-processor], required)
  — processor to use
  (engine: `options.processor`)
* `rcName` (`string`, required)
  — name of [configuration files][github-unified-engine-config-files] to load
  (engine: `options.rcName`)
* `version` (`string`, required)
  — version of executable

### `args(options)`

Start the CLI.

> 👉 **Note**: this takes over the entire process.
> It parses `process.argv`, exits when its done, etc.

###### Parameters

* `options` ([`Options`][api-options], required)
  — configuration

###### Returns

Nothing (`undefined`).

## CLI

CLIs created with `unified-args`,
such as the [example][section-use] above,
have an interface similar to the below:

```text
Usage: remark [options] [path | glob ...]

  Command line interface to inspect and change markdown files with remark

Options:

      --[no-]color                        specify color in report (on by default)
      --[no-]config                       search for configuration files (on by default)
  -e  --ext <extensions>                  specify extensions
      --file-path <path>                  specify path to process as
  -f  --frail                             exit with 1 on warnings
  -h  --help                              output usage information
      --[no-]ignore                       search for ignore files (on by default)
  -i  --ignore-path <path>                specify ignore file
      --ignore-path-resolve-from cwd|dir  resolve patterns in `ignore-path` from its directory or cwd
      --ignore-pattern <globs>            specify ignore patterns
      --inspect                           output formatted syntax tree
  -o  --output [path]                     specify output location
  -q  --quiet                             output only warnings and errors
  -r  --rc-path <path>                    specify configuration file
      --report <reporter>                 specify reporter
  -s  --setting <settings>                specify settings
  -S  --silent                            output only errors
      --silently-ignore                   do not fail when given ignored files
      --[no-]stdout                       specify writing to stdout (on by default)
  -t  --tree                              specify input and output as syntax tree
      --tree-in                           specify input as syntax tree
      --tree-out                          output syntax tree
  -u  --use <plugins>                     use plugins
      --verbose                           report extra info for messages
  -v  --version                           output version number
  -w  --watch                             watch for changes and reprocess

Examples:

  # Process `input.md`
  $ remark input.md -o output.md

  # Pipe
  $ remark < input.md > output.md

  # Rewrite all applicable files
  $ remark . -o
```

### Files

All non-options passed to the cli are seen as input and can be:

* paths (`readme.txt`) and [globs][github-node-glob-primer] (`*.txt`)
  pointing to files to load
* paths (`test`) and globs (`fixtures/{in,out}/`) pointing to folders, which
  are searched for files with known extensions which are not ignored
  by patterns in [ignore files][github-unified-engine-ignore-files].
  The default behavior is to exclude files in `node_modules/` unless
  explicitly given

You can force things to be seen as input by using `--`:

```sh
cli -- globs/* and/files
```

* **default**: none
* **engine**: `options.files`

### `--color`

```sh
cli --no-color input.txt
```

Whether to output ANSI color codes in the report.

* **default**: on
* **engine**: `options.color`

> 👉 **Note**: This option may not work depending on the reporter given in
> [`--report`][cli-report].

### `--config`

```sh
cli --no-config input.txt
```

Whether to load [configuration files][github-unified-engine-config-files].

Searches for files with the [configured][api-options] `rcName`: `$rcName` and
`$rcName.json` (JSON), `$rcName.yml` and  `$rcName.yaml` (YAML), `$rcName.js`
(JavaScript), `$rcName.cjs` (CommonJS), and `$rcName.mjs` (ESM); and looks for
the configured `packageField` in `package.json` files.

* **default**: on
* **engine**: `options.detectConfig`

### `--ext <extensions>`

```sh
cli --ext html .
cli --ext htm --ext html .
cli --ext htm,html .
```

Specify one or more extensions to include when searching for files.

* **default**: [configured][api-options] `extensions`
* **alias**: `-e`
* **engine**: `options.extensions`

### `--file-path <path>`

```sh
cli --file-path input.txt < input.txt > doc/output.txt
```

File path to process the given file on **stdin**(4) as, if any.

* **default**: none
* **engine**: `options.filePath`

### `--frail`

```sh
cli --frail input.txt
```

Exit with a status code of `1` if warnings or errors occur.
The default behavior is to exit with `1` on errors.

* **default**: off
* **alias**: `-f`
* **engine**: `options.frail`

### `--help`

```sh
cli --help
```

Output short usage information.

* **default**: off
* **alias**: `-h`

### `--ignore`

```sh
cli --no-ignore .
```

Whether to load [ignore files][github-unified-engine-ignore-files].

Searches for files named [`$ignoreName`][api-options].

* **default**: on
* **engine**: `options.detectIgnore`

### `--ignore-path <path>`

```sh
cli --ignore-path .gitignore .
```

File path to an [ignore file][github-unified-engine-ignore-files] to load,
regardless of [`--ignore`][cli-ignore].

* **default**: none
* **alias**: `-i`
* **engine**: `options.ignorePath`

### `--ignore-path-resolve-from cwd|dir`

```sh
cli --ignore-path node_modules/my-config/my-ignore --ignore-path-resolve-from cwd .
```

Resolve patterns in the ignore file from its directory (`dir`, default) or the
current working directory (`cwd`).

* **default**: `'dir'`
* **engine**: `options.ignorePathResolveFrom`

### `--ignore-pattern <globs>`

```sh
cli --ignore-pattern "docs/*.md" .
```

Additional patterns to use to ignore files.

* **default**: none
* **engine**: `options.ignorePatterns`

### `--inspect`

```sh
cli --inspect < input.txt
```

Output the transformed syntax tree, formatted with
[`unist-util-inspect`][github-unist-util-inspect].
This does not run the [compilation phase][github-unified-overview].

* **default**: off
* **engine**: `options.inspect`

### `--output [path]`

```sh
cli --output -- .
cli --output doc .
cli --output doc/output.text input.txt
```

Whether to write successfully processed files, and where to.
Can be set from [configuration files][github-unified-engine-config-files].

* if output is not given, files are not written to the file system
* otherwise, if `path` is not given, files are overwritten when successful
* otherwise, if `path` points to a folder, files are written there
* otherwise, if one file is processed, the file is written to `path`

> 👉 **Note**: intermediate folders are not created.

* **default**: off
* **alias**: `-o`
* **engine**: `options.output`

### `--quiet`

```sh
cli --quiet input.txt
```

Ignore files without any messages in the report.
The default behavior is to show a success message.

* **default**: off
* **alias**: `-q`
* **engine**: `options.quiet`

> 👉 **Note**: this option may not work depending on the reporter given in
> [`--report`][cli-report].

### `--rc-path <path>`

```sh
cli --rc-path config.json .
```

File path to a [configuration file][github-unified-engine-config-files] to
load, regardless of [`--config`][cli-config].

* **default**: none
* **alias**: `-r`
* **engine**: `options.rcPath`

### `--report <reporter>`

```sh
cli --report ./reporter.js input.txt
cli --report vfile-reporter-json input.txt
cli --report json input.txt
cli --report json=pretty:2 input.txt
cli --report 'json=pretty:"\t"' input.txt
# Only last one is used:
cli --report pretty --report json input.txt
```

[Reporter][github-vfile-reporters] to load by its name or path,
optionally with options,
and use to report metadata about every processed file.

To pass options, follow the name by an equals sign (`=`) and settings, which
have the same in syntax as [`--setting <settings>`][cli-setting].

The prefix `vfile-reporter-` can be omitted.
Prefixed reporters are preferred over modules without prefix.

If multiple reporters are given, the last one is used.

* **default**: none, which uses [`vfile-reporter`][github-vfile-reporter]
* **engine**: `options.reporter` and `options.reporterOptions`

> 👉 **Note**: the [`quiet`][cli-quiet], [`silent`][cli-silent], and
> [`color`][cli-color] options may not work with the used reporter.
> If they are given, they are preferred over the same properties in reporter
> settings.

### `--setting <settings>`

```sh
cli --setting alpha:true input.txt
cli --setting bravo:true --setting '"charlie": "delta"' input.txt
cli --setting echo-foxtrot:-2 input.txt
cli --setting 'golf: false, hotel-india: ["juliet", 1]' input.txt
```

Configuration for the parser and compiler of the processor.
Can be set from [configuration files][github-unified-engine-config-files].

The given settings are [JSON5][github-json5],
with one exception: surrounding braces must not be used.
Instead, use JSON syntax without braces, such as
`"foo": 1, "bar": "baz"`.

* **default**: none
* **alias**: `-s`
* **engine**: `options.settings`

### `--silent`

```sh
cli --silent input.txt
```

Show only fatal errors in the report.
Turns [`--quiet`][cli-quiet] on.

* **default**: off
* **alias**: `-S`
* **engine**: `options.silent`

> 👉 **Note**: this option may not work depending on the reporter given in
> [`--report`][cli-report].

### `--silently-ignore`

```sh
cli --silently-ignore **/*.md
```

Skip given files which are ignored by ignore files, instead of warning about
them.

* **default**: off
* **engine**: `options.silentlyIgnore`

### `--stdout`

```sh
cli --no-stdout input.txt
```

Whether to write a processed file to **stdout**(4).

* **default**: off if [`--output`][cli-output] or [`--watch`][cli-watch] are
  given, or if multiple files could be processed
* **engine**: `options.out`

### `--tree`

```sh
cli --tree < input.json > output.json
```

Treat input as a syntax tree in JSON and output the transformed syntax tree.
This runs neither the
[parsing nor the compilation phase][github-unified-overview].

* **default**: off
* **alias**: `-t`
* **engine**: `options.tree`

### `--tree-in`

```sh
cli --tree-in < input.json > input.txt
```

Treat input as a syntax tree in JSON.
This does not run the [parsing phase][github-unified-overview].

* **default**: same as `--tree`
* **engine**: `options.treeIn`

### `--tree-out`

```sh
cli --tree-out < input.txt > output.json
```

Output the transformed syntax tree.
This does not run the [compilation phase][github-unified-overview].

* **default**: same as `--tree`
* **engine**: `options.treeOut`

### `--use <plugin>`

```sh
cli --use remark-man input.txt
cli --use man input.txt
cli --use 'toc=max-depth:3' input.txt
cli --use ./plugin.js input.txt
```

Plugin to load by its name or path, optionally with options, and use on every
processed file.
Can be set from [configuration files][github-unified-engine-config-files].

To pass options, follow the plugin by an equals sign (`=`) and settings, which
have the same in syntax as [`--setting <settings>`][cli-setting].

Plugins prefixed with the [configured][api-options] `pluginPrefix` are
preferred over modules without prefix.

* **default**: none
* **alias**: `-u`
* **engine**: `options.plugins`

### `--verbose`

```sh
cli --verbose input.txt
```

Print more info for messages.

* **default**: off
* **engine**: `options.verbose`

> 👉 **Note**: this option may not work depending on the reporter given in
> [`--report`][cli-report].

### `--version`

```sh
cli --version
```

Output version number.

* **default**: off
* **alias**: `-v`

### `--watch`

```sh
cli -qwo .
```

Yields:

```text
Watching... (press CTRL+C to exit)
Note: Ignoring `--output` until exit.
```

Process as normal, then watch found files and reprocess when they change.
The watch is stopped when `SIGINT` is received (usually done by pressing
`CTRL-C`).

If [`--output`][cli-output] is given without `path`, it is not honored, to
prevent an infinite loop.
On operating systems other than Windows, when the watch closes, a final process
runs including `--output`.

* **default**: off
* **alias**: `-w`

## Diagnostics

CLIs created with **unified-args** exit with:

* `1` on fatal errors
* `1` on warnings in [`--frail`][cli-frail] mode, `0` on warnings otherwise
* `0` on success

## Debugging

CLIs can be debugged by setting the [`DEBUG`][github-debug] environment variable
to `*`, such as `DEBUG="*" cli example.txt`.

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `unified-args@12`,
compatible with Node.js 22.19+.

## Security

`unified-args` loads and evaluates configuration files, plugins, and presets
from the file system (often from `node_modules/`).
That means code that is on your file system runs.
Make sure you trust the workspace where you run `unified-args` and be careful
with packages from npm and changes made by contributors.

## Contribute

See [`contributing.md`][health-contributing] in [`unifiedjs/.github`][health]
for ways to get started.
See [`support.md`][health-support] for ways to get help.

This project has a [code of conduct][health-coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][file-license] © [Titus Wormer][wooorm]

<!-- Definitions -->

[api-args]: #argsoptions

[api-options]: #options

[badge-build-image]: https://github.com/unifiedjs/unified-args/workflows/main/badge.svg

[badge-build-url]: https://github.com/unifiedjs/unified-args/actions

[badge-coverage-image]: https://img.shields.io/codecov/c/github/unifiedjs/unified-args.svg

[badge-coverage-url]: https://codecov.io/github/unifiedjs/unified-args

[badge-downloads-image]: https://img.shields.io/npm/dm/unified-args.svg

[badge-downloads-url]: https://www.npmjs.com/package/unified-args

[cli-color]: #--color

[cli-config]: #--config

[cli-frail]: #--frail

[cli-ignore]: #--ignore

[cli-output]: #--output-path

[cli-quiet]: #--quiet

[cli-report]: #--report-reporter

[cli-setting]: #--setting-settings

[cli-silent]: #--silent

[cli-watch]: #--watch

[file-license]: license

[github-debug]: https://github.com/debug-js/debug

[github-gist-esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[github-json5]: https://github.com/json5/json5

[github-node-glob-primer]: https://github.com/isaacs/node-glob#glob-primer

[github-remark]: https://github.com/remarkjs/remark

[github-remark-cli]: https://github.com/remarkjs/remark/tree/main/packages/remark-cli

[github-unified]: https://github.com/unifiedjs/unified

[github-unified-engine]: https://github.com/unifiedjs/unified-engine

[github-unified-engine-config-files]: https://github.com/unifiedjs/unified-engine#config-files

[github-unified-engine-ignore-files]: https://github.com/unifiedjs/unified-engine#ignore-files

[github-unified-overview]: https://github.com/unifiedjs/unified#overview

[github-unified-processor]: https://github.com/unifiedjs/unified#processor-1

[github-unist-util-inspect]: https://github.com/syntax-tree/unist-util-inspect

[github-vfile-reporter]: https://github.com/vfile/vfile-reporter

[github-vfile-reporters]: https://github.com/vfile/vfile#reporters

[health]: https://github.com/unifiedjs/.github

[health-coc]: https://github.com/unifiedjs/.github/blob/main/code-of-conduct.md

[health-contributing]: https://github.com/unifiedjs/.github/blob/main/contributing.md

[health-support]: https://github.com/unifiedjs/.github/blob/main/support.md

[npmjs-install]: https://docs.npmjs.com/cli/install

[section-use]: #use

[typescript]: https://www.typescriptlang.org

[wooorm]: https://wooorm.com
