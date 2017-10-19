/**
 * Created by FDD on 2017/10/19.
 * @desc 兼容的mapbox地图样式
 */
// import mapboxGlFunction from '@mapbox/mapbox-gl-style-spec/function'
// import mapbox2css from 'mapbox-to-css-font'
import applyStyleFunction from 'mapbox-to-ol-style'
ol.style.MapBoxStyle = function (style, layer) {
  this.baseUrl = ''
  this.accessToken = ''
  this.path = ''
  this.host = ''
  this.spriteData = null
  this.layerIds = []
  this.styleConfig = null
  this.loadStyleConfig_(style)
  return applyStyleFunction(layer, this.styleConfig,
    this.layerIds, undefined, this.spriteData, this.spriteImageUrl, undefined)
}

ol.style.MapBoxStyle.spriteRegEx = /^(.*)(\?.*)$/

/**
 * 处理链接
 * @param url
 * @param path
 * @returns {*}
 */
ol.style.MapBoxStyle.withPath = function (url, path) {
  if (path && url.indexOf('http') !== 0) {
    url = path + url
  }
  return url
}

/**
 * 转换雪碧图url
 * @param url
 * @param path
 * @param extension
 * @returns {string}
 */
ol.style.MapBoxStyle.toSpriteUrl = function (url, path, extension) {
  url = ol.style.MapBoxStyle.withPath(url, path)
  let parts = url.match(ol.style.MapBoxStyle.spriteRegEx)
  return parts ? parts[1] + extension + (parts.length > 2 ? parts[2] : '')
    : url + extension
}

/**
 * 获取ref
 * @param layers
 * @param ref
 * @returns {*}
 */
ol.style.MapBoxStyle.getSourceIdByRef = function (layers, ref) {
  let sourceId
  layers.some(layer => {
    if (layer.id === ref) {
      sourceId = layer.source
      return true
    }
  })
  return sourceId
}

/**
 * 根据服务地址加载样式数据（可以为本地）
 * @param style
 * @private
 */
ol.style.MapBoxStyle.prototype.loadStyleConfig_ = function (style) {
  if (typeof style === 'string') {
    const parts = style.match(ol.style.MapBoxStyle.spriteRegEx)
    if (parts) {
      this.baseUrl = parts[1]
      this.accessToken = parts.length > 2 ? parts[2] : ''
    }
    const xhr = new XMLHttpRequest()
    xhr.open('GET', style)
    const a = document.createElement('A')
    a.href = style
    this.path = a.pathname.split('/').slice(0, -1).join('/') + '/'
    this.host = style.substr(0, style.indexOf(this.path))
    xhr.addEventListener('load', () => {
      let glStyle = JSON.parse(xhr.responseText)
      this.processStyle(glStyle)
    })
    xhr.addEventListener('error', () => {
      throw new Error('Could not load ' + style)
    })
    xhr.send()
  } else {
    this.processStyle(style)
  }
}

/**
 * 加载Sprite数据
 * @param sprite
 */
ol.style.MapBoxStyle.prototype.loadSpriteData = function (style) {
  let spriteScale = window.devicePixelRatio >= 1.5 ? 0.5 : 1
  const xhr = new window.XMLHttpRequest()
  let sizeFactor = spriteScale === 0.5 ? '@2x' : ''
  let spriteUrl = ol.style.MapBoxStyle.toSpriteUrl(style.sprite, this.path, sizeFactor + '.json')
  xhr.open('GET', spriteUrl)
  xhr.onload = xhr.onerror = function () {
    if (xhr.responseText) {
      this.spriteData = JSON.parse(xhr.responseText)
    } else {
      throw new Error('Could not load spriteData：' + style.sprite)
    }
  }
  xhr.send()
  this.spriteImageUrl = ol.style.MapBoxStyle.toSpriteUrl(style.sprite, this.path, sizeFactor + '.png')
  let spriteImage = document.createElement('img')
  spriteImage.onload = () => {
  }
  spriteImage.src = this.spriteImageUrl
}

/**
 * 处理样式数据
 * @param style
 */
ol.style.MapBoxStyle.prototype.processStyle = function (style) {
  if (!style.layers) {
    throw new Error('数据不完整：' + style)
  }
  this.styleConfig = style
  const layers = style.layers
  for (let i = 0, ii = layers.length; i < ii; ++i) {
    let layer = layers[i]
    if (layer.type === 'background') {
      // setBackground(map, glLayer)
    } else {
      let id = layer.source || ol.style.MapBoxStyle.getSourceIdByRef(layers, layer.ref)
      this.layerIds.push(layer.sources[id])
    }
  }
  this.loadSpriteData(style)
}
