import olStyleFactory from '../style/factory'
import olLayerLayerUtils from '../layer/layerUtils'
ol.interaction.MeasureTool = function (params) {
  this.options = params || {}

  /**
   * 计算工具
   * @type {ol.Sphere}
   */
  this.wgs84Sphere = new ol.Sphere(typeof this.options['sphere'] === 'number' ? this.options['sphere'] : 6378137)

  /**
   * 测量类型（目前预制两种，测距和测面）
   * @type {{measureLength: string, measureArea: string}}
   */
  this.measureTypes = {
    measureLength: {
      name: 'measureLength',
      type: 'LineString'
    },
    measureArea: {
      name: 'measureArea',
      type: 'Polygon'
    }
  }

  /**
   * 是否使用地理测量方式
   * @type {boolean}
   */
  this.isGeodesic = (this.options['isGeodesic'] === false ? this.options['isGeodesic'] : true)

  /**
   * 测量工具所处图层
   * @type {*}
   */
  this.layerName = this.options['layerName'] || 'measureTool'

  /**
   * 当前矢量图层
   * @type {null}
   */
  this.layer = null

  /**
   * 交互工具
   * @type {null}
   */
  this.draw = null

  /**
   * drawStyle
   * @type {{}}
   */
  this.drawStyle = {
    fill: {
      fillColor: 'rgba(67, 110, 238, 0.4)'
    },
    stroke: {
      strokeColor: 'rgba(242, 123, 57, 1)',
      strokeWidth: 2
    }
  }
  if (this.options['drawStyle'] && typeof this.options['drawStyle'] === 'object') {
    this.drawStyle = this.options['drawStyle']
  }

  /**
   * 完成后样式
   * @type {{}}
   */
  this.finshStyle = {
    fill: {
      fillColor: 'rgba(67, 110, 238, 0.4)'
    },
    stroke: {
      strokeColor: 'rgba(242, 123, 57, 1)',
      strokeWidth: 2
    },
    circle: {
      circleRadius: 1,
      stroke: {
        strokeColor: 'rgba(255, 0, 0, 1)',
        strokeWidth: 1
      },
      fill: {
        fillColor: 'rgba(255, 255, 255, 1)'
      }
    }
  }
  if (this.options['finshStyle'] && typeof this.options['finshStyle'] === 'object') {
    this.finshStyle = this.options['finshStyle']
  }

  /**
   * @type {string|undefined}
   * @private
   */
  this.cursor_ = 'default'

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined
  ol.interaction.Pointer.call(this, {
    handleMoveEvent: ol.interaction.MeasureTool.handleMoveEvent_,
    handleDownEvent: ol.interaction.MeasureTool.handleDownEvent_,
    handleDragEvent: ol.interaction.MeasureTool.handleDragEvent_,
    handleUpEvent: ol.interaction.MeasureTool.handleUpEvent_
  })
}

ol.inherits(ol.interaction.MeasureTool, ol.interaction.Pointer)

/**
 * 处理移动事件
 * @param mapBrowserEvent
 */
ol.interaction.MeasureTool.handleMoveEvent_ = function (mapBrowserEvent) {
  this.getMap().render()
}

/**
 * 处理鼠标按下事件
 * @param event
 * @private
 */
ol.interaction.MeasureTool.handleDownEvent_ = function (event) {
  return true
}

/**
 * 处理拖拽事件
 * @param event
 * @private
 */
ol.interaction.MeasureTool.handleDragEvent_ = function (event) {
  console.log(event)
}

/**
 * 处理鼠标抬起事件
 * @param event
 * @private
 */
ol.interaction.MeasureTool.handleUpEvent_ = function (event) {
  return false
}

ol.interaction.MeasureTool.prototype.addDrawInteractions = function (type) {
  let style_ = new olStyleFactory(this.drawStyle)
  this.draw = new ol.interaction.Draw({
    source: this.layer.getSource(),
    type: type,
    style: style_
  })
  this.getMap().addInteraction(this.draw)
  this.draw.on('drawstart', this.drawStartHandle_, this)
  this.draw.on('drawend', this.drawEndHandle_, this)
}

/**
 * drawStartHandle
 * @param event
 * @private
 */
ol.interaction.MeasureTool.prototype.drawStartHandle_ = function (event) {
  console.log(event)
}

/**
 * drawEndHandle
 * @param event
 * @private
 */
ol.interaction.MeasureTool.prototype.drawEndHandle_ = function (event) {
  console.log(event)
}

/**
 * 激活测量工具
 * @param key
 */
ol.interaction.MeasureTool.prototype.active = function (key) {
  if (key && this.measureTypes.hasOwnProperty(key) && !this.layer) {
    let _style = new olStyleFactory(this.finshStyle)
    this.layer = new olLayerLayerUtils(this.getMap()).createVectorLayer(this.layerName, {
      create: true
    })
    this.layer.setStyle(_style)
    this.addDrawInteractions(this.measureTypes[key]['type'])
  }
}

/**
 * 取消激活工具
 * @param params
 */
ol.interaction.MeasureTool.prototype.disActive = function (params) {
  console.log(params)
}

/**
 * 测量结果格式化
 * @param geom
 * @returns {number}
 */
ol.interaction.MeasureTool.prototype.formatData = function (geom) {
  let output = 0
  if (geom) {
    if (this.options['measureType'] === this.measureTypes.measureLength) {
      if (this.isGeodesic) {
        let [coordinates, length] = [geom.getCoordinates(), 0]
        let sourceProj = this.map.getView().getProjection()
        for (let i = 0, ii = coordinates.length - 1; i < ii; ++i) {
          let c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326')
          let c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326')
          length += this.wgs84Sphere.haversineDistance(c1, c2)
        }
        if (length > 100) {
          output = (Math.round(length / 1000 * 100) / 100) + ' ' + '公里'
        } else {
          output = (Math.round(length * 100) / 100) + ' ' + '米'
        }
      } else {
        output = Math.round(geom.getLength() * 100) / 100
      }
    } else if (this.options['measureType'] === this.measureTypes.measureArea) {
      if (this.isGeodesic) {
        let sourceProj = this.getMap().getView().getProjection()
        let geometry = /** @type {ol.geom.Polygon} */(geom.clone().transform(
          sourceProj, 'EPSG:4326'))
        let coordinates = geometry.getLinearRing(0).getCoordinates()
        let area = Math.abs(this.wgs84Sphere.geodesicArea(coordinates))
        if (area > 10000000000) {
          output = (Math.round(area / (1000 * 1000 * 10000) * 100) / 100) + ' ' + '万平方公里'
        } else if (area > 1000000 && area < 10000000000) {
          output = (Math.round(area / (1000 * 1000) * 100) / 100) + ' ' + '平方公里'
        } else {
          output = (Math.round(area * 100) / 100) + ' ' + '平方米'
        }
      } else {
        output = geom.getArea()
      }
    }
  }
  return output
}

let olInteractionMeasureTool = ol.interaction.MeasureTool
export default olInteractionMeasureTool
