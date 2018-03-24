/**
 * Created by FDD on 2017/9/20.
 * @desc 视图旋转控件
 */
import '../assets/scss/rotate.scss'
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import {hasClass, addClass, create, on, removeClass, setStyle} from '../utils'

class RotateControl extends ol.control.Control {
  static render = function (mapEvent) {
    const frameState = mapEvent.frameState;
    if (!frameState) {
      return;
    }
    const rotation = frameState.viewState.rotation;
    if (rotation !== this.rotation_) {
      let transform = 'rotate(' + rotation + 'rad)';
      if (this.autoHide_) {
        const contains = hasClass(this.element, BASE_CLASS_NAME.CLASS_HIDDEN);
        if (!contains && rotation === 0) {
          addClass(this.element, BASE_CLASS_NAME.CLASS_HIDDEN)
        } else if (contains && rotation !== 0) {
          removeClass(this.element, BASE_CLASS_NAME.CLASS_HIDDEN)
        }
      }
      setStyle(this.label_, {
        transform: transform,
        webkitTransform: transform,
        msTransform: transform
      });
    }
    this.rotation_ = rotation
  }
  constructor (options = {}) {
    const className = options.className !== undefined ? options.className : 'ole-rotate-control';
    const element = create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE))
    const rButton = create('button', className + '-inner right-button', element)
    const cButton = create('button', className + '-inner center-button', element, className + '-inner-center')
    const lButton = create('button', className + '-inner left-button', element)
    const render = options.render ? options.render : RotateControl.render;
    super({
      element: element,
      render: render,
      target: options.target
    });

    /**
     * 重置回调
     */
    this.callResetNorth_ = options.resetNorth ? options.resetNorth : undefined;

    /**
     * 动画时延
     * @type {number}
     * @private
     */
    this.duration_ = options.duration !== undefined ? options.duration : 250;

    /**
     * 是否自动隐藏
     */
    this.autoHide_ = options.autoHide !== undefined ? options.autoHide : true;

    /**
     * 旋转角度
     * @type {undefined}
     * @private
     */
    this.rotation_ = undefined;

    /**
     * center button
     * @type {HTMLElement}
     * @private
     */
    this.label_ = cButton;

    on(rButton, 'click', this.handleClick_.bind(this, 'right'));
    on(cButton, 'click', this.handleClick_.bind(this, 'center'));
    on(lButton, 'click', this.handleClick_.bind(this, 'left'));
  }

  /**
   * handle click
   * @param type
   * @param event
   * @private
   */
  handleClick_ (type, event) {
    event.preventDefault();
    this.resetNorth_(type)
  }

  /**
   * reset view
   * @param type
   * @private
   */
  resetNorth_ (type) {
    let rotation = 0;
    if (type === 'center') {
      rotation = 0;
      if (this.callResetNorth_ !== undefined) {
        this.callResetNorth_()
      } else {
        this.rotationView_(rotation, type)
      }
    } else if (type === 'left') {
      rotation = -90;
      this.rotationView_(rotation)
    } else {
      rotation = 90;
      this.rotationView_(rotation)
    }
  }

  /**
   * bind view
   * @param rotation
   * @param type
   * @private
   */
  rotationView_ (rotation, type) {
    let map = this.getMap();
    let view = map.getView();
    let r = type === 'center' ? 0 : view.getRotation() + (rotation / 180 * Math.PI);
    if (view && view instanceof ol.View) {
      if (view.getRotation() !== undefined) {
        if (this.duration_ > 0) {
          view.animate({
            rotation: r,
            duration: this.duration_,
            easing: ol.easing.easeOut
          })
        } else {
          view.setRotation(0);
        }
      }
    } else {
      throw new Error('can not get view!')
    }
  }
}

export default RotateControl
