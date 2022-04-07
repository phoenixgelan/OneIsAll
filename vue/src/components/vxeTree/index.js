import './index.less'
import _ from 'lodash'

export default {
  name: 'vxeTree',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler (value) {
        this.treeData = _.cloneDeep(value)
      }
    }
  },
  computed: {
    fullConfig () {
      const defaultConfig = {
        asyncNeeded: false,
        asyncCallback: () => {},

        enableSelect: true,
        enableMultiSelect: false,

        defaultSelectedKey: '',

        checkable: false,
        checkRelation: {
          Y: 'parent,children',
          N: 'parent,children'
        },
        defaultCheckedKeys: [],

        defaultExpandAll: false,
        replaceFields: {
          name: 'name',
          id: 'id',
          children: 'children'
        }
      }
      return Object.assign({}, defaultConfig, this.config)
    },

    /**
     * 允许勾选时，当某个节点勾选时，联动父子节点的关系
     * @return {Array} ['parent', 'children'] / ['parent'] / ['children'] / []
     */
    Y () {
      const checkRelation = this.fullConfig.checkRelation
      return checkRelation.Y ? checkRelation.Y.split(',').map(i => i.trim()) : []
    },

    /**
     * 允许勾选时，当某个节点取消勾选时，联动父子节点的关系
     * @return {Array} ['parent', 'children'] / ['parent'] / ['children'] / []
     */
    N () {
      const checkRelation = this.fullConfig.checkRelation
      return checkRelation.N ? checkRelation.N.split(',').map(i => i.trim()) : []
    }
  },
  data () {
    return {
      test_randomId: '',

      height: 0,
      oldBeginIndex: 0,

      // 记录全部处理过的节点信息
      allNodesArr: [],
      allNodesObj: {},

      visibleNodesArr: [],
      totalVisibleAmount: 0,

      // 记录全部的节点信息（源数据）
      originalDataArr: [],
      originalDataObj: {},

      selectedNodes: [],

      treeId: '',

      // 树形结构的节点信息
      treeData: [],

      // 页面上可以看到的节点信息
      treeNodes: [],

      tempArr: [], // 暂存处理过程中的数组

      // nodeAmount: 10,

      // 容器的总高度
      containerHeight: 0,

      // 每个节点的高度
      nodeHeight: 24,

      // 可视区域内节点的数量
      visibleAmount: 0,

      // 顶部margin
      bodyMarginTop: 0,
      // 底部margin
      bodyMarginBottom: 1000
    }
  },
  created () {
    this.treeId = '' + new Date().getTime() // FIXME 感觉最好不要用一串数字来作ID值。如果页面同时存在多个树组件可能会出现问题

    if (!this.treeData || this.treeData.length === 0) {
      // TODO 此处添加空数据的逻辑
      return
    }

    // Mounted中可能需要获取第一项的高度值 TODO
    this.treeNodes = this.data.slice(0, 1)

    console.time('计算节点数据用时')
    this.getAllNodes(this.treeData)
    this.getOriginalNodes(this.data)
    console.timeEnd('计算节点数据用时')

    console.error('总节点数量：' + this.allNodesArr.length)
  },

  mounted () {
    if (!this.treeData || this.treeData.length === 0) {
      // TODO 此处添加空数据的逻辑
      return
    }

    const height = document.querySelector('.vxe-tree-content').clientHeight
    this.containerHeight = height

    let itemHeight
    const dom = document.querySelector('.vxe-tree-body').children
    if (dom && dom[0].clientHeight) {
      itemHeight = dom[0].clientHeight
    }
    this.nodeHeight = itemHeight

    if (height && itemHeight) {
      // 小数向上取整
      this.visibleAmount = Number((height / itemHeight).toFixed(0)) + 1
    }

    let temp = 0
    this.treeNodes = this.allNodesArr.filter(item => {
      return item._visible && temp++ < this.visibleAmount
    })

    // 计算初始的顶部和底部的距离，生成滚动条
    this.calculateMargin(0)

    const {
      defaultSelectedKey,
      defaultCheckedKeys
    } = this.fullConfig
    // 有默认选中值时，选中并滚动到这个节点
    if (defaultSelectedKey) {
      this.expandToNode(defaultSelectedKey)
    }

    // 有默认勾选值时，勾选对应节点
    // const _id = this.fullConfig.replaceFields.id
    if (defaultCheckedKeys && defaultCheckedKeys.length > 0) {
      defaultCheckedKeys.forEach(item => {
        this.nodeCheck(this.allNodesObj[item])
      })
    }
  },
  methods: {
    /**
     * 展开节点
     * 会展开该节点的所有层级的父节点
     * @param id {String} 节点ID
     */
    expandToNode (id) {
      const node = this.allNodesObj[id]
      if (!node) {
        return false
      }

      const _id = this.fullConfig.replaceFields.id
      const _children = this.fullConfig.replaceFields.children

      const parentId = node._parentId
      if (parentId) {
        // 父节点以及父节点的所有子节点，改变显示状态
        const parentNode = this.allNodesObj[parentId]
        parentNode._expanded = true
        parentNode._visible = true
        const children = parentNode[_children]
        if (children && children.length > 0) {
          children.forEach(item => {
            item._visible = true
          })
          this.tempArr = children.concat(this.tempArr)
        }

        this.expandToNode(parentId)
      } else { // 最顶层节点
        const visibleNodes = this.allNodesArr.filter(item => item._visible === true)
        const index = visibleNodes.findIndex(item => item[_id] === node[_id])
        // 把展开的全部节点添加到显示的节点信息中
        this.treeNodes.splice(index + 1, 0, ...this.tempArr)
        this.tempArr = []

        // 滚动到该节点的位置，并选中该节点
        const scrollTop = this.nodeHeight * index
        document.querySelectorAll('.vxe-tree-body')[0].parentElement.scrollTop = scrollTop
        this.nodeClick(this.allNodesObj[this.fullConfig.defaultSelectedKey])

        this.$forceUpdate()
      }
    },

    /**
     * 滚动到指定节点
     */
    scrollToNode (nodeId) {
      const _id = this.fullConfig.replaceFields.id
      const node = this.allNodesObj[nodeId]
      const visibleNodes = this.allNodesArr.filter(item => item._visible === true)
      const index = visibleNodes.findIndex(item => item[_id] === node[_id])
      const scrollTop = this.nodeHeight * index
      document.querySelectorAll('.vxe-tree-body')[0].parentElement.scrollTop = scrollTop
    },

    /**
     * 遍历全部数据，生成数组格式和对象格式的信息，方便数据操作处理
     * TODO proxy代替clone?
     * @param {Array<Object>} arr 树的节点信息
     * @param {Number} level 节点位于树的第几层
     * @param {String} parentId 父节点ID值
     */
    getAllNodes (arr, level = 0, parentId) {
      const {
        replaceFields: { id, children },
        asyncNeeded,
        defaultExpandAll
      } = this.fullConfig

      for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        const _id = item[id]
        const _children = item[children]

        item._level = level // 节点层级
        item._visible = (asyncNeeded && !item.isLeafnode) || (!asyncNeeded && (this.fullConfig.defaultExpandAll || level === 0)) // 节点是否显示
        item._parentId = parentId // 节点对应的父节点ID
        item._checkState = '' // 节点的勾选状态
        item._expanded = defaultExpandAll && !asyncNeeded // 节点是否展开

        this.allNodesArr.push(item)
        this.allNodesObj[_id] = item

        if (_children && _children.length > 0) {
          this.getAllNodes(_children, (level + 1), _id)
        }
      }
    },

    /**
     * 由源数据生成节点信息，用于$emit时返回原来的参数信息
     * 不会带上组件中使用到的属性
     */
    getOriginalNodes (arr) {
      const {
        replaceFields: { id: _id, children: _children }
        // asyncNeeded,
        // defaultExpandAll
      } = this.fullConfig
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i]
        const id = item[_id]
        this.originalDataArr.push(item)
        this.originalDataObj[id] = item

        const children = item[_children]
        if (children && children.length > 0) {
          this.getOriginalNodes(children)
        }
      }
    },

    /**
     * 异步请求数据时会增加节点信息
     * @param arr {Array{Object}} 节点信息
     * @param nodeId {String} 增加的节点信息追加到哪个节点上的节点ID
     */
    addNewDataToOriginal (arr, nodeId) {
      const { id: _id } = this.fullConfig.replaceFields
      const index = this.originalDataArr.findIndex(item => item[_id] === nodeId)
      this.originalDataArr.splice(index + 1, 0, ...arr)
      arr.forEach(item => {
        this.originalDataObj[_id] = item
      })
    },

    /**
     * 计算顶部和底部的margin值，生成合适的滚动距离
     */
    calculateMargin (scrollTop) {
      // 全部的显示的节点的高度
      const visibleNodes = this.allNodesArr.filter(item => item._visible === true)
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
      // this.oldBeginIndex = beginIndex
      this.reSetTreeNodes(beginIndex)
    },

    /**
     * 重新生成可视区域内的数据
     * @param beginIndex {Number} 第一条数据的索引
     */
    reSetTreeNodes (beginIndex) {
      let temp = 0
      const arr = []
      for (let i = 0, length = this.allNodesArr.length; i < length; i++) {
        const item = this.allNodesArr[i]
        if (item._visible) {
          temp++
        }
        if (temp >= beginIndex && item._visible) {
          arr.push(this.allNodesArr[i])
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
      const { children } = this.fullConfig.replaceFields
      arr.forEach(item => {
        item._visible = false
        item._expanded = false
        if (item[children] && item[children].length > 0) {
          this.hideNodes(item[children])
        }
      })
    },

    /**
     * 为节点的勾选状态赋值
     * @param arr {Array} 节点数组
     * @param checkState {String} checked 勾选/ halfChecked 半选/ 空字符串 未勾选
     */
    checkChildrenNodes (arr, checkState) {
      const { children: _children } = this.fullConfig.replaceFields
      arr.forEach(item => {
        const checkFlag = this.Y.includes('children') && ['halfChecked', 'checked'].includes(checkState)
        const uncheckFlag = this.N.includes('children') && checkState === ''
        if (checkFlag || uncheckFlag) {
          item._checkState = checkState
        }

        item[_children] && item[_children].length > 0 && this.checkChildrenNodes(item[_children], checkState)
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

      const {
        children: _children
      } = this.fullConfig.replaceFields

      // 获取父节点
      if (!_parentId) return
      const parentNode = this.allNodesObj[_parentId]
      const children = parentNode[_children]

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
      const {
        id: _id,
        children: _children
      } = this.fullConfig.replaceFields
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
        this.checkChildrenNodes(node[_children], checkState)
      }

      if (this.Y.includes('parent') || this.N.includes('parent')) {
        this.checkParentNodes(node)
      }

      this.$forceUpdate()

      const checked = checkState === 'checked'
      const checkedNodes = this.allNodesArr.filter(item => {
        return ['checked', 'halfChecked'].includes(item._checkState)
      })
      const checkedKeys = checkedNodes.map(item => item[_id])
      const originalNodes = checkedKeys.map(item => this.originalDataObj[item])
      const originalNode = this.originalDataObj[node[_id]]

      this.$emit('nodeCheck', checkedKeys, { checked, checkedNodes: originalNodes, node: originalNode })
    },

    /**
     * 节点展开/收起
     */
    nodeExpand (node) {
      const {
        replaceFields: {
          id: _id,
          children: _children
        },
        asyncNeeded,
        asyncCallback
      } = this.fullConfig

      // 异步请求，新增的节点添加到节点信息中
      if (asyncNeeded && !node.hasAsync) {
        node._ajaxing = true
        this.$forceUpdate()

        asyncCallback(node).then(data => {
          this.addNewDataToOriginal(data, node[_id])

          // 处理新增的值
          const level = node._level + 1
          const visible = true
          const parentId = node[_id]
          const checkState = node.checkState === 'checked' ? 'checked' : ''
          const expanded = false

          data.forEach(item => {
            item._level = level
            item._visible = visible
            item._parentId = parentId
            item._checkState = checkState
            item._expanded = expanded

            const id = item[_id]
            this.allNodesObj[id] = item
          })

          this.bodyMarginBottom += data.length * this.nodeHeight

          const index = this.allNodesArr.findIndex(item => item[_id] === node[_id])
          this.allNodesArr.splice(index + 1, 0, ...data) // TODO 这个操作可能耗时

          const i = this.treeNodes.findIndex(item => item[_id] === node[_id])

          this.treeNodes.splice(i + 1, 0, ...data)
          this.treeNodes.length = this.visibleAmount

          node._ajaxing = false
          node._expanded = true
          node.hasAsync = true
          node[_children] = data

          this.$forceUpdate()

          const originalNode = this.originalDataObj[node[_id]]
          this.$emit('nodeExpandAsync', node[_id], originalNode)
        }).catch(e => {
          node._ajaxing = false
          console.error(e)
        })
        return
      }

      const isExpanded = !!node._expanded
      const id = node[_id]
      const children = this.allNodesObj[id][_children]

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

      const originalNode = this.originalDataObj[node[_id]]
      this.$emit('nodeExpand', node[_id], { expanded: node._expanded, node: originalNode })
    },

    /**
     * 节点选中
     */
    nodeClick (node, event) {
      const {
        enableSelect,
        // enableMultiSelect,
        replaceFields: {
          id: _id
          // children: _children
        }
      } = this.fullConfig

      if (!enableSelect) {
        return false
      }

      const selected = !node._selected

      // 去除其他所有节点的选中状态
      this.treeNodes.forEach(item => {
        item._selected = false
      })

      node._selected = selected

      this.$forceUpdate()
      const originalNode = this.originalDataObj[node[_id]]
      this.$emit('nodeSelect', node[_id], { selected, node: originalNode })
    },

    createNode (node, h) {
      const {
        replaceFields: { name, children: _children },
        checkable,
        asyncNeeded,
        enableSelect
      } = this.fullConfig

      const showSwitcher = (node[_children] && node[_children].length > 0) || (asyncNeeded && !node.isLeafnode)
      return h(
        'div', {
          on: {
          },
          class: 'vxe-tree-node',
          style: {
            'padding-left': (node._level * 20 + 10) + 'px',
            height: '30px'
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
                click: (e) => this.nodeExpand(node, e)
              }
            },
            []
          ),
          checkable && h(
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
          node.iconSlotName && this.$slots[node.iconSlotName],
          h(
            'span',
            {
              class: [
                'vxe-tree-node-name',
                node._selected ? 'selected' : ''
              ],
              style: {
                cursor: enableSelect ? 'pointer' : 'default'
              },
              on: {
                click: e => this.nodeClick(node, e)
              }
            },
            node[name]
          )
        ]
      )
    },
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
        {

        },
        '没有数据'
      )
    }
    return h(
      'div', {
        class: ['vxe-tree'],
        // attrs: {
        //   id: `${this.treeId}`,
        // },
        style: {
          // border: '1px solid red',
          height: '100%'
        }

      },
      [
        h(
          'div', {
            class: ['vxe-tree-content'],
            style: {
              height: '100%',
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
                  'margin-bottom': `${this.bodyMarginBottom}px`,
                  border: '1px solid green'
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
