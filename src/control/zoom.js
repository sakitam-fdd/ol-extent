/**
 * Created by FDD on 2017/9/19.
 * @desc 缩放按钮
 */
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import * as htmlUtils from '../utils/dom'
import * as Events from '../utils/events'

class ZoomMenu extends ol.control.Control {
  constructor (options = {}) {
    /**
     * 基础类名
     * @type {string}
     */
    const className = options.className !== undefined ? options.className : 'ole-control-zoom';

    /**
     * delta
     */
    const delta = options.delta !== undefined ? options.delta : 1;

    const element_ = this.initDomInternal_(className, delta);

    /**
     * 动画时间
     * @type {number}
     * @private
     */
    const duration_ = options.duration !== undefined ? options.duration : 250;
    super({
      element: element_,
      target: options.target
    });
    this.set('duration', duration_);
  }

  initDomInternal_ (className, delta) {
    let element = htmlUtils.create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));
    let zoomin = htmlUtils.create('span', 'zoom-in', element);
    zoomin.setAttribute('title', '放大');
    zoomin.innerHTML = '+';
    let zoomout = htmlUtils.create('span', 'zoom-out', element);
    zoomout.setAttribute('title', '缩小');
    zoomout.innerHTML = '\u2212';
    Events.listen(zoomin, 'click', this.handleClick_.bind(this, delta));
    Events.listen(zoomout, 'click', this.handleClick_.bind(this, -delta));
    return element;
  }

  handleClick_ (delta, event) {
    event.preventDefault()
    this.zoomByDelta_(delta)
  }

  zoomByDelta_ (delta) {
    let map = this.getMap()
    let view = map.getView()
    if (!view) {
      throw new Error('未获取到视图！')
    } else {
      let currentResolution = view.getResolution()
      if (currentResolution) {
        let newResolution = view.constrainResolution(currentResolution, delta)
        if (this.duration_ > 0) {
          if (view.getAnimating()) {
            view.cancelAnimations()
          }
          view.animate({
            resolution: newResolution,
            duration: this.duration_,
            easing: ol.easing.easeOut
          })
        } else {
          view.setResolution(newResolution)
        }
      }
    }
  }
}

export default ZoomMenu
