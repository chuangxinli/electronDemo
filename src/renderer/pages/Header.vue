<template>
    <div class="header" style="-webkit-app-region: drag">
        <div class="title">欢迎使用有谱报告下载助手</div>
        <div class="signOut mLeft40 mRight20" style="position: relative">
            <el-popover
                    placement="bottom"
                    width="160"
                    trigger="click">
                <ul class="popover_box">
                    <li v-show="savePath" @click="openSavePath">
                        <i class="iconfont icon-chakan3"></i>
                        <span>查看下载的报告</span>
                    </li>
                    <li @click="setSavePath">
                        <i class="iconfont icon-shezhi"></i>
                        <span>设置报告下载路径</span>
                    </li>
                    <li @click="signOut">
                        <i class="iconfont icon-qiehuan1"></i>
                        <span>切换账号</span>
                    </li>
                </ul>
                <div slot="reference">
                    <i class="iconfont icon-shezhi4"></i>
                    <span>设置</span>
                </div>
            </el-popover>
        </div>
        <div class="user">
            <i class="iconfont icon-yonghu4"></i>
            <span>{{user}}</span>
        </div>
    </div>
</template>

<script>
    const {shell} = require('electron').remote
    export default {
        data() {
            return {
                user: '',
                role: ''
            }
        },
        computed: {
            savePath() {
                return this.$store.state.reportData.savePath
            }
        },
        mounted() {
            this.user = this.global.nickName + this.global.roleNickName
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
            },
            openSavePath() {
                //shell.openExternal('https://github.com')
                shell.openItem(this.savePath)
            },
            setSavePath(){
                this.$emit('showSetPath')
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
        z-index: 666;
    }
    .title{
        float: left;
        margin-left: 20px;
    }
    .user{
        float: right;
    }
    .signOut{
        cursor: pointer;
        float: right;
    }
    .popover_box li{
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        text-align: left;
        border: 1px solid #ffffff;
        border-radius: 5px;
    }
    .popover_box li i{
        margin-left: 10px;
    }
    .popover_box li span{
        margin-left: 10px;
    }
    .popover_box li:hover{
        color: #ffffff;
        background: #0188EF;
    }
</style>