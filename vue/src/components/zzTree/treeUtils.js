const _constants = {
  switcherState: {
    close: 'zztree-switcher-close'
  },
  nodeState: {
    name: 'zztree-node',
    select: 'zztree-node-selected',
    checked: 'checked',
    unchecked: '',
    halfChecked: 'half-checked',
    close: 'close',
  },
  PARENT: 'parent',
  CHILDREN: 'children',
  CHECKBOX: 'checkbox'
}

export const constants = _constants

const _hasDomClass = (dom, className) => {
  if (!dom) {
    return false
  }

  const arr = dom.className.split(/\s+/g)
  return arr.includes(className)
}
export const hasDomClass = _hasDomClass

export const removeDomClass = (dom, ...className) => {
  if (!dom) {
    return
  }

  const newClassName = dom.className.split(/\s+/g).filter(item => {
    return !className.includes(item)
  }).join(' ') || ''
  dom.setAttribute('class', newClassName.trim())
}

export const addDomClass = (dom, className) => {
  if (!dom || _hasDomClass(dom, className)) {
    return
  }

  dom.setAttribute('class', (dom.className + ' ' + className).trim())
}

export const toggleDomClass = (dom, className) => {
  if (!dom) {
    return
  }

  if (_hasDomClass(dom, className)) {
    removeDomClass(dom, className)
  } else {
    addDomClass(dom, className)
  }
}


/**
 * 获取当前节点同级的节点
 * @return {Array}
 */
export const getSameTagSiblingDom = (dom, tagName, selfIncluded = false) => {
  const parentDom = dom.parentElement;
  if (!parentDom) {
    return selfIncluded ? [dom] : []
  }

  tagName = tagName.toUpperCase();
  const result = [];
  for (let i = 0, length = parentDom.children.length; i < length; i++) {
    let item = parentDom.children[i]
    if (selfIncluded && item === dom) {
      result.push(item);
      continue;
    }
    if (item.tagName.toUpperCase() === tagName) {
      result.push(item);
    }
  }
  return result;
}

/**
 * 获取节点对应的数据的ID
 */
export const getDomId = (dom) => {
  if (_hasDomClass(dom, _constants.nodeState.name) && dom.tagName === 'UL') {
    return dom.getAttribute('id');
  }

  if (dom.tagName === 'LI') {
    const ul = dom.querySelector('.' + _constants.nodeState.name);
    if (ul) {
      return ul.getAttribute('id');
    }
  }

  if (_hasDomClass(dom, _constants.CHECKBOX)) {
      return dom.parentElement.getAttribute('id')
  }
}

export const addItemToArray = (arr, item) => {
  if (arr.includes(item)) { return }
  arr.push(item)
}

export const removeItemFromArray = (arr, item) => {
  if (!arr.includes(item)) { return }
  arr = arr.filter(i => i !== item)
}