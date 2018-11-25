const fs = require('fs')
const path = require('path')
const rollup = require('rollup') 
const uglify = require('uglify-js') // minify files output like .min.js e.g
const banner = require('bannerjs')
const chalk = require('chalk')
const log = console.log

// import rollup config
const { rollupInputOptions, rollupOutputOptions } = require('../config/rollup.config').buildConfig
// import uglify-js config
const uglifyOption = require('../config/uglify.config')

async function build(rollupInputOptions, rollupOutputOptions,  uglifyOpt) {
  const bundle = await rollup.rollup(rollupInputOptions)

  if (Array.isArray(rollupOutputOptions)) {
    rollupOutputOptions.forEach(async (option) => {
      let { code } = await bundle.generate(option)
      let minCode = `${banner.onebanner()}\n${uglify.minify(code, uglifyOpt).code}`
      write(option.file, code)
        .then(() => {
          if (option.minFile) {
            write(option.minFile, minCode)
          }
        })
    })
  } else {
    let { code } = await bundle.generate(rollupOutputOptions)
    let minCode = `${banner.onebanner()}\n${uglify.minify(code, uglifyOpt).code}`
    write(rollupOutputOptions.file, code)
      .then(() => {
        if (rollupOutputOptions.minFile) {
          write(rollupOutputOptions.minFile, minCode)
        }
      })
  }
}

build(rollupInputOptions, rollupOutputOptions, uglifyOption)

// write code to the disk and log each file size
function write(dest, code) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest))
    }
    fs.writeFile(dest, code, err => {
      if (err) {
        return reject(err)
      } else {
        log(chalk.yellow(`${path.relative(process.cwd(), dest)}`) + chalk.green(` ${getSize(code)}`))
        resolve()
      }
    })
  })
}

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`
}

