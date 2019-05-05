<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>有谱周测</el-breadcrumb-item>
            <el-breadcrumb-item>学情报告</el-breadcrumb-item>
            <el-breadcrumb-item>查看报告</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="mTop20">
            <el-button :type="curActive == 'person' ? 'primary' : ''" size="small" @click="getClassList()">个人报告
            </el-button>
            <el-select v-model="classId" placeholder="请选择" size="small" class="mLeft20"
                       @change="getPaperTestStuDetail()"
                       v-show="curActive == 'person'">
                <el-option
                        v-for="item in classList"
                        :key="item.classId"
                        :label="item.className"
                        :value="item.classId">
                </el-option>
            </el-select>
            <el-button :type="curActive == 'class' ? 'primary' : ''" size="small" class="mLeft20"
                       @click="getPaperTestClassDetail()" v-show="testObject == 1">班级报告
            </el-button>
            <el-button :type="curActive == 'grade' ? 'primary' : ''" size="small" class="mLeft20"
                       @click="getPaperTestGradeDetail()" v-show="testObject == 1">年级报告
            </el-button>
            <el-button type="primary" size="small" class="mLeft20" @click="allDown()">批量下载</el-button>
            <el-button type="primary" size="small" class="mLeft20" @click="setSavePath()">下载路径设置</el-button>
            <search-down class="mLeft20" :qualityType="qualityType"></search-down>
            <el-button type="primary" size="small" class="mLeft20" @click="$router.go(-1)">返回</el-button>
        </div>
        <div class="mTop20" v-show="savePath">
            <span>报告下载位置：</span>
            <el-tag>{{savePath}}</el-tag>
            <el-button type="primary" size="small" class="mLeft20" @click="openSavePath()">查看下载的报告</el-button>
            <down-list></down-list>
            <el-button type="primary" size="small" class="mLeft20" @click="errorPdfDialogVisible = true">查看下载失败的报告</el-button>
        </div>
        <div class="mTop20">
            <span>报告质量选择（方案一和方案二都只针对个人报告和班级报告）：</span>
            <el-radio-group v-model="qualityType">
                <el-radio :label="1">方案一（质量较好，较耗时）</el-radio>
                <el-radio :label="2">方案二（质量一般，较省时）</el-radio>
            </el-radio-group>
        </div>
        <div class="mTop20">
            <el-button type="primary" size="small" @click="downSelectGrade()" v-show="curActive == 'grade' && gradeReportList.length > 0">下载所选年级报告
            </el-button>
        </div>
        <div class="mTop20" v-show="curActive == 'grade'" >
            <el-table
                    :data="gradeReportList"
                    border
                    @selection-change="handleGradeSelectionChange"
                    style="width: 100%">
                <el-table-column
                        align="center"
                        type="index"
                        width="50">
                </el-table-column>
                <el-table-column
                        align="center"
                        type="selection"
                        width="55">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="id"
                        label="报告编号"
                        width="100">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="name"
                        label="报告名称"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="score"
                        label="平均成绩"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="createtime"
                        label="生成时间"
                        width="200">
                </el-table-column>
                <el-table-column
                        align="center"
                        fixed="right"
                        label="操作"
                        width="200">
                    <template slot-scope="scope">
                        <el-button @click="downGradeReport(scope.row)" type="text" size="small">下载报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="mTop20">
            <el-button type="primary" size="small" @click="downSelectClass()" v-show="curActive == 'class' && classReportList.length > 0">下载所选班级报告
            </el-button>
        </div>
        <div class="mTop20" v-show="curActive == 'class'">
            <el-table
                    :data="classReportList"
                    border
                    @selection-change="handleClassSelectionChange"
                    style="width: 100%">
                <el-table-column
                        align="center"
                        type="index"
                        width="50">
                </el-table-column>
                <el-table-column
                        align="center"
                        type="selection"
                        width="55">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="id"
                        label="报告编号"
                        width="100">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="name"
                        label="报告名称"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="score"
                        label="平均成绩"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        :formatter="dealScore"
                        label="最高分/总分"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="createtime"
                        label="生成时间"
                        width="200">
                </el-table-column>
                <el-table-column
                        align="center"
                        fixed="right"
                        label="操作"
                        width="100">
                    <template slot-scope="scope">
                        <el-button @click="downClassReport(scope.row)" type="text" size="small">下载报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="mTop20">
            <el-button type="primary" size="small" @click="downSelectPerson()" v-show="curActive == 'person' && personReportList.length > 0">下载所选个人报告
            </el-button>
        </div>
        <div class="mTop20" v-show="curActive == 'person'">
            <el-table
                    :data="personReportList"
                    border
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
                        width="100">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="name"
                        label="报告名称"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="studentName"
                        label="学生姓名"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="score"
                        label="成绩"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="totalScore"
                        label="总分"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="createtime"
                        label="生成时间"
                        width="200">
                </el-table-column>
                <el-table-column
                        align="center"
                        fixed="right"
                        label="操作"
                        width="200">
                    <template slot-scope="scope">
                        <el-button @click="downPersonReport(scope.row)" type="text" size="small">下载报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!--批量下载弹框-->
        <el-dialog
                title="提示"
                :visible.sync="allDownDialogVisible"
                width="40%"
                center>
            <h2>请根据需要选择</h2>
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
            <span slot="footer" class="dialog-footer">
        <el-button @click="allDownDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="confirmDown()" size="small">确 定</el-button>
      </span>
        </el-dialog>
        <!--错误报告弹框-->
        <el-dialog
                title="错误报告列表"
                :visible.sync="errorPdfDialogVisible"
                width="40%"
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
                        align="center"
                        prop="id"
                        label="报告编号"
                        width="100">
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
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        :formatter="getType"
                        label="报告类型"
                        width="120">
                </el-table-column>
            </el-table>
        </el-dialog>

    </div>
