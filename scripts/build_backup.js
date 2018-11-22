const fs = require('fs')
const path = require('path')
const rollup = require('rollup') 
const babel = require('rollup-plugin-babel') // transform ES6/7 to ES5
const nodeResolve = require('rollup-plugin-node-resolve') 
const commonjs = require('rollup-plugin-commonjs') // handle commonjs module
const banner = require('bannerjs') // output Author, copyright ...
const zlib = require('zlib') // gzip files
const uglify = require('uglify-js') // output like .min.js files
const log = console.log

// 打包入口文件配置
const rollupOptions = {
  input: 'src/index.js',
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}

const uglifyOption = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    warnings: false,
  },
  output: {
    ascii_only: true,
  }
}

async function build(rollupOpt, uglifyOpt) {
  const bundle = rollup.rollup(rollupOpt)

  // generate for usually modules
  const umd = await bundle.generate({
    format: 'umd',
    name: 'tvvm',
    banner: banner.multibanner()
  })
  const umdMin = `${banner.onebanner()}\n${uglify.minify(umd.code, uglifyOpt).code}`

  // generate for commonjs
  const common = await bundle.generate({
    format: 'cjs',
    name: 'tvvm',
    banner: banner.multibanner()
  })
  const commonMin = `${banner.onebanner()}\n${uglify.minify(common.code, uglifyOpt).code}`

  const es = await bundle.generate({
    format: 'es',
    name: 'tvvm',
    banner:　banner.multibanner()
  })
  const esMin = `${banner.onebanner()}\n${uglify.minify(es.code, uglifyOpt).code}`
  write('dist/tvvm.js', umd.code)
    .then(() => write('dist/tvvm.min.js'), umdMin)
    .then(() => write('dist/tvvm.common.js', common.code))
    .then(() => write('dist/tvvm.commin.min.js', commonMin))
    .then(() => write('dist/tvvm.esm.js', es.code))
    .then(() => write('dist/tvvm.esm.min.js', esMin))
}

build(rollupOptions, uglifyOption)

function write(dest, code) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest))
    }
    fs.writeFile(dest, code, err => {
      if (err) {
        return reject(err)
      } else {
        log(`${path.relative(process.cwd(), dest)} ${getSize(code)}`)
        resolve()
      }
    })
  })
}

function getSize(code) {
  return `${(code.length / 1024).toFiexd(2)}kb`
}

