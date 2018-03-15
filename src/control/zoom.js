/**
 * Created by FDD on 2017/9/19.
 * @desc ZoomMenu
 */
import '../assets/scss/zoom.scss'
import ol from 'openlayers';
import {BASE_CLASS_NAME} from '../constants';
import { create, on } from '../utils';

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

    const element_ = create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));

    const zoomIn = create('span', 'zoom-in', element_);
    zoomIn.setAttribute('title', '放大');
    zoomIn.innerHTML = '+';
    const zoomOut = create('span', 'zoom-out', element_);
    zoomOut.setAttribute('title', '缩小');
    zoomOut.innerHTML = '\u2212';

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

    /**
     * set duration
     */
    this.set('duration', duration_);
    on(zoomIn, 'click', this.handleClick_.bind(this, delta));
    on(zoomOut, 'click', this.handleClick_.bind(this, -delta));
  }

  /**
   * handel click event
   * @param delta
   * @param event
   * @private
   */
  handleClick_ (delta, event) {
    event.preventDefault()
    this.zoomByDelta_(delta)
  }

  /**
   * zoom
   * @param delta
   * @private
   */
  zoomByDelta_ (delta) {
    let map = this.getMap()
    let view = map.getView()
    if (!view) {
      throw new Error('can not get view!')
    } else {
      let currentResolution = view.getResolution()
      if (currentResolution) {
        let newResolution = view.constrainResolution(currentResolution, delta)
        if (this.get('duration') > 0) {
          if (view.getAnimating()) {
            view.cancelAnimations()
          }
          view.animate({
            resolution: newResolution,
            duration: this.get('duration'),
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
