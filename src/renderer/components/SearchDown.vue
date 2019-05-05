<template>
   <div class="inlineBlock">
       <el-button type="primary" size="small" @click="searchDialogVisible = true">搜索下载</el-button>
       <!--搜索下载弹框-->
       <el-dialog
               class="searchDialog"
               title="搜索下载"
               :visible.sync="searchDialogVisible"
               width="60%"
               center>
           <div>
               <div class="searchTips">
                   <el-tag size="small">小提示：如果搜索的报告超过两个，每个报告ID用‘；’隔开。例如(209963
                       ；209964；209965)</el-tag>
               </div>
               <div class="searchBox">
                   <el-input placeholder="请输入报告ID" v-model="searchReportIds" class="input-with-select" size="small">
                       <el-button slot="append" icon="el-icon-search" @click="getSearchList"></el-button>
                   </el-input>
               </div>
               <div class="mTop20" v-show="searchList.length > 0">
                   <el-button type="primary" size="small" @click="downSelectReport">下载所选报告</el-button>
               </div>
               <el-table
                       class="mTop20"
                       :data="searchList"
                       border
                       size="small"
                       @selection-change="handleSearchSelectionChange"
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
                           label="报告ID"
                           width="">
                   </el-table-column>
                   <el-table-column
                           align="center"
                           :formatter="getReportType"
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
           </div>
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
            return {
                searchReportIds: '',
                searchDialogVisible: false,
                searchList: [],
                downList: [],
                //报告临时位置
                tempPath: ''
            }
        },
        computed: {
            savePath() {
                return this.$store.state.reportData.savePath
            },
            appPath() {
                return this.$store.state.reportData.appPath
            }
        },
        props: {
            qualityType: {
                type: Number,
                default: 1
            }
        },
        mounted(){
            if (this.appPath.includes('DownloadReport')) {
                this.tempPath = this.appPath.split('DownloadReport')[0] + 'DownloadReport'
            } else {
                this.tempPath = this.appPath.split('electronDemo')[0] + 'electronDemo'
            }
            this.searchList = []
        },
        methods: {
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
                    let subjectName = '', gradeName = '', className = ''
                    if(item.type == 1 || item.type == 2){
                        tempRow.name = item.data.report.cover.studentName + '（报告ID' + tempRow.id + '）'
                        subjectName = item.data.report.cover.subjectName
                        className = item.data.report.cover.className
                    }else if(item.type == 3 || item.type == 4){
                        tempRow.name = item.data.report.cover.gradeName + '（报告ID' + tempRow.id + '）'
                        subjectName = item.data.report.cover.subjectName
                        gradeName = item.data.report.cover.gradename
                    }else if(item.type == 5 || item.type == 6){
                        tempRow.name = item.data.report.covermap.classname + '（报告ID' + tempRow.id + '）'
                        subjectName = item.data.report.covermap.subjectname
                        className = item.data.report.covermap.classname
                        gradeName = item.data.report.covermap.gradename
                    }
                    this.global.downTaskList.push(tempRow)
                    if(this.qualityType == 1){
                        singleScreen([tempRow], {
                            gradeName,
                            subjectName,
                            className,
                            savePath: this.savePath,
                            type: tempRow.type,
                            isBatch: false,  //true是批量下载（下载后会自动整合到一个文件夹）  false不是批量下载直接放在了文件夹的根目录
                            appPath: this.tempPath
                        }, this.global.myEmitter)
                    }else if(this.qualityType == 2){
                        singleNoScreen([tempRow], {
                            gradeName: '',
                            subjectName: '',
                            savePath: this.savePath,
                            type: tempRow.type,
                            isBatch: false,  //true是批量下载（下载后会自动整合到一个文件夹）  false不是批量下载直接放在了文件夹的根目录
                            appPath: this.tempPath
                        }, this.global.myEmitter)
                    }
                })
            },
            getReportType(row){
                if(row.type == 1){
                    return '月考个人报告'
                }else if(row.type == 2){
                    return '周测个人报告'
                }else if(row.type == 3){
                    return '周测年级报告'
                }else if(row.type == 4){
                    return '月考年级报告'
                }else if(row.type == 5){
                    return '周测班级报告'
                }else if(row.type == 6){
                    return '月考班级报告'
                }
            },
            async getSearchList(){
                if(!this.searchReportIds){
                    this.$message({
                        message: '搜索内容不能为空！',
                        type: 'warning',
                        duration: 2000
                    })
                    return
                }
                this.searchList = []
                let arr, that = this
                function getAxiosArr(searchReportIds){
                    let returnArr = []
                    arr = searchReportIds.replace(/；/g,';').split(';')
                    arr.forEach((item) => {
                        returnArr.push(axios.get(`${baseURL}/das/learningreport/getReportContent?id=${item.replace(/[^0-9]/g, '')}`))
                    })
                    return returnArr
                }
                axios.all(getAxiosArr(this.searchReportIds))
                    .then(axios.spread(function (...args) {
                        // 两个请求现在都执行完成
                        console.log(args)
                        args.forEach((item, index) => {
                            console.log(item)
                            if(item.data.report){
                                if(item.data.testType == 2 && item.data.report.covermap && item.data.report.covermap.classname && item.data.report.covermap.classno && item.data.report.covermap.gradename){
                                    item.type = 5
                                }else if(item.data.testType != 2 && item.data.report.covermap && item.data.report.covermap.classname && item.data.report.covermap.classno && item.data.report.covermap.gradename){
                                    item.type = 6
                                }else if(item.data.testType == 2 && item.data.report.cover && item.data.report.cover.studentName){
                                    item.type = 2
                                }else if(item.data.testType != 2 && item.data.report.cover && item.data.report.cover.studentName){
                                    item.type = 1
                                }else if(item.data.testType == 2 && item.data.report.cover && item.data.report.cover.gradeName){
                                    item.type = 3
                                }else if(item.data.testType != 2 && item.data.report.cover && item.data.report.cover.gradeName){
                                    item.type = 4
                                }
                                console.log('item.type:', item.type)
                                item.id = arr[index].replace(/[^0-9]/g, '')
                                that.searchList.push(item)
                            }
                        })
                    }))
            }
        }
    }
</script>

<style scoped>
    .searchBox{
        max-width: 60%;
        margin: auto;
    }
    .searchTips{
        margin: 20px;
        text-align: center;
    }
</style>