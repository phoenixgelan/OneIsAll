import zzTreeNode from './zzTreeNode.jsx'

import './zzTree.less'

import {
  constants,
  removeDomClass,
  addDomClass,
  hasDomClass,
  getSameTagSiblingDom,
  getDomId
} from './treeUtils.js'

const { nodeState } = constants

export default {
  name: 'zzTree',
  watch: {
    treeData: {
      handler(newValue) {
        this.treeDataNow = newValue
      },
      deep: true
    }
  },
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    fullConfig () {
      const defaultConfig = {
        defaultExpandAll: false,
        iconParamName: 'dwType',
        checkable: false,
        replaceFields: {
          name: 'name',
          id: 'id',
          children: 'children'
        },
        checkRelation: {
          Y: 'parent,children',
          N: 'parent,children'
        },
        async: false,
        asyncCallback: () => {}
      }
      return Object.assign({}, defaultConfig, this.config)
    },
    Y () {
      const { checkRelation } = this.fullConfig;
      return checkRelation.Y ? checkRelation.Y.split(',').map(i => i.trim()) : []
    },
    N () {
      const { checkRelation } = this.fullConfig;
      return checkRelation.N ? checkRelation.N.split(',').map(i => i.trim()) : []
    }
  },
  created() {
    this.generateTreeInfo(this.treeDataNow)
  },
  methods: {
    nodeExpandAsync (node, data) {
      // console.error('---------nodeExpandAsync-------')
      // console.log(node)
      // console.log(data)

      const { id, children } = this.fullConfig.replaceFields
      const _id = node[id]
      const n = this.getNodeById(_id)
      this.$set(n, children, data) // 触发vue视图刷新

      // 记录在数据中，方便调用
      data.forEach(item => {
        let key = item[id]
        this.treeNodeObj[key] = item
      })
      this.treeNodeArr = this.treeNodeArr.concat(data)
      this.$forceUpdate()

      const nodeInfo = this.getNodeById(_id)
      this.$emit('nodeExpandAsync', _id, nodeInfo)
    },

    /**
     * 记录树的每个节点信息，方便数据处理
     */
    generateTreeInfo(arr) {
      const { name, id, children } = this.fullConfig.replaceFields
      arr.forEach(item => {
        const _children = item[children]
        const _id = item[id]
        this.treeNodeObj[_id] = item
        this.treeNodeArr.push(item)
        if (_children && Array.isArray(_children) && _children.length > 0) {
          this.generateTreeInfo(_children)
        }
      })
    },

    nodeExpand(id, expanded) {
      const node = this.getNodeById(id);
      this.$emit('nodeExpand', id, {expanded, node})
    },

    nodeSelect(id, selected, dom) {
      if (this.selectedNodeDOM[0]) {
        const _dom = this.selectedNodeDOM[0]
        if (_dom !== dom) {
          removeDomClass(_dom, nodeState.select)
        }
      }
      this.selectedNodeDOM = [dom]

      const node = this.getNodeById(id);
      this.$emit('nodeSelect', id, {selected, node})
    },

    /**
     * 节点勾选/取消勾选
     * @param id { String } 节点对应的ID值
     * @param checked { Boolean } 节点是否勾选
     * @param dom { HTML DOM } 复选框对应的元素
     */
    nodeCheck(id, checked, dom, event) {
      // 子节点
      if (checked && this.Y.includes(constants.CHILDREN)) {
        dom.parentElement.querySelectorAll('.checkbox, li').forEach(item =>{
          addDomClass(item, nodeState.checked)
        })
      }
      if (!checked && this.N.includes(constants.CHILDREN)) {
        dom.parentElement.querySelectorAll('.checkbox, li').forEach(item => {
          removeDomClass(item, nodeState.checked, nodeState.halfChecked)
        })
      }

      // 父节点
      const parent = dom.parentElement; // 对应本节点的LI元素
      // 添加标记，方便遍历时使用
      if (checked) {
        addDomClass(parent, nodeState.checked);
      } else {
        removeDomClass(parent, nodeState.checked);
      }

      if (this.Y.includes(constants.PARENT) || this.N.includes(constants.PARENT)) {
        const checkState = checked ? nodeState.checked : nodeState.unchecked;
        this.changeAllParentNodeCheckState(parent, checkState)
      }

      const checkedNodes = this.getCheckedNode()
      const node = this.getNodeById(id)
      this.$emit('nodeCheck', id, {checked, checkedNodes, node, event})
    },

    /**
     * 改变该节点的所有父节点的勾选状态
     * @param dom {HTML DOM} 节点，LI
     * @param checkState { String } 勾选、半勾选、无勾选
     */
    changeAllParentNodeCheckState (dom, checkState) {
      const checkbox = dom.querySelectorAll('.checkbox')[0]
      removeDomClass(checkbox, nodeState.checked, nodeState.halfChecked);
      addDomClass(checkbox, checkState);

      // 勾选关联父节点
      let parentLi = dom.parentElement; // ul
      if (!parentLi || hasDomClass(parentLi, 'zztree')) { // 顶级节点
        return false;
      }

      let p;

      // 当前节点勾选影响所有的父级节点
      const siblings = getSameTagSiblingDom(dom, 'li');
      if (siblings.length === 0) { // 无其他子节点，那么本节点的勾选与父节点的勾选情况完全一致
        if (checkState === nodeState.checked && this.Y.includes(constants.PARENT)) {
          addDomClass(parentLi, nodeState.checked);
        } 
        if (checkState === nodeState.unchecked && this.N.includes(constants.PARENT)) {
          removeDomClass(parentLi, nodeState.checked);
        }
        this.changeAllParentNodeCheckState(parentLi, checkState);
      } else { // 有其他同级的子节点

        // 计算除了自己之外相邻节点的勾选数量
        const checkAmount = siblings.filter(item => {
          return hasDomClass(item, nodeState.checked)
        }).length

        if (checkState === nodeState.checked && checkAmount === siblings.length) { // 子节点全部勾选
          if (!this.Y.includes(constants.PARENT)) {
            return
          }
          p = parentLi.parentElement;
          addDomClass(p, nodeState.checked);
          removeDomClass(p, nodeState.halfChecked);
          this.changeAllParentNodeCheckState(p, nodeState.checked)
        } else if (checkState === nodeState.unchecked && checkAmount === 0) { // 子节点全部不勾选
          if (!this.N.includes(constants.PARENT)) {
            return
          }
          p = parentLi.parentElement;
          removeDomClass(p, nodeState.checked, nodeState.halfChecked);
          this.changeAllParentNodeCheckState(p,  nodeState.unchecked);
        } else { // 其他情况，半勾选
          if (!this.Y.includes(constants.PARENT) && this.N.includes(constants.PARENT)) {
            return
          }
          p = parentLi.parentElement;
          addDomClass(p, nodeState.halfChecked);
          removeDomClass(p, nodeState.checked);
          this.changeAllParentNodeCheckState(p, nodeState.halfChecked);
        }
      }
    },

    /**
     * 获取全部勾选的节点信息
     */
    getCheckedNode () {
      // 先获取全部ID，然后映射为Node信息
      const idArr = this.getCheckedNodeId()
      return idArr.map(item => {
        return this.treeNodeObj[item]
      })
    },

    /**
     * 获取全部勾选节点的ID
     */
    getCheckedNodeId () {
      const result = []
      document.getElementById(this.treeId).querySelectorAll('.checkbox').forEach(item => {
        if (hasDomClass(item, nodeState.checked) 
          || hasDomClass(item, nodeState.halfChecked)) {
            const id = getDomId(item)
            result.push(id)
          }
      })
      return result
    },

    getNodeById(id) {
      return this.treeNodeObj[id]
    }
  },
  data () {
    return {
      treeDataNow: this.treeData,
      treeId: new Date().getTime() + '' + (Math.random() * 1000).toFixed(0), // FIXME 树ID的生成

      // 记录所有的节点信息
      treeNodeObj: {},
      treeNodeArr: [],

      // 当前选中的节点DOM
      selectedNodeDOM: []
    }
  },
  render() {
    return (
        <ul class="zztree" id={this.treeId}>
        {
          this.treeDataNow.map(node => {
            const nodeData = {
              props: {
                node,
                slots: this.$slots,
                config: {
                  ...this.fullConfig
                }
              },
              on: {
                nodeExpand: this.nodeExpand,
                nodeSelect: this.nodeSelect,
                nodeCheck: this.nodeCheck,
                nodeExpandAsync: this.nodeExpandAsync
              }
            }
            return <zzTreeNode {...nodeData}></zzTreeNode>
          })
        }
      </ul>
    )
  }
}