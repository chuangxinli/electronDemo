<template>
    <div class="aside">
        <div class="mTop20"></div>
        <el-menu
                default-active="2"
                class="el-menu-vertical-demo"
                background-color="#333333"
                text-color="#fff"
                active-text-color="#ffd04b">
            <el-menu-item index="2" @click="goWeekReport()">
                <i class="el-icon-menu"></i>
                <span slot="title">周测报告</span>
            </el-menu-item>
            <el-menu-item index="4" @click="$router.push({path: '/Home/MonthReport'})">
                <i class="el-icon-setting"></i>
                <span slot="title">月考报告</span>
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