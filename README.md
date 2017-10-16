# ol-extent
a JavaScript library for openlayers extent

## build

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上最新的源码，你需要自己构建。

---

```bash
git clone https://github.com/sakitam-fdd/ol-extent.git
npm run dev
npm run build
```

### CDN

```bash
https://unpkg.com/ol-extent@1.1.3/dist/olExtent.min.js
https://unpkg.com/ol-extent@1.1.3/dist/olExtent.js
https://unpkg.com/ol-extent@1.1.3/dist/css/olExtent.css
https://unpkg.com/ol-extent@1.1.3/dist/css/olExtent.min.css
```

### 单控件使用

> 按功能模块名称引用

```bash
https://unpkg.com/ol-extent@1.1.3/dist/[功能模块名称].min.js
https://unpkg.com/ol-extent@1.1.3/dist/[功能模块名称].js
https://unpkg.com/ol-extent@1.1.3/dist/css/[功能模块名称].css
https://unpkg.com/ol-extent@1.1.3/dist/css/[功能模块名称].min.css
```

### 模块列表

#### 控件

| 控件 | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| ZoomMenu | 放大缩小控件 | `olControlZoomMenu` | `olControlZoomMenu` or `ol.control.ZoomMenu` |
| ContextMenu | 右键控件 | `olControlContextMenu` | `olControlContextMenu` or `ol.control.ContextMenu` |
| CompareLayer | 图层对比控件 | `olControlCompareLayer` | `olControlCompareLayer` or `ol.control.CompareLayer` |
| RotateControl | 旋转控件 | `olControlRotate` | `olControlRotate` or `ol.control.RotateControl` |
| Loading | 图层加载进度控件 | `olControlLoading` | `olControlLoading` or `ol.control.Loading` |
| BZoomSlider | 图层平移缩放控件 | `olControlBZoomSlider` | `olControlBZoomSlider` or `ol.control.BZoomSlider` |
| FullScreenMenu | 全屏控件 | `olControlFullScreenMenu` | `olControlFullScreenMenu` or `ol.control.FullScreenMenu` |
| LayerSwitcher | 图层切换控件 | `olControlLayerSwitcher` | `olControlLayerSwitcher` or `ol.control.LayerSwitcher` |
| ScaleLineH | 比例尺控件 | `olControlScaleLine` | `olControlScaleLine` or `ol.control.ScaleLineH` |
| MousePositionH | 鼠标位置显示控件 | `olControlMousePosition` | `olControlMousePosition` or `ol.control.MousePositionH` |
| Geolocation | 定位控件 | `olControlOverviewMap` | `olControlOverviewMap` or `ol.control.Geolocation` (暂时屏蔽) |
| OverviewMapH | 鹰眼控件 | `olControlOverviewMap` | `olControlOverviewMap` or `ol.control.OverviewMapH` |

#### 交互

| 交互 | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| MeasureTool | 测量 | `olInteractionMeasureTool` | `olInteractionMeasureTool` or `ol.interaction.MeasureTool` |
| FreeHandCircle | 可变圆（主要用于周边搜索） | `olInteractionFreeHandCircle` | `olInteractionFreeHandCircle` or `ol.interaction.FreeHandCircle` |
| LayerSpyglass | 图层滤镜 | `olInteractionLayerSpyglass` | `olInteractionLayerSpyglass` or `ol.interaction.LayerSpyglass` |
| LayerMagnify | 放大镜 | `olInteractionLayerMagnify` | `olInteractionLayerMagnify` or `ol.interaction.LayerMagnify` |

#### 图层

| 图层 | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| LayerUtils | 图层工具 | `olLayerLayerUtils` | `olLayerLayerUtils` or `ol.layer.LayerUtils` |
| Vector | 矢量图层扩展3D渲染 | `olLayerVector` | `olLayerVector` or `ol.layer.Vector` |

#### overlay

| overlay | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| Popover | 气泡 | `olPopover` | `olPopover` or `ol.Popover` |

#### render

| render | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| render3D | 矢量要素3D渲染器 | `olRender3D` | `olRender3D` or `ol.render.render3D` |

#### source

| source | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| BAIDU | 百度数据源图层 | `olSourceBaidu` | `olSourceBaidu` or `ol.source.BAIDU` |
| GAODE | 高德数据源图层 | `olSourceGaode` | `olSourceGaode` or `ol.source.GAODE` |
| GOOGLE | 谷歌数据源图层 | `olSourceGoogle` | `olSourceGoogle` or `ol.source.GOOGLE` |

#### style

| style | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| Factory | 兼容json格式传入的样式信息（便于矢量渲染的样式保存和修改） | `olStyleFactory` | `olStyleFactory` or `ol.style.Factory` |

#### tools

| tools | 简介 | 模块名 | 命名空间 |
| --- | --- | --- | --- |
| Geofence | 电子围栏（功能待完善） | `olToolsGeofence` | `olToolsGeofence` or `ol.tools.Geofence` |
| PrintfMap | 地图打印 | `olToolsPrintfMap` | `olToolsPrintfMap` or `ol.tools.PrintfMap` |

### NPM

```bash
npm install ol-extent --save
import olExtent 'ol-extent'
```

## Examples

其他示例请参看examples文件夹

# 更新日志

[详细](./CHANGELOG.md)
