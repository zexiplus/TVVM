if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/tvvm.common.min.js')
} else {
  module.exports = require('./dist/tvvm.common.js')
}