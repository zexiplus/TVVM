const rollup = require('rollup')
const chalk = require('chalk')
const path = require('path')
const log = console.log
const { watchConfig } = require('../config/rollup.config')

const watcher = rollup.watch(watchConfig)
watcher.on('event', (event) => {
  // event.code can be one of:
  //   START        — the watcher is (re)starting
  //   BUNDLE_START — building an individual bundle
  //   BUNDLE_END   — finished building a bundle
  //   END          — finished building all bundles
  //   ERROR        — encountered an error while bundling
  //   FATAL        — encountered an unrecoverable error
  if (event.code === 'BUNDLE_END') {
    event.output.forEach(item => {
      log(chalk.yellow(`bundle ${event.input} to ${item.replace(process.cwd() + path.sep, '')}`))
    })
    log(chalk.yellow(`duration ${event.duration}ms\n`))
  } else if (event.code === 'END') {
    log(chalk.green('waiting for changes...'))
  }

})

// stop watching
// watcher.close();