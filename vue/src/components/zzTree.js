import zzTreeNode from './zzTreeNode.js'

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
        console.error('-------------')
        console.log(this.$scopedSlots.icon())
        const slots = this.$slots;
        const children = this.$slots.default;
        const icon = this.$slots.icon;
        const keys = Object.keys(this.$slots);
        const tempSlots = {};
        keys.map(name => {
            tempSlots[name] = () => this.$slots[name]
        })
        const nodeProps = {
            scopedSlots: {
                ...tempSlots
            }
        }
        return (
            <div class="zztree">
                {
                    this.$props.treeData.map(node => {
                        const p = {
                            props: { node },
                            ...nodeProps
                        }
                        return <zzTreeNode {...p}>
                            {children}
                        </zzTreeNode>
                    })
                }
            </div>
        )
    }
}