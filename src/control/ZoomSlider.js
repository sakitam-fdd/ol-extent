/**
 * Created by FDD on 2017/7/28.
 * @desc 定制缩放控制条(仿百度)
 */
import '../assets/scss/zoomSlider.scss';
import ol from 'openlayers';
import {BASE_CLASS_NAME} from '../constants';
import {create, getElement, getStyle, on, stopPropagation, preventDefault} from '../utils';

class ZoomSlider extends ol.control.Control {
  /**
   * 更新控制条element
   * @param {ol.MapEvent} mapEvent Map event.
   * @this {ZoomSlider}
   * @api
   */
  static render = function (mapEvent) {
    if (!mapEvent.frameState) {
      return
    }
    if (!this.sliderInitialized_) {
      this.initSlider_()
    }
    let res = mapEvent.frameState.viewState.resolution;
    if (res !== this.currentResolution_) {
      this.currentResolution_ = res;
      this.setThumbPosition_(res)
    }
  };

  /**
   * 允许的方向值
   * @type {{VERTICAL: number, HORIZONTAL: number}}
   * @private
   */
  static Direction_ = {
    VERTICAL: 0,
    HORIZONTAL: 1
  };
  constructor (options = {}) {
    const className = (options.className !== undefined ? options.className : 'ole-zoom-slider');

    /**
     * @private
     * @type {Element}
     */
    const element = create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));

    const translateContent = create('div', ('ole-zoom-slider-translate-content' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), element);

    const silderContent = create('div', ('ole-zoom-slider-content' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), element);

    const translateN = create('div', ('ole-zoom-slider-button ole-zoom-slider-translate-n' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent);
    translateN.setAttribute('title', '向上平移');
    const translateS = create('div', ('ole-zoom-slider-button ole-zoom-slider-translate-s' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent);
    translateS.setAttribute('title', '向下平移');
    const translateW = create('div', ('ole-zoom-slider-button ole-zoom-slider-translate-w' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent);
    translateW.setAttribute('title', '向左平移');
    const translateE = create('div', ('ole-zoom-slider-button ole-zoom-slider-translate-e' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), translateContent);
    translateE.setAttribute('title', '向右平移');
    const zoomIn = create('div', ('ole-zoom-slider-zoom-in' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), silderContent);
    zoomIn.setAttribute('title', '放大');
    const zoomOut = create('div', ('ole-zoom-slider-zoom-out' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), silderContent);
    zoomOut.setAttribute('title', '缩小');
    const slider = create('div', ('ole-zoom-slider-zoom-slider' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), silderContent);
    create('div', ('slider-background-top' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider);
    const sliderBackgroundBottom = create('div', ('slider-background-bottom' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider);
    const sliderBackgroundMask = create('div', ('slider-background-mask' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider);
    sliderBackgroundMask.setAttribute('title', '缩放到此级别');
    const sliderBar = create('div', ('slider-bar' + ' ' + BASE_CLASS_NAME.CLASS_SELECTABLE), slider, 'slider-bar');
    sliderBar.setAttribute('title', '滑动缩放地图');
    const render = options['render'] ? options['render'] : ZoomSlider.render;
    super({
      element: element,
      render: render,
      target: options['target']
    });

    /**
     * 当前分辨率
     * @type {undefined}
     * @private
     */
    this.currentResolution_ = undefined;

    /**
     * 滑块默认方向（默认竖向）
     * @type {number}
     * @private
     */
    this.direction_ = ZoomSlider.Direction_.VERTICAL;

    /**
     * 是否正在拖拽
     * @type {boolean}
     * @private
     */
    this.dragging_ = false;

    /**
     * 高度限制
     * @type {number}
     * @private
     */
    this.heightLimit_ = 0;

    /**
     * 宽度限制
     * @type {number}
     * @private
     */
    this.widthLimit_ = 0;

    /**
     * 原始X
     * @type {null}
     * @private
     */
    this.previousX_ = null;

    /**
     * 原始Y
     * @type {null}
     * @private
     */
    this.previousY_ = null;

    /**
     * 计算出的视图大小（边框加边距）
     * @type {null}
     * @private
     */
    this.thumbSize_ = null;

    /**
     * 滑块是否被初始化
     * @type {boolean}
     * @private
     */
    this.sliderInitialized_ = false;

    /**
     * 动画过渡时延
     * @type {number}
     * @private
     */
    this.duration_ = options['duration'] !== undefined ? options['duration'] : 200;
    /**
     * 视图限制
     * @type {{ANIMATING: number, INTERACTING: number}}
     */
    this.viewHint = {
      ANIMATING: 0,
      INTERACTING: 1
    };

    /**
     * @private
     * @type {number}
     */
    this.pixelDelta_ = options['pixelDelta'] !== undefined ? options['pixelDelta'] : 128;
    /**
     * 滑块容器
     * @type {Element}
     */
    this.silderContent = silderContent;

    this.sliderBackgroundBottom = sliderBackgroundBottom;

    on(translateN, 'click', this.handletranslateClick_.bind(this, 'translateN'), this);
    on(translateS, 'click', this.handletranslateClick_.bind(this, 'translateS'), this);
    on(translateW, 'click', this.handletranslateClick_.bind(this, 'translateW'), this);
    on(translateE, 'click', this.handletranslateClick_.bind(this, 'translateE'), this);
    on(zoomIn, 'click', this.handleZoomClick_.bind(this, 1), this);
    on(zoomOut, 'click', this.handleZoomClick_.bind(this, -1), this);
    on(silderContent, 'pointerdown', this.handleDraggerStart_, this);
    on(silderContent, 'pointermove', this.handleDraggerDrag_, this);
    on(silderContent, 'pointerup', this.handleDraggerEnd_, this);
    on(silderContent, 'click', this.handleContainerClick_, this);
    on(sliderBar, 'click', stopPropagation)
  }

  /**
   * 处理缩放点击
   * @param delta
   * @param event
   * @private
   */
  handleZoomClick_ (delta, event) {
    preventDefault(event);
    this.zoomByDelta_(delta)
  }

  /**
   * 处理平移点击事件
   * @param type
   * @param event
   * @private
   */
  handletranslateClick_ (type, event) {
    preventDefault(event);
    let view = this.getMap().getView();
    let mapUnitsDelta = view.getResolution() * this.pixelDelta_;
    let [deltaX, deltaY] = [0, 0];
    switch (type) {
      case 'translateN':
        deltaY = mapUnitsDelta;
        break;
      case 'translateS':
        deltaY = -mapUnitsDelta;
        break;
      case 'translateW':
        deltaX = mapUnitsDelta;
        break;
      case 'translateE':
        deltaX = -mapUnitsDelta;
        break;
    }
    let delta = [deltaX, deltaY];
    ol.coordinate.rotate(delta, view.getRotation());
    this.pan(view, delta, this.duration_);
  }

  /**
   * 平移地图
   * @param view
   * @param delta
   * @param optDuration
   */
  pan (view, delta, optDuration) {
    let currentCenter = view.getCenter();
    if (currentCenter) {
      let center = view.constrainCenter(
        [currentCenter[0] + delta[0], currentCenter[1] + delta[1]]);
      if (optDuration) {
        view.animate({
          duration: optDuration,
          easing: ol.easing.linear,
          center: center
        })
      } else {
        view.setCenter(center);
      }
    }
  }

  /**
   * @param {number} delta Zoom delta.
   * @private
   */
  zoomByDelta_ (delta) {
    let view = this.getMap().getView();
    if (view && view instanceof ol.View) {
      let currentResolution = view.getResolution();
      if (currentResolution) {
        let newResolution = view.constrainResolution(currentResolution, delta);
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

  /**
   * 设置地图
   * @param map
   */
  setMap (map) {
    super.setMap.call(this, map);
    if (map) {
      map.render();
    }
  }

  /**
   * @inheritDoc
   */
  disposeInternal () {
    on(this.silderContent, 'pointercancel', function (event) {}, this);
    super.disposeInternal.call(this)
  }

  /**
   * 初始化滑块元素
   * @private
   */
  initSlider_ () {
    let container = this.silderContent;
    let containerSize = {
      width: container.offsetWidth, height: container.offsetHeight
    };
    let thumb = getElement('slider-bar');
    let thumbWidth = thumb.offsetWidth +
      parseFloat(getStyle(thumb, 'marginRight')) +
      parseFloat(getStyle(thumb, 'marginLeft'));
    let thumbHeight = thumb.offsetHeight +
      parseFloat(getStyle(thumb, 'marginTop')) +
      parseFloat(getStyle(thumb, 'marginBottom'));
    this.thumbSize_ = [thumbWidth, thumbHeight];
    if (containerSize.width > containerSize.height) {
      this.direction_ = ZoomSlider.Direction_.HORIZONTAL;
      this.widthLimit_ = containerSize.width - thumbWidth;
    } else {
      this.direction_ = ZoomSlider.Direction_.VERTICAL;
      this.heightLimit_ = containerSize.height - thumbHeight;
    }
    this.sliderInitialized_ = true;
  }

  /**
   * 容器点击事件处理
   * @param event
   * @private
   */
  handleContainerClick_ (event) {
    let view = this.getMap().getView();
    let relativePosition = this.getRelativePosition_(event.offsetX - this.thumbSize_[0] / 2, event.offsetY - this.thumbSize_[1] / 2);
    let resolution = this.getResolutionForPosition_(relativePosition);
    view.animate({
      resolution: view.constrainResolution(resolution),
      duration: this.duration_,
      easing: ol.easing.easeOut
    })
  }

  /**
   * 处理拖拽
   * @param event
   * @private
   */
  handleDraggerStart_ (event) {
    if (!this.dragging_ && event.target === getElement('slider-bar')) {
      this.previousX_ = event.clientX;
      this.previousY_ = event.clientY;
      this.dragging_ = true;
    }
  }

  /**
   * 处理拖动事件
   * @param event
   * @private
   */
  handleDraggerDrag_ (event) {
    if (this.dragging_) {
      let element = getElement('slider-bar');
      let deltaX = event.clientX - this.previousX_ + parseInt(element.style.left, 10);
      let deltaY = event.clientY - this.previousY_ + parseInt(element.style.top, 10);
      let relativePosition = this.getRelativePosition_(deltaX, deltaY);
      this.currentResolution_ = this.getResolutionForPosition_(relativePosition);
      this.getMap().getView().setResolution(this.currentResolution_);
      this.setThumbPosition_(this.currentResolution_);
      this.previousX_ = event.clientX;
      this.previousY_ = event.clientY;
    }
  }

  /**
   * 处理拖拽结束事件
   * @param event
   * @private
   */
  handleDraggerEnd_ (event) {
    if (this.dragging_) {
      let view = this.getMap().getView();
      view.animate({
        resolution: view.constrainResolution(this.currentResolution_),
        duration: this.duration_,
        easing: ol.easing.easeOut
      });
      this.dragging_ = false;
      this.previousX_ = undefined;
      this.previousY_ = undefined;
    }
  }

  /**
   * 计算指针位置（相对于父容器）
   * @param res
   * @private
   */
  setThumbPosition_ (res) {
    let position = this.getPositionForResolution_(res);
    let thumb = getElement('slider-bar');
    if (this.direction_ === ZoomSlider.Direction_.HORIZONTAL) {
      thumb.style.left = this.widthLimit_ * position + 'px';
      this.sliderBackgroundBottom.style.width = this.widthLimit_ - (this.widthLimit_ * position - 5) + 'px';
    } else {
      thumb.style.top = this.heightLimit_ * position + 'px';
      this.sliderBackgroundBottom.style.height = this.heightLimit_ - (this.heightLimit_ * position - 5) + 'px';
    }
  }

  /**
   * 给出x和y偏移量的指针的相对位置
   * @param x
   * @param y
   * @returns {number}
   * @private
   */
  getRelativePosition_ (x, y) {
    let amount;
    if (this.direction_ === ZoomSlider.Direction_.HORIZONTAL) {
      amount = x / this.widthLimit_;
    } else {
      amount = y / this.heightLimit_;
    }
    return Math.min(Math.max(amount, 0), 1);
  }

  /**
   * 计算相关分辨率
   * @param position
   * @returns {number}
   * @private
   */
  getResolutionForPosition_ (position) {
    let view = this.getMap().getView();
    if (view && view instanceof ol.View) {
      return this.getResolutionForValueFunction(1 - position);
    }
  }

  /**
   * 获取值
   * @param resolution
   * @param optPower
   * @returns {number}
   */
  getValueForResolutionFunction (resolution, optPower) {
    let power = optPower || 2;
    let view = this.getMap().getView();
    let maxResolution = view.getMaxResolution();
    let minResolution = view.getMinResolution();
    let max = Math.log(maxResolution / minResolution) / Math.log(power);
    return ((Math.log(maxResolution / resolution) / Math.log(power)) / max);
  }

  /**
   * 获取分辨率
   * @param value
   * @param optPower
   * @returns {number}
   */
  getResolutionForValueFunction (value, optPower) {
    let power = optPower || 2;
    let view = this.getMap().getView();
    let maxResolution = view.getMaxResolution();
    let minResolution = view.getMinResolution();
    let max = Math.log(maxResolution / minResolution) / Math.log(power);
    return (maxResolution / Math.pow(power, value * max));
  }

  /**
   * 计算相关位置
   * @param res
   * @returns {number}
   * @private
   */
  getPositionForResolution_ (res) {
    let view = this.getMap().getView();
    if (view && view instanceof ol.View) {
      return (1 - this.getValueForResolutionFunction(res));
    }
  }
}

export default ZoomSlider
