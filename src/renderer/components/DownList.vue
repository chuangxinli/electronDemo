<template>
    <div style="float: right">
        <el-button type="primary" size="small" class="mLeft20" @click="taskDialogVisible = !taskDialogVisible">
            查看下载任务
        </el-button>
        <!--下载任务列表弹框-->
        <el-dialog
                title="提示"
                :visible.sync="taskDialogVisible"
                width="60%"
                center>
            <div>
                <el-table
                        :data="downList"
                        border
                        style="width: 100%">
                    <el-table-column
                            type="index"
                            width="50">
                    </el-table-column>
                    <el-table-column
                            property="name"
                            label="报告名称">
                    </el-table-column>
                    <el-table-column
                            :formatter="getType"
                            label="报告类型">
                    </el-table-column>
                    <el-table-column
                            :formatter="getStatus"
                            label="任务状态">
                    </el-table-column>
                    <el-table-column
                            label="操作"
                            width="100">
                        <template slot-scope="scope">
                            <el-button type="text" size="small">删除该任务</el-button>
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
        data() {
            return {
                taskDialogVisible: false
            }
        },
        mounted(){
            console.log(this.downList)
        },
        methods:{
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
                }
            }
        }
    }
</script>

<style scoped>

</style>