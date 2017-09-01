/**
 * Created by FDD on 2017/8/31.
 * @ 地图打印功能
 */
import 'core-js/es6/promise'
import {has} from '../utils/utils'
import fileSaver from 'file-saver'
import JSPDF from 'jspdf'
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

  /**
   * 生成pdf大小
   * @type {{a0: [*], a1: [*], a2: [*], a3: [*], a4: [*], a5: [*]}}
   */
  this.dims = {
    a0: [1189, 841],
    a1: [841, 594],
    a2: [594, 420],
    a3: [420, 297],
    a4: [297, 210],
    a5: [210, 148]
  }

  /**
   * 纸张类型
   * @type {{A0: string, A1: string, A2: string, A3: string, A4: string, A5: string}}
   */
  this.format = {
    A0: 'a0',
    A1: 'a1',
    A2: 'a2',
    A3: 'a3',
    A4: 'a4',
    A5: 'a5'
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
ol.tools.PrintfMap.prototype.getImageUrl = function (params) {
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

/**
 * 下载图片
 * @param params
 * @constructor
 */
ol.tools.PrintfMap.prototype.DownLoadImage = function (params) {
  let button = document.createElement('a')
  button.style.visibility = 'hidden'
  button.style.width = '0px'
  button.style.height = '0px'
  document.body.appendChild(button)
  button.addEventListener('click', () => {
    this.map.once('postcompose', event => {
      let canvas = event.context.canvas
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), (params['fileName'] ? params['fileName'] : 'map') + '.png')
      } else {
        canvas.toBlob(function (blob) {
          fileSaver.saveAs(blob, (params['fileName'] ? params['fileName'] : 'map') + '.png')
        })
      }
    })
    this.map.renderSync()
  })
  button.click()
}

/**
 * 下载为pdf
 * @param params
 * @constructor
 */
ol.tools.PrintfMap.prototype.DownLoadPDF = function (params) {
  let button = document.createElement('a')
  button.style.visibility = 'hidden'
  button.style.width = '0px'
  button.style.height = '0px'
  document.body.appendChild(button)
  button.addEventListener('click', () => {
    this.getImageUrl(params).then(res => {
      let format = this.format[params['format']] ? this.format[params['format']] : 'a4'
      let dim = this.dims[format]
      let pdf = new JSPDF(params['orient'] ? params['orient'] : 'landscape', undefined, format)
      pdf.addImage(res, 'JPEG', 0, 0, dim[0], dim[1])
      pdf.save((params['fileName'] ? params['fileName'] : 'map') + '.pdf')
    }).catch(error => {
      console.log(error)
    })
    this.map.renderSync()
  })
  button.click()
}

ol.tools.PrintfMap.prototype.print = function () {

}

let olToolsPrintfMap = ol.tools.PrintfMap
export default olToolsPrintfMap
