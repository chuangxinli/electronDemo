<template>
    <div style="float: right">
        <el-button type="primary" size="small" class="mLeft20" @click="taskDialogVisible = !taskDialogVisible">
            查看下载任务
        </el-button>
        <!--下载任务列表弹框-->
        <el-dialog
                title="当前下载任务列表"
                :visible.sync="taskDialogVisible"
                width="60%"
                center>
            <div>
                <el-table
                        :data="downList"
                        border
                        row-key="localId"
                        style="width: 100%">
                    <el-table-column
                            align="center"
                            type="index"
                            width="50">
                    </el-table-column>
                    <el-table-column
                            align="center"
                            property="name"
                            label="报告名称">
                    </el-table-column>
                    <el-table-column
                            align="center"
                            :formatter="getType"
                            label="报告类型">
                    </el-table-column>
                    <el-table-column
                            align="center"
                            :formatter="getStatus"
                            label="任务状态">
                    </el-table-column>
                    <el-table-column
                            label="操作"
                            align="center"
                            width="100">
                        <template slot-scope="scope">
                            <el-button type="text" size="small" @click="deleteTask(scope.row)" v-show="scope.row.status == 1">删除任务</el-button>
                            <el-button type="text" size="small" @click="noShow(scope.row)" v-show="scope.row.status == 3">不再显示</el-button>
                            <el-button type="text" size="small" v-show="scope.row.status == 2">------</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        props: {
            downList: {
                type: Array,
                default: function () {
                    return []
                }
            }
        },
        computed: {
            filterDownList(){
                for(let i = 0, len = this.downList.length; i < len; i++){

                }
            }
        },
        data() {
            return {
                taskDialogVisible: false
            }
        },
        mounted(){
            console.log(this.downList)
        },
        methods:{
            deleteTask(row){
                console.log(row)
                for(let i = 0, len = this.global.downTaskList.length; i < len; i++){
                    if(this.global.downTaskList[i].localId == row.localId){
                        this.global.downTaskList[i].isDown = false
                        this.global.downTaskList[i].isShow = false
                    }else if(this.global.downTaskList[i].children && this.global.downTaskList[i].children.length > 0){
                        console.log(111)
                        for(let j = 0; j < this.global.downTaskList[i].children.length; j++){
                            if(this.global.downTaskList[i].children[j].localId == row.localId){
                                console.log(222)
                                this.global.downTaskList[i].children[j].isDown = false
                                this.global.downTaskList[i].children[j].isShow = false
                            }

                        }
                    }
                }
            },
            noShow(row){
                console.log(row)
                //this.$emit('showChange', row) //或者这种方法
                for(let i = 0, len = this.global.downTaskList.length; i < len; i++){
                    if(this.global.downTaskList[i].localId == row.localId){
                        this.global.downTaskList[i].isShow = false
                    }
                }
            },
            getType(row) {
                if(row.type == 1){
                    return '月考个人'
                } else if (row.type == 2){
                    return '周测个人'
                } else if (row.type == 3){
                    return '周测年级'
                } else if (row.type == 4){
                    return '月考年级'
                } else if (row.type == 5){
                    return '周测班级'
                } else if (row.type == 6){
                    return '月考班级'
                }
            },
            getStatus(row){
                if(row.status == 1){
                    return '等待下载'
                } else if (row.status == 2) {
                    return '正在下载'
                } else if (row.status == 3) {
                    return '下载完成'
                } else if (row.status == 4) {
                    return '下载失败'
                }
            }
        }
    }
</script>

<style scoped>

</style>