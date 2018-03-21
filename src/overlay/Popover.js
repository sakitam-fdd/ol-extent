/**
 * Created by FDD on 2017/5/14.
 * @desc 用于地图弹出气泡
 */
import '../assets/scss/popover.scss'
import ol from 'openlayers'
import { createVectorLayer, getLayerByLayerName } from '../layer/layerUtils';
import StyleFactory from '../style/StyleFactory'
import {merge, uuid, create, on, stopPropagation, off, setStyle} from '../utils';

class Popover extends ol.Overlay {
  constructor (options = {}) {
    const _uuid = options['id'] || uuid();
    const _layerName = options['layerName'] || 'popover-feature-layer';
    const _className = options['className'] || 'ole-js-popup';
    const container = create('div', _className);
    const content = create('div', _className + '-content', container);
    super({
      element: container,
      stopEvent: options['stopEvent'] !== undefined ? options['stopEvent'] : true,
      offset: options['offset'] !== undefined ? options['offset'] : [0, 0],
      position: options['position'],
      positioning: options['positioning'],
      id: _uuid,
      layerName: _layerName,
      autoPan: options['autoPan'],
      autoPanAnimation: merge({
        duration: 1000
      }, options['autoPanAnimation']),
      autoPanMargin: options['autoPanMargin'],
      className: _className,
      insertFirst: ((options.hasOwnProperty('insertFirst')) ? options.insertFirst : false)
    });

    /**
     * uuid
     * @type {{}|*}
     */
    this.uuid = _uuid;

    /**
     * bottom mark icon
     * @type {*|string}
     */
    this.markIcon = options['markIcon'] || './images/mark.png';

    if (options['showCloser']) {
      const closer = create('div', _className + '-closer', container);
      closer.innerHTML = '+';
      on(closer, 'click', this.handleCloseClick, this);
    }
    if (options['showMinimize']) {
      const minimize = create('div', _className + '-minimize', container);
      minimize.innerHTML = '_'
      on(minimize, 'click', this.handleCloseClick, this);
    }
    if (options['properties']) {
      this.setProperties(options['properties']);
    }

    /**
     * 最小化后文本
     * @type {*|string}
     */
    this.minimizeText = options['minimizeText'] || '我的标记';

    /**
     * 最小化的label
     * @type {null}
     */
    this.miniOverLay = null;

    /**
     * 是否显示底部要素
     * @type {*|boolean}
     */
    this._showMarkFeature = options['showMarkFeature'] || false;
    this.container = container;
    this.content = content;
  }

  /**
   * handle closer click event
   * @param event
   */
  handleCloseClick (event) {
    stopPropagation(event);
    if (!this.getMap()) return;
    this.getMap().removeOverlay(this);
    const layer = getLayerByLayerName(this.getMap(), this.get('layerName'));
    layer.getSource().removeFeature(this.markFeature);
    this.markFeature = null
  }

  /**
   * handle mini button click event
   * @param event
   */
  showMinimize (event) {
    stopPropagation(event);
    if (!this.getMap()) return;
    if (this._showMarkFeature) {
      if (!this.miniOverLay) {
        let element = create('span', 'ole-marker-minimize-panel');
        element.setAttribute('data-state', 'block')
        this.container.style.display = 'none'
        const eventListener = (event) => {
          let e = !event ? window.event : event
          stopPropagation(e);
          this.container.style.display = 'block'
          this.miniOverLay.getElement().style.display = 'none'
          this.miniOverLay.getElement().setAttribute('data-state', 'none')
        };
        off(element, 'click', eventListener, this);
        on(element, 'click', eventListener, this);
        let label = create('label', 'ole-marker-minimize-label', element);
        label.innerText = this.minimizeText;
        label.setAttribute('title', this.minimizeText);
        this.miniOverLay = new ol.Overlay({
          element: element,
          stopEvent: true,
          offset: [0, 0],
          id: this.options['id'] + '_minimize',
          position: this.coords
        });
        this.map.addOverlay(this.miniOverLay)
      } else {
        this.miniOverLay.getElement().style.display = 'block';
        this.container.style.display = 'none';
        this.miniOverLay.getElement().setAttribute('data-state', 'block');
        this.miniOverLay.setPosition(this.coords);
      }
    }
  }

