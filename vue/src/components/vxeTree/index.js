import "./index.less";

export default {
    name: 'vxeTree',
    props: {
        treeData: {
            type: Array,
            default: () => []
        },
        config: {
            type: Object,
            default: () => {}
        },
        height: {
            type: Number,
            default: 400
        }
    },
    computed: {
        fullConfig() {
            const defaultConfig = {
                asyncNeeded: false,
                asyncCallback: () => {},

                checkable: false,
                checkRelation: {
                    Y: 'parent,children',
                    N: 'parent,children'
                },
                defaultExpandAll: false,
                replaceFields: {
                    name: 'name',
                    id: 'id',
                    children: 'children'
                }
            }
            return Object.assign({}, defaultConfig, this.config)
        },
        Y () {
            const checkRelation = this.fullConfig.checkRelation
            return checkRelation.Y ? checkRelation.Y.split(',').map(i => i.trim()) : []
        },
        N () {
            const checkRelation = this.fullConfig.checkRelation
            return checkRelation.N ? checkRelation.N.split(',').map(i => i.trim()) : []
        }
    },
    data() {
        return {
            oldBeginIndex: 0,
            allNodesArr: [],
            allNodesObj: {},
            visibleNodesArr: [],
            totalVisibleAmount: 0,

            treeNodes: [],
            // nodeAmount: 10,
            containerHeight: 0, // 容器的总高度
            nodeHeight: 24, // 每个节点的高度
            visibleAmount: 0, // 可视区域内节点的数量
            bodyMarginTop: 0, // 顶部margin
            bodyMarginBottom: 1000 // 底部margin
        }
    },
    created() {
        if (this.treeData.length === 0) {
            // TODO 此处添加空数据的逻辑
            return
        }

        // Mounted中可能需要获取第一项的高度值 TODO
        this.treeNodes = this.treeData.slice(0, 1)
        this.getAllNodes(this.treeData)
        console.log(this.allNodesArr)
    },
    mounted() {
        const height = document.querySelector('.vxe-tree-content').clientHeight
        this.containerHeight = height

        let itemHeight;
        const dom = document.querySelector('.vxe-tree-body').children
        if (dom && dom[0].clientHeight) {
            itemHeight = dom[0].clientHeight
        }
        this.nodeHeight = itemHeight

        if (height && itemHeight) {
            // 小数部分向上取整
            this.visibleAmount = Number((height / itemHeight).toFixed(0)) + 1
        }

        let temp = 0
        this.treeNodes = this.allNodesArr.filter(item => {
            return item._visible && temp++ < this.visibleAmount
        })

        this.calculateMargin(0)
    },
    methods: {
        /**
         * 遍历全部数据，生成数组格式和对象格式的信息，方便数据操作处理
         * TODO proxy代替clone?
         * @param {Array<Object>} arr 树的节点信息
         * @param {Number} level 节点位于树的第几层
         * @param {String} parentId 父节点ID值
         */
        getAllNodes(arr, level = 0, parentId) {
            const {
                replaceFields: {id, children},
                asyncNeeded,
                defaultExpandAll
             } = this.fullConfig

            for (let i = 0; i < arr.length; i++) {
                const item = arr[i]
                const _id = item[id]
                const _children = item[children]

                item._level = level
                item._visible = (asyncNeeded && !item.isLeafnode) || (!asyncNeeded && (this.fullConfig.defaultExpandAll || level === 0))
                item._parentId = parentId
                item._checkState = ''
                // item._hasChildren = _children && _children.length > 0
                item._expanded = defaultExpandAll && !asyncNeeded

                this.allNodesArr.push(item)
                this.allNodesObj[_id] = item

                if (_children && _children.length > 0) {
                    this.getAllNodes(_children, (level + 1), _id)
                }
            }
        },

        calculateMargin(scrollTop) {
            let marginTop = scrollTop

            const visibleNodes = this.allNodesArr.filter(item => item._visible === true)
            const visibleNodesHeight = visibleNodes.length * this.nodeHeight

            let nodesHeight = this.containerHeight

            let temp = visibleNodesHeight - nodesHeight
            if (temp < 0) { temp = 0} // 节点全部显示的时候，没有占全全部租的可视区域

            marginTop = Math.min(scrollTop, temp)

            let marginBottom = visibleNodesHeight - nodesHeight - marginTop
            if (marginBottom < 0) {
                marginBottom = 0;
            }

            this.bodyMarginTop = marginTop
            this.bodyMarginBottom = marginBottom
        },

        /**
         * 滚动事件
         */
        eventScroll(e) {
            const {
                scrollTop
            } = e.target;

            this.calculateMargin(scrollTop)

            const beginIndex = Number((scrollTop / this.nodeHeight).toFixed(0))
            this.oldBeginIndex = beginIndex
            this.reSetTreeNodes(beginIndex)
        },

        reSetTreeNodes(beginIndex) {
            let temp = 0
            let arr = []
            for (let i = 0, length = this.allNodesArr.length; i < length; i++) {
                let item = this.allNodesArr[i]
                if (item._visible) {
                    temp++
                }
                if (temp >= beginIndex && item._visible) {
                    arr.push(this.allNodesArr[i])
                    if (arr.length > this.visibleAmount) {
                        break;
                    }
                }
            }
            this.$set(this, 'treeNodes', arr)
        },

        hideNodes(arr) {
            const { children } = this.fullConfig.replaceFields
            arr.forEach(item => {
                item._visible = false
                item._expanded = false
                if (item[children] && item[children].length > 0) {
                    this.hideNodes(item[children])
                }
            })
        },

        checkChildrenNodes(arr, checkState) {
            const { children: _children } = this.fullConfig.replaceFields
            arr.forEach(item => {
                const checkFlag = this.Y.includes('children') && ['halfChecked', 'checked'].includes(checkState)
                const uncheckFlag = this.N.includes('children') && checkState === ''
                if (checkFlag || uncheckFlag) {
                    item._checkState = checkState;
                }

                item[_children] && item[_children].length > 0 && this.checkChildrenNodes(item[_children], checkState)
            })
        },

        checkParentNodes(currentNode) {
            const {
                _parentId,
            } = currentNode

            const {
                children: _children
            } = this.fullConfig.replaceFields

            // 获取父节点
            if (!_parentId) return
            const parentNode = this.allNodesObj[_parentId]
            const children = parentNode[_children]

            let isSomeNodeChecked = false; // 所有子节点中，是不是有一个节点是勾选状态
            let isSomeNodeUnchecked = false; // 所有子节点中，是不是有一个节点是未勾选状态
            let isSomeNodeHalfchecked = false; // 所有子节点中，是不是有一个节点是半勾选状态
            for (let i = 0, length = children.length; i < length; i++) {
                // const checked = children[i]._checkState === 'checked' // || children[i]._checkState === 'halfChecked'
                // if (checked) {
                //     isSomeNodeChecked = true
                // } else {
                //     isSomeNodeUnchecked = true
                // }
                children[i]._checkState === 'checked' && (isSomeNodeChecked = true)
                children[i]._checkState === 'halfChecked' && (isSomeNodeHalfchecked = true)
                children[i]._checkState === '' && (isSomeNodeUnchecked = true)
                if (isSomeNodeChecked && isSomeNodeUnchecked && isSomeNodeHalfchecked) break;
            }

            if ((!isSomeNodeChecked && !isSomeNodeHalfchecked) && this.N.includes('parent')) { // 子节点都未勾选
                parentNode._checkState = ''
            } else if ((!isSomeNodeUnchecked && !isSomeNodeHalfchecked) && this.Y.includes('parent')) { // 子节点都勾选
                parentNode._checkState = 'checked'
            } else {
                if (this.Y.includes('parent')){
                    parentNode._checkState = 'halfChecked'
                }
            }

            this.checkParentNodes(parentNode)
        },

        nodeCheck(node) {
            const {
                children: _children
            } = this.fullConfig.replaceFields
            const _checkState = node._checkState || ''

            let checkState;
            // 勾选状态，点击，变为未勾选状态
            // 半勾选状态，点击，变为勾选状态
            // 未勾选状态，点击，变为勾选状态
            if (_checkState === '' || _checkState === 'halfChecked') {
                checkState = 'checked'
            } else {
                checkState = ''
            }

            node._checkState = checkState

            if (this.Y.includes('children') || this.N.includes('children')) {
                this.checkChildrenNodes(node[_children], checkState)
            }

            if (this.Y.includes('parent') || this.N.includes('parent')) {
                this.checkParentNodes(node)
            }

            this.$forceUpdate();
        },

        nodeExpand(node) {
            const {
                replaceFields: {
                    id: _id,
                    children: _children
                },
                asyncNeeded,
                asyncCallback
             } = this.fullConfig

            if (asyncNeeded && !node.hasAsync) {

                node._ajaxing = true
                this.$forceUpdate()

                asyncCallback(node).then(data => {

                    // 处理新增的值
                    const level = node._level + 1
                    const visible = true
                    const parentId = node[_id]
                    const checkState = node.checkState === 'checked' ? 'checked': ''
                    const expanded = false

                    data.forEach(item => {
                        item._level = level;
                        item._visible = visible
                        item._parentId = parentId
                        item._checkState = checkState
                        item._expanded = expanded

                        const id = item[_id]
                        this.allNodesObj[id] = item
                    })


                    this.bodyMarginBottom += data.length * this.nodeHeight

                    console.log(this.bodyMarginBottom)

                    const index = this.allNodesArr.findIndex(item => item[_id] === node[_id])
                    this.allNodesArr.splice(index + 1, 0, ...data) // TODO 这个操作会不会耗时

                    // console.log(this.allNodesArr)
                    // console.log(this.allNodesObj)


                    // const treeNodes = this.treeNodes
                    const i = this.treeNodes.findIndex(item => item[_id] === node[_id])

                    console.log(this.treeNodes)

                    this.treeNodes.splice(i + 1, 0, ...data)
                    this.treeNodes.length = this.visibleAmount

                    node._ajaxing = false
                    node._expanded = true
                    node.hasAsync = true
                    node[_children] = data

                    this.$forceUpdate()

                    // let temp = 0
                    // let indexTemp = 0
                    // this.treeNodes = this.allNodesArr.filter((item, index) => {
                    //     return item._visible && temp++ < this.visibleAmount
                    // })

                    // console.log(this.oldBeginIndex)

                    // this.calculateMargin(this.oldBeginIndex)
                }).catch(e => {
                    node._ajaxing = false
                    console.error(e)
                }) 
                return
            }

            const isExpanded = !!node._expanded
            const id = node[_id]
            const children = this.allNodesObj[id][_children]

            // 展开当前节点
            if (!isExpanded) {
                children.forEach(item => {
                    item._visible = !isExpanded
                })
            } else { // 收起当前节点
                this.hideNodes(children)
            }


            node._expanded = !node._expanded

            const beginIndex = this.bodyMarginTop / this.nodeHeight
            this.reSetTreeNodes(beginIndex)
        },

        nodeClick() {
            console.error('nodeClick')
        },

        createNode(node, h) {
            const { 
                replaceFields: { name, children: _children },
                checkable,
                asyncNeeded
             } = this.fullConfig

             console.log(node)

            const showSwitcher = node[_children] && node[_children].length > 0 || (asyncNeeded && !node.isLeafnode)
            return h(
                'div', {
                    on: {
                        // click: this.nodeClick
                    },
                    class: 'vxe-tree-node',
                    style: {
                        'padding-left': (node._level * 20 + 10) + 'px',
                        'height': '30px'
                    }
                },
                [
                    showSwitcher && h(
                        'span', {
                            class: [
                                'vxe-tree-switcher',
                                node._ajaxing ? 'ajaxing' : '',
                                node._expanded ? 'expanded' : ''
                            ],
                            on: {
                                click: (e) => this.nodeExpand(node, e)
                            }
                        },
                        []
                    ),
                    checkable && h(
                        'div', 
                        {
                            class: [
                                'checkbox',
                                node._checkState
                            ],
                            on: {
                                click: e => this.nodeCheck(node, e)
                            }
                        }
                    ),
                    node.iconSlotName && this.$slots[node.iconSlotName],
                    h(
                        'span',
                        {
                            class: ['vxe-tree-node-name'],
                            style: {
                                cursor: 'pointer'
                            },
                            on: {
                                click: e => this.nodeClick(node, e)
                            }
                        },
                        node[name]
                    )
                ]
            )
        },
        createNodes(arr, h) {
            const resultArr = arr.map(item => {
                return this.createNode(item, h)
            })
            return [...resultArr]
        }
    },
    render(h) {
        return h(
            'div', {
                class: ['vxe-tree'],
                style: {
                    border: '1px solid red',
                },

            },
            [
                h(
                    'div', {
                        class: ['vxe-tree-content'],
                        style: {
                            height: `${this.height}px`,
                            overflow: 'auto',
                        },
                        on: {
                            scroll: e => this.eventScroll(e, true)
                        }
                    },
                    [
                        h(
                            'div', {
                                class: ['vxe-tree-body'],
                                style: {
                                    height: '400px',
                                    'margin-top': `${this.bodyMarginTop}px`,
                                    'margin-bottom': `${this.bodyMarginBottom}px`,
                                    border: '1px solid green'
                                },
                            },
                            [this.createNodes.call(this, this.treeNodes, h)]
                        )
                    ]
                )
            ]
        )
    }
}