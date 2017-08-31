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
    port: 6060,
    htmlPath: path.resolve(__dirname, '../example'),
    autoOpenBrowser: true,
    assetsSubDirectory: '',
    assetsPublicPath: '/',
    proxyTable: {},
    cssSourceMap: true
  },
  base: {
    fileName: 'olExtent',
    libraryName: 'olExtent',
    distDirectory: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'css'
  }
}
