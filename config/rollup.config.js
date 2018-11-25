const banner = require('bannerjs') // output Author, copyright ...
const babel = require('rollup-plugin-babel') // transform ES6/7 to ES5
const nodeResolve = require('rollup-plugin-node-resolve') 
const commonjs = require('rollup-plugin-commonjs') // handle commonjs module

const buildConfig = {
  rollupInputOptions: {
    input: 'src/main.js',
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  rollupOutputOptions: [
    { 
      file: 'dist/tvvm.js',
      minFile: 'dist/tvvm.min.js',
      format: 'umd',
      name: 'TVVM', // global value name
      banner: banner.multibanner()
    },
    { 
      file: 'dist/tvvm.common.js',
      minFile: 'dist/tvvm.common.min.js',
      format: 'cjs',
      name: 'TVVM',
      banner: banner.multibanner()
    },
    {
      file: 'dist/tvvm.esm.js',
      format: 'es',
      name: 'TVVM',
      banner:　banner.multibanner()
    }
  ]
}

const watchConfig = {
  ...buildConfig.rollupInputOptions,
  output: buildConfig.rollupOutputOptions,
}

module.exports = { buildConfig, watchConfig }