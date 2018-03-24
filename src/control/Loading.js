/**
 * Created by FDD on 2017/7/21.
 * @desc 全局地图加载loading
 */
import '../assets/scss/loading.scss'
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import {create, setStyle} from '../utils'

class Loading extends ol.control.Control {
  constructor (options = {}) {
    const className = (options.className !== undefined ? options.className : 'ole-loading-panel');
    const widget = (options['widget'] ? options['widget'] : 'animatedGif');
    const elementDom = (widget === 'animatedGif') ? 'span' : 'progress';
    const element = create(elementDom, (className + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));
    super({
      element: element,
      target: options['target']
    });

    /**
     * map listeners
     * @type {Array}
     */
    this.mapListeners = [];

    /**
     * tile listeners
     * @type {Array}
     */
    this.tileListeners = [];

    /**
     * load status
     * @type {boolean}
     * @private
     */
    this.loadStatus_ = false;

    /**
     * is first load flag
     * @type {boolean}
     */
    this.isFirstRander = true;

    /**
     * progress
     * @type {number[]}
     * @private
     */
    this.loadProgress_ = [0, 1];

    /**
     * widget
     * @type {string}
     */
    this.widget = widget;

    /**
     * 进度条模式
     */
    if (options['progressMode']) {
      if (['tile', 'layer'].indexOf(options['progressMode']) === -1) {
        throw Error('不支持的进度条模式');
      }
      this.loadProgressByTile_ = ((options['progressMode'] === 'layer') ? !(options['progressMode'] === 'layer') : true);
    }

    /**
     * show widget
     * @type {boolean}
     */
    this.showPanel = (typeof options['showPanel'] === 'boolean') ? options['showPanel'] : true;
    if (this.widget === 'progressBar') {
      const div = create('div', 'ole-progress-bar');
      create('span', '', div)
    }
    this.onCustomStart = (options['onStart'] ? options['onStart'] : false);
    this.onCustomProgress = (options['onProgress'] ? options['onProgress'] : false);
    this.onCustomEnd = (options['onEnd'] ? options['onEnd'] : false);
  }

  /**
   * 设置
   */
  setup () {
    if (!this.getMap()) return;
    this.setDomPosition();
    this.getMap().on('change:size', this.setDomPosition, this);
    const pointerDown = this.getMap().on('pointerdown', this.hide(), this)
    const beforeRander = this.getMap().on('precompose', () => {
      if (this.isFirstRander) {
        this.isFirstRander = false;
        this.registerLayersLoadEvents_();
        this.show();
        if (this.onCustomStart) {
          let args = [];
          this.onCustomStart.apply(this, args)
        }
      }
    });
    const afterRander = this.getMap().on('postrender', () => {
      this.updateLoadStatus_()
      if (this.loadStatus_) {
        if (this.onCustomEnd) {
          let args = [];
          this.onCustomEnd.apply(this, args);
        }
        this.hide();
      }
    });
    this.mapListeners.push(pointerDown);
    this.mapListeners.push(beforeRander);
    this.mapListeners.push(afterRander);
  }

  /**
   * 设置dom位置
   */
  setDomPosition () {
    let size = this.getMap().getSize();
    if (!size) return;
    let domSize = [this.element.clientWidth, this.element.clientHeight];
    setStyle(this.element, {
      left: String(Math.round((size[0] - domSize[0]) / 2)) + 'px',
      bottom: String(Math.round((size[1] - domSize[1]) / 2)) + 'px'
    });
  }

  /**
   * 获取进度
   * @param source
   * @returns {boolean}
   * @private
   */
  updateSourceLoadStatus_ (source) {
    return (Math.round(source.loaded / source.loading * 100) === 100);
  }

