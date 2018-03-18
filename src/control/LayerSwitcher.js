/**
 * Created by FDD on 2017/9/6.
 * @ 图层切换功能控件
 */
import '../assets/scss/layerSwitcher.scss'
import ol from 'openlayers';
import {BASE_CLASS_NAME} from '../constants';
import {create, on, setStyle, getElement, addClass, removeClass} from '../utils';
import { getLayersArrayByKeyValue } from '../layer/layerUtils'

class LayerSwitcher extends ol.control.Control {
  constructor (options = {}) {
    /**
     * className
     * @type {string}
     */
    const className_ = (options.className !== undefined ? options.className : 'ole-layer-switcher');
    /**
     * @private
     * @type {Element}
     */
    const element_ = create('div', (className_ + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));
    super({
      element: element_,
      target: options['target']
    });

    this.options = options;

    /**
     * className
     * @type {string}
     * @private
     */
    this.className_ = className_;

    on(element_, 'mouseover', this.contentMouseOver_, this);
    on(element_, 'mouseout', this.contentMouseOut_, this);

    /**
     * width
     * @type {number}
     */
    this.options['itemWidth'] = (this.options['itemWidth'] === 'number' ? this.options['itemWidth'] : 86);

    /**
     * 底图集合
     * @type {Array}
     * @private
     */
    this.baseLayers_ = [];

    /**
     * 标注图层
     * @type {Array}
     * @private
     */
    this.labelLayers_ = [];

    /**
     * 用于标识底图的关键字
     * @type {string}
     */
    this.baseLayerKey = this.options['baseLayerKey'] ? this.options['baseLayerKey'] : 'isBaseLayer';

    /**
     * 用于标识当前底图的关键字
     * @type {string}
     */
    this.isDefaultKey = this.options['isDefaultKey'] ? this.options['isDefaultKey'] : 'isDefault';

    /**
     * 关联图层关键字
     * @type {string}
     */
    this.labelAliasKey = this.options['labelAlias'] ? this.options['labelAlias'] : 'layerName';

    /**
     * 标准labelLayer关键字
     * @type {string}
     */
    this.labelLayerKey = this.options['labelLayerKey'] ? this.options['labelLayerKey'] : 'isLabelLayer';

    /**
     * 是否已经默认执行选中操作
     * @type {boolean}
     * @private
     */
    this.isActionSelected_ = false;

    /**
     * 是否每次操作之前强制更新图层，这在底图可能发生变化时比较有用。
     */
    this.forcedUpdate = this.options['forcedUpdate'];

    /**
     * height
     * @type {number}
     */
    this.options['itemHeight'] = (typeof this.options['itemHeight'] === 'number' ? this.options['itemHeight'] : 60);

    /**
     * 图层关键字
     * @type {string}
     */
    this.options['key'] = (this.options['key'] ? this.options['key'] : 'layerName');
    if (this.labelLayerKey === this.baseLayerKey) {
      throw new Error('标注图层关键字不能和底图相同！')
    }

    /**
     * @private
     * @type {Element}
     */
    this.innerElement_ = create('ul', className_ + '-ul-inner', element_, className_ + '-ul-inner');

    if (this.options['layers'] && Array.isArray(this.options['layers']) && this.options['layers'].length > 0) {
      this.initDomInternal(this.options['layers'], className_, this.options['key']);
    } else {
      this.element.style.display = 'none';
    }
  }

  /**
   * 初始化dom
   * @param layers
   * @param className
   * @param key
   */
  initDomInternal (layers, className, key) {
    let width = this.options['itemWidth'];
    let height = this.options['itemHeight'];
    let length = layers.length;
    this.innerElement_.style.width = width + (length - 1) * 10 + 'px';
    this.innerElement_.style.height = height + 'px';
    layers.forEach((item, index) => {
      if (item && item[key]) {
        let li_ = create('li', className + '-li-inner', this.innerElement_, className + '-li' + index + '-inner');
        setStyle(li_, {
          background: 'url(' + item['icon'] + ') 0px 0px no-repeat',
          width: width + 'px',
          height: height + 'px',
          zIndex: index + 1,
          right: '0px',
          marginRight: (length - 1 - index) * 10 + 'px'
        });
        li_.setAttribute('data-name', item[key]);
        on(li_, 'click', this.handleClick_, this);
        if (item['name']) {
          let name_ = create('span', 'layer-name', li_);
          name_.setAttribute('data-name', item[key]);
          name_.innerHTML = item['name'];
        }
        if (!this.isActionSelected_) {
          if (item[this.isDefaultKey]) {
            addClass(li_, 'selected-item');
            this.isActionSelected_ = true;
          }
        }
        if (!this.isActionSelected_ && (index === length - 1)) {
          addClass(li_, 'selected-item');
          this.isActionSelected_ = true;
        }
      }
    })
  }

