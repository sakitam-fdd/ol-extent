/**
 * Created by FDD on 2017/8/31.
 * @ 工具类
 */

/**
 * 判断对象是否有某个键值
 * @param object_
 * @param key_
 * @returns {boolean}
 */
const has = (object_, key_) => {
  return typeof object_ === 'object' && object_.hasOwnProperty(key_)
}

/**
 * 检查浏览器版本
 * @returns {*}
 */
const checkBrowser = () => {
  let userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  if (userAgent.indexOf('OPR') > -1) { // 判断是否Opera浏览器 OPR/43.0.2442.991
    return 'Opera'
  } else if (userAgent.indexOf('Firefox') > -1) { // 判断是否Firefox浏览器  Firefox/51.0
    return 'FF'
  } else if (userAgent.indexOf('Trident') > -1) { // 判断是否IE浏览器  Trident/7.0; rv:11.0
    return 'IE'
  } else if (userAgent.indexOf('Edge') > -1) { // 判断是否Edge浏览器  Edge/14.14393
    return 'Edge'
  } else if (userAgent.indexOf('Chrome') > -1) { // Chrome/56.0.2924.87
    return 'Chrome'
  } else if (userAgent.indexOf('Safari') > -1) { // 判断是否Safari浏览器
    return 'Safari'
  }
}

/**
 * 获取uuid
 * @returns {*|string|!Array.<T>}
 */
const getuuid = () => {
  let [s, hexDigits] = [[], '0123456789abcdef']
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'
  return (s.join(''))
}

/**
 * 替换节点
 * @param newNode
 * @param oldNode
 */
const replaceNode = (newNode, oldNode) => {
  let parent = oldNode.parentNode
  if (parent) {
    parent.replaceChild(newNode, oldNode)
  }
}

/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
const isObject = value => {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
}

/**
 * merge
 * @param target
 * @returns {*}
 */
function merge (target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {}
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop]
        if (value !== undefined) {
          target[prop] = value
        }
      }
    }
  }
  return target
}

export {
  has,
  checkBrowser,
  getuuid,
  replaceNode,
  isObject,
  merge
}
