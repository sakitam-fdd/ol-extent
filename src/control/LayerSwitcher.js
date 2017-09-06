/**
 * Created by FDD on 2017/9/6.
 * @ 图层切换功能控件
 */
import '../scss/layerSwitcher.scss'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from 'nature-dom-util/src/utils/domUtils'
ol.control.LayerSwitcher = function (params = {}) {
  this.options = params

  /**
   * className
   * @type {string}
   */
  let className = (this.options.className !== undefined ? this.options.className : 'hmap-layer-switcher')

  /**
   * @private
   * @type {Element}
   */
  this.element_ = htmlUtils.create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))

  /**
   * @private
   * @type {Element}
   */
  this.innerElement_ = htmlUtils.create('ul', className + '-ul-inner', this.element_, className + '-ul-inner')

  if (this.options['layers'] && Array.isArray(this.options['layers']) && this.options['layers'].length > 0) {
    this.initDomInternal(this.options['layers'], className, (this.options['key'] ? this.options['key'] : 'layerName'))
  }

  ol.control.Control.call(this, {
    element: this.element_,
    target: this.options['target']
  })
}

ol.inherits(ol.control.LayerSwitcher, ol.control.Control)

/**
 * 初始化dom
 * @param layers
 * @param className
 * @param key
 */
ol.control.LayerSwitcher.prototype.initDomInternal = function (layers, className, key) {
  let width = (typeof this.options['itemWidth'] === 'number' ? this.options['itemWidth'] : 86)
  let height = (typeof this.options['itemHeight'] === 'number' ? this.options['itemHeight'] : 60)
  let length = layers.length
  this.innerElement_.style.width = width + (length - 2) * 8 + 'px'
  this.innerElement_.style.height = height + 'px'
  layers.forEach((item, index) => {
    if (item && item[key]) {
      let li_ = htmlUtils.create('li', className + '-li-inner', this.innerElement_, className + '-li-inner')
      li_.style.background = 'url(' + item['icon'] + ') 0px 0px no-repeat'
      li_.style.width = width + 'px'
      li_.style.height = height + 'px'
      li_.style.zIndex = index + 1
      li_.style.right = Math.abs(index - length) * 8 + 'px'
      if (item['name']) {
        let name_ = htmlUtils.create('span', 'layer-name', li_)
        name_.innerHTML = item['name']
      }
      if (length - 1 === index) {
        li_.style.marginRight = '0px'
      }
    }
  })
}

let olControlLayerSwitcher = ol.control.LayerSwitcher
export default olControlLayerSwitcher
