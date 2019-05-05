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
                        <div class="div_table">
                            <div class="div_tr">
                                <div class="div_td">
                                    <span>任务名称</span>
                                </div>
                                <div class="div_td">
                                    <span>任务类型</span>
                                </div>
                                <div class="div_td">
                                    <span>任务状态</span>
                                </div>
                                <div class="div_td">
                                    <span>操作</span>
                                </div>
                            </div>
                        </div>
                    </li>
                    <div v-show="downList.length == 0" class="noDataTip"><span>暂无任务</span></div>
                    <li v-for="item,index in downList" v-show="item.isShow" class="tbody">
                        <div class="div_table">
                            <div class="div_tr">
                                <div class="div_td">
                                    <i class="el-icon-arrow-right pointer" v-show="item.children && item.children.length > 0 && !item.isOpen" @click="handleIsOpen(index)" title="点击展开"></i>
                                    <i class="el-icon-arrow-down pointer
" v-show="item.children && item.children.length > 0 && item.isOpen" @click="handleIsOpen(index)" title="点击关闭"></i>
                                    <span :title="item.name">{{item.name}}</span>
                                </div>
                                <div class="div_td">
                                    <span>{{getType(item)}}</span>
                                </div>
                                <div class="div_td">
                                    <span>{{getStatus(item)}}</span>
                                </div>
                                <div class="div_td">
                                    <span v-show="item.status == 3 && !item.children" @click="goCheck(index)" class="success pointer">本地查看</span>
                                    <span v-show="item.status == 3" @click="noShow(index)" class="success pointer">不再显示</span>
                                    <span v-show="item.status == 1 && !item.children" @click="deleteTask(index)" class="danger pointer">删除任务</span>
                                    <span v-show="item.status == 2">&#45;&#45;&#45;&#45;&#45;&#45;</span>
                                </div>
                            </div>
                        </div>
                        <ul v-show="item.children && item.children.length > 0 && item.isOpen" class="taskTable taskTableSub">
                            <li v-for="subItem,subIndex in item.children" v-show="subItem.isShow" class="tbody subTbody">
                                <div class="div_table">
                                    <div class="div_tr">
                                        <div class="div_td">
                                            <i class="el-icon-arrow-right pointer" v-show="subItem.children && subItem.children.length > 0 && !subItem.isOpen" @click="handleIsOpen(index, subIndex)" title="点击展开"></i>
                                            <i class="el-icon-arrow-down pointer
