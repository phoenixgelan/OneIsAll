import zzTreeNode from './zzTreeNode.jsx'

import './zzTree.less'

export default {
    name: 'zzTree',
    props: {
        treeData: {
            type: Array,
            default: () => []
        }
    },
    render(h, ctx) {
        debugger

        return (
            <div class="zztree">
                {
                    this.$props.treeData.map(node => {
                        const nodeData = {
                            props: node
                        }
                        return <zzTreeNode {...{ props: { node } }}></zzTreeNode>
                    })
                }
            </div>
        )
    }
}