  /**
   * show popover
   * @param coordinates
   * @param html
   * @param options
   * @returns {Popover}
   */
  show (coordinates, html, options = {}) {
    if (options['dataProjection'] && options['featureProjection']) {
      let geom = new ol.geom.Point(coordinates);
      this.coords = geom.transform(options['dataProjection'], options['featureProjection']).getCoordinates();
    } else {
      this.coords = coordinates;
    }
    if (html instanceof HTMLElement) {
      this.content.innerHTML = '';
      this.content.appendChild(html);
    } else {
      this.content.innerHTML = html;
    }
    setStyle(this.container, 'display', 'block');
    this.content.scrollTop = 0;
    if (this._showMarkFeature) {
      this.showMarkFeature(this.coords);
    }
    if (this.markFeature) {
      let size = this.markFeature.getStyle().getImage().getSize();
      if (size && this.options['offset']) {
        const offset_ = [this.getOffset()[0], this.getOffset()[1] - size[1]];
        this.setOffset(offset_);
      }
    }
    this.setPosition(this.coords);
    this.updateSize();
    return this
  }

  /**
   * show mark
   * @param coordinates
   */
  showMarkFeature (coordinates) {
    if (!this.getMap() || !coordinates || coordinates.length < 2) return;
    this.markFeature = new ol.Feature({
      params: {
        moveable: true
      },
      geometry: new ol.geom.Point(coordinates)
    });
    this.set('markFeature', this.markFeature)
    const style = StyleFactory.getStyle({
      image: {
        type: 'icon',
        image: {
          imageAnchor: [0.5, 1],
          imageAnchorXUnits: 'fraction',
          imageAnchorYUnits: 'fraction',
          imageOpacity: 1,
          imageSrc: this.markIcon
        }
      }
    });
    this.markFeature.setId(this.uuid);
    this.markFeature.setStyle(style);
    this.markFeature.on('featureMove', event => {
      let coords = this.markFeature.getGeometry().getCoordinates();
      this.coords = coords;
      this.setPosition(coords);
      if (this.miniOverLay) {
        this.miniOverLay.setPosition(this.coords)
      }
    });
    const layer = createVectorLayer(this.getMap(), this.get('layerName'), {
      create: true
    });
    if (layer && layer instanceof ol.layer.Vector) {
      layer.getSource().addFeature(this.markFeature)
    }
  }

  /**
   * hide popover
   * @param clear
   * @returns {Popover}
   */
  hide (clear) {
    setStyle(this.container, 'display', 'none');
    if (this.getMap() && clear && this && this.uuid) {
      this.getMap().removeOverlay(this);
    }
    return this
  }

  /**
   * update size
   * @returns {Popover}
   */
  updateSize () {
    if (this.container) {
      setStyle(this.container, {
        marginLeft: (-this.container.clientWidth / 2) - 1 + 'px',
        display: 'block',
        opacity: 1,
        scrollTop: 0
      })
    }
    this.getMap() && this.getMap().render()
    return this
  }

  /**
   * check popover opened
   * @returns {boolean}
   */
  isOpened () {
    return (this.container.style.display === 'block')
  }

  /**
   * 判断是否为移动设备（触摸）
   * @returns {boolean}
   * @private
   */
  isTouchDevice_ () {
    try {
      document.createEvent('TouchEvent');
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * 允许触摸滚动
   * @param elm
   * @private
   */
  enableTouchScroll_ (elm) {
    if (this.isTouchDevice_()) {
      let scrollStartPos = 0;
      on(elm, 'touchstart', function (event) {
        scrollStartPos = this.scrollTop + event.touches[0].pageY;
      }, this);
      on(elm, 'touchmove', function (event) {
        this.scrollTop = scrollStartPos - event.touches[0].pageY;
      }, this)
    }
  }
}

export default Popover
