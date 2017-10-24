/**
 * Created by FDD on 2017/10/24.
 * @desc openlayers es2015 模块映射
 */

const View = [
  {
    nameSpace: 'ol.View',
    regex: /^(ol\/view|openlayers\/view)$/,
    path: 'ol/view'
  },
  {
    nameSpace: 'ol.ViewHint',
    regex: /^(ol\/viewhint|openlayers\/viewhint)$/,
    path: 'ol/viewhint'
  },
  {
    nameSpace: 'ol.ViewProperty',
    regex: /^(ol\/viewproperty|openlayers\/viewproperty)$/,
    path: 'ol/viewproperty'
  }
]
const Layer = [
  {
    nameSpace: 'ol.layer.Layer',
    regex: /^(ol\/layer\/layer|openlayers\/layer\/layer)$/,
    path: 'ol/layer/layer'
  },
  {
    nameSpace: 'ol.layer.Base',
    regex: /^(ol\/layer\/base|openlayers\/layer\/base)$/,
    path: 'ol/layer/base'
  },
  {
    nameSpace: 'ol.layer.Group',
    regex: /^(ol\/layer\/group|openlayers\/layer\/group)$/,
    path: 'ol/layer/group'
  },
  {
    nameSpace: 'ol.layer.Heatmap',
    regex: /^(ol\/layer\/heatmap|openlayers\/layer\/heatmap)$/,
    path: 'ol/layer/heatmap'
  },
  {
    nameSpace: 'ol.layer.Image',
    regex: /^(ol\/layer\/image|openlayers\/layer\/image)$/,
    path: 'ol/layer/image'
  },
  {
    nameSpace: 'ol.layer.Tile',
    regex: /^(ol\/layer\/tile|openlayers\/layer\/tile)$/,
    path: 'ol/layer/tile'
  },
  {
    nameSpace: 'ol.layer.TileProperty',
    regex: /^(ol\/layer\/tileproperty|openlayers\/layer\/tileproperty)$/,
    path: 'ol/layer/tileproperty'
  },
  {
    nameSpace: 'ol.layer.Property',
    regex: /^(ol\/layer\/property|openlayers\/layer\/property)$/,
    path: 'ol/layer/property'
  },
  {
    nameSpace: 'ol.layer.Vector',
    regex: /^(ol\/layer\/vector|openlayers\/layer\/vector)$/,
    path: 'ol/layer/vector'
  },
  {
    nameSpace: 'ol.layer.VectorTile',
    regex: /^(ol\/layer\/vectortile|openlayers\/layer\/vectortile)$/,
    path: 'ol/layer/vectortile'
  },
  {
    nameSpace: 'ol.layer.VectorTileRenderType',
    regex: /^(ol\/layer\/vectortilerendertype|openlayers\/layer\/vectortilerendertype)$/,
    path: 'ol/layer/vectortilerendertype'
  }
]
export default {
  modules: [
    {
      nameSpace: 'ol.Map',
      regex: /^(ol\/map|openlayers\/map)$/,
      path: 'ol/map'
    },
    ...View,
    ...Layer
  ],
  version: '4.4.2'
}
