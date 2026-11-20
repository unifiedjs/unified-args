/**
 * @import {FlatXoConfig} from 'xo'
 */

/** @type {FlatXoConfig} */
const xoConfig = [
  {
    name: 'default',
    prettier: 'compat',
    rules: {
      complexity: 'off',
      'jsdoc/check-indentation': 'off',
      'jsdoc/check-line-alignment': 'off',
      'jsdoc/informative-docs': 'off',
      'jsdoc/reject-any-type': 'off',
      // Functions typed with `@type` are described by that type.
      'jsdoc/require-description': [
        'error',
        {exemptedBy: ['inheritdoc', 'type']}
      ],
      'jsdoc/require-asterisk-prefix': 'off',
      // Wrong for TypeScript types.
      'jsdoc/valid-types': 'off',
      'no-await-in-loop': 'off',
      'no-shadow': 'off',
      // Asserts are used to narrow types.
      'node-test/prefer-equality-assertion': 'off',
      'prefer-arrow-callback': 'off',
      'regexp/no-super-linear-move': 'off',
      'regexp/prefer-named-capture-group': 'off',
      'require-unicode-regexp': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-computed-property-existence-check': 'off',
      'unicorn/prefer-at': 'off',
      'unicorn/prefer-early-return': 'off',
      'unicorn/prefer-simple-condition-first': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/prefer-unicode-code-point-escapes': 'off',
      'unicorn/require-array-sort-compare': 'off',
      'unicorn/single-line-block-comment-style': 'off'
    },
    space: true
  },
  {
    files: ['test/**/*.js'],
    rules: {
      // Wrong for fixtures in `test/fixtures/`.
      'node-test/no-import-test-files': 'off'
    }
  },
  {
    files: ['test/fixtures/**/*.js'],
    rules: {
      // Fixtures test uncaught errors.
      'unicorn/no-top-level-side-effects': 'off'
    }
  },
  {
    files: ['package.json'],
    rules: {
      'package-json/no-orphan-types': 'off',
      'package-json/require-engines': 'off',
      'package-json/sort-files': 'off',
      'package-json/sort-properties': 'off'
    }
  },
  {
    files: ['test/fixtures/**/package.json'],
    rules: {
      'package-json/prefer-files-field': 'off',
      'package-json/require-engines': 'off',
      'package-json/require-entry-point': 'off',
      'package-json/require-fields': 'off'
    }
  }
]

export default xoConfig
