'use strict'
const tool = require('command-line-tool')
const fs = require('fs')

const cli = parseCommandLine()
let options = cli.options._all

/* jsdoc2md --help */
if (options.help) {
  tool.stop(cli.usage)

/* jsdoc2md --version */
} else if (options.version) {
  tool.stop(require('../package').version)

/* jsdoc2md --clear */
} else if (options.clear) {
  const jsdoc2md = require('../../')
  jsdoc2md.clear().catch(tool.halt)

} else {
  const jsdoc2md = require('../../')
  options = loadStoredConfig(options)

  /* jsdoc2md --json */
  if (options.json) {
    const pick = require('lodash.pick')
    jsdoc2md
      .getJsdocData(options.src, pick(options, [ 'sort-by', 'private' ]))
      .then(function (json) {
        tool.printOutput(JSON.stringify(json, null, '  '))
      })
      .catch(tool.halt)

  /* jsdoc2md --namepaths */
  } else if (options.stats) {
    jsdoc2md
      .getStats(options.src)
      .then(function (json) {
        tool.printOutput(JSON.stringify(json, null, '  '))
      })
      .catch(tool.halt)

  /* jsdoc2md --config */
  } else if (options.config) {
    const omit = require('lodash.omit')
    tool.stop(JSON.stringify(omit(options, 'config'), null, '  '))

  /* jsdoc2md [<options>] --src <files> */
  } else {
    /* input validation */
    try {
      const assert = require('assert')
      options.src = options.src || []
      assert.ok(options.src.length, 'No input files supplied')
    } catch (err) {
      tool.halt(err)
    }

    if (options.template) options.template = fs.readFileSync(options.template, 'utf8')

    jsdoc2md
      .render(options.src, options)
      .then(tool.printOutput)
      .catch(tool.halt)
  }
}

function loadStoredConfig (options) {
  const loadConfig = require('config-master')
  const jsdoc2mdConfig = loadConfig('jsdoc2md')
  return Object.assign(jsdoc2mdConfig, options)
}

function parseCommandLine () {
  const cliData = require('../lib/cli-data')
  try {
    return tool.getCli(cliData.definitions, cliData.usageSections)
  } catch (err) {
    tool.halt(err, { stack: false })
  }
}