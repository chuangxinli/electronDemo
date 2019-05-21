<template>
    <div>
        <Header @showSetPath="setDialogVisible = true"></Header>
        <div class="main">
            <Aside></Aside>
            <div class="view">
                <div class="viewBbox">
                    <div style="min-height: 600px">
                        <router-view></router-view>
                    </div>
                    <Footer></Footer>
                </div>
            </div>
        </div>
        <!--设置弹框-->
        <el-dialog
                title="设置报告下载路径"
                :visible.sync="setDialogVisible"
                width="600px"
                center>
            <div>
                <div class="savePath">当前报告下载位置：{{savePath ? savePath : '暂无'}}</div>
                <el-button type="primary" class="mTop20" size="small" @click="setSavePath()">设置下载路径</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Header from './Header.vue'
    import Aside from './Aside.vue'
    import Footer from './Footer.vue'
    const {dialog} = require('electron').remote
    export default {
        data() {
            return {
                setDialogVisible: false
            }
        },
        computed: {
            savePath() {
                return this.$store.state.reportData.savePath
            }
        },
        mounted(){

        },
        components: {
            Header,
            Aside,
            Footer
        },
        methods: {
            setSavePath() {
                dialog.showOpenDialog({properties: ['openDirectory']}, (path) => {
                    if (path) {
                        this.$store.dispatch('GET_SAVE_PATH', {savePath: path[0]})
                    }
                })
            }
        }
    }
</script>

<style scoped>
    .main{
        height: 100%;
    }
    .view{
        position: fixed;
        top: 60px;
        left: 200px;
        right: 0;
        bottom: 0;
        z-index: 10;
    }
    .viewBbox{
        padding: 20px;
        height: 100%;
        overflow-y: scroll;
    }
    .savePath{
        min-height: 40px;
        line-height: 40px;
    }
</style>