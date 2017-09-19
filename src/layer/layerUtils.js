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
      targetLayer = this.getLayerInternal(layers, 'layerName', layerName)
    }
    return targetLayer
  } catch (e) {
    console.log(e)
  }
}

/**
 * 内部处理获取图层方法
 * @param layers
 * @param key
 * @param value
 * @returns {*}
 */
ol.layer.LayerUtils.prototype.getLayerInternal = function (layers, key, value) {
  let _target = null
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray()
        _target = this.getLayerInternal(layers, key, value)
        if (_target) {
          return false
        } else {
          return true
        }
      } else if (layer.get(key) === value) {
        _target = layer
        return false
      } else {
        return true
      }
    })
  }
  return _target
}

/**
 * 根据相关键值键名获取图层集合
 * @param layers
 * @param key
 * @param value
 * @returns {Array}
 */
ol.layer.LayerUtils.prototype.getLayersArrayInternal = function (layers, key, value) {
  let _target = []
  if (layers.length > 0) {
    layers.forEach(layer => {
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray()
        let _layer = this.getLayerInternal(layers, key, value)
        if (_layer) {
          _target.push(layer)
        }
      } else if (layer.get(key) === value) {
        _target.push(layer)
      }
    })
  }
  return _target
}

/**
 * 通过键名键值获取图层（注意键名键值必须是set(key, value)）
 * @param key
 * @param value
 */
ol.layer.LayerUtils.prototype.getLayerByKeyValue = function (key, value) {
  try {
    let targetLayer = null
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      targetLayer = this.getLayerInternal(layers, key, value)
    }
    return targetLayer
  } catch (e) {
    console.log(e)
  }
}

/**
 * 通过键名键值获取图层集合（注意键名键值必须是set(key, value)）
 * @param key
 * @param value
 */
ol.layer.LayerUtils.prototype.getLayersArrayByKeyValue = function (key, value) {
  try {
    let targetLayers = []
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      targetLayers = this.getLayersArrayInternal(layers, key, value)
    }
    return targetLayers
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
