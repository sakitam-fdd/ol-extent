import olStyleFactory from '../style/factory'
import olLayerLayerUtils from '../layer/layerUtils'
import {getuuid} from '../utils/utils'
import '../scss/measureTool.scss'
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
   * 当前测量类型
   * @type {string}
   */
  this.measureType = ''

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
   * 工具是否激活
   * @type {boolean}
   */
  this.isActive = false

  /**
   * drawStyle
   * @type {{}}
   */
  this.drawStyle = {
    fill: {
      fillColor: 'rgba(67, 110, 238, 0.4)'
    },
    stroke: {
      strokeColor: 'rgba(249, 185, 154, 1)',
      strokeWidth: 2.5
    },
    image: {
      type: '',
      image: {
        fill: {
          fillColor: 'rgba(255, 255, 255, 0.8)'
        },
        points: Infinity,
        radius: 4,
        stroke: {
          strokeColor: 'rgba(255, 0, 0, 1)',
          strokeWidth: 1.5
        }
      }
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
      strokeColor: 'rgba(253, 128, 68, 1)',
      strokeWidth: 3
    },
    image: {
      type: '',
      image: {
        fill: {
          fillColor: 'rgba(255, 255, 255, 0.8)'
        },
        points: Infinity,
        radius: 4,
        stroke: {
          strokeColor: 'rgba(255, 0, 0, 1)',
          strokeWidth: 1.5
        }
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
    handleUpEvent: ol.interaction.MeasureTool.handleUpEvent_
  })
}

ol.inherits(ol.interaction.MeasureTool, ol.interaction.Pointer)

/**
 * 处理移动事件
 * @param mapBrowserEvent
 */
ol.interaction.MeasureTool.handleMoveEvent_ = function (mapBrowserEvent) {
  this.beforeDrawPointClickHandler(mapBrowserEvent)
}

/**
 * 处理鼠标按下事件
 * @param event
 * @private
 */
ol.interaction.MeasureTool.handleDownEvent_ = function (event) {
  return false
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
  this.draw.set('uuid', getuuid())
  this.getMap().addInteraction(this.draw)
  this.draw.on('drawstart', this.drawStartHandle_, this)
  this.draw.on('drawend', this.drawEndHandle_, this)
  this.getMap().on('click', this.drawClickHandle_, this)
}

/**
 * 单击事件处理
 * @param event
 * @private
 */
ol.interaction.MeasureTool.prototype.drawClickHandle_ = function (event) {
  console.log(event)
  if (this.drawStart_ && !event.dragging) {
    this.addMeasurecircle(event.coordinate)
  }
}

/**
 * 添加点击测量时的圆圈
 * @param coordinate
 */
ol.interaction.MeasureTool.prototype.addMeasurecircle = function (coordinate) {
  let feature = new ol.Feature({
    uuid: this.draw.get('uuid'),
    geometry: new ol.geom.Point(coordinate)
  })
  this.layer.getSource().addFeature(feature)
}

/**
 * drawStartHandle
 * @param event
 * @private
 */
ol.interaction.MeasureTool.prototype.drawStartHandle_ = function (event) {
  this.drawStart_ = true
}

/**
 * drawEndHandle
 * @param event
 * @private
 */
ol.interaction.MeasureTool.prototype.drawEndHandle_ = function (event) {
  console.log(event)
}

// ol.interaction.MeasureTool.prototype.addclickEventListener

/**
 * 点击之前的帮助信息
 * @param event
 */
ol.interaction.MeasureTool.prototype.beforeDrawPointClickHandler = function (event) {
  if (!this.measureHelpTooltip && this.getActive()) {
    let helpTooltipElement = document.createElement('span')
    if (this.measureTypes.measureLength['name'] === this.measureType) {
      helpTooltipElement.className = 'hamp-js-measure hamp-js-measure-length'
      helpTooltipElement.innerHTML = '单击开始测距'
    } else {
      helpTooltipElement.className = 'hamp-js-measure hamp-js-measure-area'
      helpTooltipElement.innerHTML = '单击开始测面'
    }
    this.measureHelpTooltip = new ol.Overlay({
      element: helpTooltipElement,
      offset: [15, -10],
      positioning: 'center-right'
    })
    this.measureHelpTooltip.set('layerName', this.layerName)
    this.getMap().addOverlay(this.measureHelpTooltip)
  } else if (this.measureHelpTooltip && this.measureHelpTooltip instanceof ol.Overlay) {
    this.measureHelpTooltip.setPosition(event.coordinate)
  }
}

/**
 * 激活测量工具
 * @param active
 * @param key
 */
ol.interaction.MeasureTool.prototype.setActive = function (active, key) {
  if (active && key && this.measureTypes.hasOwnProperty(key) && !this.layer) {
    this.isActive = active
    this.measureType = key
    let _style = new olStyleFactory(this.finshStyle)
    this.layer = new olLayerLayerUtils(this.getMap()).createVectorLayer(this.layerName, {
      create: true
    })
    this.layer.setStyle(_style)
    this.addDrawInteractions(this.measureTypes[key]['type'])
  } else {
    this.isActive = false
  }
}

ol.interaction.MeasureTool.prototype.getActive = function () {
  return this.isActive
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
