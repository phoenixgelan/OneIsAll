<template>
<div>
  <!-- <h1>tree</h1> -->
  <!-- <icon /> -->
  <div id="container">
    <zzTree :treeData="replaceFieldsData"
            :config="config">
          <div slot="icon">
            <icon />
          </div>
      </zzTree>
  </div>
</div>
</template>
<script>

import zzTree from '@/components/zzTree.js'

import icon from './icon.vue'

export default {
  name: "demo",
  components: {
    zzTree,
    icon
  },
  data() {
    return {
      config: {
        checkable: true,
        replaceFields: {
          name: 'title',
          id: 'nodeId',
          children: 'subItems'
        },
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
      replaceFieldsData: [
                {
          title: '水果',
          label: 'test',
          nodeId: '1',
          subItems: [
            {
              title: '热带水果',
              nodeId: '1-1',
              subItems: [
                  {
                      title: '菠萝',
                      nodeId: '1-1-1'
                  },
                  {
                      title: '凤梨',
                      nodeId: '1-1-2'
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
              nodeId: '2-1'
            },
            {
              title: '裤子',
              nodeId: '2-2'
            }
          ]
        }
      ]
    };
  },
  methods: {

  },
};
</script>

<style scoped lang="less">
#container {
    width: 240px;
}
</style>
