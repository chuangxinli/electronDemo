<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>周测报告</el-breadcrumb-item>
            <el-breadcrumb-item>学情报告</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="mTop20">
            <span>年级：</span>
            <el-select v-model="selectGradeId" size="small" placeholder="请选择" @change="getTestList()">
                <el-option
                        v-for="item in gradeList"
                        :key="item.gradeCode"
                        :label="item.gradeName"
                        :value="item.gradeCode">
                </el-option>
            </el-select>
            <span class="mLeft20">学科：</span>
            <el-select v-model="selectSubjectId" size="small" placeholder="请选择" class="mRight20"
                       @change="getTestList()">
                <el-option
                        v-for="item in subjectList"
                        :key="item.subjectCode"
                        :label="item.subjectName"
                        :value="item.subjectCode">
                </el-option>
            </el-select>
            <el-button type="primary" @click="getTestList()" size="small">查询</el-button>
        </div>
        <div class="mTop20">
            <el-table
                    :data="testList"
                    border
                    style="width: 100%">
                <el-table-column
                        align="center"
                        type="index"
                        width="50">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="name"
                        label="测试名称"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="id"
                        label="考试ID"
                        width="100">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="publisher"
                        label="发布人"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="publisherTime"
                        label="发布时间"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="testObjectName"
                        label="测试对象"
                        width="100">
                </el-table-column>
                <el-table-column
                        align="center"
                        label="操作"
                        width="300px">
                    <template slot-scope="scope">
                        <el-button @click="showBatchDown(scope.row)" type="text" size="small">批量下载</el-button>
                        <el-button v-show="scope.row.isDown" @click="seeDownProgress(scope.row)" type="text" size="small">查看下载进度</el-button>
                        <el-button v-show="scope.row.isDown" @click="seeErrReport(scope.row)" type="text" size="small">下载失败的报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <paging class="mTop20" :current-page="currentPage" :total-num="total" :page-size="pageSize" @childrenChange="pageChange" v-show="testList && testList.length > 0"></paging>
        <!--批量下载弹框-->
        <el-dialog
                title="提示"
                :visible.sync="allDownDialogVisible"
                width="50%"
                center>
            <h2>请根据需要选择</h2>
            <div v-show="gradeReportList.length == 0 && classReportList.length == 0 && classList.length == 0 && personReportList.length == 0" class="mTop20 noResponseTip">
                数据加载中，请稍等。。。
            </div>
            <div class="allDown" v-show="gradeReportList.length > 0">
                <p class="reportType"><span>年级报告</span></p>
                <el-checkbox :indeterminate="isIndeterminate_grade" v-model="checkAll_grade"
                             @change="handleCheckAllChange_grade">全选
                </el-checkbox>
                <el-checkbox-group v-model="checkedReport_grade" @change="handleCheckedChange_grade">
                    <el-checkbox v-for="item in gradeReportList" :label="item" :key="item.id">{{item.name}}
                    </el-checkbox>
                </el-checkbox-group>

            </div>
            <div class="allDown" v-show="classReportList.length > 0">
                <p class="reportType"><span>班级报告</span></p>
                <el-checkbox :indeterminate="isIndeterminate_class" v-model="checkAll_class"
                             @change="handleCheckAllChange_class">全选
                </el-checkbox>
                <el-checkbox-group v-model="checkedReport_class" @change="handleCheckedChange_class">
                    <el-checkbox v-for="item in classReportList" :label="item" :key="item.id">{{item.name}}
                    </el-checkbox>
                </el-checkbox-group>

            </div>
            <div class="allDown" v-show="classList.length > 0">
                <p class="reportType"><span>个人报告</span></p>
                <el-checkbox :indeterminate="isIndeterminate_person" v-model="checkAll_person"
                             @change="handleCheckAllChange_person">全选
                </el-checkbox>
                <el-checkbox-group v-model="checkedReport_person" @change="handleCheckedChange_person">
                    <el-checkbox v-for="item in classList" :label="item" :key="item.classId">{{item.className}}
                    </el-checkbox>
                </el-checkbox-group>
            </div>
            <div class="allDown" v-show="personReportList.length > 0">
                <p class="reportType"><span>测试对象为个人的个人报告</span></p>
                <el-checkbox :indeterminate="isIndeterminate_singlePerson" v-model="checkAll_singlePerson" @change="handleCheckAllChange_singlePerson">全选
                </el-checkbox>
                <el-checkbox-group v-model="checkedReport_singlePerson" @change="handleCheckedChange_singlePerson">
                    <el-checkbox v-for="item in personReportList" :label="item" :key="item.classId">{{item.name}}
                    </el-checkbox>
                </el-checkbox-group>
            </div>
            <span slot="footer" class="dialog-footer">
        <el-button @click="allDownDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="confirmDown()" size="small">确 定</el-button>
      </span>
        </el-dialog>
        <!--下载任务列表弹框-->
        <el-dialog
                :title="taskTitle"
                :visible.sync="taskDialogVisible"
                width="60%"
                center>
            <div>
                <div class="taskTip">
                    <span class="danger">建议报告未全部下载完之前，不要关闭程序！</span>
                </div>
                <ul class="taskTable" v-if="curDownTask.taskId">
                    <li class="thead">
                        <div class="div_table">
                            <div class="div_tr">
                                <div class="div_td">
                                    <span>报告类型</span>
                                </div>
                                <div class="div_td">
                                    <span>报告名称</span>
                                </div>
                                <div class="div_td">
                                    <span>报告数量</span>
                                </div>
                                <div class="div_td">
                                    <span>下载状态</span>
                                </div>
                            </div>
                        </div>
                    </li>
                    <ul v-if="curDownTask.gradeReportInfo && curDownTask.gradeReportInfo.gradeReportList && curDownTask.gradeReportInfo.gradeReportList.length > 0" class="taskTable">
                        <li>
                            <div class="div_table">
                                <div class="div_tr">
                                    <div class="div_td">
                                        <span>年级报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span>{{gradeName}}{{subjectName}}年级报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="curDownTask.gradeReportInfo.progress == 3">{{curDownTask.gradeReportInfo.allNum}}</span>
                                        <span v-show="curDownTask.gradeReportInfo.progress == 2">正在处理</span>
                                        <span v-show="curDownTask.gradeReportInfo.progress == 1">队列中</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="curDownTask.gradeReportInfo.progress == 3">{{curDownTask.gradeReportInfo.successNum}} / {{curDownTask.gradeReportInfo.allNum}}</span>
                                        <span v-show="curDownTask.gradeReportInfo.errNum && curDownTask.gradeReportInfo.progress == 3">({{curDownTask.gradeReportInfo.errNum}}个失败)</span>
                                        <span v-show="curDownTask.gradeReportInfo.progress == 1">等待下载</span>
                                        <span v-show="curDownTask.gradeReportInfo.progress == 1"
                                              class="danger pointer mLeft20" @click="cancleDownReport('grade')">取消</span>
                                        <span v-show="curDownTask.gradeReportInfo.progress == 2">正在处理</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <ul class="taskTable" v-if="curDownTask.classReportInfo && curDownTask.classReportInfo.classReportList && curDownTask.classReportInfo.classReportList.length > 0">
                        <li>
                            <div class="div_table">
                                <div class="div_tr">
                                    <div class="div_td">
                                        <span>班级报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span>{{gradeName}}{{subjectName}}班级报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="curDownTask.classReportInfo.progress == 3">{{curDownTask.classReportInfo.allNum}}</span>
                                        <span v-show="curDownTask.classReportInfo.progress == 1">队列中</span>
                                        <span v-show="curDownTask.classReportInfo.progress == 2">正在处理</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="curDownTask.classReportInfo.progress == 3">{{curDownTask.classReportInfo.successNum}} / {{curDownTask.classReportInfo.allNum}}</span>
                                        <span v-show="curDownTask.classReportInfo.errNum && curDownTask.classReportInfo.progress == 3">({{curDownTask.classReportInfo.errNum}}个失败)</span>
                                        <span v-show="curDownTask.classReportInfo.progress == 1">等待下载</span>
                                        <span v-show="curDownTask.classReportInfo.progress == 1" class="danger pointer mLeft20" @click="cancleDownReport('class')">取消</span>
                                        <span v-show="curDownTask.classReportInfo.progress == 2">正在处理</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <ul class="taskTable" v-if="curDownTask.classPersonReportList && curDownTask.classPersonReportList.length > 0 && curDownTask.classPersonReportList[0].children && curDownTask.classPersonReportList[0].children.length > 0">
                        <li v-for="item,index in curDownTask.classPersonReportList[0].children">
                            <div class="div_table">
                                <div class="div_tr">
                                    <div class="div_td">
                                        <span>个人报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span>{{gradeName}}{{subjectName}}({{item.className}})个人报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="item.progress == 3">{{item.allNum}}</span>
                                        <span v-show="item.progress == 1">队列中</span>
                                        <span v-show="item.progress == 2">正在处理</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="item.progress == 3">{{item.successNum}} / {{item.allNum}}</span>
                                        <span v-show="item.errNum && item.progress == 3">({{item.errNum}}个失败)</span>
                                        <span v-show="item.progress == 1">等待下载</span>
                                        <span v-show="item.progress == 1" class="danger pointer mLeft20"
                                              @click="cancleDownReport('person', index)">取消</span>
                                        <span v-show="item.progress == 2">正在处理</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <ul class="taskTable" v-if="curDownTask.singlePersonInfo && curDownTask.singlePersonInfo.singlePersonList && curDownTask.singlePersonInfo.singlePersonList.length > 0">
                        <li>
                            <div class="div_table">
                                <div class="div_tr">
                                    <div class="div_td">
                                        <span>个人报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span>{{gradeName}}{{subjectName}}个人报告</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="curDownTask.singlePersonInfo.progress == 3">{{curDownTask.singlePersonInfo.allNum}}</span>
                                        <span v-show="curDownTask.singlePersonInfo.progress == 1">队列中</span>
                                        <span v-show="curDownTask.singlePersonInfo.progress == 2">正在处理</span>
                                    </div>
                                    <div class="div_td">
                                        <span v-show="curDownTask.singlePersonInfo.progress == 3">{{curDownTask.singlePersonInfo.successNum}} / {{curDownTask.singlePersonInfo.allNum}}</span>
                                        <span v-show="curDownTask.singlePersonInfo.errNum && curDownTask.singlePersonInfo.progress == 3">({{curDownTask.singlePersonInfo.errNum}}个失败)</span>
                                        <span v-show="curDownTask.singlePersonInfo.progress == 1">等待下载</span>
                                        <span v-show="curDownTask.singlePersonInfo.progress == 1" class="danger pointer mLeft20" @click="cancleDownReport('singlePerson')">取消</span>
                                        <span v-show="curDownTask.singlePersonInfo.progress == 2">正在处理</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </ul>
            </div>
        </el-dialog>
        <!--错误报告弹框-->
        <el-dialog
                title="错误报告列表"
                :visible.sync="errorPdfDialogVisible"
                width="60%"
                center>
            <div class="mTop20 mBot20" v-show="errReportList.length > 0">
                <el-button type="primary" size="small" @click="downSelectReport">下载所选报告</el-button>
            </div>
            <el-table
                    :data="errReportList"
                    empty-text="暂时没有下载失败的报告"
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
                        :formatter="getErrDownStatus"
                        label="下载状态"
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
    const singleNoScreen = require('@/assets/js/singleNoScreen')
    const singleScreen = require('@/assets/js/singleScreen')
    const batchNoScreen = require('@/assets/js/batchNoScreen')
    const batchScreen = require('@/assets/js/batchScreen')
    const singleNoScreenForSearch = require('@/assets/js/singleNoScreenForSearch')
    const singleScreenForSearch = require('@/assets/js/singleScreenForSearch')
    const {dialog, shell} = require('electron').remote
    export default {
        data() {
            return {
                reportType: 3, //3是周测  6是月考
                gradeList: [],
                selectGradeId: '',
                subjectList: [],
                selectSubjectId: '',
                currentPage: 1,
                pageSize: 10,
                total: 0,
                testList: [],
                //2019-05-15
                //批量下载
                subjectName: '',
                gradeName: '',
                className: '',
                taskId: '',
                subjectId: '',
                gradeReportList: [],
                classReportList: [],
                personReportList: [],
                classList: [],
                classId: '',
                allDownDialogVisible: false,
                //年级报告
                checkAll_grade: false,
                checkedReport_grade: [],
                isIndeterminate_grade: false,
                //班级报告
                checkAll_class: false,
                checkedReport_class: [],
                isIndeterminate_class: false,
                //个人报告
                checkAll_person: false,
                checkedReport_person: [],
                isIndeterminate_person: false,
                //周测中测试对象对个人
                checkAll_singlePerson: false,
                checkedReport_singlePerson: [],
                isIndeterminate_singlePerson: false,
                //任务进度
                taskDialogVisible: false,
                taskName: '',
                curDownTask: {
                    taskId: '',
                    gradeReportInfo: {},
                    classReportInfo: {},
                    classPersonReportList: [],
                    singlePersonInfo: {}
                },
                taskTitle: '',
                //重新下载下载失败的报告所需的数据
                errReportList: [],
                errorPdfDialogVisible: false,
                downErrList: [],
                //针对周测的测试对象
                testObject: ''
            }
        },
        computed: {
            //报告下载存放位置路径
            savePath() {
                return this.$store.state.reportData.savePath
            },
            //客户端.asar文件位置
            appPath() {
                return this.$store.state.reportData.appPath
            },
            //公共文件public文件所在的路径
            dataPath() {
                return this.$store.state.reportData.dataPath
            }
        },
        mounted() {
            this.getSubjectGradeCondition()
        },
        methods: {
            async getSubjectGradeCondition() {
                let url = '/das/weekTest/reportManager/getReportSelectCondition'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    roleId: this.global.roleId,
                    schoolId: this.global.schoolId
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.gradeList = data.gradeCode
                    //暂时去掉全部的选项
                    this.gradeList.unshift({
                        gradeCode: 0,
                        gradeName: '全部'
                    })
                    this.selectGradeId = this.gradeList[0].gradeCode
                    this.subjectList = data.subjectCode
                    //暂时去掉全部的选项
                    this.subjectList.unshift({
                        subjectName: '全部',
                        subjectCode: 0
                    })
                    this.selectSubjectId = this.subjectList[0].subjectCode
                    this.getTestList()
                }
            },
            async getTestList() {
                let url = '/das/weekTest/reportManager/getReportList'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    schoolId: this.global.schoolId,
                    roleId: this.global.roleId,
                    pageSize: this.pageSize,
                    currentPage: this.currentPage,
                    gradeCode: this.selectGradeId,
                    subjectCode: this.selectSubjectId
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    let downTaskList = []
                    this.global.downTaskList.forEach((item) => {
                        if(item.reportType == this.reportType){
                            downTaskList.push(item.taskId)
                        }
                    })
                    for(let i = 0, len = data.homeworkList.length; i < len; i++){
                        if(downTaskList.includes(data.homeworkList[i].id)){
                            data.homeworkList[i].isDown = true
                        }else{
                            data.homeworkList[i].isDown = false
                        }
                    }
                    this.testList = data.homeworkList
                    this.total = data.count
                }
            },
            pageChange(currentPage, pageSize) {
                this.currentPage = currentPage
                this.pageSize = pageSize
                this.getTestList()
            },
            //2019-05-15
            handleCheckAllChange_grade(val) {
                this.checkedReport_grade = val ? this.gradeReportList.filter((item) => item.id) : [];
                this.isIndeterminate_grade = false;
            },
            handleCheckedChange_grade(value) {
                let checkedCount = value.length;
                this.checkAll_grade = checkedCount === this.gradeReportList.length;
                this.isIndeterminate_grade = checkedCount > 0 && checkedCount < this.gradeReportList.length;
            },
            handleCheckAllChange_class(val) {
                this.checkedReport_class = val ? this.classReportList.filter((item) => item.id) : [];
                this.isIndeterminate_class = false;
            },
            handleCheckedChange_class(value) {
                let checkedCount = value.length;
                this.checkAll_class = checkedCount === this.classReportList.length;
                this.isIndeterminate_class = checkedCount > 0 && checkedCount < this.classReportList.length;
            },
            handleCheckAllChange_person(val) {
                this.checkedReport_person = val ? this.classList.filter((item) => item.classId) : [];
                this.isIndeterminate_person = false;
            },
            handleCheckedChange_person(value) {
                let checkedCount = value.length;
                this.checkAll_person = checkedCount === this.classList.length;
                this.isIndeterminate_person = checkedCount > 0 && checkedCount < this.classList.length;
            },
            handleCheckAllChange_singlePerson(val) {
                this.checkedReport_singlePerson = val ? this.personReportList.filter((item) => item.id) : [];
                this.isIndeterminate_singlePerson = false;
            },
            handleCheckedChange_singlePerson(value) {
                let checkedCount = value.length;
                this.checkAll_singlePerson = checkedCount === this.personReportList.length;
                this.isIndeterminate_singlePerson = checkedCount > 0 && checkedCount < this.personReportList.length;
            },
            showBatchDown(row) {
                if(!this.global.isAllowDownReport(this.global.downTaskList)){
                    this.$message({
                        type: 'info',
                        message: '下载任务太多了，等稍等片刻再接着下载！',
                        showClose: true
                    })
                    return
                }
                if(this.global.downTaskList.length > 0){
                    for(let i = 0, len = this.global.downTaskList.length; i < len; i++){
                        if((row.id == this.global.downTaskList[i].taskId) && this.global.downTaskList[i].reportType == this.reportType){
                            if(this.global.downTaskList[i].gradeReportInfo.gradeReportList && this.global.downTaskList[i].gradeReportInfo.gradeReportList.length > 0 && !this.global.downTaskList[i].gradeReportInfo.isComplete){
                                this.$message({
                                    type: 'info',
                                    message: '当前考试任务正在下载，不能重复下载，请等待本次任务下载完成，再接着下载！',
                                    showClose: true
                                })
                                return
                            }
                            if(this.global.downTaskList[i].classReportInfo.classReportList &&　this.global.downTaskList[i].classReportInfo.classReportList.length > 0 && !this.global.downTaskList[i].classReportInfo.isComplete){
                                this.$message({
                                    type: 'info',
                                    message: '当前考试任务正在下载，不能重复下载，请等待本次任务下载完成，再接着下载！',
                                    showClose: true
                                })
                                return
                            }
                            if(this.global.downTaskList[i].classPersonReportList.length > 0 && this.global.downTaskList[i].classPersonReportList[0].children && this.global.downTaskList[i].classPersonReportList[0].children.length > 0 && !this.global.downTaskList[i].classPersonReportList[0].isComplete){
                                this.$message({
                                    type: 'info',
                                    message: '当前考试任务正在下载，不能重复下载，请等待本次任务下载完成，再接着下载！',
                                    showClose: true
                                })
                                return
                            }
                            if(this.global.downTaskList[i].singlePersonInfo.singlePersonList &&　this.global.downTaskList[i].singlePersonInfo.singlePersonList.length > 0 && !this.global.downTaskList[i].singlePersonInfo.isComplete){
                                this.$message({
                                    type: 'info',
                                    message: '当前考试任务正在下载，不能重复下载，请等待本次任务下载完成，再接着下载！',
                                    showClose: true
                                })
                                return
                            }
                            break;
                        }
                    }
                }
                this.testObject = row.testObject
                this.gradeReportList = []
                this.classReportList = []
                this.classList = []
                this.personReportList = []
                this.taskId = row.id
                this.subjectName = row.subjectName
                this.gradeName = row.gradeName
                this.subjectId = row.subjectId
                if(this.testObject == 1){
                    this.getPaperTestGradeDetail()
                    this.getPaperTestClassDetail()
                    this.getClassList()
                }else{
                    this.getPaperTestStuDetail()
                }
                this.allDownDialogVisible = true
            },
            async getPaperTestGradeDetail() {
                let url = '/das/testManager/getPaperTestGradeDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    type: ''
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.gradeReportList = data.reportList
                    if (this.gradeReportList.length > 0) {
                        this.checkAll_grade = true
                        this.checkedReport_grade = this.gradeReportList
                    }
                }
            },
            async getPaperTestClassDetail() {
                let url = '/das/testManager/getPaperTestClassDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    type: ''
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.classReportList = data.reportList
                    if (this.classReportList.length > 0) {
                        this.checkAll_class = true
                        this.checkedReport_class = this.classReportList
                    }
                }
            },
            async getClassList() {
                let url = '/das/homework/relation/classes'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    testHomeworkId: this.taskId
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.classList = data.classList
                    this.classId = this.classList[0].classId
                    this.className = this.classList[0].className
                    if (this.classList.length > 0) {
                        this.checkAll_person = true
                        this.checkedReport_person = this.classList
                    }
                }
            },
            async getPaperTestStuDetail() {
                let url = '/das/testManager/getPaperTestStuDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    classid: this.classId,
                    type: ''
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    for (let i = 0, len = this.classList.length; i < len; i++) {
                        if (this.classList[i].classId == this.classId) {
                            this.className = this.classList[i].className
                        }
                    }
                    this.personReportList = data.reportList
                    if (this.personReportList.length > 0) {
                        this.checkAll_singlePerson = true
                        this.checkedReport_singlePerson = this.personReportList
                    }
                }
            },
            seeDownProgress(row) {
                this.taskId = row.id
                this.taskName = row.name
                this.subjectName = row.subjectName
                this.gradeName = row.gradeName
                this.subjectId = row.subjectId
                this.taskTitle = this.taskName + '报告批量下载'
                this.curDownTask = {
                    taskId: '',
                    gradeReportInfo: {},
                    classReportInfo: {},
                    classPersonReportList: []
                }
                for (let i = 0, len = this.global.downTaskList.length; i < len; i++) {
                    if (this.taskId == this.global.downTaskList[i].taskId) {
                        this.curDownTask = this.global.downTaskList[i]
                    }
                }
                this.taskDialogVisible = true
            },
            confirmDown() {
                this.allDownDialogVisible = false
                let taskObj = {}
                if (this.checkedReport_grade.length > 0 || this.checkedReport_class.length > 0 || this.checkedReport_person.length > 0 || this.checkedReport_singlePerson.length > 0) {
                    if(this.global.downTaskList.length > 0){
                        for(let i = 0, len = this.global.downTaskList.length; i < len; i++){
                            if((this.taskId == this.global.downTaskList[i].taskId) && this.global.downTaskList[i].reportType == this.reportType){
                                this.global.downTaskList.splice(i, 1)
                                break;
                            }
                        }
                    }
                    for(let i = 0, len = this.testList.length; i < len; i++){
                        if(this.taskId == this.testList[i].id){
                            this.testList[i].isDown = true
                        }
                    }
                    taskObj = {
                        taskId: this.taskId,
                        gradeReportInfo: {},
                        classReportInfo: {},
                        classPersonReportList: [],
                        singlePersonInfo: {},
                        reportType: this.reportType
                    }
                    this.global.downTaskList.push(taskObj)
                }
                if (this.checkedReport_grade.length > 0) {
                    let tempRow = []
                    this.checkedReport_grade.forEach((item) => {
                        tempRow.push({
                            name: item.name,
                            id: item.id,
                            studentName: item.studentName,
                            type: 3,
                            isDown: true,
                            isShow: true,
                            isDelete: false,
                            status: 1
                        })
                    })
                    let gradeReportInfo = {
                        gradeReportList: tempRow,
                        allNum: tempRow.length,
                        successNum: 0,
                        errNum: 0,
                        progress: 1,
                        isComplete: false
                    }
                    taskObj.gradeReportInfo = gradeReportInfo
                    singleNoScreen(gradeReportInfo, {
                        gradeName: this.gradeName,
                        subjectName: this.subjectName,
                        savePath: this.savePath,
                        type: 3,
                        isBatch: true,
                        appPath: this.appPath,
                        dataPath: this.dataPath,
                        taskId: this.taskId,
                        reportType: this.reportType
                    }, this.global.myEmitter)
                }
                if (this.checkedReport_class.length > 0) {
                    let tempRow = []
                    this.checkedReport_class.forEach((item) => {
                        tempRow.push({
                            name: item.name,
                            id: item.id,
                            studentName: item.studentName,
                            type: 5,
                            isDown: true,
                            isShow: true,
                            isDelete: false,
                            status: 1
                        })
                    })
                    let classReportInfo = {
                        classReportList: tempRow,
                        allNum: tempRow.length,
                        successNum: 0,
                        errNum: 0,
                        progress: 1,
                        isComplete: false
                    }
                    taskObj.classReportInfo = classReportInfo
                    singleScreen(classReportInfo, {
                        gradeName: this.gradeName,
                        subjectName: this.subjectName,
                        savePath: this.savePath,
                        type: 5,
                        isBatch: true,
                        appPath: this.appPath,
                        dataPath: this.dataPath,
                        taskId: this.taskId,
                        reportType: this.reportType
                    }, this.global.myEmitter)
                }
                if (this.checkedReport_person.length > 0) {
                    let tempRow = [{
                        name: `${this.gradeName}${this.subjectName}`,
                        id: '',
                        type: 2,
                        isDown: true,
                        isShow: true,
                        isOpen: false,
                        isDelete: false,
                        status: 1,
                        isComplete: false,
                        children: []
                    }]
                    this.checkedReport_person.forEach((item) => {
                        tempRow[0].children.push({
                            classId: item.classId,
                            className: item.className,
                            id: item.classId,
                            name: item.className,
                            type: 2,
                            isShow: true,
                            isDown: true,
                            isOpen: false,
                            isDelete: false,
                            status: 1,
                            allNum: 0,
                            successNum: 0,
                            errNum: 0,
                            progress: 1,  //1还没有开始   2准备状态开始  3正式开始下载
                            isComplete: false,
                            children: []
                        })
                    })
                    taskObj.classPersonReportList = tempRow
                    if(this.subjectId == 7 || this.subjectId == 10){
                        batchNoScreen(tempRow, {
                            gradeName: this.gradeName,
                            subjectName: this.subjectName,
                            savePath: this.savePath,
                            type: 2,
                            isBatch: true,
                            appPath: this.appPath,
                            dataPath: this.dataPath,
                            taskId: this.taskId,
                            subjectId: this.subjectId,
                            reportType: this.reportType
                        }, this.global.myEmitter)
                    }else{
                        batchScreen(tempRow, {
                            gradeName: this.gradeName,
                            subjectName: this.subjectName,
                            savePath: this.savePath,
                            type: 2,
                            isBatch: true,
                            appPath: this.appPath,
                            dataPath: this.dataPath,
                            taskId: this.taskId,
                            subjectId: this.subjectId,
                            reportType: this.reportType
                        }, this.global.myEmitter)
                    }
                }
                if (this.checkedReport_singlePerson.length > 0) {
                    let tempRow = []
                    this.checkedReport_singlePerson.forEach((item) => {
                        tempRow.push({
                            name: item.name,
                            id: item.id,
                            studentName: item.studentName,
                            type: 2,
                            isDown: true,
                            isShow: true,
                            isDelete: false,
                            status: 1
                        })
                    })
                    let singlePersonInfo = {
                        singlePersonList: tempRow,
                        allNum: tempRow.length,
                        successNum: 0,
                        errNum: 0,
                        progress: 1,
                        isComplete: false
                    }
                    taskObj.singlePersonInfo = singlePersonInfo
                    if(this.subjectId == 7 || this.subjectId == 10){
                        singleNoScreen(singlePersonInfo, {
                            gradeName: this.gradeName,
                            subjectName: this.subjectName,
                            savePath: this.savePath,
                            type: 2,
                            isBatch: true,
                            appPath: this.appPath,
                            dataPath: this.dataPath,
                            taskId: this.taskId,
                            reportType: this.reportType,
                            className: '个人组'
                        }, this.global.myEmitter)
                    }else{
                        singleScreen(singlePersonInfo, {
                            gradeName: this.gradeName,
                            subjectName: this.subjectName,
                            savePath: this.savePath,
                            type: 2,
                            isBatch: true,
                            appPath: this.appPath,
                            dataPath: this.dataPath,
                            taskId: this.taskId,
                            reportType: this.reportType,
                            className: '个人组'
                        }, this.global.myEmitter)
                    }
                }
            },
            cancleDownReport(type, index) {
                if (type == 'grade') {
                    for (let i = 0, len = this.curDownTask.gradeReportInfo.gradeReportList.length; i < len; i++) {
                        this.curDownTask.gradeReportInfo.gradeReportList[i].isDown = false
                    }
                    this.curDownTask.gradeReportInfo.gradeReportList = []
                } else if (type == 'class') {
                    for (let i = 0, len = this.curDownTask.classReportInfo.classReportList.length; i < len; i++) {
                        this.curDownTask.classReportInfo.classReportList[i].isDown = false
                    }
                    this.curDownTask.classReportInfo.classReportList = []
                } else if(type == 'singlePerson'){
                    for (let i = 0, len = this.curDownTask.singlePersonInfo.singlePersonList.length; i < len; i++) {
                        this.curDownTask.singlePersonInfo.singlePersonList[i].isDown = false
                    }
                    this.curDownTask.singlePersonInfo.singlePersonList = []
                }else if (type == 'person') {
                    this.curDownTask.classPersonReportList[0].children[index].isDown = false
                    this.curDownTask.classPersonReportList[0].children.splice(index, 1)
                }
            },
            seeErrReport(row){
                this.errReportList = []
                for(let i = 0, len = this.global.errReportList.length; i < len; i++){
                    if(row.id == this.global.errReportList[i].obj.taskId && this.global.errReportList[i].obj.reportType == this.reportType){
                        this.errReportList.push(this.global.errReportList[i])
                    }
                }
                this.errorPdfDialogVisible = true
            },
            //重新下载下载失败的报告所需的方法
            handlePersonSelectionChange(val){
                this.downErrList = val
            },
            downReport(row){
                if(!(row instanceof Array)){
                    row = [row]
                }
                row.forEach((item, index) => {
                    setTimeout(() => {
                        if([3, 4].includes(item.obj.type) || (item.obj.type == 1 && this.subjectId == 7) || (item.obj.type == 2 && this.subjectId == 10)){
                            singleNoScreenForSearch([item], {
                                gradeName: item.obj.gradeName,
                                subjectName: item.obj.subjectName,
                                className: item.obj.className,
                                savePath: this.savePath,
                                type: item.type,
                                isBatch: item.obj.isBatch,
                                //true是批量下载（下载后会自动整合到一个文件夹）
                                appPath: this.appPath,
                                dataPath: this.dataPath,
                                errReport: true,
                                reportType: item.obj.reportType,
                                taskId: item.obj.taskId
                            }, this.global.myEmitter)
                        }else{
                            singleScreenForSearch([item], {
                                gradeName: item.obj.gradeName,
                                subjectName: item.obj.subjectName,
                                className: item.obj.className,
                                savePath: this.savePath,
                                type: item.type,
                                isBatch: item.obj.isBatch,  //true是批量下载（下载后会自动整合到一个文件夹）
                                appPath: this.appPath,
                                dataPath: this.dataPath,
                                errReport: true,
                                reportType: item.obj.reportType,
                                taskId: item.obj.taskId
                            }, this.global.myEmitter)
                        }
                    }, index * 30000)
                })
            },
            downSelectReport(){
                if(this.downErrList.length == 0){
                    this.$message({
                        message: '所选报告不能为空！',
                        type: 'warning',
                        duration: 2000
                    })
                    return
                }
                this.downReport(this.downErrList)
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
            },
            getErrDownStatus(row){
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
                } else {
                    return '-------'
                }
            }
        }
    }
