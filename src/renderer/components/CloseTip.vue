<template>
    <div>
        <el-dialog
                title="友情提示"
                :visible.sync="closeTipDialogVisible"
                width="400px"
                center>
            <div class="closeTip">
                关闭客户端，报告下载任务被终止并且当前的下载记录将会删除，请慎重考虑！
            </div>
            <span slot="footer" class="dialog-footer">
            <el-button @click="closeTipDialogVisible = false" size="small">取 消</el-button>
            <el-button type="primary" @click="confirmClose" size="small">继续关闭</el-button>
  </span>
        </el-dialog>
    </div>
</template>

<script>
    const {ipcRenderer} = require('electron')
    export default {
        data() {
            return {
                closeTipDialogVisible: false
            }
        },
        mounted() {
            ipcRenderer.on('close', (data) => {
                this.closeTipDialogVisible = true
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