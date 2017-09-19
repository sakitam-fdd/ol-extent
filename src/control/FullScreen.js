/**
 * Created by FDD on 2017/9/19.
 * @desc 全屏控制
 */
import '../asset/scss/fullScreen.scss'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from 'nature-dom-util/src/utils/domUtils'
import * as Events from 'nature-dom-util/src/events/Events'
import {EventType} from 'nature-dom-util/src/events/EventType'
import screenfull from 'screenfull'
ol.control.FullScreenMenu = function (params = {}) {
  let options = params

  /**
   * 基础类名
   * @type {string}
   */
  let className = options.className !== undefined ? options.className : 'hmap-control-full-screen'

  /**
   * 快捷键
   * @private
   * @type {boolean}
   */
  this.keys_ = options.keys !== undefined ? options.keys : false

  /**
   * 图标大小
   * @type {[*]}
   * @private
   */
  this.size_ = options.size !== undefined ? options.size : [16, 16]

  /**
   * 图标
   * @type {string}
   * @private
   */
  this.dActionIcon_ = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1505815133373" class="icon" style="" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14347" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + this.size_[0] + '" height="' + this.size_[1] + '"><defs><style type="text/css"></style></defs><path d="M914.741707 18.731707 665.321604 268.16781l-40.143373-40.127373c-24.895611-24.911611-50.639209-16.975735-57.263105 17.599725L530.267715 442.88508c-6.623897 34.59146 16.271746 57.471102 50.847206 50.847206l197.244918-37.663412c34.55946-6.623897 42.495336-32.367494 17.599725-57.247106l-40.127373-40.159373 249.436103-249.404103c24.99161-25.007609 24.99161-65.534976 0-90.526586C980.260683-6.243902 939.717317-6.243902 914.741707 18.731707z" p-id="14348"></path><path d="M109.266293 1005.244293l249.436103-249.436103 40.127373 40.127373c24.895611 24.911611 50.655209 16.975735 57.263105-17.599725l37.663412-197.244918c6.607897-34.55946-16.287746-57.471102-50.847206-50.847206l-197.244918 37.663412c-34.57546 6.623897-42.495336 32.367494-17.615725 57.279105l40.127373 40.127373L18.771707 914.749707c-25.007609 25.007609-25.007609 65.502977 0 90.494586C43.747316 1030.251902 84.274683 1030.251902 109.266293 1005.244293z" p-id="14349"></path><path d="M530.283714 581.074921l37.663412 197.244918c6.623897 34.59146 32.367494 42.495336 57.247106 17.631725l40.159373-40.127373 249.404103 249.404103c25.007609 25.007609 65.534976 25.007609 90.526586 0 24.97561-24.97561 24.97561-65.502977 0-90.494586l-249.436103-249.436103 40.127373-40.127373c24.911611-24.879611 16.975735-50.655209-17.599725-57.247106L581.11492 530.243715C546.523461 523.651818 523.659818 546.515461 530.283714 581.074921z" p-id="14350"></path><path d="M456.092874 245.640162c-6.623897-34.55946-32.367494-42.495336-57.279105-17.599725l-40.127373 40.127373L109.250293 18.731707c-25.007609-24.97561-65.502977-24.97561-90.494586 0-25.007609 25.007609-25.007609 65.534976 0 90.526586l249.436103 249.404103-40.127373 40.159373c-24.911611 24.879611-16.975735 50.623209 17.599725 57.247106l197.244918 37.663412c34.55946 6.623897 57.471102-16.255746 50.847206-50.847206L456.092874 245.640162z" p-id="14351"></path></svg>'
  this.actionIcon_ = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1505815040737" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12836" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + this.size_[0] + '" height="' + this.size_[1] + '"><defs><style type="text/css"></style></defs><path d="M350 62c0.064 0.154 0.088 0.403 0.197 0.448 11.542 4.766 13.362 14.464 4.287 23.556-30.017 30.071-60.076 60.099-90.137 90.127-1.412 1.411-2.99 2.656-5.002 4.43 1.941 1.661 3.55 2.863 4.956 4.268 59.633 59.601 119.215 119.252 178.898 178.802 8.918 8.898 13.919 19.292 15.962 31.772 4.113 25.125-9.955 48.658-30.938 58.874-20.37 9.918-45.322 7.02-62.138-8.713-6.901-6.457-13.845-12.878-20.53-19.554-53.766-53.686-107.476-107.427-161.186-161.168-1.291-1.292-2.38-2.788-5.774-5.514-0.815 1.674-1.257 3.72-2.5 4.968-29.857 29.995-59.739 59.966-89.828 89.728-2.757 2.727-6.741 5.021-10.5 5.757-7.438 1.456-9.018-0.124-13.767-9.781V93c0.325-0.5 0.824-0.96 0.949-1.506 1.989-8.659 5.766-16.369 13.431-21.211C81.586 66.994 87.437 64.725 93 62h257zM674 962c-0.064-0.154-0.088-0.403-0.197-0.448-11.542-4.766-13.362-14.464-4.287-23.556 30.017-30.071 60.076-60.099 90.136-90.127 1.412-1.411 2.99-2.656 5.003-4.43-1.941-1.661-3.55-2.862-4.956-4.267-59.632-59.601-119.215-119.252-178.898-178.802-8.918-8.898-13.919-19.292-15.962-31.772-4.113-25.126 9.956-48.659 30.938-58.874 20.37-9.917 45.323-7.02 62.138 8.713 6.901 6.457 13.845 12.878 20.53 19.554 53.765 53.686 107.475 107.428 161.191 161.163 1.292 1.292 2.458 2.711 5.496 6.082 1.088-2.237 1.53-4.282 2.773-5.531 29.857-29.995 59.738-59.967 89.827-89.728 2.757-2.727 6.741-5.021 10.5-5.757 7.437-1.457 9.019 0.125 13.766 9.781v257c-0.325 0.499-0.823 0.958-0.949 1.503-1.992 8.636-5.727 16.35-13.391 21.179-5.226 3.293-11.085 5.581-16.66 8.319C845.333 962 759.667 962 674 962z" fill="" p-id="12837"></path><path d="M962 350c-0.154 0.064-0.403 0.088-0.448 0.197-4.766 11.542-14.464 13.362-23.556 4.287-30.071-30.017-60.099-60.076-90.127-90.137-1.411-1.412-2.656-2.99-4.43-5.002-1.661 1.941-2.863 3.55-4.268 4.956-59.601 59.633-119.252 119.215-178.802 178.898-8.898 8.918-19.292 13.919-31.772 15.962-25.125 4.113-48.658-9.955-58.874-30.938-9.917-20.37-7.02-45.322 8.713-62.138 6.457-6.901 12.878-13.845 19.554-20.53 53.686-53.766 107.427-107.476 161.168-161.186 1.292-1.291 2.788-2.38 5.514-5.774-1.674-0.815-3.72-1.257-4.968-2.5-29.995-29.857-59.966-59.739-89.728-89.828-2.727-2.757-5.021-6.741-5.757-10.5-1.456-7.438 0.124-9.018 9.781-13.767h257c0.5 0.325 0.96 0.824 1.506 0.949 8.659 1.989 16.369 5.766 21.211 13.431 3.289 5.206 5.558 11.057 8.283 16.62v257zM62 674c0.154-0.064 0.403-0.088 0.448-0.197 4.766-11.542 14.464-13.362 23.556-4.287 30.071 30.017 60.099 60.076 90.127 90.136 1.411 1.412 2.656 2.99 4.43 5.003 1.661-1.941 2.862-3.55 4.267-4.956 59.601-59.633 119.252-119.215 178.802-178.898 8.898-8.918 19.292-13.919 31.772-15.962 25.126-4.113 48.659 9.956 58.874 30.938 9.918 20.37 7.02 45.323-8.713 62.138-6.457 6.901-12.878 13.845-19.554 20.53-53.686 53.765-107.428 107.475-161.163 161.191-1.292 1.292-2.711 2.458-6.082 5.496 2.237 1.088 4.282 1.53 5.531 2.773 29.995 29.857 59.967 59.738 89.728 89.827 2.727 2.757 5.021 6.741 5.757 10.5 1.457 7.437-0.125 9.019-9.781 13.766h-257c-0.499-0.325-0.958-0.823-1.503-0.949-8.636-1.992-16.35-5.727-21.179-13.391C67.026 942.434 64.738 936.576 62 931V674z" fill="" p-id="12838"></path></svg>'

  /**
   * 要放大的容器
   * @private
   * @type {Element|string|undefined}
   */
  this.source_ = options.source

  /**
   * delta
   */
  this.element_ = this.initDomInternal_(className)

  ol.control.Control.call(this, {
    element: this.element_,
    target: options.target
  })
}
ol.inherits(ol.control.FullScreenMenu, ol.control.Control)

