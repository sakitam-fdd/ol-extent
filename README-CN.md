# ol-extent

> openlayers扩展插件, 当前版本已经经过重构，变化较大，你需要查看相关示例或者文档。

[![Build Status](https://travis-ci.org/sakitam-fdd/ol-extent.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/ol-extent)
[![codecov](https://codecov.io/gh/sakitam-fdd/ol-extent/branch/master/graph/badge.svg)](https://codecov.io/gh/sakitam-fdd/ol-extent)
![JS gzip size](http://img.badgesize.io/https://unpkg.com/ol-extent/dist/ol-extent.js?compression=gzip&label=gzip%20size:%20JS)
[![Npm package](https://img.shields.io/npm/v/ol-extent.svg)](https://www.npmjs.org/package/ol-extent)
[![GitHub stars](https://img.shields.io/github/stars/sakitam-fdd/ol-extent.svg)](https://github.com/sakitam-fdd/ol-extent/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/sakitam-fdd/ol-extent/master/LICENSE)

## build

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上最新的源码，你需要自己构建。

---

```bash
git clone https://github.com/sakitam-fdd/ol-extent.git
npm install // or yarn
npm run dev
npm run build
```

## Install

### CDN

现在你可以使用 
* [unpkg.com](https://unpkg.com/ol-extent/dist/ol-extent.js) / 
* [jsdelivr](https://cdn.jsdelivr.net/npm/ol-extent/dist/ol-extent.js) 
获取最新版本。

```bash
// jsdelivr (最好锁定版本号)
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

查看 `examples` 文件夹。

## extent

### Control

| 控件 | 简介 | 文档 |
| --- | --- | --- |
| ZoomMenu | 放大缩小控件 | [ZoomMenu]() |
| ContextMenu | 右键控件 | [ContextMenu]() |
| CompareLayer | 图层对比控件 | [CompareLayer]() |
| RotateControl | 旋转控件 | [RotateControl]() |
| Loading | 图层加载进度控件 | [Loading]() |
| ZoomSlider | 图层平移缩放控件 | [ZoomSlider]() |
| FullScreen | 全屏控件 | [FullScreen]() |
| LayerSwitcher | 图层切换控件 | [LayerSwitcher]() |
| ScaleLine | 比例尺控件 | [ScaleLine]() |
| MousePosition | 鼠标位置显示控件 | [MousePosition]() |
| OverviewMap | 鹰眼控件 | [OverviewMap]() |

### Interaction

| 控件 | 简介 | 文档 |
| --- | --- | --- |
| MeasureTool | 测量工具 | [MeasureTool]() |
| FreeHandCircle | 自由圆（主要用于周边搜索） | [FreeHandCircle]() |
| LayerMagnify | 地图放大镜功能 | [LayerMagnify]() |
| layerSpyglass | 图层滤镜功能 | [layerSpyglass]() |

### Layer

| 控件 | 简介 | 文档 |
| --- | --- | --- |
| CanvasLayer | 基于 `Image` layer 扩展出的 `canvas` 图层，可以用于扩展其他自定义渲染图层 | [CanvasLayer]() |
| DozensLayer | 用于渲染大量数据的 `canvas` 图层 | [DozensLayer]() |

### Source

| 控件 | 简介 | 文档 |
| --- | --- | --- |
| Baidu | 百度数据源 | [Baidu]() |
| Gaode | 高德数据源 | [Gaode]() |
| Google | 谷歌数据源 | [Google]() |

### Overlay

| 控件 | 简介 | 文档 |
| --- | --- | --- |
| Popover | 气泡（支持标记和最小化） | [Popover]() |

### Tools

| 工具 | 简介 | 文档 |
| --- | --- | --- |
| StyleFactory | 样式处理工具（可解析 json 存储样式信息） | [StyleFactory]() |
| layerUtils | 图层处理工具（相关图层操作工具） | [layerUtils]() |
| utils | 相关  `dom` 事件等工具 | [utils]() |

## Resources

* [openlayers](https://github.com/openlayers/openlayers)

# changelog

[detail](./CHANGELOG.md)
