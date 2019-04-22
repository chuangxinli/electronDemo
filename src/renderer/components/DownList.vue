<template>
    <div class="inlineBlock">
        <el-button type="primary" size="small" class="mLeft20" @click="taskDialogVisible = !taskDialogVisible">
            <span>查看下载任务</span>
            <span v-show="checkDownTask">(暂无任务)</span>
            <span v-show="!checkDownTask">(正在下载...)</span>
        </el-button>
        <!--下载任务列表弹框-->
        <el-dialog
                title="当前下载任务列表"
                :visible.sync="taskDialogVisible"
                width="60%"
                center>
            <div>
                <div v-show="downList.length > 0" class="taskTip">
                    <span>下载任务是否已经全部完成：</span>
                    <span v-show="checkDownTask">是</span>
                    <span v-show="!checkDownTask">否</span>
                </div>
                <ul class="taskTable taskTableSup">
                    <li class="thead">
                        <div class="parent">
                            <div class="child">
                                <span>任务名称</span>
                            </div>
                        </div>
                        <div class="parent">
                            <div class="child">
                                <span>任务类型</span>
                            </div>
                        </div>
                        <div class="parent">
                            <div class="child">
                                <span>任务状态</span>
                            </div>
                        </div>
                        <div class="parent">
                            <div class="child">
                                <span>操作</span>
                            </div>
                        </div>
                    </li>
                    <div v-show="downList.length == 0" class="noDataTip"><span>暂无任务</span></div>
                    <li v-for="item,index in downList" v-show="item.isShow" class="tbody">
                        <div class="parent">
                            <i class="el-icon-arrow-right pointer" v-show="item.children && item.children.length > 0 && !item.isOpen" @click="handleIsOpen(item)" title="点击展开"></i>
                            <i class="el-icon-arrow-down pointer
