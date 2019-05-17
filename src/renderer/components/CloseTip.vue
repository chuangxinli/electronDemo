<template>
    <div>
        <el-dialog
                title="友情提示"
                :visible.sync="closeTipDialogVisible"
                width="400px"
                center>
            <div class="closeTip">
                <span v-show="showTip == 1">关闭客户端，报告下载任务被终止并且当前的下载记录将会删除，请慎重考虑！</span>
                <span v-show="showTip == 2">检测到还有下载失败的报告没有处理，真的要关闭吗？</span>
                <span v-show="showTip == 3">确认要退出客户端吗？</span>
            </div>
            <span slot="footer" class="dialog-footer">

                <el-button @click="closeTipDialogVisible = false" size="small">取 消</el-button>

                <el-button type="primary" @click="confirmClose" size="small" v-show="showTip == 1 || showTip == 2">继续关闭</el-button>
                <el-button type="primary" @click="confirmClose" size="small" v-show="showTip == 3">确认</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    const {ipcRenderer} = require('electron')
    export default {
        data() {
            return {
                closeTipDialogVisible: false,
                showTip: 1
            }
        },
        mounted() {
            ipcRenderer.on('close', (data) => {
                for(let i = 0, len = this.global.downTaskList.length; i < len ; i++){
                    if((this.global.downTaskList[i].gradeReportInfo.gradeReportList && this.global.downTaskList[i].gradeReportInfo.gradeReportList.length > 0 && !this.global.downTaskList[i].gradeReportInfo.isComplete) || (this.global.downTaskList[i].classReportInfo.classReportList && this.global.downTaskList[i].classReportInfo.classReportList.length > 0 && !this.global.downTaskList[i].classReportInfo.isComplete) || (this.global.downTaskList[i].classPersonReportList && this.global.downTaskList[i].classPersonReportList.length > 0 && !this.global.downTaskList[i].classPersonReportList[0].isComplete) || (this.global.downTaskList[i].singlePersonInfo.singlePersonList && this.global.downTaskList[i].singlePersonInfo.singlePersonList.length > 0 && !this.global.downTaskList[i].singlePersonInfo.isComplete)){
                        this.showTip = 1
                        this.closeTipDialogVisible = true
                        return
                    }
                }
                if(this.global.errReportList.length > 0){
                    this.showTip = 2
                    this.closeTipDialogVisible = true
                    return
                }else{
                    this.showTip = 3
                    this.closeTipDialogVisible = true
                    return
                }
            })
        },
        methods: {
            confirmClose() {
                ipcRenderer.send('master-close')
            }
        }
    }
</script>

<style scoped>
    .closeTip{
        text-indent: 30px;
        line-height: 30px;
    }
</style>