/**
 * 处理点击事件
 * @param event
 * @private
 */
ol.control.FullScreenMenu.prototype.handleClick_ = function (event) {
  event.preventDefault()
  let map = this.getMap()
  if (map) {
    let element = null
    if (this.source_) {
      element = typeof this.source_ === 'string'
        ? document.getElementById(this.source_) : this.source_
    } else {
      element = this.getMap().getTargetElement()
    }
    if (screenfull.enabled) {
      screenfull.toggle(element)
      screenfull.on('change', () => {
        if (screenfull.isFullscreen) {
          this.element_.firstElementChild.innerHTML = this.dActionIcon_
        } else {
          this.element_.firstElementChild.innerHTML = this.actionIcon_
        }
      })
    }
  }
}

/**
 * 鼠标移入事件
 * @private
 */
ol.control.FullScreenMenu.prototype.handleMouseOver_ = function () {
  this.element_.firstElementChild.innerHTML = this.actionIcon_.replace('fill=""', 'fill="#2c9eff"')
}

/**
 * 鼠标移除事件
 * @private
 */
ol.control.FullScreenMenu.prototype.handleMouseOut_ = function () {
  this.element_.firstElementChild.innerHTML = this.actionIcon_.replace('fill=""', 'fill="#7c8196"')
}

/**
 * 初始化相关dom
 * @param className
 * @param delta
 * @returns {Element}
 * @private
 */
ol.control.FullScreenMenu.prototype.initDomInternal_ = function (className) {
  let element = htmlUtils.create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))
  let inner = htmlUtils.create('span', className + '-inner', element)
  inner.setAttribute('title', '放大')
  inner.innerHTML = this.actionIcon_.replace('fill=""', 'fill="#7c8196"')
  Events.listen(element, EventType.CLICK, this.handleClick_, this)
  Events.listen(element, 'mouseover', this.handleMouseOver_, this)
  Events.listen(element, 'mouseout', this.handleMouseOut_, this)
  return element
}

let olControlFullScreenMenu = ol.control.FullScreenMenu
export default olControlFullScreenMenu