" v-show="subItem.children && subItem.children.length > 0 && subItem.isOpen" @click="handleIsOpen(index, subIndex)" title="点击关闭"></i>
                                            <span :title="subItem.name">{{subItem.name}}</span>
                                        </div>
                                        <div class="div_td">
                                            <span>{{getType(subItem)}}</span>
                                        </div>
                                        <div class="div_td">
                                            <span>{{getStatus(subItem)}}</span>
                                        </div>
                                        <div class="div_td">
                                            <span v-show="subItem.status == 3" @click="goCheck(index, subIndex)" class="success pointer">本地查看</span>
                                            <span v-show="subItem.status == 3" @click="noShow(index, subIndex)" class="success pointer">不再显示</span>
                                            <span v-show="subItem.status == 1" @click="deleteTask(index, subIndex)" class="danger pointer">删除任务</span>
                                            <span v-show="subItem.status == 2">&#45;&#45;&#45;&#45;&#45;&#45;</span>
                                        </div>
                                    </div>
                                </div>
                                <ul v-show="subItem.children && subItem.children.length > 0 && subItem.isOpen" class="taskTable taskTableSub">
                                    <li v-for="gradeChildItem,gradeChildIndex in subItem.children" v-show="gradeChildItem.isShow" class="tbody subTbody">
                                        <div class="div_table">
                                            <div class="div_tr">
                                                <div class="div_td">
                                                    <span :title="gradeChildItem.name">{{gradeChildItem.name}}</span>
                                                </div>
                                                <div class="div_td">
                                                    <span>{{getType(gradeChildItem)}}</span>
                                                </div>
                                                <div class="div_td">
                                                    <span>{{getStatus(gradeChildItem)}}</span>
                                                </div>
                                                <div class="div_td">
                                                    <span v-show="gradeChildItem.status == 3" @click="goCheck(index, subIndex, gradeChildIndex)" class="success pointer">本地查看</span>
                                                    <span v-show="gradeChildItem.status == 3" @click="noShow(index, subIndex, gradeChildIndex)" class="success pointer">不再显示</span>
                                                    <span v-show="gradeChildItem.status == 1" @click="deleteTask(index, subIndex, gradeChildIndex)" class="danger pointer">删除任务</span>
                                                    <span v-show="gradeChildItem.status == 2">&#45;&#45;&#45;&#45;&#45;&#45;</span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
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
                    if(this.downList[i].isDown && [1, 2, 5, 6, 7, 8].includes(this.downList[i].status)){
                        //说明还有下载任务正在进行
                        console.log(false)
                        this.global.isDownTaskComplete = false
                        return false
                    }
                }
                this.global.isDownTaskComplete = true
                console.log(true)
                return true
            }
        },
        methods: {
            deleteTask(index, subIndex, gradeChildIndex) {
                if(index != undefined && subIndex != undefined && gradeChildIndex != undefined){
                    this.global.downTaskList[index].children[subIndex].children[gradeChildIndex].isDown = false
                    this.global.downTaskList[index].children[subIndex].children[gradeChildIndex].isShow = false
                }else if(index != undefined && subIndex != undefined){
                    this.global.downTaskList[index].children[subIndex].isDown = false
                    this.global.downTaskList[index].children[subIndex].isShow = false
                }else{
                    this.global.downTaskList[index].isDown = false
                    this.global.downTaskList[index].isShow = false
                }
            },
            goCheck(index, subIndex, gradeChildIndex) {
                if(index != undefined && subIndex != undefined && gradeChildIndex != undefined){
                    console.log(this.global.downTaskList[index].children[subIndex].children[gradeChildIndex].savePath)
                    shell.openExternal(this.global.downTaskList[index].children[subIndex].children[gradeChildIndex].savePath)
                }else if(index != undefined && subIndex != undefined){
                    shell.openItem(this.global.downTaskList[index].children[subIndex].savePath)
                }else{
                    shell.openExternal(this.global.downTaskList[index].savePath)
                }
            },
            noShow(index, subIndex, gradeChildIndex){
                if(index != undefined && subIndex != undefined && gradeChildIndex != undefined){
                    this.global.downTaskList[index].children[subIndex].children[gradeChildIndex].isShow = false
                }else if(index != undefined && subIndex != undefined){
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
                } else if(row.status == 7) {
                    return '正在处理数据'
                } else if(row.status == 8) {
                    return '正在处理数据和图片'
                }
            },
            handleIsOpen(index, subIndex){
                if(index != undefined && subIndex != undefined){
                    this.global.downTaskList[index].children[subIndex].isOpen = !this.global.downTaskList[index].children[subIndex].isOpen
                }else{
                    this.global.downTaskList[index].isOpen = !this.global.downTaskList[index].isOpen
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
    .taskTable > li > .div_table > .div_tr >div:nth-of-type(1) > span{
        cursor: pointer;
    }
    .taskTable > li > .div_table{
        width: 100%;
        display: table;
        table-layout: fixed;
    }
    .taskTable > li > .div_table > .div_tr{
        display: table-row;
    }
    .taskTable > li > .div_table > .div_tr > div{
        box-sizing: border-box;
        min-height: 40px;
        line-height: 30px;
        display: table-cell;
        vertical-align: middle;
        border-right: 1px solid #EBEEF5;
        text-align: center;
        padding: 5px;
        /*float: left;
        width: 25%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;*/
    }
    .taskTable > li > .div_table > .div_tr >div:nth-last-of-type(1){
        border-right: none;
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