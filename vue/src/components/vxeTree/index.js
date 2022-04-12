import './index.less'

const nodeHeight = 30 // 每个节点高度

const bufferSize = 2 // 可视区域顶部和底部添加多出的数据的数量

let allNodesArr = []
let allNodesObj = {}

// let treeData = []

const searchResultHeight = 200 // 搜索面板高度
const searchResultLiHeight = 24 // 搜索项每一项的高度
const searchInputHeight = 24 // 搜索输入框的高度
const searchResultAmountPerPage = (searchResultHeight / searchResultLiHeight) | 1 // 搜索面板每页数量

let searchResultArrTemp = []

const searchResultCached = {} // 缓存搜索的结果，加快页面显示

const operateItemHeight = 24 // 操作弹窗，每项高度

let dom

export default {
  name: 'ComVxeTree',
  props: {
    async: {
      type: Boolean,
      default: false
    },
    checkable: {
      type: Boolean,
      default: false
    },
    checkedKeys: {
      type: Array,
      default: () => []
    },
    checkRelation: {
      type: Object,
      default: () => {
        return {
          Y: 'parent,children',
          N: 'parent,children'
        }
      }
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    enableSearch: {
      type: Boolean,
      defalut: false
    },
    fieldNames: {
      type: Object,
      default: () => {
        return {
          name: 'name',
          id: 'id',
          children: 'children'
        }
      }
    },
    filterTreeNode: {
      type: Function
    },
    loadData: {
      type: Function,
      default: () => {
        return new Promise(resolve => resolve([]))
      }
    },
    selectable: {
      type: Boolean,
      default: true
    },
    selectedKeys: {
      type: Array,
      default: () => []
    },
    title: {
      type: Function,
      default: () => {}
    },
    treeData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    treeData: {
      deep: true,
      handler (value) {
        this.init(value)
      }
    }
  },
  computed: {
    fullConfig () {
      const defaultConfig = {
        containerHeight: 0,

        enableOperate: false,
        operateList: [],

        /**
         * 兼容org-tree中的参数
         * 树节点中的图标与每个节点中dwType的值有关
         */
        enableOrgTreeIcon: false,

        enableSearch: false,

        // asyncNeeded: false,
        // asyncCallback: () => {},

        // enableSelect: true,
        enableMultiSelect: false,

        defaultSelectedKey: ''

        // checkable: false,
        // checkRelation: {
        //   Y: 'parent,children',
        //   N: 'parent,children'
        // },
        // defaultCheckedKeys: [],

        // defaultExpandAll: false,
        // replaceFields: {
        //   name: 'name',
        //   id: 'id',
        //   children: 'children'
        // }
      }
      return Object.assign({}, defaultConfig, this.config)
    },

    /**
     * 允许勾选时，当某个节点勾选时，联动父子节点的关系
     * @return {Array} ['parent', 'children'] / ['parent'] / ['children'] / []
     */
    Y () {
      const checkRelation = this.checkRelation || {}
      return checkRelation.Y ? checkRelation.Y.split(',').map(i => i.trim()) : []
    },

    /**
     * 允许勾选时，当某个节点取消勾选时，联动父子节点的关系
     * @return {Array} ['parent', 'children'] / ['parent'] / ['children'] / []
     */
    N () {
      const checkRelation = this.checkRelation || {}
      return checkRelation.N ? checkRelation.N.split(',').map(i => i.trim()) : []
    },
    _id () {
      return this.fieldNames.id
    },
    _name () {
      return this.fieldNames.name
    },
    _children () {
      return this.fieldNames.children
    }
  },
  data () {
    return {
      height: 0,

      // 记录全部的节点信息（源数据）
      // originalDataObj: {},

      // selectedNodes: [],

      // treeId: '',

      // 树形结构的节点信息
      // treeData: [],

      // 页面上可以看到的节点信息
      treeNodes: [],

      tempArr: [], // 暂存处理过程中的数组

      // 容器的总高度
      containerHeight: 0,

      // 每个节点的高度
      nodeHeight: 24,

      // 可视区域内节点的数量
      visibleAmount: 0,

      // 顶部margin
      bodyMarginTop: 0,
      // 底部margin
      bodyMarginBottom: 0,

      showSearchResult: false,
      showSearchResultEmpty: false,
      // searchKeyWord: '',
      searchResultArr: []
    }
  },
  mounted () {
    this.init(this.treeData)
  },

  methods: {
    /**
     * 计算操作面板的位置
     */
    recalculateListPosition (event, node) {
      const target = event.target
      if (target.tagName === 'LI') {
        return false
      }

      const nodeId = node[this._id]
      const index = this.treeNodes.findIndex(item => {
        return item[this._id] === nodeId
      })

      // 当前节点距离容器顶部的距离
      const top = index * this.nodeHeight

      // 操作弹窗的高度
      const length = node.operateList && node.operateList.length
      const height = length * operateItemHeight

      const totalHeight = this.containerHeight

      if (totalHeight - top < height) {
        event.target.parentElement.querySelector('ul').style.top = '-' + (height - operateItemHeight) + 'px'
      }
    },

    /**
     * 点击搜索结果面板中的一项
     */
    eventClickSearchResult (event) {
      this.showSearchResult = false

      const id = event.target.dataset.id
      this.scrollToNode(id)

      const name = allNodesObj[id][this._name]
      event.target.parentElement.parentElement.querySelector('input').value = name

      this.$forceUpdate()
    },

    /**
     * 搜索
     */
    eventSearch (value) {
      this.showSearchResult = true

      value = value.trim().toLowerCase()
      searchResultArrTemp = this.getSearchResultArr(value)

      this.searchResultArr = []
      const totalNumber = searchResultAmountPerPage

      for (let i = 0; i < totalNumber; i++) {
        searchResultArrTemp[i] && this.searchResultArr.push(searchResultArrTemp[i])
      }
      this.showSearchResultEmpty = this.searchResultArr.length === 0 || !value

      this.$forceUpdate()
    },

    /**
     * 从树节点信息中查找符合搜索关键字的节点
     * @param keyWord {String} 搜索的关键字
     * @return {Array} 匹配项
     */
    getSearchResultArr (keyWord) {
      keyWord = keyWord.trim()
      const keys = Object.keys(searchResultCached)
      if (keys.indexOf(keyWord) > 0) {
        return searchResultCached[keyWord]
      } else {
        const matchedKeys = keys.filter(item => {
          return keyWord.includes(item)
        }).sort((a, b) => {
          return b.length - a.length
        })
        if (matchedKeys.length > 0) {
          const result = this.getResultFromArray(keyWord, searchResultCached[matchedKeys[0]])
          searchResultCached[keyWord] = result
          return result
        }
      }

      const result = this.getResultFromArray(keyWord, allNodesArr)
      searchResultCached[keyWord] = result
      return result
    },

    /**
     * 从数组中找出匹配的项
     * @param keyWord {String} 搜索的关键字
     * @param arr {Array} 数组
     */
    getResultFromArray (keyWord, arr) {
      if (!keyWord) {
        return arr
      }

      if (this.filterTreeNode) {
      // debugger
        return arr.filter(item => this.filterTreeNode(keyWord, item))
      }

      return arr.filter(item => {
        return item[this._name].toLowerCase().includes(keyWord.toLowerCase())
      })
    },

    /**
     * 点击树，控制搜索弹窗的显示隐藏
     */
    eventTreeClick (event) {
      const { tagName, value } = event.target
      if (tagName === 'INPUT' && value.trim() !== '') {
        this.showSearchResult = true
        event.preventDefault()
        return false
      }
      this.showSearchResult = false
      this.showSearchResultEmpty = false
    },

    generateSearchResult (beginIndex) {
      for (let i = 0; i < searchResultAmountPerPage; i++) {
        this.searchResultArr.push(searchResultArrTemp[beginIndex + i])
      }
    },

    /**
     * 搜索面板滚动
     */
    eventSearchResultScroll (event) {
      const {
        scrollTop
      } = event.target

      const a1 = scrollTop + searchResultHeight
      const a2 = (this.searchResultArr.length - 1) * searchResultLiHeight

      if (a1 >= a2) {
        this.generateSearchResult(this.searchResultArr.length)
      }
    },

    /**
     * 数据初始化
     */
    init (data) {
      allNodesArr = []
      allNodesObj = {}
      searchResultArrTemp = []

      this.treeNodes = []
      this.tempArr = []
      this.bodyMarginTop = 0
      this.bodyMarginBottom = 0

      if (!data || data.length === 0) {
        return
      }

      this.getAllNodes(data)
      // this.getOriginalNodes(data)

      console.error('总节点数量：' + allNodesArr.length)

      dom = this._self.$el.parentElement

      this.containerHeight = dom.clientHeight
      this.containerWidth = dom.clientWidth
      if (this.fullConfig.enableSearch) {
        this.containerHeight -= searchInputHeight
      }

      this.nodeHeight = nodeHeight
      this.visibleAmount = Number((this.containerHeight / this.nodeHeight).toFixed(0)) + 1 + bufferSize * 2

      let temp = 0
      let i
      const tempArr = this.defaultExpandAll ? allNodesArr : data // treeData
      const length = tempArr.length
      for (i = 0; i < length; i++) {
        const item = tempArr[i]
        if (item._visible) {
          this.treeNodes.push(item)
          temp++
        }
        if (temp > this.visibleAmount) {
          break
        }
      }

      // 计算初始的顶部和底部的距离，生成滚动条
      this.calculateMargin(0)

      // const {
      // defaultSelectedKey,
      // defaultCheckedKeys
      // } = this.fullConfig

      // 有默认选中值时，选中并滚动到这个节点
      if (this.selectedKeys && this.selectedKeys.length > 0) {
        // TODO 只选中，不展开
        // this.expandToNode(defaultSelectedKey)
      }

      // 有默认勾选值时，勾选对应节点
      if (this.checkedKeys && this.checkedKeys.length > 0) {
        this.checkedKeys.forEach(item => {
          this.nodeCheck(allNodesObj[item])
        })
      }

      this.$forceUpdate()
    },

    /**
     * 展开节点
     * 会展开该节点的所有父节点（各个层级）
     * @param id {String} 节点ID
     */
    expandToNode (id) {
      const node = allNodesObj[id]
      const parentId = node._parentId

      if (parentId) {
        const result = this.getParentNodeArr(parentId)
        while (result.length > 0) {
          this.nodeExpand(null, result.pop(), true)
        }
      }
    },

    /**
     * 获取节点所有的父节点ID的信息
     * @param nodeId {String} 节点ID
     * @return {Array} 所有父节点的ID
     */
    getParentNodeArr (nodeId) {
      const node = allNodesObj[nodeId]

      if (!node) {
        return []
      }
      const parentId = node._parentId
      return [node].concat(this.getParentNodeArr(parentId))
    },

    /**
     * 搜索输入框点击
     */
    eventSearchInputClick (event) {
      const value = event.target.value.trim()
      if (value) {
        this.eventSearch(value)
      }
    },

    /**
     * 生成搜索结果
     */
    createSearchBox (h) {
      return h(
        'div',
        {
          class: ['vxe-tree-search-box']
        },
        [
          h(
            'input',
            {
              attrs: {
                // value: this.searchKeyWord
              },
              on: {
                click: (e) => this.eventSearchInputClick(e),
                keyup: e => this.eventSearch(e.target.value)
              }
            },
            []
          ),
          this.createSearchResult(h)
        ]
      )
    },

    /**
     * 生成搜索结果
     */
    createSearchResult (h) {
      if (this.searchResultArr.length === 0) {
        return [h(
          'div',
          {
            class: ['vxe-tree-search-result-empty'],
            style: {
              display: this.showSearchResultEmpty ? 'inline-block' : 'none',
              maxWidth: `${this.containerWidth - 40}px`
            }
          },
          '暂无匹配结果'
        )]
      }

      const arr = this.searchResultArr.map(item => {
        return this.createSearchLi(item, h)
      })
      return h(
        'ul',
        {
          class: [],
          style: {
            display: this.showSearchResult ? 'inline-block' : 'none',
            height: `${searchResultHeight}px`,
            maxWidth: `${this.containerWidth - 40}px`
          },
          on: {
            scroll: e => this.eventSearchResultScroll(e)
          }
        },
        [...arr]
      )
    },

    /**
     * 生成搜索结果的一个节点
     */
    createSearchLi (node, h) {
      return h(
        'li',
        {
          attrs: {
            'data-id': node[this._id]
          },
          on: {
            click: e => this.eventClickSearchResult(e)
          }
        },
        node[this._name]
      )
    },

    /**
     * 滚动到指定节点
     * TODO 添加页面效果标示节点
     */
    scrollToNode (nodeId) {
      this.expandToNode(nodeId)

      this.$nextTick(() => {
        const node = allNodesObj[nodeId]
        if (!node) {
          return false
        }
        const visibleNodes = allNodesArr.filter(item => item._visible === true)
        const index = visibleNodes.findIndex(item => item[this._id] === node[this._id])

        let scrollTop = this.nodeHeight * (index + bufferSize)
        if (this.enableSearch) {
          scrollTop += searchInputHeight
        }

        dom.querySelector('.vxe-tree-content').scrollTop = scrollTop
      })
    },

    /**
     * 遍历全部数据，生成数组格式和对象格式的信息，方便数据操作处理
     * TODO proxy代替clone?
     * @param {Array<Object>} arr 树的节点信息
     * @param {Number} level 节点位于树的第几层
     * @param {String} parentId 父节点ID值
     */
    getAllNodes (arr, level = 0, parentId) {
      // const {
      // asyncNeeded,
      // defaultExpandAll
      // } = this.fullConfig

      for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        const _id = item[this._id]
        const _children = item[this._children]

        item._level = level // 节点层级
        item._visible = (this.async && !item.isLeaf) || (!this.async && (this.defaultExpandAll || level === 0)) // 节点是否显示
        item._parentId = parentId // 节点对应的父节点ID
        item._checkState = '' // 节点的勾选状态
        item._expanded = this.defaultExpandAll && !this.async // 节点是否展开

        allNodesArr.push(item)
        allNodesObj[_id] = item

        if (_children && _children.length > 0) {
          this.getAllNodes(_children, (level + 1), _id)
        }
      }
    },

    /**
     * 计算顶部和底部的margin值，生成合适的滚动距离
     */
    calculateMargin (scrollTop) {
      scrollTop = scrollTop - this.nodeHeight * bufferSize + (scrollTop % this.nodeHeight)
      if (scrollTop < 0) { scrollTop = 0 }
      // 全部的显示的节点的高度
      const visibleNodes = allNodesArr.filter(item => item._visible === true)
      const visibleNodesHeight = visibleNodes.length * this.nodeHeight

      let temp = visibleNodesHeight - this.containerHeight
      if (temp < 0) { temp = 0 } // 节点全部显示的时候，没有占全可视区域

      const marginTop = Math.min(scrollTop, temp)

      let marginBottom = visibleNodesHeight - this.containerHeight - marginTop
      if (marginBottom < 0) {
        marginBottom = 0
      }

      this.bodyMarginTop = marginTop
      this.bodyMarginBottom = marginBottom
    },

    /**
     * 滚动事件
     * 计算滚动距离，计算在可视区域内第一条数据的索引，生成可视区域内的节点信息
     */
    eventScroll (e) {
      const {
        scrollTop
      } = e.target

      this.calculateMargin(scrollTop)

      const beginIndex = Number((scrollTop / this.nodeHeight).toFixed(0))
      this.reSetTreeNodes(beginIndex)
    },

    /**
     * 重新生成可视区域内的数据
     * @param beginIndex {Number} 第一条数据的索引
     */
    reSetTreeNodes (beginIndex) {
      let temp = 0
      const arr = []
      for (let i = 0, length = allNodesArr.length; i < length; i++) {
        const item = allNodesArr[i]
        if (item._visible) {
          temp++
        }
        if (temp >= beginIndex && item._visible) {
          arr.push(allNodesArr[i])
          if (arr.length > this.visibleAmount) {
            break
          }
        }
      }
      this.$set(this, 'treeNodes', arr)
    },

    /**
     * 收起并隐藏节点，以及子节点
     */
    hideNodes (arr) {
      arr.forEach(item => {
        item._visible = false
        item._expanded = false
        const tempArr = item[this._children]
        if (tempArr && tempArr.length > 0) {
          this.hideNodes(tempArr)
        }
      })
    },

    /**
     * 为节点的勾选状态赋值
     * @param arr {Array} 节点数组
     * @param checkState {String} checked 勾选/ halfChecked 半选/ 空字符串 未勾选
     */
    checkChildrenNodes (arr, checkState) {
      if (!arr || arr.length < 0) {
        return false
      }
      arr.forEach(item => {
        const checkFlag = this.Y.includes('children') && ['halfChecked', 'checked'].includes(checkState)
        const uncheckFlag = this.N.includes('children') && checkState === ''
        if (checkFlag || uncheckFlag) {
          item._checkState = checkState
        }

        const tempArr = item[this._children]

        tempArr && tempArr.length > 0 && this.checkChildrenNodes(tempArr, checkState)
      })
    },

    /**
     * 根据当前节点的勾选情况和config中的配置，决定父节点的勾选情况
     * @param currentNode {Object} 当前节点信息
     */
    checkParentNodes (currentNode) {
      const {
        _parentId
      } = currentNode

      // 获取父节点
      if (!_parentId) return
      const parentNode = allNodesObj[_parentId]
      const children = parentNode[this._children]

      let isSomeNodeChecked = false // 所有子节点中，是不是有一个节点是勾选状态
      let isSomeNodeUnchecked = false // 所有子节点中，是不是有一个节点是未勾选状态
      let isSomeNodeHalfchecked = false // 所有子节点中，是不是有一个节点是半勾选状态
      for (let i = 0, length = children.length; i < length; i++) {
        children[i]._checkState === 'checked' && (isSomeNodeChecked = true)
        children[i]._checkState === 'halfChecked' && (isSomeNodeHalfchecked = true)
        children[i]._checkState === '' && (isSomeNodeUnchecked = true)
        if (isSomeNodeChecked && isSomeNodeUnchecked && isSomeNodeHalfchecked) break
      }

      if ((!isSomeNodeChecked && !isSomeNodeHalfchecked) && this.N.includes('parent')) { // 子节点都未勾选
        parentNode._checkState = ''
      } else if ((!isSomeNodeUnchecked && !isSomeNodeHalfchecked) && this.Y.includes('parent')) { // 子节点都勾选
        parentNode._checkState = 'checked'
      } else {
        if (this.Y.includes('parent')) {
          parentNode._checkState = 'halfChecked'
        }
      }

      this.checkParentNodes(parentNode)
    },

    /**
     * 节点勾选/取消勾选
     */
    nodeCheck (node) {
      if (!node) return

      const _checkState = node._checkState || ''
      let checkState
      // 勾选状态，点击，变为未勾选状态
      // 半勾选状态，点击，变为勾选状态
      // 未勾选状态，点击，变为勾选状态
      if (_checkState === '' || _checkState === 'halfChecked') {
        checkState = 'checked'
      } else {
        checkState = ''
      }

      node._checkState = checkState

      if (this.Y.includes('children') || this.N.includes('children')) {
        this.checkChildrenNodes(node[this._children], checkState)
      }

      if (this.Y.includes('parent') || this.N.includes('parent')) {
        this.checkParentNodes(node)
      }

      this.$forceUpdate()

      const checked = checkState === 'checked'
      const checkedNodes = allNodesArr.filter(item => {
        return ['checked', 'halfChecked'].includes(item._checkState)
      })
      const checkedKeys = checkedNodes.map(item => item[this._id])
      const originalNodes = checkedKeys.map(item => allNodesObj[item])
      const originalNode = allNodesObj[node[this._id]]

      this.$emit('check', checkedKeys, { checked, checkedNodes: originalNodes, node: originalNode })
    },

    /**
     * 节点展开/收起
     * @param node {Object} 要操作的节点
     * @param expanded {Boolean} 节点操作后的展开状态。无该参数时切换节点的展开/收起状态
     */
    nodeExpand (event, node, expanded) {
      // 异步请求，新增的节点添加到节点信息中
      // TODO 新增数据后清空缓存的搜索数据
      if (this.async && !node.hasAsync) {
        node._ajaxing = true
        this.$forceUpdate()

        this.loadData(node).then(data => {
          // 处理新增的值
          const level = node._level + 1
          const visible = true
          const parentId = node[this._id]
          const checkState = node.checkState === 'checked' ? 'checked' : ''
          const expanded = false

          data.forEach(item => {
            item._level = level
            item._visible = visible
            item._parentId = parentId
            item._checkState = checkState
            item._expanded = expanded

            const id = item[this._id]
            allNodesObj[id] = item
          })

          this.bodyMarginBottom += data.length * this.nodeHeight

          const index = allNodesArr.findIndex(item => item[this._id] === node[this._id])
          allNodesArr.splice(index + 1, 0, ...data) // TODO 这个操作可能耗时

          const i = this.treeNodes.findIndex(item => item[this._id] === node[this._id])

          this.treeNodes.splice(i + 1, 0, ...data)
          this.treeNodes.length = this.visibleAmount

          node._ajaxing = false
          node._expanded = true
          node.hasAsync = true
          node[this._children] = data

          this.$forceUpdate()

          const originalNode = allNodesObj[node[this._id]]
          this.$emit('load', node[this._id], originalNode)
        }).catch(e => {
          node._ajaxing = false
          console.error(e)
        })
        return
      }

      const isExpanded = !!node._expanded
      const id = node[this._id]
      const children = allNodesObj[id][this._children]

      if (expanded !== undefined) {
        if (expanded === isExpanded) {
          return false
        }
      }

      // 展开当前节点
      if (!isExpanded) {
        children.forEach(item => {
          item._visible = !isExpanded
        })
      } else { // 收起当前节点
        this.hideNodes(children)
      }

      node._expanded = !isExpanded

      const beginIndex = this.bodyMarginTop / this.nodeHeight
      this.reSetTreeNodes(beginIndex)

      if (expanded === undefined) {
        const originalNode = allNodesObj[node[this._id]]
        this.$emit('expand', node[this._id], { expanded: node._expanded, node: originalNode })
      }
    },

    /**
     * 节点选中
     */
    nodeClick (node, event) {
      if (!this.selectable) {
        return false
      }

      const selected = !node._selected

      // 去除其他所有节点的选中状态
      this.treeNodes.forEach(item => {
        item._selected = false
      })

      node._selected = selected

      this.$forceUpdate()
      const originalNode = allNodesObj[node[this._id]]
      this.$emit('select', node[this._id], { selected, node: originalNode })
    },

    /**
     * 生成节点的图标
     */
    createIcon (node, h) {
      const { enableOrgTreeIcon } = this.fullConfig
      const { dwType } = node
      if (enableOrgTreeIcon && dwType) {
        let iconName = 'icon-'
        if (dwType + '' === '1') {
          iconName += 'jianzhu'
        } else if (dwType + '' === 'A') {
          iconName += 'danwei'
        } else if (dwType + '' === '2') {
          iconName += 'bumen'
        }
        return h(
          'div',
          {
            class: [iconName]
          }
        )
      }
      return node.iconSlotName && this.$slots[node.iconSlotName]
    },

    createOperateList (node, h) {
      const configList = this.fullConfig.operateList
      if (!configList || configList.length === 0) {
        return null
      }

      const operateList = node.operateList
      let resultList = []
      if (Array.isArray(operateList)) {
        resultList = configList.filter(item => {
          return operateList.includes(item.type)
        })
      } else if (!operateList) {
        resultList = configList
      }

      if (resultList.length === 0) {
        return null
      }

      return h(
        'span',
        {
          class: ['vxe-tree-node-operate'],
          on: {
            mouseover: e => this.recalculateListPosition(e, node)
          }
        },
        [
          h(
            'ul',
            {
              class: ['vxe-tree-node-operate-list']
            },
            [...this.createOperateListItems(resultList, node, h)]
          )
        ]
      )
    },

    createOperateListItems (arr, node, h) {
      return arr.map(item => {
        return h(
          'li',
          {
            class: ['vxe-tree-node-operate-list-item'],
            on: {
              click: e => item.callback(node)
            }
          },
          item.name
        )
      })
    },

    /**
     * 生成树节点
     * @param node {Object} 节点信息
     */
    createNode (node, h) {
      const showSwitcher = (node[this._children] && node[this._children].length > 0) || (this.async && !node.isLeaf)
      return h(
        'div',
        {
          on: {
          },
          class: 'vxe-tree-node',
          style: {
            'padding-left': (node._level * 20 + 10) + 'px',
            height: `${this.nodeHeight}px`
          }
        },
        [
          showSwitcher && h(
            'span', {
              class: [
                'vxe-tree-switcher',
                node._ajaxing ? 'ajaxing' : '',
                node._expanded ? 'expanded' : ''
              ],
              on: {
                click: (e) => this.nodeExpand(e, node)
              }
            },
            []
          ),
          this.checkable && h(
            'div',
            {
              class: [
                'checkbox',
                node._checkState
              ],
              on: {
                click: e => this.nodeCheck(node, e)
              }
            }
          ),
          this.createIcon(node, h),
          h(
            'span',
            {
              class: [
                'vxe-tree-node-name',
                node._selected ? 'selected' : ''
              ],
              style: {
                cursor: this.selectable ? 'pointer' : 'default'
              },
              on: {
                click: e => this.nodeClick(node, e)
              },
              attrs: {
                title: this.title(node)
              }
            },
            node[this._name]
          ),
          this.createOperateList(node, h)
        ]
      )
    },

    /**
     * 生成可以看到的树的全部节点
     */
    createNodes (arr, h) {
      const resultArr = arr.map(item => {
        return this.createNode(item, h)
      })
      return [...resultArr]
    }
  },

  render (h) {
    if (!this.treeData || this.treeData.length === 0) {
      return h(
        'div',
        {},
        '暂无数据'
      )
    }

    return h(
      'div',
      {
        class: ['vxe-tree'],
        style: {
          height: '100%'
        },
        on: {
          click: e => this.eventTreeClick(e)
        }
      },
      [
        this.enableSearch && this.createSearchBox(h),
        h(
          'div', {
            class: ['vxe-tree-content'],
            style: {
              height: `${this.containerHeight}px`,
              overflow: 'auto'
            },
            on: {
              scroll: e => this.eventScroll(e, true)
            }
          },
          [
            h(
              'div', {
                class: ['vxe-tree-body'],
                style: {
                  height: '100%',
                  'margin-top': `${this.bodyMarginTop}px`,
                  'margin-bottom': `${this.bodyMarginBottom}px`
                }
              },
              [this.createNodes(this.treeNodes, h)]
            )
          ]
        )
      ]
    )
  }

}