  /**
   * 注册图层事件
   * @param layer
   * @private
   */
  registerLayerLoadEvents_ (layer) {
    let that = this;
    layer.getSource().on('tileloadstart', function (event) {
      if (that.loadStatus_) {
        that.loadStatus_ = false;
        that.loadProgress_ = [0, 1];
        if (that.widget === 'progressBar') {
          that.element.value = that.loadProgress_[0];
          that.element.max = that.loadProgress_[1];
        }
        that.show();
        if (that.onCustomStart) {
          let args = [];
          that.onCustomStart.apply(that, args);
        }
      }
      this.loading = (this.loading) ? this.loading + 1 : 1;
      this.isLoaded = that.updateSourceLoadStatus_(this);
      if (that.loadProgressByTile_) {
        this.loadProgress_[1] += 1;
        if (this.widget === 'progressBar') {
          that.element.max = that.loadProgress_[1];
          let progressBarDiv = that.element.getElementsByClassName('ole-progress-bar');
          if (progressBarDiv.length > 0) progressBarDiv[0].children()[0].width = String(parseInt(100 * that.progress(), 0)) + '%';
        }
      }
    });
    layer.getSource().on(['tileloadend', 'tileloaderror'], function (e) {
      if (e.tile.getState() === 3) {
        console.warn('Loading tile failed for resource \'' + e.tile.src_ + '\'')
      }
      this.loaded = (this.loaded) ? this.loaded + 1 : 1;
      this.isLoaded = that.updateSourceLoadStatus_(this);
      if (that.loadProgressByTile_) {
        that.loadProgress_[0] += 1;
        if (that.widget === 'progressBar') {
          that.element.value = that.loadProgress_[0];
          let progressBarDiv = this.element.getElementsByClassName('ole-progress-bar');
          if (progressBarDiv.length > 0) {
            progressBarDiv[0].children()[0].width = String(parseInt(100 * that.progress(), 0)) + '%';
          }
        }
        if (that.onCustomProgress) {
          that.onCustomProgress.apply(that, that.loadProgress_);
        }
      }
    });
  }

  /**
   * 注册全局图层事件
   * @private
   */
  registerLayersLoadEvents_ () {
    let groups = this.getMap().getLayers().getArray();
    for (let i = 0; i < groups.length; i++) {
      let layer = groups[i];
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray();
        for (let j = 0; j < layers.length; j++) {
          let l = layers[j];
          if (!(l instanceof ol.layer.Vector)) {
            this.tileListeners.push(this.registerLayerLoadEvents_(l));
          }
        }
      } else if (layer instanceof ol.layer.Layer) {
        if (!(layer instanceof ol.layer.Vector)) {
          this.tileListeners.push(this.registerLayerLoadEvents_(layer));
        }
      }
    }
  }

  /**
   * 更新加载状态
   * @private
   */
  updateLoadStatus_ () {
    let loadStatusArray = [];
    let groups = this.getMap().getLayers().getArray();
    for (let i = 0; i < groups.length; i++) {
      let layer = groups[i];
      if (layer) {
        if (layer instanceof ol.layer.Group) {
          let layers = layer.getLayers().getArray();
          for (let j = 0; j < layers.length; j++) {
            let l = layers[j];
            if (l && l.getSource() && !(l instanceof ol.layer.Vector) && l.getSource().hasOwnProperty('isLoaded')) {
              loadStatusArray.push(l.getSource().isLoaded);
            }
          }
        } else if (layer.getSource() && layer.getSource().hasOwnProperty('isLoaded')) {
          loadStatusArray.push(layer.getSource().isLoaded);
        }
      }
    }
    this.loadStatus_ = (loadStatusArray.indexOf(false) === -1) && (loadStatusArray.indexOf(true) !== -1);
    if (!this.loadProgressByTile_) {
      // progress
      let count = {};
      loadStatusArray.forEach(function (i) {
        count[i] = (count[i] || 0) + 1
      });
      let loaded = (count[true]) ? count[true] : 0;
      // progress events
      if (loaded > this.loadProgress_[0]) {
        this.loadProgress_ = [loaded, loadStatusArray.length];
        if (this.widget === 'progressBar') {
          this.element.max = this.loadProgress_[1];
          this.element.value = this.loadProgress_[0];
        }
        if (this.onCustomProgress) this.onCustomProgress.apply(this, this.loadProgress_);
      }
    }
  }

  /**
   * show
   */
  show () {
    if (this.showPanel) {
      this.element.style.display = 'block';
    }
  }

  /**
   * hide
   */
  hide () {
    if (this.showPanel) {
      this.element.style.display = 'none';
    }
  }

  /**
   * 显示进度详情
   * @returns {*[]|Array|[*,*]|[number,number]}
   */
  progressDetails () {
    return this.loadProgress_;
  }

  /**
   * 显示进度条
   * @returns {number}
   */
  progress () {
    return this.loadProgress_[0] / this.loadProgress_[1];
  }

  /**
   * 设置地图
   * @param map
   */
  setMap (map) {
    if (this.mapListeners && this.mapListeners.length > 0) {
      this.mapListeners.forEach(listener => {
        this.getMap().unByKey(listener)
      })
    }
    this.mapListeners.length = 0;
    super.setMap.call(this, map);
    if (map) {
      this.setup()
    }
  }
}

export default Loading
