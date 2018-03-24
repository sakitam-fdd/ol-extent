/**
 * Created by FDD on 2017/10/12.
 * @desc 坐标实时拾取
 */
import '../assets/scss/mousePosition.scss'
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import {create, on} from '../utils';

class MousePosition extends ol.control.Control {
  static Property_ = {
    PROJECTION: 'projection',
    COORDINATE_FORMAT: 'coordinateFormat',
    UNITS: ['经度', '纬度']
  };
  static render = function (mapEvent) {
    let frameState = mapEvent.frameState
    if (!frameState) {
      this.mapProjection_ = null
    } else {
      if (this.mapProjection_ !== frameState.viewState.projection) {
        this.mapProjection_ = frameState.viewState.projection
        this.transform_ = null
      }
    }
    if (this.getMap() && this.lastMouseMovePixel_) {
      if (this.followMouse_) {
        this.followMousePopver_(this.lastMouseMovePixel_)
      } else {
        this.updateHTML_(this.lastMouseMovePixel_)
      }
    }
  };
  static identityTransform = function (input, output, dimension) {
    if (output !== undefined && input !== output) {
      for (let i = 0, ii = input.length; i < ii; ++i) {
        output[i] = input[i];
      }
      input = output;
    }
    return input;
  };
  constructor (options = {}) {
    const className_ = options.className !== undefined ? options.className : 'ole-mouse-position';
    const element = create('div', (className_ + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));
    const render = options.render ? options.render : MousePosition.render;
    super({
      element: element,
      render: render,
      target: options.target
    });

    this.on('change:' + MousePosition.Property_.PROJECTION, this.handleProjectionChanged_, this);

    if (options.coordinateFormat) {
      this.setCoordinateFormat(options.coordinateFormat);
    }
    if (options.projection) {
      this.setProjection(options.projection);
    }

    if (options.units) {
      this.setUnits(options.units);
    }
    /**
     * @private
     * @type {string}
     */
    this.undefinedHTML_ = options.undefinedHTML !== undefined ? options.undefinedHTML : '';

    /**
     * @private
     * @type {string}
     */
    this.renderedHTML_ = element.innerHTML;

    /**
     * @private
     * @type {ol.proj.Projection}
     */
    this.mapProjection_ = null;

    /**
     * @private
     * @type {?ol.TransformFunction}
     */
    this.transform_ = null;

    /**
     * @private
     * @type {ol.Pixel}
     */
    this.lastMouseMovePixel_ = null;

    /**
     * 是否显示跟随气泡（同步开启点击锚坐标）
     * @type {boolean}
     * @private
     */
    this.followMouse_ = options['followMouse'] === true ? options['followMouse'] : false;

    /**
     * 当前气泡
     * @type {null}
     * @private
     */
    this.popver_ = null;

    /**
     * 容器边界
     * @type {null}
     * @private
     */
    this._bounds = null;

    /**
     * className
     * @type {string}
     * @private
     */
    this.className_ = className_;
  }

  /**
   * 处理投影变化事件
   * @private
   */
  handleProjectionChanged_ () {
    this.transform_ = null
  }

  /**
   * 获取投影转换函数
   * @returns {ol.CoordinateFormatType|undefined}
   */
  getCoordinateFormat () {
    return (this.get(MousePosition.Property_.COORDINATE_FORMAT))
  }

  /**
   * 获取投影
   * @returns {ol.proj.Projection|undefined}
   */
  getProjection () {
    return (this.get(MousePosition.Property_.PROJECTION));
  }

  /**
   * 处理鼠标移动事件
   * @param event
   */
  handleMouseMove (event) {
    let map = this.getMap();
    if (map) {
      this.lastMouseMovePixel_ = map.getEventPixel(event);
      if (this.lastMouseMovePixel_) {
        if (this.followMouse_) {
          this.followMousePopver_(event);
        } else {
          this.updateHTML_(this.lastMouseMovePixel_);
        }
      }
    }
  }

  /**
   * 显示气泡
   * @private
   */
  followMousePopver_ () {
    let html = this.getHTML_(this.lastMouseMovePixel_);
    let map = this.getMap();
    let coordinates = map.getCoordinateFromPixel(this.lastMouseMovePixel_);
    if (!this.popver_) {
      let ele = create('div', this.className_ + '_overlay');
      ele.innerHTML = html;
      this.popver_ = new ol.Overlay({
        element: ele,
        offset: [10, 0],
        position: coordinates,
        positioning: 'center-left'
      });
      map.addOverlay(this.popver_);
      map.render();
    } else {
      let _ele = this.popver_.getElement();
      _ele.innerHTML = html;
      if (_ele.offsetWidth >= this._bounds.width - this.lastMouseMovePixel_[0]) {
        this.popver_.setPositioning('center-right');
        this.popver_.setOffset([-10, 0]);
      } else {
        this.popver_.setPositioning('center-left');
        this.popver_.setOffset([10, 0]);
      }
      this.popver_.setPosition(coordinates);
      this.popver_.setElement(_ele);
    }
  }

  /**
   * 处理鼠标移出视图事件
   * @param event
   */
  handleMouseOut (event) {
    this.updateHTML_(null);
    this.lastMouseMovePixel_ = null;
  }

  /**
   * setMap
   * @param map
   */
  setMap (map) {
    super.setMap.call(this, map);
    if (map) {
      let viewport = map.getViewport();
      this._bounds = map.getTargetElement().getBoundingClientRect();
      on(viewport, 'mousemove', this.handleMouseMove, this);
      on(viewport, 'mouseout', this.handleMouseOut, this);
    }
  }

  /**
   * 设置坐标格式化函数
   * @param format
   */
  setCoordinateFormat (format) {
    this.set(MousePosition.Property_.COORDINATE_FORMAT, format);
  }

  /**
   * 设置投影转换
   * @param projection
   */
  setProjection (projection) {
    this.set(MousePosition.Property_.PROJECTION, ol.proj.get(projection));
  }

  /**
   * 设置显示单位
   * @param units
   */
  setUnits (units) {
    this.set(MousePosition.Property_.PROJECTION, units)
  }

  /**
   * 更新页面控件
   * @param pixel
   * @private
   */
  updateHTML_ (pixel) {
    const html = this.getHTML_(pixel);
    if (!this.renderedHTML_ || html !== this.renderedHTML_) {
      this.element.innerHTML = html;
      this.renderedHTML_ = html;
    }
  }

  /**
   * 获取dom
   * @param pixel
   * @returns {string|*}
   * @private
   */
  getHTML_ (pixel) {
    let html = this.undefinedHTML_;
    if (pixel && this.mapProjection_) {
      if (!this.transform_) {
        let projection = this.getProjection();
        if (projection) {
          this.transform_ = ol.proj.getTransformFromProjections(this.mapProjection_, projection);
        } else {
          this.transform_ = MousePosition.identityTransform;
        }
      }
      let map = this.getMap();
      let coordinate = map.getCoordinateFromPixel(pixel);
      if (coordinate) {
        this.transform_(coordinate, coordinate);
        let coordinateFormat = this.getCoordinateFormat();
        if (coordinateFormat) {
          html = coordinateFormat(coordinate)
        } else {
          html = MousePosition.Property_.UNITS[0] + '：' + coordinate[0] +
            ' ' + MousePosition.Property_.UNITS[1] + '：' + coordinate[1]
        }
      }
    }
    return html
  }
}

export default MousePosition
