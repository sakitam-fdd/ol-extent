/**
 * Created by FDD on 2017/7/28.
 * @desc 用于图层比较
 */
import '../assets/scss/compareLayer.scss'
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import { create, on } from '../utils'

class CompareLayer extends ol.control.Control {
  constructor (beforeMap, afterMap, options = {}) {
    const className = (options.className !== undefined ? options.className : 'ole-control-compare');

    /**
     * @private
     * @type {Element}
     */
    const element_ = create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));

    /**
     * @private
     * @type {Element}
     */
    const innerElement_ = create('div', className + '-inner', element_);
    super({
      element: element_,
      target: options['target']
    });

    if (beforeMap && afterMap) {
      this.beforeMap = beforeMap
      this.afterMap = afterMap
    } else {
      throw new Error('图层必须传入！')
    }

    this.orderLayerZindex();

    /**
     * 当前截取位置占整个视图宽度的比例
     * @type {number}
     */
    this.initPosition = (options['initPosition'] !== undefined ? options['initPosition'] : 0.5);

    /**
     * 是否正在拖拽
     * @type {boolean}
     * @private
     */
    this.dragging_ = false;

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

    on(innerElement_, 'pointerdown', this.handleDraggerStart_, this);
    on(innerElement_, 'pointermove', this.handleDraggerDrag_, this);
    on(innerElement_, 'pointerup', this.handleDraggerEnd_, this);
    on(window, 'pointerup', this.handleDraggerEnd_, this);
  }

  /**
   * setup
   */
  initControl () {
    /**
     * 获取当前视图大小
     * @type {ClientRect}
     * @private
     */
    if (!this.getMap()) return;
    this._bounds = this.getMap().getTargetElement().getBoundingClientRect();
    this.percent = 0.5;
    this._setPosition(this._bounds.width, this._bounds.width / 2);
    this.getMap().on('change:size', this.resize, this);
    this.clipLayer();
  }

  /**
   * 处理拖拽
   * @param event
   * @private
   */
  handleDraggerStart_ (event) {
    if (!this.dragging_ && event.target) {
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
      this._bounds = this.getMap().getTargetElement().getBoundingClientRect();
      this._setPosition(this._bounds.width, this._getX(event));
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
      this.dragging_ = false;
      this.previousX_ = undefined;
      this.previousY_ = undefined;
    }
  }

  /**
   * 通过canvas切割视图
   */
  clipLayer () {
    let that = this;
    this.getMap().un('precompose', this.precompose);
    this.getMap().un('postcompose', this.postcompose);
    this.precompose = this.beforeMap.on('precompose', event => {
      let ctx = event.context;
      let width = ctx.canvas.width * (that.initPosition);
      ctx.save();
      ctx.beginPath();
      ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
      ctx.clip();
    });
    this.postcompose = this.beforeMap.on('postcompose', event => {
      let ctx = event.context;
      ctx.restore();
    })
  }

  /**
   * 设置切割位置
   * @param sourceWidth
   * @param value
   * @private
   */
  _setPosition (sourceWidth, value) {
    let pos = 'translate(' + value + 'px, 0)';
    this.element.style.transform = pos;
    this.element.style.WebkitTransform = pos;
    this._x = value;
    this.percent = value / sourceWidth;
    this.initPosition = value / sourceWidth;
    this.getMap().render();
  }

  /**
   * 窗口变化事件
   */
  resize () {
    this._bounds = this.getMap().getTargetElement().getBoundingClientRect();
    this._setPosition(this._bounds.width, this._bounds.width * this.percent);
  }

  /**
   * 获取当前位置
   * @param e
   * @returns {number}
   * @private
   */
  _getX (e) {
    e = e.touches ? e.touches[0] : e;
    let x = e.clientX - this._bounds.left;
    if (x < 0) x = 0;
    if (x > this._bounds.width) x = this._bounds.width;
    return x;
  }

  /**
   * 设置地图
   * @param map
   */
  setMap (map) {
    super.setMap.call(this, map);
    if (map && map instanceof ol.Map) {
      map.render();
      this.initControl();
    }
  }

  /**
   * 设置上一级图层
   * @param beforeMap
   */
  setBeforeLayet (beforeMap) {
    if (beforeMap) {
      this.beforeMap = beforeMap;
      this.orderLayerZindex();
    } else {
      throw Error('设置图层错误！');
    }
  }

  /**
   * 设置下一级图层
   * @param afterMap
   */
  setAfterLayer (afterMap) {
    if (afterMap) {
      this.afterMap = afterMap;
      this.orderLayerZindex();
    } else {
      throw Error('设置图层错误！');
    }
  }

  /**
   * 调整相关图层层级，避免图层压盖
   */
  orderLayerZindex () {
    if (this.afterMap && this.beforeMap) {
      let afterMapIndex = this.afterMap.getZIndex();
      let beforeMapIndex = this.beforeMap.getZIndex();
      let max = Math.max(afterMapIndex, beforeMapIndex);
      let min = Math.min(afterMapIndex, beforeMapIndex);
      if (max === min) {
        max = max + 1
      }
      this.beforeMap.setZIndex(max);
      this.afterMap.setZIndex(min);
    }
  }
}

export default CompareLayer
