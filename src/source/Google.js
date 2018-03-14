import ol from 'openlayers'

class Google extends ol.source.XYZ {
  static ATTRIBUTION = new ol.Attribution({
    html: '&copy; ' +
    '<a href="http://www.google.cn/maps">谷歌地图</a> ' +
    'contributors.'
  })
  constructor (options = {}) {
    let attributions = '';
    if (options.attributions !== undefined) {
      attributions = options.attributions;
    } else {
      attributions = [Google.ATTRIBUTION];
    }
    options.projection = options['projection'] ? options.projection : 'EPSG:3857';
    const crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : 'anonymous';
    const url = options.url !== undefined ? options.url : 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}';
    super({
      attributions: attributions,
      cacheSize: options.cacheSize,
      crossOrigin: crossOrigin,
      opaque: options.opaque !== undefined ? options.opaque : true,
      maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
      reprojectionErrorThreshold: options.reprojectionErrorThreshold,
      tileLoadFunction: options.tileLoadFunction,
      url: url,
      wrapX: options.wrapX
    })
  }
}

export default Google
