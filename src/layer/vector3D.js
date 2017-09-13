/**
 * Created by FDD on 2017/9/13.
 * @desc render 3D vector layer
 */
import '../render/render3D'
ol.layer.Vector.prototype.setRender3D = function (render) {
  render.setLayer(this)
}

let olLayerVector = ol.layer.Vector
export default olLayerVector
