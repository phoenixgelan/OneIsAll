import {
  addDomClass,
  constants,
  hasDomClass,
  removeDomClass,
  toggleDomClass
} from './treeUtils.js'

import jianzhu from './jianzhu.vue'
import danwei from './danwei.vue'
import bumen from './bumen.vue'

const {switcherState, nodeState} = constants

export default {
  name: 'zzTreeNode',
  props: {
    node: {
      type: Object,
      default: () => {}
    },
    config: {
      type: Object,
      default: () => ({})
    },
    slots: Object
  },
  methods: {
    nodeOperate (e, info, callback) {
      callback(e, info)
    },

    /**
     * 异步-节点展开
     */
    nodeExpandAsync() {
      this.$emit('nodeExpandAsync', ...arguments)
    },

    /**
     * 节点展开/收起
     * @returns
     */
    nodeExpand() {
      const e = arguments[0]
      const node = arguments[1]

      if (!e.target) {
        this.$emit('nodeExpand', ...arguments)
        return
      }

      const dom = e.target;
      const parentDom = dom.parentElement;
      const className = dom.className;
      const expanded = className.indexOf(switcherState.close) > -1

      // 获取当前节点的ID
      const id = e.target.parentElement.getAttribute('id')

      // 处理异步请求
      if (!hasDomClass(dom, 'isAsync')) {
        if (this.config.async === true && expanded) {
          addDomClass(dom, 'ajaxing')
          this.config.asyncCallback && this.config.asyncCallback(id).then(data => {
            toggleDomClass(dom, switcherState.close)
            toggleDomClass(parentDom.querySelectorAll('.zztree-node-children')[0], nodeState.close)
            addDomClass(dom, 'isAsync')
            removeDomClass(dom, 'ajaxing')
            this.$emit('nodeExpandAsync', node, data)
          })
          removeDomClass(dom, 'ajaxing')
          return false;
        }
      }

      toggleDomClass(dom, switcherState.close)
      toggleDomClass(parentDom.querySelectorAll('.zztree-node-children')[0], nodeState.close)

      this.$emit('nodeExpand', id, expanded)
    },

    /**
     * 节点勾选/取消勾选
     * @returns
     */
    nodeCheck() {
      const e = arguments[0]
      if (!e.target) {
        this.$emit('nodeCheck', ...arguments)
        return
      }

      // 修改复选样式
      let checked = hasDomClass(e.target, nodeState.checked)
      if (checked) {
        removeDomClass(e.target, nodeState.checked, nodeState.halfChecked)
      } else {
        addDomClass(e.target, nodeState.checked)
        removeDomClass(e.target, nodeState.halfChecked)
      }

      const id = e.target.parentElement.getAttribute('id')
      this.$emit('nodeCheck', id, !checked, e.target, e)
    },

    /**
     * 节点选中/取消选中
     * @returns
     */
    nodeSelect() {
      const e = arguments[0]
      if (!e.target) {
        this.$emit('nodeSelect', ...arguments)
        return
      }

      toggleDomClass(e.target, nodeState.select);

      const id = e.target.parentElement.getAttribute('id');
      const isSelected = hasDomClass(e.target, nodeState.select);
      this.$emit('nodeSelect', id, isSelected, e.target)
    },

    /**
     * 生成节点的复选框
     * @returns 复选框DOM
     */
    createCheckbox(node){
      return (<div class="checkbox" onClick={this.nodeCheck}></div>)
    },

    /**
     * 生成列的操作窗口
     * TODO 是否要把这个弹窗放在全局中？ 这样可以避免一些样式问题
     * @returns 
     */
    createNodeOperate(node) {
      if (!node.operate || node.operate.length === 0) return null;
      return (
        <div class="operate">
          <ul class="operate-list">
            {node.operate && node.operate.map(item => {
              return <li onClick={e => this.nodeOperate(e, node, item.callback)}>{item.title}</li>
            })}
          </ul>
        </div>
        )
      },

    createGlobalNodeOperate (node) {
      if (document.getElementById('zztree-node-operate')) {
        return
      }
    }
  },
  render() {
    const { name, id, children } = this.config.replaceFields
    const { checkable, defaultExpandAll } = this.config

    // 兼容之前参数有dwType属性的情况
    const iconValue = this.node[this.config.iconParamName]
    let ico = null;
    if (iconValue === '1') {
      ico = <jianzhu />
    } else if (iconValue === 'A') {
      ico = <danwei />
    } else if (iconValue === '2') {
      ico = <bumen />
    }

    const hasChildNode = (this.config.async === false && (this.node[children] && this.node[children].length !== 0))
      || (this.config.async === true && this.node.isLeafNode === false)

    return (
      <li class="zztree-node" id={this.node[id]}>
        {checkable && this.createCheckbox(this.node)}
        {ico}
        {this.node.iconSlotName && this.slots[this.node.iconSlotName]}
        <div class="zztree-node-name"
             title={this.node[name]}
             onClick={this.nodeSelect}>
          {this.node[name]}
        </div>
        {this.node.operate && this.createNodeOperate(this.node)}
        { hasChildNode &&
          <span class={defaultExpandAll ? "zztree-switcher" : "zztree-switcher zztree-switcher-close" }
                onClick={e => this.nodeExpand(e, this.node)}></span>
        }
        <ul class= {defaultExpandAll ? 'zztree-node-children' : 'zztree-node-children close'}>
          {
            this.node[children] && this.node[children].map(node => {
              const p = {
                props: {
                  node,
                  config: this.config
                },
                on: {
                  nodeExpand: this.nodeExpand,
                  nodeSelect: this.nodeSelect,
                  nodeCheck: this.nodeCheck,
                  nodeExpandAsync: this.nodeExpandAsync
                }
              }
              return <zzTreeNode {...p}></zzTreeNode>
            })
          }
        </ul>

      </li>
    )
  }
}