# vxeTree使用

[toc]

---

## 组件使用示例

### 基础使用<div id="basic_demo"></div>

```vue
<template>
<div style="height: 300px; padding: 20px;">
  <ComVxeTree :data="treeData"></ComVxeTree>
</div>
</template>

<script>
export default {
  name: 'demo',
  data () {
    return {
      treeData: [
        {
          name: '水果',
          id: '1',
          children: [
            {
              name: '苹果',
              id: '1-1'
            },
            {
              name: '香蕉',
              id: '1-2'
            }
          ]
        },
        {
          name: '服装',
          id: '2'
        }
      ]
    }
  }
}
</script>
```

![基础使用](./src/images/01_basic_use.png)

### 复选框

```vue
<ComVxeTree :data="treeData"
            :config="treeConfig">
</ComVxeTree>

treeConfig: {
    checkable: true
}
```

#### 节点勾选/取消勾选时，父子节点联动关系

<a href="#config_checkRelation">参数说明</a>

```vue
config: {
    checkable: true,
    checkRelation: {
        Y: 'parent,children',
        N: 'parent,children'
    }
}
```

![复选框](./src/images/02_checkbox.png)

<div id="config_replaceFields"></div>

### 调整数据中的属性名称

```vue
config: {
    replaceFields: {
        name: 'title',
        id: 'key',
        children: 'subItems'
    }
},
treeData: [
    {
        title: '水果',
        key: '1',
        subItems: [
        {
            title: '苹果',
            key: '1-1'
        },
        {
            title: '香蕉',
            key: '1-2'
        }
        ]
    },
    {
        title: '服装',
        key: '2'
    }
]
```

### 默认展开全部节点

```vue
config: {
    defaultExpandAll: true
}
```

### 自定义节点图标

```vue
  <ComVxeTree :data="treeData">
    <div style="display:inline-block;" slot="icon-1">
      <span style="color:red;">aa</span>
    </div>
    <div style="display:inline-block;" slot="icon-2">
      <span style="color:green;">bb</span>
    </div>
  </ComVxeTree>

      treeData: [
        {
          name: '水果',
          id: '1',
          iconSlotName: 'icon-1',
          children: [
            {
              name: '苹果',
              iconSlotName: 'icon-2',
              id: '1-1'
            },
            {
              name: '香蕉',
              iconSlotName: 'icon-2',
              id: '1-2'
            }
          ]
        },
        {
          name: '服装',
          iconSlotName: 'icon-1',
          id: '2'
        }
      ]
```

![自定义节点图标](./src/images/03_slot_icon.png)

#### 兼容公共组件comOrgTree的功能

<div id="config_enableOrgTreeIcon"></div>

```vue
treeConfig: {
    enableOrgTreeIcon: true
},
treeData: [
    {
        name: '1',
        id: '1',
        dwType: '1',
        children: [
        {
            name: '1-1',
            id: '1-1',
            dwType: 'A',
            children: [
            {
                name: '1-1-1',
                id: '1-2',
                dwType: '2'
            }
            ]
        }
        ]
    }
]
```

![兼容公共组件comOrgTree](./src/images/04_ComOrgTree_compatible.png)

#### 搜索功能

```vue
treeConfig: {
  enableOrgTreeIcon: true
}
```

![搜索功能](./src/images/05_search.png)

#### 自定义节点操作

<div id="config_operateList"></div>

```vue
      treeConfig: {
        enableOperate: true,

        // 节点可能有的操作是： 新增、修改、删除
        operateList: [
          {
            name: '新增',
            type: 'add',
            callback: node => {
              this.addNode(node)
            }
          },
          {
            name: '修改',
            type: 'modify',
            callback: node => {
              this.modifyNode(node)
            }
          },
          {
            name: '删除',
            type: 'delete',
            callback: node => {
              this.delNode(node)
            }
          }
        ]
      },

      treeData: [
        {
          name: '水果',
          id: '1',
          operateList: ['add'], // 本节点只有“新增”操作
          children: [
            {
              name: '苹果',
              id: '1-1',
              operateList: [], // 本节点没有自定义操作
              children: [
                {
                  name: '红苹果', // 本节点有默认的全部操作，即“新增”、“修改”、“删除”
                  id: '1-1-1'
                }
              ]
            }
          ]
        }
      ]
```

![节点操作](./src/images/06_operate_list.png)

---

## 参数说明

| 参数名 | 类型           | 说明                                    |
|--------|----------------|-----------------------------------------|
| data   | Array\<Object> | 树的数据 <a href="#basic_demo">示例</a> |
| config | Object         | 树的配置                                |

