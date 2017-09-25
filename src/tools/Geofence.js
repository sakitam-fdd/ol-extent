/**
 * Created by FDD on 2017/9/8.
 * @desc 实现地理围栏功能
 */
import ol from 'openlayers'
import Observable from 'observable-emit'
import mixin from '../utils/mixin'
import {has, getuuid} from '../utils/utils'
import 'core-js/es6/set'
if (!has(ol, 'tools')) {
  ol.tools = {}
}

ol.tools.Geofence = function () {
  this.geofences_ = []
  this.geofencesIds_ = new Set()
  Observable.call(this)
}

/**
 * 添加电子围栏
 * @param geom
 * @param options
 */
ol.tools.Geofence.prototype.addGeofence = function (geom, options) {
  if (geom && (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.Circle)) {
    let _length = JSON.stringify([...(this.geofencesIds_)].length)
    if (geom.get('id')) {
      this.geofencesIds_.add(geom.get('id'))
    } else {
      let uuid = getuuid()
      this.geofencesIds_.add(geom.get('id'))
      geom.set('id', uuid)
    }
    let length_ = [...(this.geofencesIds_)].length
    if (Number(JSON.parse(_length)) !== length_) {
      this.geofences_.push(geom)
    } else {
      throw new Error('禁止添加相同id的数据')
    }
  } else {
    throw new Error('传入的不是面数据!')
  }
}

ol.tools.Geofence.prototype.getAllGeofences = function () {
}

ol.tools.Geofence.prototype.getGeofence = function () {
}

ol.tools.Geofence.prototype.queryGeofence = function () {
}

ol.tools.Geofence.prototype.clear = function () {
}

/**
 * 添加所有的被观察者
 * @param features
 */
ol.tools.Geofence.prototype.addVisitors = function (features) {

}

/**
 * 更新观察者
 * @param visitor
 */
ol.tools.Geofence.prototype.updateVisitor = function (visitor) {
  if (this.geofences_.length > 0 && visitor instanceof ol.Feature) {
    this.geofences_.forEach(fence => {
      let coordinates = visitor.getGeometry().getCoordinates()
      if (fence && fence.intersectsCoordinate(coordinates)) {
        this.actionEnter(visitor, fence)
      }
    })
  }
}

/**
 * 响应进入围栏事件
 * @param visitor
 * @param fence
 */
ol.tools.Geofence.prototype.actionEnter = function (visitor, fence) {
  this.dispatch('enter', {
    visitor: visitor,
    geoFences: fence
  })
}

/**
 * 响应离开围栏事件
 * @param visitorId
 * @param fence
 */
ol.tools.Geofence.prototype.actionLeave = function (visitorId, fence) {
  this.dispatch('leave', {
    visitorId: visitorId,
    geoFencesId: fence.get('id')
  })
}

/**
 * 响应停留事件
 * @param visitorId
 * @param fence
 */
ol.tools.Geofence.prototype.actionDwell = function (visitorId, fence) {
  this.dispatch('dwell', {
    visitorId: visitorId,
    geoFencesId: fence.get('id')
  })
}

ol.tools.Geofence.prototype.removeVisitor = function () {
}

ol.tools.Geofence.prototype.clearVisitors = function () {
}
mixin(ol.tools.Geofence, Observable)

let olToolsGeofence = ol.tools.Geofence
export default olToolsGeofence
