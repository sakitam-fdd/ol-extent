/**
 * Created by FDD on 2017/9/13.
 * @desc render 3D vector layer
 * @base https://github.com/Viglino/ol3-ext
 */
import ol from 'openlayers'
ol.layer.Vector.prototype.setRender3D = function (render) {
  render.setLayer(this)
}

/**
 * render
 * @param params
 */
ol.render.render3D = function (params = {}) {
  let options = params

  /**
   * 最大分辨率
   * @type {*}
   * @private
   */
  this.maxResolution_ = options['maxResolution'] || 100

  /**
   * 默认高度
   * @type {*}
   * @private
   */
  this.defaultHeight_ = options['defaultHeight'] || 0

  /**
   * 建筑物高度
   * @type {Function}
   * @private
   */
  this.height_ = this.getHeight_(options['height'])

  /**
   * 默认样式
   * @type {{stroke: {strokeWidth: number, strokeColor: string}, fill: {fillColor: string}}}
   */
  this.baseStyle = {
    stroke: {
      strokeWidth: 1,
      strokeColor: 'rgba(196,189,181,1)'
    },
    fill: {
      fillColor: 'rgba(248,238,228,1)'
    },
    text: {
      stroke: {
        strokeWidth: 1,
        strokeColor: 'rgba(87,87,87,1)'
      },
      fill: {
        fillColor: 'rgba(255,255,255,0.5)'
      },
      textAlign: 'center',
      textBaseline: 'bottom',
      textScale: 1
    }
  }
  if (options['style']) {
    this.eachObject(this.baseStyle, options['style'])
  }
}

/**
 * 赋值参数中的值
 * @param base
 * @param params
 */
ol.render.render3D.prototype.eachObject = function (base = {}, params = {}) {
  for (let key in base) {
    if (key && base[key] && params[key]) {
      if (typeof base[key] === 'object') {
        this.eachObject(base[key], params[key])
      } else {
        base[key] = params[key]
      }
    }
  }
}

/**
 * 重新计算3D图形
 * @param event
 * @private
 */
ol.render.render3D.prototype.postcompose_ = function (event) {
  let res = event.frameState.viewState.resolution
  if (res <= this.maxResolution_) {
    this.res_ = res * 400
    if (this.animate_) {
      let elapsed = event.frameState.time - this.animate_
      if (elapsed < this.animateDuration_) {
        this.elapsedRatio_ = this.easing_(elapsed / this.animateDuration_)
        event.frameState.animate = true
      } else {
        this.animate_ = false
        this.height_ = this.toHeight_
      }
    }
    let ratio = event.frameState.pixelRatio
    let ctx = event.context
    let matrix = this.matrix_ = event.frameState.coordinateToPixelTransform
    if (!matrix) {
      matrix = event.frameState.coordinateToPixelMatrix
      matrix[2] = matrix[4]
      matrix[3] = matrix[5]
      matrix[4] = matrix[12]
      matrix[5] = matrix[13]
    }
    this.center_ = [ctx.canvas.width / 2 / ratio, ctx.canvas.height / ratio]
    let features_ = this.layer_.getSource().getFeaturesInExtent(event.frameState.extent)
    ctx.save()
    ctx.scale(ratio, ratio)
    ctx.lineWidth = this.baseStyle.stroke.strokeWidth
    ctx.strokeStyle = this.baseStyle.stroke.strokeColor
    ctx.fillStyle = this.baseStyle.fill.fillColor
    let builds = []
    features_.forEach(feature => {
      builds.push(this.getFeature3D_(feature, this.getFeatureHeight(feature)))
    })
    this.drawFeature3D_(ctx, builds)
    ctx.restore()
  } else {
    // console.warn('超出所设置最大分辨率！')
  }
}

/**
 * 设置需要渲染的图层
 * @param layer
 */
ol.render.render3D.prototype.setLayer = function (layer) {
  if (layer) {
    if (this.layer_) {
      this.layer_.un('postcompose', this.postcompose_, this)
    }
    this.layer_ = layer
    this.layer_.on('postcompose', this.postcompose_, this)
  }
}

/**
 * 获取高度（可以为函数）
 * @param height
 * @returns {*}
 * @private
 */
ol.render.render3D.prototype.getHeight_ = function (height) {
  let that = this
  let rHeight = function () {
    return 10
  }
  switch (typeof height) {
    case 'function':
      rHeight = height
      break
    case 'string':
      rHeight = function (feature) {
        return (Number(feature.get(height)) || that.defaultHeight_)
      }
      break
    case 'number':
      rHeight = function (feature) {
        return height
      }
      break
  }
  return rHeight
}

/**
 * 设置动画
 * @param options
 */
ol.render.render3D.prototype.animate = function (options = {}) {
  this.toHeight_ = this.getHeight_(options.height)
  this.animate_ = new Date().getTime()
  this.animateDuration_ = options.duration || 1000
  this.easing_ = options.easing || ol.easing.easeOut
  this.layer_.changed()
}

/**
 * 检查动画是否处于开启状态
 * @returns {boolean}
 */
ol.render.render3D.prototype.animating = function () {
  if (this.animate_ && new Date().getTime() - this.animate_ > this.animateDuration_) {
    this.animate_ = false
  }
  return !!this.animate_
}

