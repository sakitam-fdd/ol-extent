/**
 * Created by FDD on 2017/10/11.
 * @desc 比例尺控件
 */
import '../assets/scss/scaleLine.scss'
import ol from 'openlayers'
import {BASE_CLASS_NAME, UNITS} from '../constants'
import { create, on } from '../utils';

class ScaleLine extends ol.control.Control {
  static render = function (mapEvent) {
    const frameState = mapEvent.frameState
    if (!frameState) {
      this.viewState_ = null
    } else {
      this.viewState_ = frameState.viewState
    }
    this.updateElement_()
  };
  static LEADING_DIGITS = [1, 2, 5];
  static ScaleLineUnits = { // units
    DEGREES: 'degrees',
    IMPERIAL: 'imperial',
    NAUTICAL: 'nautical',
    METRIC: 'metric',
    CHINESEMETRIC: 'metric_cn',
    US: 'us'
  };
  static Property_ = {
    UNITS: 'units'
  };
  constructor (options = {}) {
    // className
    const className = options.className !== undefined ? options.className : 'ole-scale-line-control'
    // element
    const element_ = create('div', (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));
    // innerElement
    const innerElement_ = create('div', (className + '-inner'), element_);
    // render
    const render = options.render ? options.render : ScaleLine.render;
    super({
      element: element_,
      render: render,
      target: options.target
    });

    /**
     * @private
     * @type {?olx.ViewState}
     */
    this.viewState_ = null;

    /**
     * @private
     * @type {number}
     */
    this.minWidth_ = options.minWidth !== undefined ? options.minWidth : 64;

    /**
     * @private
     * @type {boolean}
     */
    this.renderedVisible_ = false;

    /**
     * @private
     * @type {number|undefined}
     */
    this.renderedWidth_ = undefined;

    /**
     * @private
     * @type {string}
     */
    this.renderedHTML_ = '';

    /**
     * inner element
     * @type {HTMLElement}
     * @private
     */
    this.innerElement_ = innerElement_;

    on(this, 'change:' + ScaleLine.Property_.UNITS, this.handleUnitsChanged_, this);
    this.setUnits((options.units) || ScaleLine.ScaleLineUnits.METRIC)
  }

  /**
   * get units
   */
  getUnits () {
    return (this.get(ScaleLine.Property_.UNITS));
  }

  /**
   * handle units changed
   * @private
   */
  handleUnitsChanged_ () {
    this.updateElement_();
  }

  /**
   * set units
   * @param units
   */
  setUnits (units) {
    this.set(ScaleLine.Property_.UNITS, units)
  }

  /**
   * update element
   * @private
   */
  updateElement_ () {
    const viewState = this.viewState_;
    if (!viewState) {
      if (this.renderedVisible_) {
        this.element.style.display = 'none';
        this.renderedVisible_ = false;
      }
      return
    }
    let [center, projection] = [viewState.center, viewState.projection];
    let units = this.getUnits();
    let pointResolutionUnits = units === ScaleLine.ScaleLineUnits.DEGREES ? UNITS.DEGREES : UNITS.METERS;
    let pointResolution = ol.proj.getPointResolution(projection, viewState.resolution, center, pointResolutionUnits);
    let nominalCount = this.minWidth_ * pointResolution;
    let suffix = '';
    if (units === ScaleLine.ScaleLineUnits.DEGREES) {
      let metersPerDegree = ol.proj.METERS_PER_UNIT[UNITS.DEGREES];
      if (projection.getUnits() === UNITS.DEGREES) {
        nominalCount *= metersPerDegree;
      } else {
        pointResolution /= metersPerDegree;
      }
      if (nominalCount < metersPerDegree / 60) {
        suffix = '\u2033'; // seconds
        pointResolution *= 3600
      } else if (nominalCount < metersPerDegree) {
        suffix = '\u2032'; // minutes
        pointResolution *= 60
      } else {
        suffix = '\u00b0'; // degrees
      }
    } else if (units === ScaleLine.ScaleLineUnits.IMPERIAL) {
      if (nominalCount < 0.9144) {
        suffix = 'in';
        pointResolution /= 0.0254
      } else if (nominalCount < 1609.344) {
        suffix = 'ft';
        pointResolution /= 0.3048
      } else {
        suffix = 'mi';
        pointResolution /= 1609.344
      }
    } else if (units === ScaleLine.ScaleLineUnits.NAUTICAL) {
      pointResolution /= 1852;
      suffix = 'nm';
    } else if (units === ScaleLine.ScaleLineUnits.METRIC) {
      if (nominalCount < 0.001) {
        suffix = 'μm';
        pointResolution *= 1000000
      } else if (nominalCount < 1) {
        suffix = 'mm';
        pointResolution *= 1000
      } else if (nominalCount < 1000) {
        suffix = 'm';
      } else {
        suffix = 'km';
        pointResolution /= 1000;
      }
    } else if (units === ScaleLine.ScaleLineUnits.US) {
      if (nominalCount < 0.9144) {
        suffix = 'in';
        pointResolution *= 39.37
      } else if (nominalCount < 1609.344) {
        suffix = 'ft';
        pointResolution /= 0.30480061
      } else {
        suffix = 'mi';
        pointResolution /= 1609.3472
      }
    } else if (units === ScaleLine.ScaleLineUnits.CHINESEMETRIC) {
      if (nominalCount < 0.001) {
        suffix = '微米';
        pointResolution *= 1000000;
      } else if (nominalCount < 1) {
        suffix = '毫米';
        pointResolution *= 1000
      } else if (nominalCount < 1000) {
        suffix = '米';
      } else {
        suffix = '千米';
        pointResolution /= 1000
      }
    } else {
      ol.asserts.assert(false, 33) // Invalid units
    }

    let i = 3 * Math.floor(Math.log(this.minWidth_ * pointResolution) / Math.log(10));
    let [count, width] = [undefined, undefined];
    while (true) {
      count = ScaleLine.LEADING_DIGITS[((i % 3) + 3) % 3] * Math.pow(10, Math.floor(i / 3));
      width = Math.round(count / pointResolution)
      if (isNaN(width)) {
        this.element.style.display = 'none'
        this.renderedVisible_ = false
        return
      } else if (width >= this.minWidth_) {
        break
      }
      ++i
    }
    let html = count + ' ' + suffix;
    if (this.renderedHTML_ !== html) {
      this.innerElement_.innerHTML = html;
      this.renderedHTML_ = html
    }
    if (this.renderedWidth_ !== width) {
      this.innerElement_.style.width = width + 'px';
      this.renderedWidth_ = width
    }
    if (!this.renderedVisible_) {
      this.element.style.display = '';
      this.renderedVisible_ = true
    }
  }
}

export default ScaleLine
