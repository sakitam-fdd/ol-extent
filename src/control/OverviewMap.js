/**
 * Created by FDD on 2017/10/12.
 * @desc 自定义鹰眼控件
 */
import '../assets/scss/overviewMap.scss'
import ol from 'openlayers';
import {BASE_CLASS_NAME, OVERVIEWMAP} from '../constants';
import {on, off, setStyle, create} from '../utils';

class OverviewMap extends ol.control.Control {
  static render = function (mapEvent) {
    this.validateExtent_();
    this.updateBox_();
  };
  /**
   * 计算鼠标位置
   * @param mousePosition
   * @param overlayBox
   * @returns {{clientX: number, clientY: *}}
   */
  static computeDesiredMousePosition = function (mousePosition, overlayBox) {
    return {
      clientX: mousePosition.clientX - (overlayBox.offsetWidth / 2),
      clientY: mousePosition.clientY + (overlayBox.offsetHeight / 2)
    }
  };
  constructor (options = {}) {
    const className = options.className !== undefined ? options.className : 'ole-overview-map';

    const element = create('div', className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE);

    const render = options.render ? options.render : OverviewMap.render
    super({
      element: element,
      render: render,
      target: options.target
    });

    /**
     * @type {boolean}
     * @private
     */
    this.collapsed_ = options.collapsed !== undefined ? options.collapsed : true;

    /**
     * @private
     * @type {boolean}
     */
    this.collapsible_ = options.collapsible !== undefined ? options.collapsible : true;

    if (!this.collapsible_) {
      this.collapsed_ = false
    }

    /**
     * @type {Element}
     * @private
     */
    this.ovmapDiv_ = create('div', 'ole-overview-map-target', element)

    /**
     * 收起按钮
     * @type {Element}
     * @private
     */
    if (this.collapsible_) {
      this.collapsElement_ = create('div', 'ole-overview-map-button', element)
      on(this.collapsElement_, 'click', this.handleClick_, this)
    }

    /**
     * @type {ol.Map}
     * @private
     */
    this.ovmap_ = new ol.Map({
      controls: new ol.Collection(),
      interactions: new ol.Collection(),
      view: options.view
    });

    this.addBoxControl_()
  }

  addOptionLayers_ (options) {
    let map = this.ovmap_;
    if (options.layers) {
      options.layers.forEach(function (layer) {
        map.addLayer(layer);
      }, this)
    }
  }

  /**
   * handle move event
   * @param event
   * @private
   */
  move_ (event) {
    const overlayBox = this.boxOverlay_.getElement();
    const coordinates = this.ovmap_.getEventCoordinate(OverviewMap.computeDesiredMousePosition(event, overlayBox));
    this.boxOverlay_.setPosition(coordinates);
  }

  /**
   * handle move end events
   * @param event
   * @private
   */
  endMoving_ (event) {
    const coordinates = this.ovmap_.getEventCoordinate(event);
    this.getMap().getView().setCenter(coordinates);
    off(window, 'mousemove', this.move_, this);
    off(window, 'mouseup', this.endMoving_, this);
  }

  /**
   * add event handle
   * @private
   */
  addEvent_ () {
    on(window, 'mousemove', this.move_, this);
    on(window, 'mouseup', this.endMoving_, this);
  }

  /**
   * add box handle
   * @private
   */
  addBoxControl_ () {
    const box = create('div', 'ole-overview-map-box');
    on(box, 'mousedown', this.addEvent_, this);
    this.boxOverlay_ = new ol.Overlay({
      position: [0, 0],
      positioning: 'bottom-left',
      element: box
    });
    this.ovmap_.addOverlay(this.boxOverlay_);
  }

