<template>
<div>
  <h1>tree</h1>
  <!-- <icon /> -->
  <div id="container">
      <zzTree :treeData="simpleTreeData">
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
      simpleTreeData: [
        {
          name: '水果',
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
