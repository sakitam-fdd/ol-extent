/**
 * Created by FDD on 2016/11/5.
 * @desc 动态圆，主要用于周边搜索功能
 */
import '../scss/freeHandCircle.scss'
import olStyleFactory from '../style/factory'
import olLayerLayerUtils from '../layer/layerUtils'
import {getuuid} from '../utils/utils'
ol.interaction.FreeHandCircle = function (params) {
  this.options = params || {}

  /**
   * 计算工具
   * @type {ol.Sphere}
   */
  this.wgs84Sphere = new ol.Sphere(typeof this.options['sphere'] === 'number' ? this.options['sphere'] : 6378137)

  /**
   * 当前图层layerName
   * @type {*}
   */
  this.layerName = this.options['layerName'] || 'FREE_HAND_CIRCLE'

  /**
   * 中心点样式
   * @type {*}
   */
  this.centerStyle = this.options['centerStyle'] || null

  /**
   * 当前图层
   * @type {null}
   */
  this.layer = null

  /**
   * 当前半径
   * @type {number}
   */
  this.radius = ''

  /**
   * 中心点坐标
   * @type {Array}
   * @private
   */
  this.center_ = []

  /**
   * cursor
   * @type {string}
   * @private
   */
  this.cursor_ = 'pointer'

  /**
   * isDrawStart
   * @type {boolean}
   * @private
   */
  this.drawStart_ = false

  /**
   * @type {string|undefined}
   * @private
   */
  this.previousCursor_ = undefined

  /**
   * coordinate
   * @type {null}
   * @private
   */
  this.coordinate_ = null

  /**
   * feature
   * @type {null}
   * @private
   */
  this.feature_ = null

  /**
   * 文本要素
   * @type {null}
   */
  this.textOverlay = null

  /**
   * drawStyle
   * @type {{}}
   */
  this.style_ = {
    fill: {
      fillColor: 'rgba(67, 110, 238, 0)'
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
  if (this.options['style'] && typeof this.options['style'] === 'object') {
    this.style_ = this.options['style']
  }

  ol.interaction.Pointer.call(this, {
    handleMoveEvent: ol.interaction.FreeHandCircle.handleMoveEvent_,
    handleDownEvent: ol.interaction.FreeHandCircle.handleDownEvent_,
    handleUpEvent: ol.interaction.FreeHandCircle.handleUpEvent_,
    handleDragEvent: ol.interaction.FreeHandCircle.handleDragEvent_
  })
}

ol.inherits(ol.interaction.FreeHandCircle, ol.interaction.Pointer)

/**
 * 处理移动事件
 * @param mapBrowserEvent
 */
ol.interaction.FreeHandCircle.handleMoveEvent_ = function (mapBrowserEvent) {
  if (this.cursor_) {
    let map = mapBrowserEvent.map
    let feature = map.forEachFeatureAtPixel(mapBrowserEvent.pixel, function (feature) {
      return feature
    })
    let element = map.getTargetElement()
    if (feature && feature.get('free-hand-circle-lable')) {
      if (element.style.cursor !== this.cursor_) {
        this.previousCursor_ = element.style.cursor
        element.style.cursor = this.cursor_
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_
      this.previousCursor_ = undefined
    }
  }
}

/**
 * 鼠标按下事件
 * @param mapBrowserEvent
 * @private
 */
ol.interaction.FreeHandCircle.handleDownEvent_ = function (mapBrowserEvent) {
  if (!this.drawStart_ && mapBrowserEvent.originalEvent.button === 0) {
    let map = mapBrowserEvent.map
    let feature = map.forEachFeatureAtPixel(mapBrowserEvent.pixel, function (feature) {
      return feature
    })
    if (feature && feature.get('free-hand-circle-lable')) {
      this.coordinate_ = mapBrowserEvent.coordinate
      this.feature_ = feature
    }
    return !!this.feature_
  }
}

/**
 * 处理鼠标抬起事件
 * @param mapBrowserEvent
 * @private
 */
ol.interaction.FreeHandCircle.handleUpEvent_ = function (mapBrowserEvent) {
  this.coordinate_ = null
  this.feature_ = null
  return false
}

/**
 * 处理拖拽事件
 * @param mapBrowserEvent
 * @private
 */
ol.interaction.FreeHandCircle.handleDragEvent_ = function (mapBrowserEvent) {
  if (!this.coordinate_) {
    return
  }
  let deltaX = mapBrowserEvent.coordinate[0] - this.coordinate_[0]
  let deltaY = 0
  let geometry = /** @type {ol.geom.SimpleGeometry} */
    (this.feature_.getGeometry())
  geometry.translate(deltaX, deltaY)
  this.coordinate_[0] = mapBrowserEvent.coordinate[0]
  this.coordinate_[1] = mapBrowserEvent.coordinate[1]
  this.drawTextLabel_('', geometry.getCoordinates())
}

/**
 * 初始化interaction工具
 * @private
 */
ol.interaction.FreeHandCircle.prototype.initDrawInteraction_ = function () {
  let style_ = new olStyleFactory(this.style_)
  if (!this.layer) {
    this.layer = new olLayerLayerUtils(this.getMap()).createVectorLayer(this.layerName, {
      create: true
    })
    this.layer.setStyle(style_)
  }
  this.draw = new ol.interaction.Draw({
    type: 'Circle',
    source: this.layer.getSource(),
    style: style_
  })
  this.draw.set('uuid', getuuid())
  this.getMap().addInteraction(this.draw)
  this.draw.on('drawstart', this.drawStartHandle_, this)
  this.draw.on('drawend', this.drawEndHandle_, this)
}

/**
 * 移除上一次交互工具
 * @private
 */
ol.interaction.FreeHandCircle.prototype.removeLastInteraction_ = function () {
  this.draw.un('drawstart', this.drawStartHandle_, this)
  this.draw.un('drawend', this.drawEndHandle_, this)
  this.getMap().removeInteraction(this.draw)
}

/**
 * drawStart
 * @param event
 * @private
 */
ol.interaction.FreeHandCircle.prototype.drawStartHandle_ = function (event) {
  this.drawStart_ = true
  let geom_ = event.feature.getGeometry()
  this.center_ = geom_.getCenter()
  this.addLabelFeature_(this.center_, 'center')
  geom_.on('change', evt => {
    let geom = evt.target
    let coordinates = geom.getLastCoordinate()
    this.radius = this.mathRadius(coordinates)
    this.drawTextLabel_(this.radius + ' m', coordinates)
  })
}

/**
 * drawEnd
 * @param event
 * @private
 */
ol.interaction.FreeHandCircle.prototype.drawEndHandle_ = function (event) {
  this.drawStart_ = false
  if (event && event.feature) {
    let labelCenter = event.feature.getGeometry().getLastCoordinate()
    this.addLabelFeature_(labelCenter, 'endLabel')
  }
  this.removeLastInteraction_()
}

/**
 * 添加中心点和label要素
 * @param coordinates
 * @param type
 * @private
 */
ol.interaction.FreeHandCircle.prototype.addLabelFeature_ = function (coordinates, type) {
  let feature = new ol.Feature({
    uuid: this.draw.get('uuid'),
    geometry: new ol.geom.Point(coordinates)
  })
  if (type === 'center') {
    if (this.centerStyle) {
      let _style = new olStyleFactory(this.centerStyle)
      feature.setStyle(_style)
    }
  } else {
    let _style = new olStyleFactory({
      image: {
        type: 'icon',
        image: {
          imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAATCAYAAAGCZu9cAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTAyQjQ0OTk5MUZGMTFFN0JCMzdENDYyNTY0RDI4MzAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTAyQjQ0OUE5MUZGMTFFN0JCMzdENDYyNTY0RDI4MzAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMDJCNDQ5NzkxRkYxMUU3QkIzN0Q0NjI1NjREMjgzMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMDJCNDQ5ODkxRkYxMUU3QkIzN0Q0NjI1NjREMjgzMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Poms414AAAUoSURBVHjaYmxqamJg+PTJn+H//0gGBoYVtT09G1iADMm86uoNDBAQDsSMTEDi+bPHj9/9//eP4dWzZx9AMgABxAjW/vHjCrA6fv4Ixo8fPvwHAgYYYObi4rpnZmoaCLSAYfKUKSIAAcQA0nJkz54nP3/8+I+OTx858hykG2SZiJ6JifS7N28YXEqvMCDTqlpaEiCjAQIIYjkDAwvQAd0gJ0OtfAl0SD5EgoFBubys7A4DJsjr7OoC+unjxyXfv38HGw2ikdmcv36dZ2Lg4Dj5/etXhlXlEgwgGoX948cMJgZ29obZEybs5+TmZuDg5ARjEHt2f/8+Bj6+mQABBHMkI8PPn8YO9vbrbZydZZADCB0wMjIynDx06NnuLVscgR65VVtbCw4ODoYvX+aU1tScNraykgG578ePHwwOhRfANAzD+CB5PVNTqdLm5psMHz70gQwGGSLG8O+fyvcvX+B+8ai8AbYVxgdhEACJw/jfgOqBwAoW5sxA2gdoalVmebnZD6BNhAA7BwfDjK6uMwwCApZA7/wBxctfIN4IFNg9feZMTSBbCYi5cej/BsQPgPgaUP0XmCBAAMECFhK437+LMvz6lQtkq2JoB4U2IyPIn1OBAfoGJgwKWBYomxOYEFaVtbR4srKxMTPgih1gzABBfWtp6XagS7xhwqCAZWP4/HlGZUeHDzD6mP/8/s3w588f7Bgk9/s3I1CtFzAM5yEbouYTHOz+6+dPuGJQUgRhXPxfv34xRKWmBiIbog7MHiK/gbaAMCx6NzcpM8DEQGxYFMPEpBUUBIBBwAszhPPHt29//gBNB+H1NbJgDTA+DIMASA7G//v7939gAH+FGfLm6L59T0DOhNkCyjiBLY/hfBAbJAbjg9SePnr0CVDvP5ghVy5dv77q65cvH/8Cix2Yv5cVi2Bl//37F4S/Hd6/vxAWJqAofsbAyrp26ZIlDDrq6mFmtrZS3Dw8nNhiGJiaf549fvzZuXPnmhl4eDYgGwJy0nmgQS+v3Lt3EIjFQKUbFjNA6l4D8VUGTk64V0AAIMCQUywk1YIM/vVLDJhlE4EZ09vAzExMUU2ND5hfmAUEBdkZiASfP3369e3r1z9PHz78curwYZDlG4CJdQYwMt4hqwOleJhvYA7gBAacBsPXrx2egYG6RhYWEv/+/WMgFwgKC3OBaA0dHRFnb28FRiYm02sXLhRsWLbsEtBBsUAHPUdWzwKNZBFgKHjKiImVx9bWav6FJmxswK38Gpje1alFkhwIqGpriwJznfPmVasOXzl/PgXomAPIDuEHYh1gVMT5hIUp/gQWa9hKaa+a23D2thZVcHZGByBxkDqYg0B8dPAXWJa4BwQoXgElNAYGW+QczAuuy/794+Hm5maD5Q1kjOyIjfUKDNjUwDBIHtnx6PKgkAaWWUx8AgJ8wHaAKHKIgMroXwwsLM8e3b//QUxKSgjdt2uqpMF0SNtTBv/GByhiyAAkj67nN5pZzMzMDO/fvv326ePHG8jFNMgh74H4HjA/7li9aBF/YESErpS8vAiwvYARRStKxeBsbFGDTx5U8QKLf4aP799/XDpr1hlg1Z8Hqj2QHQKqia6DQ4WP79v69etNgBWPRUBUlJKMggLYQaASCJSD8NXw2OoVJiBmZmEBtibYGd69fv1h+Zw5d4BlzWJgSMwHqviCnmtg1SIohT0G6roAxPs2bNsmAWxmqAPDVhHoCn4g5iM5DzMyfmZgYnoLjPZLQDN3ACu6u0DRD9DkgAIAomQEZFjvy7gAAAAASUVORK5CYII='
        }
      }
    })
    feature.set('free-hand-circle-lable', true)
    feature.setStyle(_style)
  }
  this.layer.getSource().addFeature(feature)
}

/**
 * 半径变化的实时显示
 * @param text
 * @param coordinates
 * @private
 */
ol.interaction.FreeHandCircle.prototype.drawTextLabel_ = function (text, coordinates) {
  if (!this.textOverlay) {
    let editor = document.createElement('span')
    editor.className = 'free-hand-circle-label'
    editor.innerHTML = text
    this.textOverlay = new ol.Overlay({
      element: editor,
      position: coordinates,
      positioning: 'center-left',
      offset: [20, 0]
    })
    this.getMap().addOverlay(this.textOverlay)
  } else {
    let element = this.textOverlay.getElement()
    element.innerHTML = text
    this.textOverlay.setPosition(coordinates)
    this.getMap().render()
  }
}

/**
 * 获取更新后的icon
 * @param text
 * @returns {string}
 * @private
 */
ol.interaction.FreeHandCircle.prototype.getImageSrc_ = function (text) {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  ctx.font = '30px Arial'
  ctx.textAlign = 'center'
  let width = ctx.measureText(text).width
  let height = 20
  canvas.width = width + 8
  canvas.height = height + 4
  ctx.fillText(text, 2, 10)
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)
  let image = canvas.toDataURL('image/.png', 1)
  return image
}

/**
 * 转换半径
 * @param center
 * @param meterRadius
 * @returns {number}
 */
ol.interaction.FreeHandCircle.prototype.transformRadius = function (center, meterRadius) {
  try {
    let lastCoords = this.wgs84Sphere.offset(center, meterRadius, (270 / 360) * 2 * Math.PI) // 计算偏移量
    let [ptx, pty] = [(center[0] - lastCoords[0]), (center[1] - lastCoords[1])]
    let transformRadiu = (Math.sqrt(Math.pow(ptx, 2) + Math.pow(pty, 2)))
    return transformRadiu
  } catch (e) {
    console.log(e)
  }
}

/**
 * 计算圆的半径
 * @param coords
 */
ol.interaction.FreeHandCircle.prototype.mathRadius = function (coords) {
  if (this.center_ && coords) {
    let c1 = ol.proj.transform(this.center_, this._getProjectionCode(), 'EPSG:4326')
    let c2 = ol.proj.transform(coords, this._getProjectionCode(), 'EPSG:4326')
    let radius = this.wgs84Sphere.haversineDistance(c1, c2)
    if (radius > this.options['maxRadius']) {
      this.radius = this.options['maxRadius'] - 1
    } else if (radius < this.options['minRadius']) {
      this.radius = this.options['minRadius'] - 1
    } else {
      this.radius = radius
    }
    this.radius = Math.floor(this.radius) + 1
  }
  return this.radius
}

/**
 * 获取当前视图投影
 * @returns {string}
 * @private
 */
ol.interaction.FreeHandCircle.prototype._getProjectionCode = function () {
  let code = ''
  if (this.getMap()) {
    code = this.getMap().getView().getProjection().getCode()
  } else {
    code = 'EPSG:3857'
  }
  return code
}

/**
 * 设置激活状态
 * @param active
 */
ol.interaction.FreeHandCircle.prototype.setActive = function (active) {
  ol.interaction.Pointer.prototype.setActive.call(this, active)
}

/**
 * 设置地图对象
 * @param map
 */
ol.interaction.FreeHandCircle.prototype.setMap = function (map) {
  ol.interaction.Pointer.prototype.setMap.call(this, map)
  if (map && map instanceof ol.Map) {
    this.initDrawInteraction_()
  }
}

/**
 * 销毁
 */
ol.interaction.FreeHandCircle.prototype.destroy = function () {
  console.log('destroy')
}

ol.interaction.FreeHandCircle.prototype.createCircle = function (params) {
  console.log(params)
}
