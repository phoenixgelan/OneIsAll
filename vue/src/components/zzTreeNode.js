const switcherState = {
  close: 'zztree-switcher-close',
  open: 'zztree-switcher-open'
}

// TODO 优化
const toggleClass = (str, className) => {
  if (!str.includes(className)) {
    str += ' ' + className;
  } else {
    let tempArr = str.split(' ')
    tempArr.splice(tempArr.indexOf(className), 1)
    str = tempArr.join(' ')
  }
  return str;
}

export default {
  name: 'zzTreeNode',
  props: {
    node: {
      type: Object,
      default: () => {}
    },
    icon: {},
    config: {}
  },
  methods: {
    switchClick(e) {
      // 仅仅操作样式，没有操作数据
      // TODO 先调整样式，再修改数据？
      // 缓存折叠的数据？ 勾选的数据？
      const className = e.target.className;
      let str = toggleClass(className, switcherState.close);
      str = toggleClass(str, switcherState.open);
      e.target.setAttribute('class', str);
    },
    createCheckbox(){
      return (<div class="checkbox"><div class="checkbox-inner"></div></div>)
    }
  },
  render(h) {
    const { name, id, children } = this.config.replaceFields
    // return (<div>{this.icon}</div>)
    const { checkable } = this.config || { checkable: true}

    // 没有子节点
    if (!this.node[children] || this.node[children] === 0) {
      return (
        <div>
        {this.config.checkable ? this.createCheckbox() : ''}
        {this.icon}
        <div class="zztree-node-no-children">
              
              {this.node[name]}
              </div>
              </div>
             )
    }

    return (
        <ul class="zztree-node" key={this.node[id]}>
{this.config.checkable ? this.createCheckbox() : ''}
{this.icon}
        <div class="zztree-node-name">
        
        
      {this.node[name]}
      </div>
        <span class="zztree-switcher zztree-switcher-close"
      onClick={this.switchClick}></span>
        <li>
        {
          this.node[children].map(node => {
            const p = {
              props: {
                node,
                icon: this.icon,
                replaceFields: this.config.replaceFields,
                config: this.config
              }
            }
            return <zzTreeNode {...p}></zzTreeNode>
          })
        }
      </li>
        </ul>
    )
  }
}