" v-show="item.children && item.children.length > 0 && item.isOpen" @click="handleIsOpen(item)" title="点击关闭"></i>
                            <span :title="item.name">{{item.name}}</span>
                        </div>
                        <div class="parent">
                            <span>{{getType(item)}}</span>
                        </div>
                        <div class="parent">
                            <span>{{getStatus(item)}}</span>
                        </div>
                        <div class="parent">
                            <span v-show="item.status == 3 && !item.children" @click="goCheck(index)" class="success pointer">本地查看</span>
                            <span v-show="item.status == 3 && !item.children" @click="noShow(index)" class="success pointer">不再显示</span>
                            <span v-show="item.status == 1 && !item.children" @click="deleteTask(index)" class="danger pointer">删除任务</span>
                            <span v-show="item.status == 2 || item.children">&#45;&#45;&#45;&#45;&#45;&#45;</span>
                        </div>
                        <ul v-show="item.children && item.children.length > 0 && item.isOpen" class="taskTable taskTableSub">
                            <li v-for="subItem,subIndex in item.children" v-show="subItem.isShow" class="tbody subTbody">
                                <div class="parent">
                                    <span :title="subItem.name">{{subItem.name}}</span>
                                </div>
                                <div class="parent">
                                    <span>{{getType(subItem)}}</span>
                                </div>
                                <div class="parent">
                                    <span>{{getStatus(subItem)}}</span>
                                </div>
                                <div class="parent">
                                    <span v-show="subItem.status == 3" @click="goCheck(index, subIndex)" class="success pointer">本地查看</span>
                                    <span v-show="subItem.status == 3" @click="noShow(index, subIndex)" class="success pointer">不再显示</span>
                                    <span v-show="subItem.status == 1" @click="deleteTask(index, subIndex)" class="danger pointer">删除任务</span>
                                    <span v-show="subItem.status == 2">&#45;&#45;&#45;&#45;&#45;&#45;</span>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    const {shell} = require('electron').remote
    const fs = require('fs')
    export default {
        data() {
            return {
                taskDialogVisible: false,
                downList: []
            }
        },
        created(){
            this.downList = this.global.downTaskList
        },
        computed: {
            checkDownTask() {
                //检测任务列表中需要下载的报告是否已经下载完毕
                for(let i = 0, len = this.downList.length; i < len; i++){
                    if(this.downList[i].isDown && [1, 2, 5, 6].includes(this.downList[i].status)){
                        //说明还有下载任务正在进行
                        console.log(false)
                        this.global.siDownTaskComplete = false
                        return false
                    }
                }
                this.global.isDownTaskComplete = true
                console.log(true)
                return true
            }
        },
        methods: {
            deleteTask(index, subIndex) {
                if(index != undefined && subIndex != undefined){
                    this.global.downTaskList[index].children[subIndex].isDown = false
                    this.global.downTaskList[index].children[subIndex].isShow = false
                }else{
                    this.global.downTaskList[index].isDown = false
                    this.global.downTaskList[index].isShow = false
                }
            },
            goCheck(index, subIndex) {
                if(index != undefined && subIndex != undefined){
                    shell.openItem(this.global.downTaskList[index].children[subIndex].savePath)
                }else{
                    shell.openExternal(this.global.downTaskList[index].savePath)
                }
            },
            noShow(index, subIndex){
                if(index != undefined && subIndex != undefined){
                    this.global.downTaskList[index].children[subIndex].isShow = false
                }else{
                    this.global.downTaskList[index].isShow = false
                }
            },
            getType(row) {
                if(!row.children){
                    if (row.type == 1) {
                        return '月考个人'
                    } else if (row.type == 2) {
                        return '周测个人'
                    } else if (row.type == 3) {
                        return '周测年级'
                    } else if (row.type == 4) {
                        return '月考年级'
                    } else if (row.type == 5) {
                        return '周测班级'
                    } else if (row.type == 6) {
                        return '月考班级'
                    }
                }else{
                    if (row.type == 1) {
                        return '月考个人（批量任务）'
                    } else if (row.type == 2) {
                        return '周测个人（批量任务）'
                    }
                }
            },
            getStatus(row) {
                if(!row.children){
                    if (row.status == 1) {
                        return '等待下载'
                    } else if (row.status == 2) {
                        return '正在下载'
                    } else if (row.status == 3) {
                        return '下载完成'
                    } else if (row.status == 4) {
                        return '下载失败'
                    } else if(row.status == 5) {
                        return '下载出现异常'
                    } else if(row.status == 6) {
                        return '正在重新下载'
                    }
                }else{
                    return '------'
                }
            },
            handleIsOpen(item){
                console.log(item)
                for(let i = 0, len = this.global.downTaskList.length; i < len; i++){
                    if(item.localId == this.global.downTaskList[i].localId){
                        console.log(item.localId)
                        this.$nextTick(() => {
                            this.global.downTaskList[i].isOpen = !this.global.downTaskList[i].isOpen
                        })
                        return
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .thead{
        background-color: #0188EF;
        color: #ffffff;
    }
    .taskTableSup{
        box-sizing: border-box;
        border: 1px solid #EBEEF5;
    }
    .taskTableSub > li:nth-of-type(1){
        border-top: 1px solid #EBEEF5;
    }
    .taskTable > li{
        width: 100%;
        overflow: hidden;
        border-bottom: 1px solid #EBEEF5;
    }
    .taskTableSub > li:nth-last-of-type(1){
        border-bottom: none;
    }
    .taskTable > li > div:nth-of-type(1) > span{
        cursor: pointer;
    }
    .taskTable > li > div{
        box-sizing: border-box;
        min-height: 30px;
        line-height: 30px;
        float: left;
        width: 25%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-right: 1px solid #EBEEF5;
    }
    .taskTable > li > div:nth-last-of-type(1){
        border-right: none;
    }
    .taskTable > li > .parent{
        text-align: center;
    }
    .success{
        color: #67C23A;
    }
    .warning{
        color: #E6A23C;
    }
    .danger{
        color: #F56C6C;
    }
    .info{
        color: #909399;
    }
    .pointer{
        cursor: pointer;
    }
    .noDataTip{
        height: 30px;
        line-height: 30px;
        text-align: center;
    }
    .taskTip{
        height: 40px;
        line-height: 40px;
    }
</style>