import {stamp, camelCase, trim} from './utils'
/* istanbul ignore next */
export const create = function (tagName, className, container, id) {
  let el = document.createElement(tagName)
  el.className = className || ''
  if (id) {
    el.id = id
  }
  if (container) {
    container.appendChild(el)
  }
  return el
}

/* istanbul ignore next */
export const getElement = function (id) {
  return typeof id === 'string' ? document.getElementById(id) : id
}

/* istanbul ignore next */
export const remove = function (el) {
  let parent = el.parentNode
  if (parent) {
    parent.removeChild(el)
  }
}

/* istanbul ignore next */
export const empty = function (el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild)
  }
}

/* istanbul ignore next */
export const createHidden = function (tagName, parent, id) {
  let element = document.createElement(tagName)
  element.style.display = 'none'
  if (id) {
    element.id = id
  }
  if (parent) {
    parent.appendChild(element)
  }
  return element
}

/**
 * 获取事件唯一标识
 * @param type
 * @param fn
 * @param context
 * @returns {string}
 */
const getDomEventKey = (type, fn, context) => {
  return '_dom_event_' + type + '_' + stamp(fn) + (context ? '_' + stamp(context) : '')
}

/**
 * 对DOM对象添加事件监听
 * @param element
 * @param type
 * @param fn
 * @param context
 * @param isOnce
 * @returns {*}
 */
export const addListener = function (element, type, fn, context, isOnce) {
  let eventKey = getDomEventKey(type, fn, context)
  let handler = element[eventKey]
  if (handler) {
    if (!isOnce) {
      handler.callOnce = false
    }
    return this
  }
  handler = function (e) {
    return fn.call(context || element, e)
  }
  if ('addEventListener' in element) {
    element.addEventListener(type, handler, false)
  } else if ('attachEvent' in element) {
    element.attachEvent('on' + type, handler)
  }
  element[eventKey] = handler
  return this
}

export const on = addListener

/**
 * 移除DOM对象监听事件
 * @param element
 * @param type
 * @param fn
 * @param context
 * @returns {removeListener}
 */
export const removeListener = function (element, type, fn, context) {
  let eventKey = getDomEventKey(type, fn, context)
  let handler = element[eventKey]
  if (!handler) {
    return this
  }
  if ('removeEventListener' in element) {
    element.removeEventListener(type, handler, false)
  } else if ('detachEvent' in element) {
    element.detachEvent('on' + type, handler)
  }
  element[eventKey] = null
  return this
}

export const off = removeListener

/**
 * attach events once
 * @param element
 * @param type
 * @param fn
 * @param context
 * @returns {*}
 */
export const once = function (element, type, fn, context) {
  return addListener(element, type, fn, context, true)
}

/**
 * Prevent default behavior of the browser.
 * @param event
 * @returns {preventDefault}
 */
export const preventDefault = function (event) {
  if (event.preventDefault) {
    event.preventDefault()
  } else {
    event.returnValue = false
  }
  return this
}

/**
 * Stop browser event propagation
 * @param event
 * @returns {stopPropagation}
 */
export const stopPropagation = function (event) {
  if (event.stopPropagation) {
    event.stopPropagation()
  } else {
    event.cancelBubble = true
  }
  return this
}

/**
 * check element has class
 * @param el
 * @param cls
 * @returns {boolean}
 */
export const hasClass = (el, cls) => {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

/**
 * add class for element
 * @param el
 * @param cls
 */
export const addClass = (el, cls) => {
  if (!el) return
  let curClass = el.className
  let classes = (cls || '').split(' ')
  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i]
    if (!clsName) continue
    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
}

/**
 * remove element class
 * @param el
 * @param cls
 */
export const removeClass = (el, cls) => {
  if (!el || !cls) return
  const classes = cls.split(' ')
  let curClass = ' ' + el.className + ' '
  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i]
    if (!clsName) continue
    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

/**
 * get current element style
 * @param element
 * @param styleName
 * @returns {*}
 */
export const getStyle = (element, styleName) => {
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    const computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  } catch (e) {
    return element.style[styleName]
  }
}

/**
 * set dom style
 * @param element
 * @param styleName
 * @param value
 */
export const setStyle = (element, styleName, value) => {
  if (!element || !styleName) return
  if (typeof styleName === 'object') {
    for (let prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity') {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}
