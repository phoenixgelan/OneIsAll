<template>
<div>
  <div v-for="item in routerInfo" :key="item.name">
    <router-link :to="item.to">{{ item.name }}</router-link>
  </div>
  <router-view />
</div>
</template>

<script>
export default {
    name: 'mainPage',
    data() {
        return {
            routerInfo: [
                {
                    to: '/keyboard',
                    name: 'keyboard'
                },
                {
                    to: '/transfer',
                    name: 'transfer'
                }
            ]
        }
    }
}
</script>

<style scoped>

</style>