  /**
   * set map
   * @param map
   */
  setMap (map) {
    let oldMap = this.getMap();
    if (map === oldMap) {
      return
    }
    if (oldMap) {
      let oldView = oldMap.getView();
      if (oldView) {
        this.unbindView_(oldView);
      }
      this.ovmap_.setTarget(null);
    }
    super.setMap.call(this, map);
    if (map) {
      this.ovmap_.setTarget(this.ovmapDiv_);
      map.on('propertychange', this.handleMapPropertyChange_, this);
      if (this.ovmap_.getLayers().getLength() === 0) {
        this.ovmap_.setLayerGroup(map.getLayerGroup());
      }
      let view = map.getView();
      if (view) {
        this.bindView_(view);
        if (this.isDef(view)) {
          this.ovmap_.updateSize();
          this.resetExtent_();
        }
      }
    }
  }

  /**
   * check view is defined
   * @param view
   * @returns {boolean}
   */
  isDef (view) {
    return !!view.getCenter() && view.getResolution() !== undefined
  }

  /**
   * handle map change
   * @param event
   * @private
   */
  handleMapPropertyChange_ (event) {
    if (event.key === 'view') {
      let oldView = (event.oldValue);
      if (oldView) {
        this.unbindView_(oldView);
      }
      let newView = this.getMap().getView();
      this.bindView_(newView);
    }
  }

  /**
   * bind view event
   * @param view
   * @private
   */
  bindView_ (view) {
    view.on('change:rotation', this.handleRotationChanged_, this)
  }

  /**
   * unbind view events
   * @param view
   * @private
   */
  unbindView_ (view) {
    view.un('change:rotation', this.handleRotationChanged_, this);
  }

  /**
   * handle view rotation change
   * @private
   */
  handleRotationChanged_ () {
    this.ovmap_.getView().setRotation(this.getMap().getView().getRotation())
  }

  /**
   * 重新调整范围，避免过大或者过小
   * @private
   */
  validateExtent_ () {
    let map = this.getMap()
    let ovmap = this.ovmap_
    let mapSize = /** @type {ol.Size} */ (map.getSize())
    let view = map.getView()
    let extent = view.calculateExtent(mapSize)
    let ovmapSize = /** @type {ol.Size} */ (ovmap.getSize())
    let ovview = ovmap.getView()
    let ovextent = ovview.calculateExtent(ovmapSize)
    let topLeftPixel =
      ovmap.getPixelFromCoordinate(ol.extent.getTopLeft(extent))
    let bottomRightPixel =
      ovmap.getPixelFromCoordinate(ol.extent.getBottomRight(extent))
    let boxWidth = Math.abs(topLeftPixel[0] - bottomRightPixel[0])
    let boxHeight = Math.abs(topLeftPixel[1] - bottomRightPixel[1])
    let ovmapWidth = ovmapSize[0]
    let ovmapHeight = ovmapSize[1]
    if (boxWidth < ovmapWidth * OVERVIEWMAP.MIN_RATIO ||
      boxHeight < ovmapHeight * OVERVIEWMAP.MIN_RATIO ||
      boxWidth > ovmapWidth * OVERVIEWMAP.MAX_RATIO ||
      boxHeight > ovmapHeight * OVERVIEWMAP.MAX_RATIO) {
      this.resetExtent_()
    } else if (!ol.extent.containsExtent(ovextent, extent)) {
      this.recenter_()
    }
  }

  /**
   * reset extent
   * @private
   */
  resetExtent_ () {
    if (OVERVIEWMAP.MAX_RATIO === 0 || OVERVIEWMAP.MIN_RATIO === 0) {
      return
    }
    let map = this.getMap()
    let ovmap = this.ovmap_
    let mapSize = /** @type {ol.Size} */ (map.getSize())
    let view = map.getView()
    let extent = view.calculateExtent(mapSize)
    let ovview = ovmap.getView()
    let steps = Math.log(OVERVIEWMAP.MAX_RATIO / OVERVIEWMAP.MIN_RATIO) / Math.LN2
    let ratio = 1 / (Math.pow(2, steps / 2) * OVERVIEWMAP.MIN_RATIO)
    this.scaleFromCenter(extent, ratio)
    ovview.fit(extent)
  }

