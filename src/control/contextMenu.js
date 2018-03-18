/**
 * Created by FDD on 2016/11/7.
 * @desc 右键功能
 */
import '../assets/scss/contextMenu.scss'
import ol from 'openlayers'
import {BASE_CLASS_NAME} from '../constants'
import { cloneDeep, getElement, create, setStyle, stopPropagation, preventDefault, addClass, on } from '../utils';

class ContextMenu extends ol.control.Control {
  constructor (options = {}) {
    /**
     * className
     * @type {string}
     */
    const className_ = (options.className !== undefined ? options.className : 'ole-context-menu-content');

    /**
     * @private
     * @type {Element}
     */
    const element_ = create('div', (className_ + ' ' + BASE_CLASS_NAME.CLASS_UNSELECTABLE));
    setStyle(element_, 'display', 'none');
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

    /**
     * 地图容器
     * @type {null}
     */
    this.mapContent = null;

    /**
     * 鼠标右键的位置
     * @type {Array}
     */
    this.pixel = [];

    /**
     * width
     * @type {number}
     */
    this.itemWidth = (typeof this.options['itemWidth'] === 'number' ? this.options['itemWidth'] : 160);

    /**
     * height
     * @type {number}
     */
    this.itemHeight = (typeof this.options['itemHeight'] === 'number' ? this.options['itemHeight'] : 30);
  }

  /**
   * 初始化dom
   * @param items
   */
  initDomInternal (items) {
    this.htmlUtils(items, '', this.element);
    if (this.getMap()) {
      this.mapContent = this.getMap().getViewport();
      on(this.mapContent, 'contextmenu', this.mouseDownHandle_, this);
    }
  }

  /**
   * 初始化事件
   * @param event
   * @private
   */
  mouseDownHandle_ (event) {
    let that = this;
    stopPropagation(event);
    preventDefault(event);
    if (event.button === 2) {
      that.pixel = this.getMap().getEventPixel(event);
      that.dispatchEvent({
        type: 'before-show',
        target: this,
        event: event
      });
      window.setTimeout(() => {
        that.show(that.pixel);
        that.dispatchEvent({
          type: 'show',
          target: this,
          event: event
        });
      }, 50)
    }
    on(event.target, 'mousedown', function () {
      that.hide();
      that.dispatchEvent({
        type: 'hide',
        target: this,
        event: event
      });
    }, this, true);
  }

  /**
   * showMenu
   * @param position
   */
  show (position) {
    setStyle(this.element, {
      display: 'block',
      top: position[1] + 'px',
      left: position[0] + 'px'
    });
    let aDoc = this.getMap().getSize();
    let maxWidth = aDoc[0] - this.element.offsetWidth;
    let maxHeight = aDoc[1] - this.element.offsetHeight;
    if (this.element.offsetTop > maxHeight) {
      setStyle(this.element, {
        top: maxHeight + 'px'
      });
    }
    if (this.element.offsetLeft > maxWidth) {
      setStyle(this.element, {
        left: maxWidth + 'px'
      });
    }
  }

  /**
   * hideMenu
   */
  hide () {
    this.element.style.display = 'none';
    this.pixel = [];
  }

  /**
   * html处理工具
   * @param items
   * @param index
   * @param content
   * @param isOffset
   * @returns {*}
   */
  htmlUtils (items, index, content, isOffset) {
    let ulList = null;
    if (items && Array.isArray(items) && items.length > 0) {
      ulList = create('ul', this.className_ + '-ul' + index + '-inner', content, this.className_ + '-ul' + index + '-inner');
      if (isOffset) {
        setStyle(ulList, {
          position: 'absolute',
          top: '0px',
          left: this.itemWidth + 20 + 'px'
        });
      }
      items.forEach((item, index_) => {
        if (item && item['name'] && item['alias']) {
          let numList = index + '-' + index_
          let li_ = create('li', this.className_ + '-li-' + numList + '-inner', ulList, this.className_ + '-li-' + numList + '-inner');
          setStyle(li_, {
            width: this.itemWidth + 'px',
            height: this.itemHeight + 'px',
            lineHeight: this.itemHeight + 'px'
          });
          li_.setAttribute('data-name', item['alias'])
          on(li_, 'click', this.handleItemClick_.bind(this, item), this);
          if (item['icon']) {
            let span_ = create('span', 'li-icon-content', li_);
            if (item['iconType'] === 'iconfont') {
              let fontName = item['fontName'] ? item['fontName'] : 'iconfont';
              addClass(span_, fontName + ' ' + item['icon']);
              if (item['iconColor']) {
                span_.style.color = item['iconColor'];
              }
            } else {
              span_.style.background = 'url(' + item['icon'] + ') 0px 0px no-repeat';
            }
          }
          let name_ = create('span', 'li-name-content', li_);
          name_.innerHTML = item['name'];
          if (item['showLine']) {
            li_.style.borderBottom = '1px solid #CCCCCC'
          }
          if (item['items']) {
            this.htmlUtils(item['items'], numList, li_, true)
            on(li_, 'mouseenter', this.handleItemMouseOver_, this)
            on(li_, 'mouseleave', this.handleItemMouseOut_, this)
          }
        }
      })
    }
    return ulList
  }

