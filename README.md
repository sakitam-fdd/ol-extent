# ol-extent

> a JavaScript library for openlayers extent, It is important to note that the current version has changed a lot
  You have to look at the examples or look at the relevant documents.

[![Build Status](https://travis-ci.org/sakitam-fdd/ol-extent.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/ol-extent)
[![codecov](https://codecov.io/gh/sakitam-fdd/ol-extent/branch/master/graph/badge.svg)](https://codecov.io/gh/sakitam-fdd/ol-extent)
![JS gzip size](http://img.badgesize.io/https://unpkg.com/ol-extent/dist/ol-extent.js?compression=gzip&label=gzip%20size:%20JS)
[![Npm package](https://img.shields.io/npm/v/ol-extent.svg)](https://www.npmjs.org/package/ol-extent)
[![GitHub stars](https://img.shields.io/github/stars/sakitam-fdd/ol-extent.svg)](https://github.com/sakitam-fdd/ol-extent/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/sakitam-fdd/ol-extent/master/LICENSE)

## build

> Important: The `/dist` folder of Github repositories will not be updated until the new version is released.
  If you want to use the latest source on Github, you need to build it yourself.

---

```bash
git clone https://github.com/sakitam-fdd/ol-extent.git
npm install // or yarn
npm run dev
npm run build
```

## Install

### CDN

current you can use 
* [unpkg.com](https://unpkg.com/ol-extent/dist/ol-extent.js) / 
* [jsdelivr](https://cdn.jsdelivr.net/npm/ol-extent/dist/ol-extent.js) get the latest version of the resource。

```bash
// jsdelivr (It is best to lock the version number for cache reasons)
https://cdn.jsdelivr.net/npm/ol-extent/dist/ol-extent.js
https://cdn.jsdelivr.net/npm/ol-extent/dist/ol-extent.css
https://cdn.jsdelivr.net/npm/ol-extent/dist/ol-extent.min.js
https://cdn.jsdelivr.net/npm/ol-extent/dist/ol-extent.min.css
// npm
https://unpkg.com/ol-extent/dist/ol-extent.js
https://unpkg.com/ol-extent/dist/ol-extent.css
https://unpkg.com/ol-extent/dist/ol-extent.min.js
https://unpkg.com/ol-extent/dist/ol-extent.min.css
```

### NPM

```bash
npm install ol-extent --save
import ole 'ol-extent'
```

## Examples

see examples folder

## extent

### Control

| control | introduction | doc |
| --- | --- | --- |
| ZoomMenu | zoom control | [ZoomMenu]() |
| ContextMenu | context menu control | [ContextMenu]() |
| CompareLayer | layer compare control | [CompareLayer]() |
| RotateControl | Rotate control | [RotateControl]() |
| Loading | loading control | [Loading]() |
| ZoomSlider | zoom and slider control | [ZoomSlider]() |
| FullScreen | fullscreen control | [FullScreen]() |
| LayerSwitcher | Layer switcher control | [LayerSwitcher]() |
| ScaleLine | ScaleLine control | [ScaleLine]() |
| MousePosition | Mouse position display control | [MousePosition]() |
| OverviewMap | OverviewMap control | [OverviewMap]() |

### Interaction

| Interaction | introduction | doc |
| --- | --- | --- |
| MeasureTool | measure tool | [MeasureTool]() |
| FreeHandCircle | Free circle (mainly for peripheral search) | [FreeHandCircle]() |
| LayerMagnify | Map magnifying mirror function | [LayerMagnify]() |
| layerSpyglass | Layer filter function | [layerSpyglass]() |

### Layer

| name | introduction | doc |
| --- | --- | --- |
| CanvasLayer | The extended `canvas` layer based on `Image` layer can be used to extend the other custom rendering layers | [CanvasLayer]() |
| DozensLayer | `canvas` layer used to render large amounts of data | [DozensLayer]() |

### Source

| name | introduction | doc |
| --- | --- | --- |
| Baidu | bmap source | [Baidu]() |
| Gaode | amap source | [Gaode]() |
| Google | goolge source | [Google]() |

### Overlay

| name | introduction | doc |
| --- | --- | --- |
| Popover | Popover (support mark and minimization) | [Popover]() |

### Tools

| tool | introduction | doc |
| --- | --- | --- |
| StyleFactory | Style processing tools (parse JSON storage style information) | [StyleFactory]() |
| layerUtils | Layer processing tool (related layer operation tool) | [layerUtils]() |
| utils | `dom event` and other tools | [utils]() |

## Resources

* [openlayers](https://github.com/openlayers/openlayers)

# changelog

[detail](./CHANGELOG.md)
