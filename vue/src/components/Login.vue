<template>
  <div>
    用户名： <input type="text" v-model="userName" />

    <br />

    密码： <input type="password" v-model="password" />

    <br />

    <input type="button" value="登录" @click="login()" />
  </div>
</template>

<script>
import utils from '@/utils'

export default {
    name: 'login',
    data() {
        return {
            userName: '',
            password: ''
        }
    },
    methods: {
        login() {
            const params = {
                userName: this.userName,
                password: this.password
            }
            if (utils.checkLogin(params)) {
                this.$router.push('/main');
            }
        }
    }
}
</script>

<style scoped>

</style>
