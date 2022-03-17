export default {
    name: 'zzTreeNode',
    props: {
        node: {
            type: Object,
            default: () => {}
        }
    },
    render(h) {
        if (!this.node.children || this.node.children.length === 0) {
            return (<div class="zztree-node-no-children">{this.node.name}</div>)
        }

        return (
            <ul class="zztree-node">
                <div class="zztree-node-name">
                    {h(this.$scopedSlots.icon)}
                    {this.node.name}
                </div>
                <li>
                    {
                        this.node.children.map(node => {
                            return <zzTreeNode {...{ props: { node } }}></zzTreeNode>
                        })
                    }
                </li>
            </ul>
        )
    }
}