</script>

<style scoped>
    .reportType {
        text-align: center;
        margin-top: 20px;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px dotted #cdcdcd;
        border-top: 1px dotted #cdcdcd;
    }

    .thead {
        background-color: #0188EF;
        color: #ffffff;
    }

    .taskTable > li {
        width: 100%;
        overflow: hidden;
        border-bottom: 1px solid #EBEEF5;
    }

    .taskTable > li > .div_table > .div_tr > div:nth-of-type(1) > span {
        cursor: pointer;
    }

    .taskTable > li > .div_table {
        width: 100%;
        display: table;
        table-layout: fixed;
    }

    .taskTable > li > .div_table > .div_tr {
        display: table-row;
    }

    .taskTable > li > .div_table > .div_tr > div {
        box-sizing: border-box;
        min-height: 40px;
        line-height: 30px;
        display: table-cell;
        vertical-align: middle;
        border-right: 1px solid #EBEEF5;
        text-align: center;
        padding: 5px;
    }

    .taskTable > li > .div_table > .div_tr > div:nth-last-of-type(1) {
        border-right: none;
    }

    .success {
        color: #67C23A;
    }

    .warning {
        color: #E6A23C;
    }

    .danger {
        color: #F56C6C;
    }

    .info {
        color: #909399;
    }

    .pointer {
        cursor: pointer;
    }
    .taskTip{
        height: 40px;
        line-height: 40px;
    }
</style>