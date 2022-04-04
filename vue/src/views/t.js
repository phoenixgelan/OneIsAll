// let treeData = [
//     {
//         name: '水果',
//         id: '1',
//         children: []
//     },
//     {
//         name: '蔬菜',
//         id: '2',
//         children: []
//     }
// ]

// for (let i = 0; i < 10000; i++) {
//     treeData[0].children.push({
//         name: '0000' + i,
//         id: '0000' + i
//     });
//     treeData[1].children.push({
//         name: '1111' + i,
//         id: '1111' + i
//     })
// }

const createN = (baseId, id) => {
  return {
    id: baseId + '+' + id,
    name: baseId + '+' + id
  }
}

const createNode = (amount = 1, level = 1, baseId) => {
  if (level <= 0) {
    return []
  }
  const result = []
  const newLevel = level - 1
  for (let i = 0; i < amount; i++) {
    const node = createN(baseId, i)
    const children = createNode(amount, newLevel, baseId + '-' + i)
    node.children = children
    result.push(node)
  }
  return result
}

let arr = createNode(200, 2, 'a');

arr = [
  {
    name: 'aaa',
    id: 'aaa',
    children: arr
  }
]

export const d = arr;