  /**
   * 计算中心点的缩放
   * @param extent
   * @param value
   */
  scaleFromCenter (extent, value) {
    let deltaX = ((extent[2] - extent[0]) / 2) * (value - 1)
    let deltaY = ((extent[3] - extent[1]) / 2) * (value - 1)
    extent[0] -= deltaX
    extent[2] += deltaX
    extent[1] -= deltaY
    extent[3] += deltaY
  }

  /**
   * reset center
   * @private
   */
  recenter_ () {
    let map = this.getMap()
    let ovmap = this.ovmap_
    let view = map.getView()
    let ovview = ovmap.getView()
    ovview.setCenter(view.getCenter())
  }

  /**
   * Update the box using the main map extent
   * @private
   */
  updateBox_ () {
    let map = this.getMap();
    let ovmap = this.ovmap_;
    let mapSize = /** @type {ol.Size} */ (map.getSize());
    let view = map.getView();
    let ovview = ovmap.getView();
    let rotation = view.getRotation();
    let overlay = this.boxOverlay_;
    let box = this.boxOverlay_.getElement();
    let extent = view.calculateExtent(mapSize);
    let ovresolution = ovview.getResolution();
    let bottomLeft = ol.extent.getBottomLeft(extent);
    let topRight = ol.extent.getTopRight(extent);
    let rotateBottomLeft = this.calculateCoordinateRotate_(rotation, bottomLeft);
    overlay.setPosition(rotateBottomLeft);
    if (box) {
      setStyle(box, {
        width: Math.abs((bottomLeft[0] - topRight[0]) / ovresolution) + 'px',
        height: Math.abs((topRight[1] - bottomLeft[1]) / ovresolution) + 'px'
      });
    }
  }

  /**
   * 计算坐标角度
   * @param rotation
   * @param coordinate
   * @returns {*}
   * @private
   */
  calculateCoordinateRotate_ (rotation, coordinate) {
    let coordinateRotate;
    const map = this.getMap();
    const view = map.getView();
    let currentCenter = view.getCenter();
    if (currentCenter) {
      coordinateRotate = [
        coordinate[0] - currentCenter[0],
        coordinate[1] - currentCenter[1]
      ];
      ol.coordinate.rotate(coordinateRotate, rotation);
      ol.coordinate.add(coordinateRotate, currentCenter);
    }
    return coordinateRotate;
  }

  /**
   * 处理点击事件
   * @param event
   * @private
   */
  handleClick_ (event) {
    event.preventDefault();
    this.handleToggle_(event);
  }

  /**
   * @private
   */
  handleToggle_ (event) {
    if (this.collapsed_) {
      this.collapsed_ = false;
      event.target.style.backgroundPosition = '-40px -405px';
      this.element.style.width = '17px';
      this.element.style.height = '17px';
    } else {
      this.collapsed_ = true;
      event.target.style.backgroundPosition = '-40px -386px';
      this.element.style.width = '120px';
      this.element.style.height = '120px';
    }
    let ovmap = this.ovmap_;
    if (!this.collapsed_ && !ovmap) {
      ovmap.updateSize();
      this.resetExtent_();
      ovmap.once('postrender', this.updateBox_, this)
    }
  }

  /**
   * 返回鹰眼是否可折叠
   * @returns {*|boolean}
   */
  getCollapsible () {
    return this.collapsible_;
  }

  /**
   * 设置鹰眼是否可折叠
   * @param collapsible
   */
  setCollapsible (collapsible) {
    if (this.collapsible_ === collapsible) {
      return
    }
    this.collapsible_ = collapsible
    if (!collapsible && this.collapsed_) {
      this.handleToggle_();
    }
  }

  /**
   * 设置鹰眼收起状态
   * @param collapsed
   */
  setCollapsed (collapsed) {
    if (!this.collapsible_ || this.collapsed_ === collapsed) {
      return
    }
    this.handleToggle_()
  }

  /**
   * 判断鹰眼是否收起
   * @returns {boolean|*}
   */
  getCollapsed () {
    return this.collapsed_
  }

  /**
   * 返回当前鹰眼地图
   * @returns {ol.Map}
   */
  getOverviewMap () {
    return this.ovmap_
  }
}

export default OverviewMap
