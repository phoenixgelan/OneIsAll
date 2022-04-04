<template>
    <vxe-tree :treeData="treeData"
              :config="treeConfig" >
       <div slot="icon-1" style="display: inline-block">aaa</div>
    </vxe-tree>
</template>
<script>

import XEUtils from 'xe-utils/ctor'

import vxeTree from '../../components/vxeTree'

const firstLevelNodeAmount = 1; // 第一层节点数量
const nodeChildrenMinAmount = 1; // 节点的children最小值
const nodeChildrenMaxAmount = 1; // 节点的children最大值
const levelAmount = 2; // 节点层数

const asyncNeeded = true

function createNode(name, id, level = 0) {
    // const node = { id: id + '', name, level}
    const node = { key: id + '', title: name, level}

    const childrenAmount = (Math.random() * (nodeChildrenMaxAmount - nodeChildrenMinAmount) | 0) + nodeChildrenMinAmount
    const children =  createNodeChildren(node, childrenAmount)
    // const o = {
    //     id: id + '',
    //     name,
    //     level,
    //     // hasChildren: children && children.length > 0,
    //     // _visible: level === 0,
    //     children
    // }
    const o = {
        key: id + '',
        title: name,
        level,
        // hasChildren: children && children.length > 0,
        // _visible: level === 0,
        subItems: children
    }

    if (asyncNeeded) {
        if (level === 0) {
            o.isLeafnode = true
        }
    }

    o.iconSlotName = 'icon-1'

    return o
}

function createNodeChildren (node, amount) {
    // const { id, name, level } = node
    const { key, title, level, subItems } = node
    if (level >= levelAmount) {
        return []
    }
    const arr = []
    for (let i = 0; i < amount; i++) {
        // arr.push(createNode(`${name}-${i}`, `${name}-${i}`, level + 1))
        arr.push(createNode(`${title}-${i}`, `${title}-${i}`, level + 1))
    }
    return arr
}

export default {
    name: 'vxeTreeDemo',
    components: {
        vxeTree
    },
    data () {
        return {
            treeConfig: {
                asyncNeeded: true, // 为true时 defaultExpandAll=true 失效
                asyncCallback: (node) => {
                    return this.asyncCallback(node)
                },

                checkable: true,
                checkRelation: {
                    Y: 'parent,children',
                    N: 'parent,children'
                },
                defaultCheckedKeys: [],
                defaultExpandAll: true,
                replaceFields: {
                    name: 'title',
                    id: 'key',
                    children: 'subItems'
                }
            },
            treeData: []
        }
    },
    created(){
        const arr = []
        for (let index = 0; index < firstLevelNodeAmount; index++) {
            const node = createNode('a' + index, index, 0)
            arr.push(node)
        }
        console.log(arr)

        // this.treeData = arr
        this.treeData = [
            {
                title: 'async-title',
                key: '0',
                isLeafnode: false,
                iconSlotName: 'icon-1'
            }
        ]
    },
    methods: {
        asyncCallback (node) {
            
                node.level = 1
                console.log(node)
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const arr = createNodeChildren(node, 20)
                        resolve(arr)
                    }, 1000)
                    // reject('error')
                })
            
        }
    }
}
</script>