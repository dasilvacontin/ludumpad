#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2))

if (argv.V || argv.version) {
  console.log(require('../package.json').version)
  process.exit(0)
}

require('../lib')
