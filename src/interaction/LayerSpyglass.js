/**
 * Created by FDD on 2017/7/28.
 * @desc 图层滤镜
 */
import ol from 'openlayers'

import { on, off, preventDefault } from '../utils';

class LayerSpyglass extends ol.interaction.Pointer {
  /**
   * 处理移动事件
   * @param mapBrowserEvent
   */
  static handleMoveEvent_ = function (mapBrowserEvent) {
    this.mousePosition = mapBrowserEvent['pixel'];
    this.getMap().render();
  };
  /**
   * 初始化事件处理机
   * @param evt
   * @returns {*}
   * @private
   */
  static handleEvent_ = function (evt) {
    return ol.interaction.Pointer.handleEvent.call(this, evt);
  };
  constructor (options = {}) {
    super({
      handleEvent: LayerSpyglass.handleEvent_,
      handleMoveEvent: LayerSpyglass.handleMoveEvent_
    });

    if (options['spyLayer']) {
      this.spyLayer = options['spyLayer']
    } else {
      throw new Error('图层必须传入！')
    }

    /**
     * 当前图层所在位置
     * @type {null}
     * @private
     */
    this._currentLayerIndex = null

    /**
     * 默认滤镜半径
     * @type {number}
     */
    this.radius = (typeof options['radius'] === 'number') ? options['radius'] : 75

    /**
     * 滤镜最大半径
     * @type {number}
     */
    this.minRadius = (typeof options['minRadius'] === 'number') ? options['minRadius'] : 150

    /**
     * 滤镜最小半径
     * @type {number}
     */
    this.maxRadius = (typeof options['maxRadius'] === 'number') ? options['maxRadius'] : 25

    /**
     * 滤镜边框宽度
     * @type {number}
     */
    this.lineWidth = (typeof options['lineWidth'] === 'number') ? options['lineWidth'] : 5

    /**
     * 滤镜边线颜色
     * @type {number}
     */
    this.strokeStyle = (options['strokeStyle'] ? options['strokeStyle'] : 'rgba(0, 0, 0, 0.5)')

    /**
     * 滤镜放大对应键值
     * @type {number}
     */
    this.zoomInKeyCode = options['zoomInKeyCode'] !== undefined ? options['zoomInKeyCode'] : 38

    /**
     * 滤镜缩小对应键值
     * @type {number}
     */
    this.zoomOutKeyCode = options['zoomOutKeyCode'] !== undefined ? options['zoomOutKeyCode'] : 40
    /**
     * 当前鼠标位置
     * @type {null}
     */
    this.mousePosition = null
  }

  /**
   * 初始化渲染事件
   * @private
   */
  initEvents_ () {
    if (this.getMap()) {
      on(this.getMap().getTargetElement(), 'mouseout', this.handleMouseOut_, this);
      on(document, 'keydown', this.handleKeyDown_, this);
      let layers = this.getMap().getLayers().getArray();
      let layerIndexs = [];
      this._currentLayerIndex = this.spyLayer.getZIndex();
      layers.every(layer => {
        layerIndexs.push(layer.getZIndex())
      });
      let maxIndex = Math.max.apply(Math, layerIndexs);
      // 保证滤镜图层在最上层
      this.spyLayer.setZIndex(maxIndex + 10);
      this.spyLayer.setVisible(true);
      // before rendering the layer, do some clipping
      this.spyLayer.on('precompose', this.handlePrecompose_, this);
      // after rendering the layer, restore the canvas context
      this.spyLayer.on('postcompose', this.handlePostcompose_, this);
    }
  }

  /**
   * 处理鼠标移除事件
   * @param event
   * @private
   */
  handleMouseOut_ (event) {
    this.mousePosition = null;
    this.getMap().render();
  }

  /**
   * 处理键盘事件
   * @param event
   * @private
   */
  handleKeyDown_ (event) {
    preventDefault(event);
    if (event.which === this.zoomInKeyCode) {
      this.radius = Math.min(this.radius + 5, 150);
    } else if (event.which === this.zoomOutKeyCode) {
      this.radius = Math.max(this.radius - 5, 25);
    }
    this.getMap().render();
  }

  /**
   * 图层开始渲染之前事件处理
   * @param event
   * @private
   */
  handlePrecompose_ (event) {
    let ctx = event.context;
    let pixelRatio = event.frameState.pixelRatio;
    ctx.save();
    ctx.beginPath();
    if (this.mousePosition) {
      // only show a circle around the mouse
      ctx.arc(this.mousePosition[0] * pixelRatio, this.mousePosition[1] * pixelRatio,
        this.radius * pixelRatio, 0, 2 * Math.PI);
      ctx.lineWidth = this.lineWidth * pixelRatio;
      ctx.strokeStyle = this.strokeStyle;
      ctx.stroke();
    }
    ctx.clip();
  }

  /**
   * 开始渲染时的事件处理
   * @param event
   * @private
   */
  handlePostcompose_ (event) {
    let ctx = event.context;
    ctx.restore();
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap (map) {
    if (map && map instanceof ol.Map) {
      super.setMap.call(this, map);
      this.initEvents_();
    } else {
      off(this.getMap().getTargetElement(), 'mouseout', this.handleMouseOut_, this);
      off(document, 'keydown', this.handleKeyDown_, this);
      // before rendering the layer, do some clipping
      this.spyLayer.un('precompose', this.handlePrecompose_, this);
      // after rendering the layer, restore the canvas context
      this.spyLayer.un('postcompose', this.handlePostcompose_, this);
      this.spyLayer.setVisible(false);
      this.spyLayer.setZIndex(this._currentLayerIndex);
      this._currentLayerIndex = null;
      super.setMap.call(this, map);
    }
  }
}

export default LayerSpyglass
