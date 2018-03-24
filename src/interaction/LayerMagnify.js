/**
 * Created by FDD on 2017/7/28.
 * @desc 图层滤镜
 */
import ol from 'openlayers'
import { on, off, preventDefault } from '../utils';

class LayerMagnify extends ol.interaction.Pointer {
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
      handleEvent: LayerMagnify.handleEvent_,
      handleMoveEvent: LayerMagnify.handleMoveEvent_
    });

    if (options['magnifyLayer']) {
      this.magnifyLayer = options['magnifyLayer']
    } else {
      throw new Error('图层必须传入！')
    }

    /**
     * 当前图层所在位置
     * @type {null}
     * @private
     */
    this._currentLayerIndex = null;

    /**
     * 默认滤镜半径
     * @type {number}
     */
    this.radius = (typeof options['radius'] === 'number') ? options['radius'] : 75;

    /**
     * 滤镜最大半径
     * @type {number}
     */
    this.minRadius = (typeof options['minRadius'] === 'number') ? options['minRadius'] : 150;

    /**
     * 滤镜最小半径
     * @type {number}
     */
    this.maxRadius = (typeof options['maxRadius'] === 'number') ? options['maxRadius'] : 25;

    /**
     * 滤镜边框宽度
     * @type {number}
     */
    this.lineWidth = (typeof options['lineWidth'] === 'number') ? options['lineWidth'] : 2;

    /**
     * 滤镜边线颜色
     * @type {number}
     */
    this.strokeStyle = (options['strokeStyle'] ? options['strokeStyle'] : 'rgba(0, 0, 0, 0.5)');

    /**
     * 滤镜放大对应键值
     * @type {number}
     */
    this.zoomInKeyCode = options['zoomInKeyCode'] !== undefined ? options['zoomInKeyCode'] : 38;

    /**
     * 滤镜缩小对应键值
     * @type {number}
     */
    this.zoomOutKeyCode = options['zoomOutKeyCode'] !== undefined ? options['zoomOutKeyCode'] : 40;

    /**
     * 当前鼠标位置
     * @type {null}
     */
    this.mousePosition = null;
  }

  /**
   * 初始化渲染事件
   * @private
   */
  initEvents_ () {
    if (this.getMap()) {
      on(this.getMap().getTargetElement(), 'mouseout', this.handleMouseOut_, this);
      on(document, 'keydown', this.handleKeyDown_, this);
      // before rendering the layer, do some clipping
      this.magnifyLayer.on('postcompose', this.handlePostcompose_, this);
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
  handlePostcompose_ (event) {
    if (this.mousePosition) {
      let [context, pixelRatio] = [event.context, event.frameState.pixelRatio];
      let half = this.radius * pixelRatio;
      let [centerX, centerY] = [this.mousePosition[0] * pixelRatio, this.mousePosition[1] * pixelRatio];
      let [originX, originY, size] = [centerX - half, centerY - half, (2 * half + 1)];
      let sourceData = context.getImageData(originX, originY, size, size).data;
      let dest = context.createImageData(size, size);
      let destData = dest.data;
      for (let j = 0; j < size; ++j) {
        for (let i = 0; i < size; ++i) {
          let dI = i - half;
          let dJ = j - half;
          let dist = Math.sqrt(dI * dI + dJ * dJ);
          let sourceI = i;
          let sourceJ = j;
          if (dist < half) {
            sourceI = Math.round(half + dI / 2);
            sourceJ = Math.round(half + dJ / 2);
          }
          let destOffset = (j * size + i) * 4;
          let sourceOffset = (sourceJ * size + sourceI) * 4;
          destData[destOffset] = sourceData[sourceOffset];
          destData[destOffset + 1] = sourceData[sourceOffset + 1];
          destData[destOffset + 2] = sourceData[sourceOffset + 2];
          destData[destOffset + 3] = sourceData[sourceOffset + 3];
        }
      }
      context.beginPath();
      context.arc(centerX, centerY, half, 0, 2 * Math.PI, false);
      context.lineWidth = this.lineWidth * pixelRatio;
      context.strokeStyle = this.strokeStyle;
      context.putImageData(dest, originX, originY);
      context.stroke();
      context.restore();
    }
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
      // after rendering the layer, restore the canvas context
      this.magnifyLayer.un('postcompose', this.handlePostcompose_, this);
      super.setMap.call(this, map);
    }
  }
}

export default LayerMagnify
