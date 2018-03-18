/**
 * Created by FDD on 2017/9/19.
 * @desc 全屏控制
 */
import '../assets/scss/fullScreen.scss'
import ol from 'openlayers';
import {BASE_CLASS_NAME} from '../constants';
import {create, on} from '../utils';
import screenfull from 'screenfull';

class FullScreen extends ol.control.Control {
  constructor (options = {}) {
    const label = options.label !== undefined ? options.label : '\u2922';
    const labelActive = options.labelActive !== undefined ? options.labelActive : '\u00d7';
    const className = options.className !== undefined ? options.className : 'ole-control-full-screen';
    const element = create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));
    const inner = create('span', className + '-inner', element);
    inner.setAttribute('title', '全屏');
    inner.innerHTML = label;
    super({
      element: element,
      target: options.target
    });

    this.label = label;

    this.labelActive = labelActive;

    /**
     * 快捷键
     * @private
     * @type {boolean}
     */
    this.keys_ = options.keys !== undefined ? options.keys : false;

    /**
     * 图标大小
     * @type {[*]}
     * @private
     */
    this.size_ = options.size !== undefined ? options.size : [16, 16];

    /**
     * 要放大的容器
     */
    this.source_ = options.source;

    on(element, 'click', this.handleClick_, this)
  }

  handleClick_ (event) {
    event.preventDefault();
    let map = this.getMap();
    if (map) {
      let element = null;
      if (this.source_) {
        element = typeof this.source_ === 'string'
          ? document.getElementById(this.source_) : this.source_;
      } else {
        element = this.getMap().getTargetElement();
      }
      if (screenfull.enabled) {
        screenfull.toggle(element);
        screenfull.on('change', () => {
          if (screenfull.isFullscreen) {
            this.element.firstElementChild.innerHTML = this.labelActive
          } else {
            this.element.firstElementChild.innerHTML = this.label
          }
        })
      }
    }
  }
}

export default FullScreen
