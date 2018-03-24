import ol from 'openlayers'

class Gaode extends ol.source.XYZ {
  static ATTRIBUTION = new ol.Attribution({
    html: '&copy; ' +
    '<a href="http://ditu.amap.com/">高德地图</a> ' +
    'contributors.'
  })
  constructor (options = {}) {
    let attributions = '';
    if (options.attributions !== undefined) {
      attributions = options.attributions;
    } else {
      attributions = [Gaode.ATTRIBUTION];
    }
    options.projection = options['projection'] ? options.projection : 'EPSG:3857';
    const crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : 'anonymous';
    const url = options.url !== undefined ? options.url : 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}';
    const tileUrlFunction = options.tileUrlFunction ? options.tileUrlFunction : undefined
    super({
      attributions: attributions,
      cacheSize: options.cacheSize,
      crossOrigin: crossOrigin,
      opaque: options.opaque !== undefined ? options.opaque : true,
      maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileLoadFunction: options.tileLoadFunction,
      tileUrlFunction: tileUrlFunction,
      url: url,
      wrapX: options.wrapX
    })
  }
}

export default Gaode
