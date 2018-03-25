/**
 * Created by FDD on 2017/9/8.
 * @desc 实现地理围栏功能
 */
import ol from 'openlayers'
import {uuid} from '../utils'

class Geofence extends ol.Object {
  static _add (source, item) {
    if (Array.isArray(source)) {
      if (source.indexOf(item) > -1) {
        throw new Error('禁止添加相同id的数据')
      } else {
        source.push(item);
        return false;
      }
    } else {
      throw new Error('不是数组！')
    }
  }
  constructor (options = {}) {
    super();
    this.geofences_ = [];
    this.geofencesIds_ = [];
  }

  /**
   * 添加电子围栏
   * @param geom
   * @param options
   */
  addGeofence (geom, options) {
    if (geom && (geom instanceof ol.geom.Polygon || geom instanceof ol.geom.Circle)) {
      if (geom.get('id')) {
        Geofence._add(this.geofencesIds_, geom.get('id'));
        this.geofences_.push(geom)
      } else {
        geom.set('id', uuid());
        Geofence._add(this.geofencesIds_, geom.get('id'));
        this.geofences_.push(geom)
      }
    } else {
      throw new Error('传入的不是面数据!')
    }
  }

  getAllGeofences () {
  }

  getGeofence () {
  }

  queryGeofence () {
  }

  clear () {
  }

  creatWatcherInternel () {
  }

  /**
   * 添加所有的被观察者
   * @param features
   */
  addVisitors (features) {

  }

  /**
   * 更新观察者
   * @param visitor
   */
  updateVisitor (visitor) {
    if (this.geofences_.length > 0 && visitor instanceof ol.Feature) {
      if (visitor.get('isEnter') === undefined) visitor.set('isEnter', false);
      for (let i = 0; i < this.geofences_.length; i++) {
        const fence = this.geofences_[i];
        const isEnter = visitor.get('isEnter');
        const coordinates = visitor.getGeometry().getCoordinates();
        const _isIntersects = fence.intersectsCoordinate(coordinates);
        if (isEnter && _isIntersects) { // 任然停留在范围内
          this.actionDwell(visitor, fence);
        } else if (!isEnter && _isIntersects) { // 从外部进入范围内
          this.actionEnter(visitor, fence);
        } else if (isEnter && !_isIntersects) { // 离开范围
          this.actionLeave(visitor, fence);
        }
      }
    }
  }

  /**
   * 响应进入围栏事件
   * @param visitor
   * @param fence
   */
  actionEnter (visitor, fence) {
    visitor.set('isEnter', true);
    this.dispatchEvent({
      type: 'enter',
      target: this,
      visitor: visitor,
      geoFences: fence
    });
  }

  /**
   * 响应离开围栏事件
   * @param visitor
   * @param fence
   */
  actionLeave (visitor, fence) {
    visitor.set('isEnter', false);
    this.dispatchEvent({
      type: 'leave',
      target: this,
      visitorId: visitor,
      geoFences: fence
    });
  }

  /**
   * 响应停留事件
   * @param visitor
   * @param fence
   */
  actionDwell (visitor, fence) {
    this.dispatchEvent({
      type: 'dwell',
      target: this,
      visitor: visitor,
      geoFences: fence
    });
  }

  removeVisitor () {
  }

  clearVisitors () {
  }
}

export default Geofence
