ol.layer.LayerUtils = function (map) {
  if (map && map instanceof ol.Map) {
    this.map = map
  } else {
    throw new Error('传入的不是地图对象！')
  }
}

/**
 * 通过layerName获取图层
 * @param layerName
 * @returns {*}
 */
ol.layer.LayerUtils.prototype.getLayerByLayerName = function (layerName) {
  try {
    let targetLayer = null
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      layers.every(layer => {
        if (layer.get('layerName') === layerName) {
          targetLayer = layer
          return false
        } else {
          return true
        }
      })
    }
    return targetLayer
  } catch (e) {
    console.log(e)
  }
}

/**
 * 创建临时图层
 * @param layerName
 * @param params
 * @returns {*}
 */
ol.layer.LayerUtils.prototype.createVectorLayer = function (layerName, params) {
  try {
    if (this.map) {
      let vectorLayer = this.getLayerByLayerName(layerName)
      if (!(vectorLayer instanceof ol.layer.Vector)) {
        vectorLayer = null
      }
      if (!vectorLayer) {
        if (params && params.create) {
          vectorLayer = new ol.layer.Vector({
            layerName: layerName,
            params: params,
            layerType: 'vector',
            source: new ol.source.Vector({
              wrapX: false
            }),
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(67, 110, 238, 0.4)'
              }),
              stroke: new ol.style.Stroke({
                color: '#4781d9',
                width: 2
              }),
              image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                  color: '#ffcc33'
                })
              })
            })
          })
        }
      }
      if (this.map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable)
        }
        // 图层只添加一次
        let _vectorLayer = this.getLayerByLayerName(layerName)
        if (!_vectorLayer || !(_vectorLayer instanceof ol.layer.Vector)) {
          this.map.addLayer(vectorLayer)
        }
      }
      return vectorLayer
    }
  } catch (e) {
    console.log(e)
  }
}

let olLayerLayerUtils = ol.layer.LayerUtils
export default olLayerLayerUtils
