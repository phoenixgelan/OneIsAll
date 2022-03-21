import zzTreeNode from './zzTreeNode.js'

import './zzTree.less'

export default {
  name: 'zzTree',
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    // TODO 添加默认设置项信息
    config: {
      type: Object,
      default: () => {}
    }
  },
  render() {
    if (this.$props.treeData[0].label === 'test') {
      return (
          <div class="zztree">
          {
            this.$props.treeData.map(node => {
              const nodeData = {
                props: {
                  node,
                  icon: this.$slots.icon,
                  ...this.$props,
                  ...this.config
                }
              }
              return <zzTreeNode {...nodeData}></zzTreeNode>
            })
          }
        </div>
      )
    } else {
      console.error('zztree')
      console.log(this.slots)
      const p = {
        props: {
          icon: this.$slots.icon
        }
      }
      return (
          <zzTreeNode {...p}></zzTreeNode>
      )
    }
  }
}