const banner = require('bannerjs') // output Author, copyright ...
const babel = require('rollup-plugin-babel') // transform ES6/7 to ES5
const nodeResolve = require('rollup-plugin-node-resolve') 
const commonjs = require('rollup-plugin-commonjs') // handle commonjs module

module.exports = {
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
      filename: 'dist/tvvm.js',
      minFilename: 'dist/tvvm.min.js',
      format: 'umd',
      name: 'tvvm',
      banner: banner.multibanner()
    },
    { 
      filename: 'dist/tvvm.common.js',
      minFilename: 'dist/tvvm.common.min.js',
      format: 'cjs',
      name: 'tvvm',
      banner: banner.multibanner()
    },
    {
      filename: 'dist/tvvm.esm.js',
      format: 'es',
      name: 'tvvm',
      banner:　banner.multibanner()
    }
  ]
}