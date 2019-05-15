<template>
    <div class="inlineBlock">
        <el-button type="primary" size="small" class="mLeft20" @click="errorPdfDialogVisible = true">查看下载失败的报告</el-button>
        <div class="mTop20" v-show="searchList.length > 0">
            <el-button type="primary" size="small" @click="downSelectReport">下载所选报告</el-button>
        </div>
        <!--错误报告弹框-->
        <el-dialog
                title="错误报告列表"
                :visible.sync="errorPdfDialogVisible"
                width="60%"
                center>
            <el-table
                    :data="errReportList"
                    border
                    size="small"
                    @selection-change="handlePersonSelectionChange"
                    style="width: 100%">
                <el-table-column
                        align="center"
                        type="index"
                        width="50">
                </el-table-column>
                <el-table-column
                        type="selection"
                        align="center"
                        width="55">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="id"
                        label="报告编号"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="belongTo"
                        label="报告所属"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="subjectName"
                        label="报告学科"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        :formatter="getType"
                        label="报告类型"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        label="操作"
                        width="">
                    <template slot-scope="scope">
                        <el-button @click="downReport(scope.row)" type="text" size="small">下载报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
    const axios = require('axios')
    const {baseURL} = require('@/assets/js/common.js')
    const singleNoScreen = require('@/assets/js/singleNoScreen')
    const singleScreen = require('@/assets/js/singleScreen')
    const uuid = require('uuid/v4')
    export default {
        data(){
            return{
                //错误报告数据
                errorPdfDialogVisible: false,
                searchReportIds: '',
                searchList: [],
                downList: []
            }
        },
        computed: {
            errReportList() {
                return this.$store.state.reportData.errReportList
            }
        },
        methods: {
            handleSearchSelectionChange(val){
                console.log(val)
                this.downList = val
            },
            downReport(row){
                console.log(row)
                if(!(row instanceof Array)){
                    row = [row]
                }
                row.forEach((item) => {
                    let tempRow = {
                        id: item.id,
                        type: item.type,
                        isDown: true,
                        isShow: true,
                        isDelete: false,
                        localId: uuid(),
                        status: 1
                    }
                    this.global.downTaskList.push(tempRow)
                    if(this.qualityType == 1){
                        singleScreen([tempRow], {
                            gradeName: item.gradeName,
                            subjectName: item.subjectName,
                            className: item.className,
                            savePath: this.savePath,
                            type: tempRow.type,
                            isBatch: false,  //true是批量下载（下载后会自动整合到一个文件夹）  false不是批量下载直接放在了文件夹的根目录
                            appPath: this.tempPath
                        }, this.global.myEmitter)
                    }else if(this.qualityType == 2){
                        singleNoScreen([tempRow], {
                            gradeName: item.gradeName,
                            subjectName: item.subjectName,
                            className: item.className,
                            savePath: this.savePath,
                            type: tempRow.type,
                            isBatch: false,  //true是批量下载（下载后会自动整合到一个文件夹）  false不是批量下载直接放在了文件夹的根目录
                            appPath: this.tempPath
                        }, this.global.myEmitter)
                    }
                })
            },
            downSelectReport(){
                if(this.downList.length == 0){
                    this.$message({
                        message: '所选报告不能为空！',
                        type: 'warning',
                        duration: 2000
                    })
                    return
                }
                this.downReport(this.downList)
            },
            getType(row){
                if(row.type == 1){
                    return '月考个人'
                }else if(row.type == 2){
                    return '周测个人'
                }else if(row.type == 3){
                    return '周测年级'
                }else if(row.type == 4){
                    return '月考年级'
                }else if(row.type == 5){
                    return '周测班级'
                }else if(row.type == 6){
                    return '月考班级'
                }
            }
        }
    }
</script>

<style scoped>

</style>