  /**
   * 更新面板元素
   * @param type
   * @param item
   * @param items
   * @private
   */
  updateElement_ (type, item, items) {
    let child_ = getElement(this.className_ + '-ul' + '-inner');
    let cloneItems = cloneDeep(this.options['items']);
    let afterItems = null;
    switch (type) {
      case 'pop': // 移除最后一个
        this.element.removeChild(child_)
        afterItems = cloneItems.pop()
        this.htmlUtils(cloneItems, '', this.element);
        break;
      case 'push': // 数组的末尾添加新的元素
        this.element.removeChild(child_)
        afterItems = cloneItems = cloneItems.push(item);
        this.htmlUtils(cloneItems, '', this.element);
        break;
      case 'shift': // 删除数组的第一个元素
        this.element.removeChild(child_);
        afterItems = cloneItems.shift();
        this.htmlUtils(cloneItems, '', this.element);
        break;
      case 'unshift': // 在数组的开头添加新元素
        this.element.removeChild(child_);
        afterItems = cloneItems = cloneItems.unshift(item);
        this.htmlUtils(cloneItems, '', this.element);
        break;
      case 'reverse':
        this.element.removeChild(child_);
        afterItems = cloneItems.reverse();
        this.htmlUtils(cloneItems, '', this.element);
        break;
      default:
        this.element.removeChild(child_);
        afterItems = items;
        this.htmlUtils(items, '', this.element);
    }
    return afterItems;
  }

  /**
   * 获取鼠标右键位置的像素坐标
   * @returns {ol.Pixel|*|Array}
   */
  getCurrentPixel () {
    return this.pixel;
  }

  /**
   * 获取鼠标点击位置的地图坐标
   * @returns {ol.Coordinate}
   */
  getCurrentCoordinates () {
    return (this.getMap().getCoordinateFromPixel(this.getCurrentPixel()));
  }

  /**
   * 处理列表点击事件
   * @param item
   * @param event
   * @private
   */
  handleItemClick_ (item, event) {
    stopPropagation(event);
    if (item && item['callback'] && typeof item['callback'] === 'function') {
      item['callback']({
        type: 'item-click',
        target: this,
        event: event,
        source: item,
        pixel: this.getCurrentPixel(),
        coordinates: this.getCurrentCoordinates()
      })
    }
    this.dispatchEvent({
      type: 'item-click',
      event: event,
      source: item,
      pixel: this.getCurrentPixel(),
      coordinates: this.getCurrentCoordinates()
    });
    window.setTimeout(() => {
      this.hide();
    }, 50);
  }

  /**
   * 处理鼠标移入事件
   * @param event
   * @private
   */
  handleItemMouseOver_ (event) {
    stopPropagation(event);
    if (event.target && event.target.childNodes) {
      let elements = Array.prototype.slice.call(event.target.childNodes, 0);
      if (elements && elements.length > 0) {
        elements.every(ele => {
          if (ele && ele.nodeName.toLowerCase() === 'ul') {
            ele.style.display = 'block';
            return false
          } else {
            return true
          }
        })
      }
    }
  }

  /**
   * 处理鼠标移出事件
   * @param event
   * @private
   */
  handleItemMouseOut_ (event) {
    stopPropagation(event);
    if (event.target && event.target.childNodes) {
      let elements = Array.prototype.slice.call(event.target.childNodes, 0);
      if (elements && elements.length > 0) {
        elements.every(ele => {
          if (ele && ele.nodeName.toLowerCase() === 'ul') {
            ele.style.display = 'none';
            return false
          } else {
            return true
          }
        })
      }
    }
  }

  /**
   * setMap
   * @param map
   */
  setMap (map) {
    super.setMap.call(this, map);
    if (map && map instanceof ol.Map) {
      this.initDomInternal(this.options['items']);
    }
  }

  /**
   * 移除菜单最后一项
   */
  pop () {
    return this.updateElement_('pop');
  }

  /**
   * 向菜单末尾添加一项
   * @param item
   */
  push (item) {
    if (item && typeof item === 'object') {
      return this.updateElement_('push', item);
    } else {
      throw new Error('传入的不是对象');
    }
  }

  /**
   * 移除菜单第一项
   */
  shift () {
    return this.updateElement_('shift');
  }

  /**
   * 倒叙菜单
   */
  reverse () {
    return this.updateElement_('reverse');
  }

  /**
   * 向菜单开头添加一项
   * @param item
   */
  unshift (item) {
    if (item && typeof item === 'object') {
      return this.updateElement_('unshift', item);
    } else {
      throw new Error('传入的不是对象');
    }
  }

  /**
   * 更新菜单
   * @param items
   */
  update (items) {
    if (items && Array.isArray(items) && items.length > 0) {
      this.updateElement_('', '', items);
    } else {
      throw new Error('传入的数组有误！');
    }
  }

  /**
   * 更新内置配置
   * @param items
   */
  updateOption (items) {
    if (items && Array.isArray(items) && items.length > 0) {
      this.options['items'] = items;
      this.updateElement_('', '', items);
    } else {
      throw new Error('传入的数组有误！');
    }
  }
}

export default ContextMenu
