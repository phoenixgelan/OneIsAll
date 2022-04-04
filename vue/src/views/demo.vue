<template>
<div>
  <div id="container"
       style="border: 1px solid red">
    <zzTree :treeData="d"
            :config="config"
            @nodeExpand="nodeExpand"
            @nodeSelect="nodeSelect"
            @nodeCheck="nodeCheck"
            >
      <div slot="myIcon">
        <icon />
      </div>
      <div slot="abc">
        <icon1 />
      </div>
    </zzTree>

  </div>
</div>
</template>
<script>

import zzTree from '@/components/zzTree/zzTree.js'
import { d } from './t.js'

import icon from './icon.vue'
import icon1 from './icon1.vue'

export default {
  name: "demo",
  components: {
    zzTree,
    icon,
    icon1
  },
  created() {
    this.arr = []
    for (let i = 0; i < 1000; i++) {
      this.arr.push(i)
    }
  },
  data() {
    return {
      d: d,
      // test
      arr: [],
      checked: undefined,
      // test end

      config: {
        // defaultExpandAll: true,
        checkable: true,
        // replaceFields: {
        //   name: 'title',
        //   id: 'nodeId',
        //   children: 'subItems'
        // },
        // checkRelation: {
        //   Y: 'parent,children',
        //   N: 'parent,children'
        // },
        // async: false,
        // asyncCallback: () => {
        //   console.error('-----------------------inside asyncCallback')
        //   return new Promise(resolve => {
        //     setTimeout(() => {
        //       const data = [
        //         {
        //           title: '随机名称',
        //           nodeId: new Date().getTime() + Math.random(),
        //           isLeafNode: Math.random() > 0.5
        //         },
        //         {
        //           title: '非叶子节点',
        //           nodeId: new Date().getTime() + Math.random(),
        //           isLeafNode: false
        //         },
        //         {
        //           title: '叶子节点',
        //           nodeId: new Date().getTime() + Math.random(),
        //           isLeafNode: true
        //         }
        //       ]
        //       resolve(data)
        //     }, 2000)
        //   })
        // }
      },

      simpleTreeData: [
        {
          name: '水果',
          label: 'test',
          id: '1',
          children: [
            {
              name: '热带水果',
              id: '1-1',
              children: [
                {
                  name: '菠萝',
                  id: '1-1-1'
                },
                {
                  name: '凤梨',
                  id: '1-1-2'
                }
              ]
            },
            {
              name: '温带水果',
              id: '1-2',
              children: [
                {
                  name: '苹果',
                  id: '1-2-1'
                },
                {
                  name: '杏子',
                  id: '1-2-2'
                }
              ]
            }
          ]
        },
        {
          name: '服装',
          id: '2',
          children: [
            {
              name: '上衣',
              id: '2-1'
            },
            {
              name: '裤子',
              id: '2-2'
            }
          ]
        }
      ],
      asyncData: [
        {
          title: '第一级',
          nodeId: '1',
          isLeafNode: false,
          subItems: [
            // {
            //   title: '随机名称',
            //   nodeId: new Date().getTime() + Math.random(),
            //   isLeafNode: Math.random() > 0.5
            // },
            // {
            //   title: '非叶子节点',
            //   nodeId: new Date().getTime() + Math.random(),
            //   isLeafNode: false
            // },
            // {
            //   title: '叶子节点',
            //   nodeId: new Date().getTime() + Math.random(),
            //   isLeafNode: true
            // }
          ]
        }
      ],
      replaceFieldsData: [
        {
          title: '水果',
          label: 'test',
          nodeId: '1',
          iconSlotName: 'myIcon',
          iconValue: '1',
          subItems: [
            {
              title: '热带水果',
              nodeId: '1-1',
              dwType: 'A',
              subItems: [
                {
                  title: '菠萝',
                  nodeId: '1-1-1',
                  dwType: '2',
                  subItems: [
                    {
                      title: '红色菠萝',
                      nodeId: '1-1-1-1',
                      dwType: '1',
                      subItems: [
                        {
                          title: '红色菠萝11111111111111111111111',
                          nodeId: '1-1-1-1-1',
                          isLeafNode: true
                        }
                      ]
                    },
                    {
                      title: '换色菠萝',
                      nodeId: '1-1-1-2',
                      dwType: 'A',
                      isLeafNode: true
                    }
                  ]
                },
                {
                  title: '凤梨',
                  nodeId: '1-1-2',
                  dwType: '2',
                  isLeafNode: true
                }
              ]
            },
            {
              title: '温带水果',
              nodeId: '1-2',
              subItems: [
                {
                  title: '苹果',
                  nodeId: '1-2-1'
                },
                {
                  title: '杏子',
                  nodeId: '1-2-2'
                }
              ]
            }
          ]
        },
        {
          title: '服装',
          nodeId: '2',
          subItems: [
            {
              title: '上衣',
              nodeId: '2-1',
              operate: []
            },
            {
              title: '裤子',
              nodeId: '2-2'
            }
          ]
        },
        {
          title: '首饰',
          nodeId: '3',
          subItems: [],
          operate: [
            {
              title: '新增',
              callback: (event, node) => {
                console.log('inside add')
                return new Promise(resolve => {
                  resolve()
                })
              }
            },
            {
              title: '自定义',
              callback: (event, node) => {
                return new Promise(resolve => {
                  this.testM()
                  resolve('inside self')
                })
              }
            }
          ]
        },
        {
          title: '需要测试一段很长很长的文字来验证可以符合需要的正常显示全部信息',
          nodeId: '3',
          iconSlotName: 'abc',
          subItems: [],
          operate: [
            {
              title: '新增',
              callback: (event, node) => {
                console.log('inside add')
                return new Promise(resolve => {
                  resolve()
                })
              }
            },
            {
              title: '自定义',
              callback: (event, node) => {
                return new Promise(resolve => {
                  this.testM()
                  resolve('inside self')
                })
              }
            }
          ]
        }
      ]
    };
  },
  methods: {
    testM () {
      console.error('inside testM')
      this.replaceFieldsData = [
        {
          title: '服装',
          label:'test',
          nodeId: '2',
          subItems: [
            {
              title: '上衣',
              nodeId: '2-1',
              operate: []
            },
            {
              title: '裤子',
              nodeId: '2-2'
            }
          ]
        }
      ]
      this.$forceUpdate()
    },
    changeChecked() {
      this.checked = !this.checked;
    },
    nodeExpand(expandedKeys, {expanded, node}) {
      console.error('---------nodeExpand-------')
      console.log(expandedKeys);
      console.log(expanded)
      console.log(node)
    },
    nodeSelect(selectedKey, {selected, node}) {
      console.error('---------nodeSelect-------')
      console.log(selectedKey);
      console.log(selected)
      console.log(node)
    },
    nodeCheck(checkedKeys, {checked, checkedNodes, node, event}) {
      console.error('---------nodeCheck-------')
      console.log(checkedKeys)
      console.log(checked)
      console.log(checkedNodes)
      console.log(node)
      console.log(event)
    }
  },
};
</script>

<style scoped lang="less">
#container {
  width: 240px;
}
</style>
