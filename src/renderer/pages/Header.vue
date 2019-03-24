<template>
    <div class="header">
        <div class="title">欢迎使用有谱报告下载客户端</div>
        <div class="signOut" @click="signOut()">退出登录</div>
        <div class="user">
            <span>当前用户：{{user}}，当前角色：{{role}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                user: '',
                role: ''
            }
        },
        mounted() {
            this.user = this.global.nickName
            this.role = this.global.roleName
        },
        methods: {
            async signOut() {
                let url = '/logout'
                let params = {
                    sid: this.global.sid
                }
                let data = await this.api.get(url, params)
                if(data){
                    this.$message({
                        message: '退出登录成功！',
                        type: 'success',
                        duration: 2000,
                        showClose: true
                    })
                    this.$router.push({
                        path: '/SignIn'
                    })
                }
            }
        }
    }
</script>

<style scoped>
    .header{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #0188EF;
        height: 60px;
        line-height: 60px;
        color: #ffffff;
        z-index: 999;
    }
    .title{
        float: left;
        margin-left: 20px;
    }
    .user{
        float: right;
        margin-right: 20px;
    }
    .signOut{
        cursor: pointer;
        float: right;
        margin-right: 20px;
    }
</style>