/**
 * 获取要素高度
 * @param feature
 * @returns {*}
 */
ol.render.render3D.prototype.getFeatureHeight = function (feature) {
  if (this.animate_) {
    let h1 = this.height_(feature)
    let h2 = this.toHeight_(feature)
    return (h1 * (1 - this.elapsedRatio_) + this.elapsedRatio_ * h2)
  } else {
    return this.height_(feature)
  }
}

/**
 * 处理矢量图层
 * @param point
 * @param height
 * @returns {[*,*]}
 * @private
 */
ol.render.render3D.prototype.handleVector_ = function (point, height) {
  let point0 = [
    point[0] * this.matrix_[0] + point[1] * this.matrix_[1] + this.matrix_[4],
    point[0] * this.matrix_[2] + point[1] * this.matrix_[3] + this.matrix_[5]
  ]
  let point1 = [
    point0[0] + height / this.res_ * (point0[0] - this.center_[0]),
    point0[1] + height / this.res_ * (point0[1] - this.center_[1])
  ]
  return [point0, point1]
}

/**
 * 获取3D要素
 * @param feature
 * @param height
 * @returns {{type: string, feature: *, geom: string}}
 * @private
 */
ol.render.render3D.prototype.getFeature3D_ = function (feature, height) {
  let coordinates = feature.getGeometry().getCoordinates()
  let json = {
    type: '',
    feature: feature,
    geom: ''
  }
  switch (feature.getGeometry().getType()) {
    case 'Polygon':
      coordinates = [coordinates]
      json.type = 'MultiPolygon'
      json.geom = this.getBuilds_(coordinates, height)
      break
    case 'MultiPolygon':
      json.type = 'MultiPolygon'
      json.geom = this.getBuilds_(coordinates, height)
      break
    case 'Point':
      json.type = 'Point'
      json.geom = this.handleVector_(coordinates, height)
      break
    default:
      json = {}
      break
  }
  return json
}

/**
 * 获取builds
 * @param coordinates
 * @param height
 * @returns {Array}
 * @private
 */
ol.render.render3D.prototype.getBuilds_ = function (coordinates, height) {
  let build = []
  coordinates.forEach(coords => {
    if (coords && Array.isArray(coords) && coords.length > 0) {
      coords.forEach(coord => {
        if (coord && Array.isArray(coord) && coord.length > 0) {
          let bear = []
          coord.forEach(cod => {
            bear.push(this.handleVector_(cod, height))
          })
          build.push(bear)
        }
      })
    }
  })
  return build
}

/**
 * 构建3D要素
 * @param ctx
 * @param buildings
 * @private
 */
ol.render.render3D.prototype.drawFeature3D_ = function (ctx, buildings) {
  for (let i = 0; i < buildings.length; i++) {
    switch (buildings[i].type) {
      case 'MultiPolygon':
        for (let j = 0; j < buildings[i].geom.length; j++) {
          let b = buildings[i].geom[j]
          for (let k = 0; k < b.length; k++) {
            let geom_ = b[k]
            ctx.beginPath()
            ctx.moveTo(geom_[0][0], geom_[0][1])
            ctx.lineTo(geom_[1][0], geom_[1][1])
            ctx.stroke()
          }
        }
        break
      case 'Point':
        let geom_ = buildings[i].geom
        ctx.beginPath()
        ctx.moveTo(geom_[0][0], geom_[0][1])
        ctx.lineTo(geom_[1][0], geom_[1][1])
        ctx.stroke()
        break
    }
  }
  for (let i = 0; i < buildings.length; i++) {
    switch (buildings[i].type) {
      case 'MultiPolygon': {
        ctx.beginPath()
        for (let j = 0; j < buildings[i].geom.length; j++) {
          let geom_ = buildings[i].geom[j]
          if (j === 0) {
            ctx.moveTo(geom_[0][1][0], geom_[0][1][1])
            for (let k = 1; k < geom_.length; k++) {
              ctx.lineTo(geom_[k][1][0], geom_[k][1][1])
            }
          } else {
            ctx.moveTo(geom_[0][1][0], geom_[0][1][0])
            for (let k = geom_.length - 2; k >= 0; k--) {
              ctx.lineTo(geom_[k][1][0], geom_[k][1][1])
            }
          }
          ctx.closePath()
        }
        ctx.fill('evenodd')
        ctx.stroke()
        break
      }
      case 'Point': {
        let build = buildings[i]
        let [label, point, fill] = [build.feature.get('label'), build.geom[1], ctx.fillStyle]
        ctx.fillStyle = this.baseStyle.text.stroke.strokeColor
        ctx.textAlign = this.baseStyle.text.textAlign
        ctx.textBaseline = this.baseStyle.text.textBaseline
        ctx.fillText(label, point[0], point[1])
        let m = ctx.measureText(label)
        let h = Number(ctx.font.match(/\d+(\.\d+)?/g).join([]))
        ctx.fillStyle = this.baseStyle.text.fill.fillColor
        ctx.fillRect(point[0] - m.width / 2 - 5, point[1] - h - 5, m.width + 10, h + 10)
        ctx.strokeRect(point[0] - m.width / 2 - 5, point[1] - h - 5, m.width + 10, h + 10)
        ctx.fillStyle = fill
      }
    }
  }
}

let olRender3D = ol.render.render3D
export default olRender3D
