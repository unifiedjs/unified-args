import * as start from 'unified-args'
import * as remark from 'remark'

start({
  processor: remark(),
  name: 'remark',
  description: 'description',
  version: '1.0.0',
  pluginPrefix: 'remark',
  extensions: ['md'],
  packageField: 'remarkConfig',
  rcName: '.remarkrc',
  ignoreName: '.remarkignore'
})

// $ExpectError
start({})

// $ExpectError
start({
  name: 'remark',
  description: 'description',
  version: '1.0.0'
})
