const path = require('path')
module.exports = {
  build: {
    env: require('./prod.env'),
    productionSourceMap: true,
    productionGzip: true,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: true
  },
  dev: {
    env: require('./dev.env'),
    devtoolSourceMap: '#source-map',
    cssSourceMap: true
  },
  server: {
    env: require('./dev.env'),
    port: 6060,
    autoOpenBrowser: true,
    assetsSubDirectory: '',
    assetsPublicPath: '/',
    proxyTable: {}
  },
  base: {
    fileName: 'olExtent',
    libraryName: 'olExtent',
    distDirectory: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: ''
  }
}
