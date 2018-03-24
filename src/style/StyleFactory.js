/**
 * Created by FDD on 2017/5/1.
 * @desc 通过json获取样式
 */
import ol from 'openlayers'

class StyleFactory {
  static getStyle = function (options = {}) {
    let style = new ol.style.Style({});
    if (options['geometry'] && options['geometry'] instanceof ol.geom.Geometry) {
      style.setGeometry(options['geometry']);
    }
    if (options['zIndex'] && typeof options['zIndex'] === 'number') {
      style.setZIndex(options['zIndex']);
    }
    if (options['fill'] && typeof options['fill'] === 'object') {
      style.setFill(StyleFactory._getFill(options['fill']));
    }
    if (options['image'] && typeof options['image'] === 'object') {
      style.setImage(StyleFactory._getImage(options['image']));
    }
    if (options['stroke'] && typeof options['stroke'] === 'object') {
      style.setStroke(StyleFactory._getStroke(options['stroke']));
    }
    if (options['text'] && typeof options['text'] === 'object') {
      style.setText(StyleFactory._getText(options['text']));
    }
    return style
  };
  static _getRegularShape = function (options = {}) {
    return new ol.style.RegularShape({
      fill: (StyleFactory._getFill(options['fill']) || undefined),
      points: ((typeof options['points'] === 'number') ? options['points'] : 1),
      radius: ((typeof options['radius'] === 'number') ? options['radius'] : undefined),
      radius1: ((typeof options['radius1'] === 'number') ? options['radius1'] : undefined),
      radius2: ((typeof options['radius2'] === 'number') ? options['radius2'] : undefined),
      angle: ((typeof options['angle'] === 'number') ? options['angle'] : 0),
      snapToPixel: ((typeof options['snapToPixel'] === 'boolean') ? options['snapToPixel'] : true),
      stroke: (StyleFactory._getStroke(options['stroke']) || undefined),
      rotation: ((typeof options['rotation'] === 'number') ? options['rotation'] : 0),
      rotateWithView: ((typeof options['rotateWithView'] === 'boolean') ? options['rotateWithView'] : false),
      atlasManager: (options['atlasManager'] ? options['atlasManager'] : undefined)
    })
  };
  static _getImage = function (options = {}) {
    let image;
    if (options['type'] === 'icon') {
      image = StyleFactory._getIcon(options['image']);
    } else {
      image = StyleFactory._getRegularShape(options['image']);
    }
    return image;
  };
  static _getIcon = function (options = {}) {
    return new ol.style.Icon({
      anchor: (options['imageAnchor'] ? options['imageAnchor'] : [0.5, 0.5]),
      anchorXUnits: (options['imageAnchorXUnits'] ? options['imageAnchorXUnits'] : 'fraction'),
      anchorYUnits: (options['imageAnchorYUnits'] ? options['imageAnchorYUnits'] : 'fraction'),
      anchorOrigin: (options['imageAnchorOrigin'] ? options['imageAnchorYUnits'] : 'top-left'),
      color: (options['imageColor'] ? options['imageColor'] : undefined),
      crossOrigin: (options['crossOrigin'] ? options['crossOrigin'] : undefined),
      img: (options['img'] ? options['img'] : undefined),
      offset: (options['offset'] && Array.isArray(options['offset']) && options['offset'].length === 2 ? options['offset'] : [0, 0]),
      offsetOrigin: (options['offsetOrigin'] ? options['offsetOrigin'] : 'top-left'),
      scale: ((typeof options['scale'] === 'number') ? options['scale'] : 1),
      snapToPixel: (typeof options['snapToPixel'] === 'boolean' ? options['snapToPixel'] : true),
      rotateWithView: (typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
      opacity: (typeof options['imageOpacity'] === 'number' ? options['imageOpacity'] : 1),
      rotation: (typeof options['imageRotation'] === 'number' ? options['imageRotation'] : 0),
      size: (options['size'] && Array.isArray(options['size']) && options['size'].length === 2 ? options['size'] : undefined),
      imgSize: (options['imgSize'] && Array.isArray(options['imgSize']) && options['imgSize'].length === 2 ? options['imgSize'] : undefined),
      src: (options['imageSrc'] ? options['imageSrc'] : undefined)
    })
  };
  static _getStroke = function (options = {}) {
    return new ol.style.Stroke({
      color: (options['strokeColor'] ? options['strokeColor'] : undefined),
      lineCap: ((options['strokeLineCap'] && typeof options['strokeLineCap'] === 'string') ? options['strokeLineCap'] : 'round'),
      lineJoin: ((options['strokeLineJoin'] && typeof options['strokeLineJoin'] === 'string') ? options['strokeLineJoin'] : 'round'),
      lineDash: (options['strokeLineDash'] ? options['strokeLineDash'] : undefined),
      lineDashOffset: (typeof options['strokeLineDashOffset'] === 'number' ? options['strokeLineDashOffset'] : '0'),
      miterLimit: (typeof options['strokeMiterLimit'] === 'number' ? options['strokeMiterLimit'] : 10),
      width: (typeof options['strokeWidth'] === 'number' ? options['strokeWidth'] : 1)
    });
  };
  static _getText = function (options = {}) {
    return new ol.style.Text({
      font: ((options['textFont'] && typeof options['textFont'] === 'string') ? options['textFont'] : '10px sans-serif'),
      offsetX: (typeof options['textOffsetX'] === 'number' ? options['textOffsetX'] : 0),
      offsetY: (typeof options['textOffsetY'] === 'number' ? options['textOffsetY'] : 0),
      scale: (typeof options['textScale'] === 'number' ? options['textScale'] : undefined),
      rotation: (typeof options['textRotation'] === 'number' ? options['textRotation'] : 0),
      text: ((options['text'] && typeof options['text'] === 'string') ? options['text'] : undefined),
      textAlign: ((options['textAlign'] && typeof options['textAlign'] === 'string') ? options['textAlign'] : 'start'),
      textBaseline: ((options['textBaseline'] && typeof options['textBaseline'] === 'string') ? options['textBaseline'] : 'alphabetic'),
      rotateWithView: (typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
      fill: StyleFactory._getFill(options['textFill']),
      stroke: StyleFactory._getStroke(options['textStroke'])
    })
  };
  static _getFill = function (options = {}) {
    return new ol.style.Fill({
      color: (options['fillColor'] ? options['fillColor'] : undefined)
    })
  }
}

export default StyleFactory
