import Login from '@/components/Login.vue'
import Transfer from '@/components/Transfer.vue'
import Keyboard from '@/components/Keyboard.vue'
import Main from '@/components/Main.vue'
import demoVueTable from '@/views/demo-vxeTable/index.vue'
import vxeTree from '@/views/demo-vxeTree/index.vue'

export const routes = [
    // {
    //     path: '/transfer',
    //     component: Transfer
    // },
    // {
    //     path: '/keyboard',
    //     component: Keyboard
    // },
    {
        path: '/login',
        component: Login,
    },
    {
        path: '/main',
        component: Main,
        children: [
            {
                path: '/transfer',
                component: Transfer
            },
            {
                path: '/keyboard',
                component: Keyboard
            },
        ]
    },
    {
        path: '/',
        component: vxeTree
    },
    // {
    //     path: '/',
    //     component: demoVueTable
    // }
]
