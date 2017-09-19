/* global __dirname, require, module */
const package_ = require('../package.json')
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const resolve = (dir) => {
  return path.join(__dirname, '..', dir)
}
const replaceUrl = (object_) => {
  let entrys = {}
  if (typeof object_ === 'object') {
    for (let key in object_) {
      if (key && object_[key]) {
        entrys[key] = resolve(object_[key])
      }
    }
  }
  return entrys
}
module.exports = {
  entry: replaceUrl(package_.modules),
  output: {
    path: config.base.distDirectory,
    publicPath: '../',
    filename: (process.env.NODE_ENV === 'production' ? '[name].min.js' : '[name].js'),
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    ol: 'ol'
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/nature-dom-util')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('images/[name].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[ext]')
        }
      }
    ]
  },
  resolve: {
    extensions: ['.json', '.js', '.css', '.scss'],
    alias: {
      '@': resolve('src')
    }
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: function () {
          return [
            autoprefixer({
              browsers: ['ie>=8', '>1% in CN']
            })
          ]
        }
      }
    })
  ]
}