  /**
   * 鼠标移入
   * @param event
   * @private
   */
  contentMouseOver_ (event) {
    let length = this.options['layers'].length;
    if (length > 0) {
      for (let i = 0; i < length - 1; i++) {
        let item = getElement(this.className_ + '-li' + i + '-inner');
        if (item) {
          setStyle(item, {
            marginRight: '0px',
            zIndex: '',
            right: (length - 1 - i) * (10 + this.options['itemWidth']) + 'px'
          });
        }
      }
      setStyle(this.innerElement_, 'width', this.options['itemWidth'] * length + 10 * (length - 1) + 'px');
    }
  }

  /**
   * 鼠标移出
   * @param event
   * @private
   */
  contentMouseOut_ (event) {
    let length = this.options['layers'].length;
    if (length > 0) {
      for (let i = 0; i < length - 1; i++) {
        let item = getElement(this.className_ + '-li' + i + '-inner');
        if (item) {
          setStyle(item, {
            marginRight: (length - 1 - i) * 10 + 'px',
            zIndex: i + 1,
            right: '0px'
          });
        }
      }
      setStyle(this.innerElement_, 'width', this.options['itemWidth'] + (length - 1) * 10 + 'px');
    }
  }

  /**
   * 处理点击切换事件
   * @param event
   * @private
   */
  handleClick_ (event) {
    let value = event.target.getAttribute('data-name');
    this.switcher(this.options['key'], value);
  }

  /**
   * 更新底图和标准层
   * @private
   */
  updateBaseLayer_ () {
    if (!this.getMap()) return;
    this.baseLayers_ = getLayersArrayByKeyValue(this.getMap(), this.baseLayerKey, true);
    this.labelLayers_ = getLayersArrayByKeyValue(this.getMap(), this.labelLayerKey, true);
    if (this.baseLayers_ && this.baseLayers_.length > 0) {
      this.baseLayers_.filter(_item => {
        return !!_item
      })
    }
    if (this.labelLayers_ && this.labelLayers_.length > 0) {
      this.labelLayers_.filter(_item => {
        return !!_item
      })
    }
  }

  /**
   * 切换底图
   * @param key
   * @param value
   */
  switcher (key, value) {
    if (this.forcedUpdate) {
      this.updateBaseLayer_();
    }
    if (this.baseLayers_.length > 0 && this.baseLayers_.length === this.options['layers'].length) {
      if (this.labelLayers_ && this.labelLayers_.length > 0) { // 处理标注层
        this.labelLayers_.forEach(labelLayer => {
          if (labelLayer && labelLayer.get(this.labelAliasKey) === value) {
            labelLayer.setVisible(true)
          } else {
            labelLayer.setVisible(false)
          }
        })
      }
      this.baseLayers_.forEach(layer => {
        if (layer && layer.get(key) === value) {
          layer.setVisible(true);
          layer.set(this.isDefaultKey, true);
        } else {
          layer.setVisible(false);
          layer.set(this.isDefaultKey, false);
        }
      })
      let length = this.options['layers'].length;
      if (length > 0) {
        for (let i = 0; i < length; i++) {
          let item = getElement(this.className_ + '-li' + i + '-inner');
          if (item && item.getAttribute('data-name') === value) {
            addClass(item, 'selected-item');
          } else {
            removeClass(item, 'selected-item');
          }
        }
      }
    } else {
      throw new Error('请检查是否存在底图获取底图数量是否和配置相同！')
    }
  }

  /**
   * setMap
   * @param map
   */
  setMap (map) {
    super.setMap.call(this, map);
    if (map && map instanceof ol.Map) {
      this.updateBaseLayer_();
    }
  }
}

export default LayerSwitcher
