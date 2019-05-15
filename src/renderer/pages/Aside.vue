<template>
    <div class="aside">
        <div class="mTop20"></div>
        <el-menu
                default-active="1"
                class="el-menu-vertical-demo"
                background-color="#333333"
                text-color="#fff"
                active-text-color="#0188EF">
            <el-menu-item index="1" @click="$router.push({path: '/Home/MonthReport'})">
                <i class="iconfont icon-gongzuobaogao self_iconfont"></i>
                <span slot="title">月考报告</span>
            </el-menu-item>
            <el-menu-item index="2" @click="goWeekReport()">
                <i class="iconfont icon-gongzuobaogao1 self_iconfont"></i>
                <span slot="title">周测报告</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
    export default {
        data() {
            return {

            }
        },
        methods: {
            goWeekReport() {
                this.$router.push({path: '/Home/WeekReport'})
            }
        }
    }
</script>

<style scoped>
    .self_iconfont{
        color: #ffffff;
        margin-right: 10px;
    }
    .aside{
        position: fixed;
        left: 0;
        top: 60px;
        width: 200px;
        height: 100%;
        background-color: #333333;
        z-index: 999;
    }
</style>