/**
 * Created by FDD on 2017/8/31.
 * @ 地图打印功能
 */
import has from 'lodash/has'
import 'core-js/es6/promise'
if (!has(ol, 'tools')) {
  ol.tools = {}
}

ol.tools.PrintfMap = function (map, params) {
  this.options = params || {}
  if (map && map instanceof ol.Map) {
    this.map = map
  } else {
    throw new Error('未获取到地图对象！')
  }
}

/**
 * 保存到canvas
 * @param event
 * @param params
 */
ol.tools.PrintfMap.prototype.saveCanvas = function (event, params) {
  let canvas = event.context.canvas
  if (params['dpi'] && typeof params['dpi'] === 'number') {
    let scaleFactor = params['dpi'] / 96
    canvas.width = Math.ceil(canvas.width * scaleFactor)
    canvas.height = Math.ceil(canvas.height * scaleFactor)
    event.context.scale(scaleFactor, scaleFactor)
  }
  if (params['printfType'] !== 'png') {
    this.map.once('precompose', e => {
      e.context.fillStyle = 'white'
      e.context.fillRect(0, 0, e.context.canvas.width, e.context.canvas.height)
    })
  }
  return canvas
}

/**
 * 获取图片
 * @param params
 * @returns {Promise}
 */
ol.tools.PrintfMap.prototype.getImage = function (params) {
  this.map.renderSync()
  if (params['printfType'] === 'jpg') {
    params['printfType'] = 'jpeg'
  }
  return new Promise((resolve) => {
    this.map.once('postcompose', event => {
      let canvas = this.saveCanvas(event, params)
      let image = canvas.toDataURL('image/.' + (params['printfType'] ? params['printfType'] : 'png'), (params['quality'] ? params['quality'] : 1))
      resolve(image)
    })
  })
}

ol.tools.PrintfMap.prototype.getPDF = function () {

}

ol.tools.PrintfMap.prototype.print = function () {

}

let olToolsPrintfMap = ol.tools.PrintfMap
export default olToolsPrintfMap