### data

#### data[i].operateList

<a href="#config_operateList">示例</a>

    节点的自定义操作
    config.operateList 定义了节点所有的可能操作， data[i].operateList 定义了当前节点的操作

### config

默认值：
```
{
    defaultExpandAll: false,

    enableOperate: false,
    operateList: [],

    checkable: false,
    checkRelation: {
        Y: 'parent,children',
        N: 'parent,children'
    },

    replaceFields: {
        name: 'name',
        id: 'id',
        children: 'children'
    }

    enableSearch: false,

    enableSelect: true
}
```

#### config.checkable

    是否显示复选框

类型： `Boolean`
默认值： `false`

#### config.checkRelation

<div id="config_checkRelation"></div>

    存在复选框时，父子节点勾选联动(参考了zTree)

类型： `Object`
默认值：
```
{
    Y: 'parent,children',
    N: 'parent,children'
}
```

`Y` 表示 **勾选** 的情况， `N` 表示 **取消勾选** 的情况

以 `checkRelation.Y` 为例
1. 空字符串表示各个节点在勾选时是独立的，不影响父节点也不影响子节点
2. `children` 表示节点勾选时影响子节点的勾选情况，即勾选本节点后，所有的子节点都勾选上；不影响父节点的勾选情况
3. `parent` 表示节点勾选时影响所有父节点的勾选情况，不影响子节点的勾选情况
4. `parent,children` 表示节点勾选时影响所有的父子节点

#### config.defaultExpandAll

    树在生成的时候是否展开全部节点

类型： `Boolean`
默认值： `false`

#### config.enableOrgTreeIcon

<a href="#config_enableOrgTreeIcon">示例</a>

    兼容ComOrgTree中的功能
    项目使用过程中，公司的组织结构树是经常用到的树结构。这个树结构中节点的图标显示根据数据中的 dwType 来确定，dwType 的值有 1/A/2 三种情况，分别对应具体的三个图标。

类型： `Boolean`
默认值：`false`


#### config.replaceFields

<a href="#config_replaceFields">示例</a>

    替换数据中的参数名称

类型： `Object`
默认值：
```
{
    name: 'name',
    id: 'id',
    children: 'children'
}
```

#### config.enableOperate

    是否展示自定义操作弹窗
    为 true 时与 config.operateList 一起使用

类型： `Boolean`
默认值： `false`

#### config.operateList

<a href="#config_operateList">示例</a>

    自定义操作弹窗的内容
    config.enableOperate为true时，本参数生效

`operateList[i].name` : 显示在页面上的操作名称
`operateList[i].type` : 操作名称，与 `data` 中的 `operateList` 属性配合使用
`operateList[i].callback` : 操作的回调事件

类型： `Array<Object>`
默认值： `[]`


## 事件说明

全部事件
```
<zzTree :treeData="treeData"
        @nodeCheck="nodeCheck"
        @nodeExpand="nodeExpand"
        @nodeSelect="nodeSelect"
        />

methods: {
    nodeCheck(checkedKeys, {checked, checkedNodes, node}){},
    nodeSelect(nodeId, {selected, node}){},
    nodeExpand(nodeId, {expanded, node}){},
}
```

### nodeCheck

    树节点勾选/取消勾选事件

`nodeCheck(checkedKeys, {checked, checkedNodes, node, event}){}`

| 参数名       | 类型           | 说明                     |
| ---          | ---            | ---                      |
| checkedKeys  | Array<String>  | 勾选状态的节点ID的数组   |
| checked      | Boolean        | 当前操作的节点是否勾选   |
| checkedNodes | Array\<Object> | 勾选状态的节点信息的数组 |

### nodeExpand

    config.async为false时， 树节点展开/收起事件

`nodeExpand(nodeId, {expanded, node}){}`

| 参数名   | 类型    | 说明         |
| ---      | ---     | ---          |
| nodeId   | String  | 节点ID       |
| expanded | Boolean | 节点是否展开 |
| node     | Object  | 节点信息     |

### nodeSelect

    节点选中/取消选中事件（点击节点的汉字）
    目前暂不支持同时选中多个节点，如果需要，请使用勾选功能 config.checkable = true

`nodeSelect(nodeId, {selected, node}){}`

| 参数名   | 类型    | 说明                   |
| ---      | ---     | ---                    |
| nodeId   | String  | 节点ID                 |
| selected | Boolean | 当前操作的节点是否选中 |
| node     | Object  | 节点信息               |