</template>

<script>
    const uuid = require('uuid/v4')
    const singleNoScreen = require('@/assets/js/singleNoScreen')
    const singleScreen = require('@/assets/js/singleScreen')
    const batchNoScreen = require('@/assets/js/batchNoScreen')
    const batchScreen = require('@/assets/js/batchScreen')
    const {dialog, shell} = require('electron').remote
    export default {
        data() {
            return {
                testObject: '',
                subjectName: '',
                gradeName: '',
                className: '',
                taskId: '',
                subjectId: '',
                allDownDialogVisible: false,
                gradeReportList: [],
                classReportList: [],
                personReportList: [],
                classList: [],
                classId: '',
                curActive: 'grade',
                curType: 3, // 1：个人 2：班级 3：年级
                reportType: 6, //3是月考  6是周测
                //批量下载
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
                //报告临时位置
                tempPath: '',
                //报告质量选择
                qualityType: 1,
                //个人报告选择下载
                person_arr: [],
                //班级报告选择下载
                class_arr: [],
                //年级报告选择下载
                grade_arr: [],
                //错误报告数据
                errorPdfDialogVisible: false,
                errReportList: []
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
        mounted() {
            if (this.appPath.includes('DownloadReport')) {
                this.tempPath = this.appPath.split('DownloadReport')[0] + 'DownloadReport'
            } else {
                this.tempPath = this.appPath.split('electronDemo')[0] + 'electronDemo'
            }
            this.errReportList = this.global.errReportList
            this.taskId = this.$route.params.taskId
            this.gradeName = this.$route.params.gradeName
            this.subjectName = this.$route.params.subjectName
            this.subjectId = this.$route.params.subjectId
            this.testObject = this.$route.params.testObject
            if(this.testObject == 2){
                this.testObject = 'person'
                this.getPaperTestStuDetail()
            }else{
                this.getPaperTestGradeDetail()
                this.getPaperTestClassDetail()
                this.getClassList()
            }
        },
        methods: {
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
            handlePersonSelectionChange(val) {
                this.person_arr = val
            },
            handleClassSelectionChange(val){
                this.class_arr = val
            },
            handleGradeSelectionChange(val){
                this.grade_arr = val
            },
            downSelectGrade(){
                if(this.grade_arr.length == 0){
                    this.$message({
                        message: '所选年级报告不能为空！',
                        type: 'warning',
                        duration: 2000
                    })
                    return
                }
                this.downGradeReport(this.grade_arr)
            },
            downSelectClass(){
                if(this.class_arr.length == 0){
                    this.$message({
                        message: '所选班级报告不能为空！',
                        type: 'warning',
                        duration: 2000
                    })
                    return
                }
                this.downClassReport(this.class_arr)
            },
            downSelectPerson() {
                if(this.person_arr.length == 0){
                    this.$message({
                        message: '所选个人报告不能为空！',
                        type: 'warning',
                        duration: 2000
                    })
                    return
                }
                this.downPersonReport(this.person_arr)
            },
            openSavePath() {
                //shell.openExternal('https://github.com')
                shell.openItem(this.savePath)
            },
            async getPaperTestGradeDetail() {
                this.curActive = 'grade'
                let url = '/das/testManager/getPaperTestGradeDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    type: 4
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.gradeReportList = data.reportList
                }
            },
            async getPaperTestClassDetail() {
                this.curActive = 'class'
                let url = '/das/testManager/getPaperTestClassDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    type: 5
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.classReportList = data.reportList
                }
            },
            async getClassList() {
                this.curActive = 'person'
                let url = '/das/homework/relation/classes'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    testHomeworkId: this.taskId
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.classList = data.infoList
                    this.classId = this.classList[0].classId
                    this.className = this.classList[0].className
                    this.getPaperTestStuDetail()
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
                    for(let i = 0, len = this.classList.length; i < len; i++){
                        if(this.classList[i].classId == this.classId){
                            this.className = this.classList[i].className
                        }
                    }
                    this.personReportList = data.reportList
                }
            },
            dealDownQuality(isWholeClass, row, obj, myEmitter) { //isWholeClass 是否批量下载下载每个班级的个人报告，早这里只有 批量下载每个班级里面的个人报告时为true，其它情况都为false
                this.$message({
                    message: '正在下载请耐心等待,可点击查看下载任务，查看下载进度！',
                    type: 'info',
                    duration: 3000,
                    showClose: true
                })
                if (this.qualityType == 1 && !isWholeClass) {
                    singleScreen(row, obj, myEmitter)
                } else if (this.qualityType == 1 && isWholeClass) {
                    batchScreen(row, obj, myEmitter)
                } else if (this.qualityType == 2 && !isWholeClass) {
                    singleNoScreen(row, obj, myEmitter)
                } else if (this.qualityType == 2 && isWholeClass) {
                    batchNoScreen(row, obj, myEmitter)
                }
            },
            downGradeReport(row) {
                //年级报告没有都不截图
                if (!(row instanceof Array)) {
                    row = [row]
                }
                this.$message({
                    message: '正在下载请耐心等待,可点击查看下载任务，查看下载进度！',
                    type: 'info',
                    duration: 3000,
                    showClose: true
                })
                let tempRow = []
                row.forEach((item) => {
                    tempRow.push({
                        name: item.name,
                        id: item.id,
                        studentName: item.studentName,
                        type: 4,
                        isDown: true,
                        isShow: true,
                        isDelete: false,
                        localId: uuid(),
                        status: 1
                    })
                })
                this.global.downTaskList.push(...tempRow)
                singleNoScreen(tempRow, {
                    gradeName: this.gradeName,
                    subjectName: this.subjectName,
                    savePath: this.savePath,
                    type: 4,
                    isBatch: false,  //true是批量下载（下载后会自动整合到一个文件夹）  false不是批量下载直接放在了文件夹的根目录
                    appPath: this.tempPath
                }, this.global.myEmitter)
            },
            downClassReport(row) {
                if (!(row instanceof Array)) {
                    row = [row]
                }
                let tempRow = []
                row.forEach((item) => {
                    tempRow.push({
                        name: item.name,
                        id: item.id,
                        studentName: item.studentName,
                        type: 6,
                        isDown: true,
                        isShow: true,
                        isDelete: false,
                        localId: uuid(),
                        status: 1
                    })
                })
                this.global.downTaskList.push(...tempRow)
                this.dealDownQuality(false, tempRow, {
                    gradeName: this.gradeName,
                    subjectName: this.subjectName,
                    savePath: this.savePath,
                    type: 6,
                    isBatch: false,
                    appPath: this.tempPath
                }, this.global.myEmitter)
            },
            downPersonReport(row) {
                if (!(row instanceof Array)) {
                    row = [row]
                }
                let tempRow = []
                row.forEach((item) => {
                    tempRow.push({
                        name: item.name,
                        id: item.id,
                        studentName: item.studentName,
                        type: 1,
                        isDown: true,
                        isShow: true,
                        isDelete: false,
                        localId: uuid(),
                        status: 1
                    })
                })
                this.global.downTaskList.push(...tempRow)
                this.dealDownQuality(false, tempRow, {
                    gradeName: this.gradeName,
                    subjectName: this.subjectName,
                    className: this.className,
                    savePath: this.savePath,
                    type: 1,
                    isBatch: false,
                    appPath: this.tempPath
                }, this.global.myEmitter)
            },
            dealScore(row) {
                return row.maxScore + '/' + row.totalScore
            },
            allDown() {
                this.allDownDialogVisible = true
            },
            confirmDown() {
                this.allDownDialogVisible = false
                if (this.checkedReport_grade.length > 0) {
                    let tempRow = []
                    this.checkedReport_grade.forEach((item) => {
                        tempRow.push({
                            name: item.name,
                            id: item.id,
                            studentName: item.studentName,
                            type: 4,
                            isDown: true,
                            isShow: true,
                            isDelete: false,
                            localId: uuid(),
                            status: 1
                        })
                    })
                    this.global.downTaskList.push(...tempRow)
                    singleNoScreen(tempRow, {
                        gradeName: this.gradeName,
                        subjectName: this.subjectName,
                        savePath: this.savePath,
                        type: 4,
                        isBatch: true,
                        appPath: this.tempPath,
                        taskId: this.taskId
                    }, this.global.myEmitter)
                }
                if (this.checkedReport_class.length > 0) {
                    let tempRow = []
                    this.checkedReport_class.forEach((item) => {
                        tempRow.push({
                            name: item.name,
                            id: item.id,
                            studentName: item.studentName,
                            type: 6,
                            isDown: true,
                            isShow: true,
                            isDelete: false,
                            localId: uuid(),
                            status: 1
                        })
                    })
                    this.global.downTaskList.push(...tempRow)
                    this.dealDownQuality(false, tempRow, {
                        gradeName: this.gradeName,
                        subjectName: this.subjectName,
                        savePath: this.savePath,
                        type: 6,
                        isBatch: true,
                        appPath: this.tempPath,
                        taskId: this.taskId
                    }, this.global.myEmitter)
                }
                if (this.checkedReport_person.length > 0) {
                    let tempRow = [{
                        name: `${this.gradeName}${this.subjectName}`,
                        id: '',
                        type: 1,
                        isDown: true,
                        isShow: true,
                        isOpen: false,
                        isDelete: false,
                        localId: uuid(),
                        status: 1,
                        children: []
                    }]
                    this.checkedReport_person.forEach((item) => {
                        tempRow[0].children.push({
                            classId: item.classId,
                            className: item.className,
                            id: item.classId,
                            name: item.className,
                            type: 1,
                            isShow: true,
                            isDown: true,
                            isOpen: false,
                            isDelete: false,
                            localId: uuid(),
                            status: 1,
                            children: []
                        })
                    })
                    this.global.downTaskList.push(...tempRow)
                    this.dealDownQuality(true, tempRow, {
                        gradeName: this.gradeName,
                        subjectName: this.subjectName,
                        savePath: this.savePath,
                        type: 1,
                        isBatch: true,
                        appPath: this.tempPath,
                        taskId: this.taskId,
                        subjectId: this.subjectId,
                        reportType: this.reportType
                    }, this.global.myEmitter)
                }
            },
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
            setSavePath() {
                dialog.showOpenDialog({properties: ['openDirectory']}, (path) => {
                    if (path) {
                        this.$store.dispatch('GET_SAVE_PATH', {savePath: path[0]})
                    }
                })
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
</style>