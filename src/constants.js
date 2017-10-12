/**
 * Created by FDD on 2017/8/29.
 * @desc 相关静态常量
 */

const BASE_CLASS_NAME = {
  CLASS_HIDDEN: 'ol-hidden',
  CLASS_SELECTABLE: 'ol-selectable',
  CLASS_UNSELECTABLE: 'ol-unselectable',
  CLASS_CONTROL: 'ol-control'
}

let UNITS = {
  DEGREES: 'degrees',
  FEET: 'ft',
  METERS: 'm',
  PIXELS: 'pixels',
  TILE_PIXELS: 'tile-pixels',
  USFEET: 'us-ft',
  METERS_PER_UNIT: {}
}

UNITS.METERS_PER_UNIT[UNITS.DEGREES] = 2 * Math.PI * 6370997 / 360
UNITS.METERS_PER_UNIT[UNITS.FEET] = 0.3048
UNITS.METERS_PER_UNIT[UNITS.METERS] = 1
UNITS.METERS_PER_UNIT[UNITS.USFEET] = 1200 / 3937

export {
  BASE_CLASS_NAME,
  UNITS
}
