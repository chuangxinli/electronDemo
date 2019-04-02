<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>有谱月考</el-breadcrumb-item>
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
                       @click="getPaperTestClassDetail()">班级报告
            </el-button>
            <el-button :type="curActive == 'grade' ? 'primary' : ''" size="small" class="mLeft20"
                       @click="getPaperTestGradeDetail()">年级报告
            </el-button>
            <el-button type="primary" size="small" class="mLeft20" @click="allDown()">批量下载</el-button>
            <el-button type="primary" size="small" class="mLeft20" @click="setSavePath()">下载路径设置</el-button>
        </div>
        <div class="mTop20" v-show="savePath">
            <span>报告下载位置：</span>
            <el-tag>{{savePath}}</el-tag>
        </div>
        <div class="mTop20" v-show="curActive == 'grade'">
            <el-table
                    :data="gradeReportList"
                    border
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
        <div class="mTop20" v-show="curActive == 'class'">
            <el-table
                    :data="classReportList"
                    border
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
                        width="200">
                    <template slot-scope="scope">
                        <el-button @click="downClassReport(scope.row)" type="text" size="small">下载报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="mTop20" v-show="curActive == 'person'">
            <el-table
                    :data="personReportList"
                    border
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
    </div>
</template>

<script>
    const EventEmitter = require('events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    const singleNoScreen = require('@/assets/js/singleNoScreen')
    //const batchNoScreen = require('@/assets/js/batchNoScreen')
    const {dialog} = require('electron').remote
    export default {
        data() {
            return {
                subjectName: '',
                gradeName: '',
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
        mounted() {
            if(this.appPath.includes('downloadreport')){
                this.tempPath = this.appPath.split('downloadreport')[0] + 'downloadreport'
            }else{
                this.tempPath = this.appPath.split('electronDemo')[0] + 'electronDemo'
            }
            this.taskId = this.$route.params.taskId
            this.gradeName = this.$route.params.gradeName
            this.subjectName = this.$route.params.subjectName
            this.subjectId = this.$route.params.subjectId
            this.getPaperTestGradeDetail()
            this.getPaperTestClassDetail()
            this.getClassList()
            myEmitter.on('complete', (data) => {
                console.log(this)
                console.log('触发事件');
                console.log(data)
                if(data.obj.isBatch){

                }else{
                    if(data.successIdList.length > 0){
                        let ids = []
                        data.successIdList.forEach((item) => {
                            ids.push(item.id)
                        })
                        ids = ids.join('，')
                        this.$notify({
                            title: '提示',
                            message: `报告ID${ids}生成成功！`,
                            duration: 0,
                            type: 'success'

                        });
                    }
                    if(data.failIdList.length > 0){
                        let ids = []
                        data.failIdList.forEach((item) => {
                            ids.push(item.id)
                        })
                        ids = ids.join('，')
                        this.$notify({
                            title: '提示',
                            message: `报告ID${ids}生成失败！`,
                            duration: 0,
                            type: 'error'

                        });
                    }
                }

            });
        },
        methods: {
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
                    console.log(data)
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
                    console.log(data)
                }
            },
            async getClassList() {
                this.curActive = 'person'
                let url = '/das/scanExam/getClassList'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    homeworkId: this.taskId
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.classList = data.infoList
                    this.classId = this.classList[0].classId
                    this.getPaperTestStuDetail()
                    console.log(data)
                }
            },
            async getPaperTestStuDetail() {
                let url = '/das/testManager/getPaperTestStuDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    classid: this.classId,
                    type: 6
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.personReportList = data.reportList
                    console.log(data)
                }
            },
            downGradeReport(row) {
                console.log(row)
                singleNoScreen([row], {
                    gradeName: this.gradeName,
                    subjectName: this.subjectName,
                    savePath: this.savePath,
                    type: 4,
                    isBatch: false,  //true是批量下载（下载后会自动整合到一个文件加）  false不是批量下载直接放在了文件夹的根目录
                    appPath: this.tempPath
                }, myEmitter)
            },
            downClassReport(row) {
                console.log(row)
                singleNoScreen([row], {
                    gradeName: this.gradeName,
                    subjectName: this.subjectName,
                    savePath: this.savePath,
                    type: 6,
                    isBatch: false,
                    appPath: this.tempPath
                }, myEmitter)
            },
            downPersonReport(row) {
                console.log(row)
                singleNoScreen([row], {
                    gradeName: this.gradeName,
                    subjectName: this.subjectName,
                    savePath: this.savePath,
                    type: 1,
                    isBatch: false,
                    appPath: this.tempPath
                }, myEmitter)
            },
            dealScore(row) {
                return row.maxScore + '/' + row.totalScore
            },
            allDown() {
                this.allDownDialogVisible = true
            },
            confirmDown() {
                if (this.checkedReport_grade.length > 0) {
                    singleNoScreen(this.checkedReport_grade, {
                        gradeName: this.gradeName,
                        subjectName: this.subjectName,
                        savePath: this.savePath,
                        type: 4,
                        isBatch: true,
                        appPath: this.tempPath
                    })
                }
                if (this.checkedReport_class.length > 0) {
                    singleNoScreen(this.checkedReport_class, {
                        gradeName: this.gradeName,
                        subjectName: this.subjectName,
                        savePath: this.savePath,
                        type: 6,
                        isBatch: true,
                        appPath: this.tempPath
                    })
                }
            },
            handleCheckAllChange_grade(val) {
                console.log(val)
                this.checkedReport_grade = val ? this.gradeReportList.filter((item) => item.id) : [];
                this.isIndeterminate_grade = false;
                console.log(this.checkedReport_grade)
            },
            handleCheckedChange_grade(value) {
                console.log(value)
                let checkedCount = value.length;
                this.checkAll_grade = checkedCount === this.gradeReportList.length;
                this.isIndeterminate_grade = checkedCount > 0 && checkedCount < this.gradeReportList.length;
            },
            handleCheckAllChange_class(val) {
                console.log(val)
                this.checkedReport_class = val ? this.classReportList.filter((item) => item.id) : [];
                this.isIndeterminate_class = false;
                console.log(this.checkedReport_class)
            },
            handleCheckedChange_class(value) {
                console.log(value)
                let checkedCount = value.length;
                this.checkAll_class = checkedCount === this.classReportList.length;
                this.isIndeterminate_class = checkedCount > 0 && checkedCount < this.classReportList.length;
            },
            handleCheckAllChange_person(val) {
                console.log(val)
                this.checkedReport_person = val ? this.classList.filter((item) => item.classId) : [];
                this.isIndeterminate_person = false;
                console.log(this.checkedReport_person)
            },
            handleCheckedChange_person(value) {
                console.log(value)
                let checkedCount = value.length;
                this.checkAll_person = checkedCount === this.classList.length;
                this.isIndeterminate_person = checkedCount > 0 && checkedCount < this.classList.length;
            },
            setSavePath() {
                let that = this
                dialog.showOpenDialog({properties: ['openDirectory']}, function (path) {
                    console.log(path)
                    if (path) {
                        that.$store.dispatch('GET_SAVE_PATH', {savePath: path[0]})
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