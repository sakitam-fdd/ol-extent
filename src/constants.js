const BASE_CLASS_NAME = {
  CLASS_HIDDEN: 'ole-hidden',
  CLASS_SELECTABLE: 'ole-selectable',
  CLASS_UNSELECTABLE: 'ole-unselectable',
  CLASS_CONTROL: 'ole-control'
};

let UNITS = {
  DEGREES: 'degrees',
  FEET: 'ft',
  METERS: 'm',
  PIXELS: 'pixels',
  TILE_PIXELS: 'tile-pixels',
  USFEET: 'us-ft',
  METERS_PER_UNIT: {}
};

UNITS.METERS_PER_UNIT[UNITS.DEGREES] = 2 * Math.PI * 6370997 / 360;
UNITS.METERS_PER_UNIT[UNITS.FEET] = 0.3048;
UNITS.METERS_PER_UNIT[UNITS.METERS] = 1;
UNITS.METERS_PER_UNIT[UNITS.USFEET] = 1200 / 3937;

const OVERVIEWMAP = {
  MIN_RATIO: 0.1,
  MAX_RATIO: 0.75
};

export {
  BASE_CLASS_NAME,
  UNITS,
  OVERVIEWMAP
}
