<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>有谱周测</el-breadcrumb-item>
            <el-breadcrumb-item>学情报告</el-breadcrumb-item>
            <el-breadcrumb-item>查看报告</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="mTop20">
            <el-button :type="curActive == 'person' ? 'primary' : ''" size="small" @click="getClassList()">个人报告</el-button>
            <el-select v-model="classId" placeholder="请选择" size="small" class="mLeft20" @change="getPaperTestStuDetail()" v-show="curActive == 'person'">
                <el-option
                        v-for="item in classList"
                        :key="item.classId"
                        :label="item.className"
                        :value="item.classId">
                </el-option>
            </el-select>
            <el-button :type="curActive == 'class' ? 'primary' : ''" size="small" class="mLeft20" @click="getPaperTestClassDetail()" v-show="testObject == 1">班级报告</el-button>
            <el-button :type="curActive == 'grade' ? 'primary' : ''" size="small" class="mLeft20" @click="getPaperTestGradeDetail()" v-show="testObject == 1">年级报告</el-button>
            <el-button type="primary" size="small" class="mLeft20" @click="$router.go(-1)">返回</el-button>
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
                        width="100">
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
                        <el-button @click="downClassReport(scope.row)" type="text" size="small">下载报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return{
                taskId: '',
                testObject: '',
                gradeReportList: [],
                classReportList: [],
                personReportList: [],
                classList: [],
                classId: '',
                curActive: 'grade',
                curType: 3 // 1：个人 2：班级 3：年级
            }
        },
        mounted() {
            this.taskId = this.$route.params.taskId
            this.testObject = this.$route.params.testObject
            if(this.testObject == 2){
                this.curActive = 'person'
                this.getClassList()
            }else{
                this.getPaperTestGradeDetail()
            }
        },
        methods: {
            async getPaperTestGradeDetail(){
                this.curActive = 'grade'
                let url = '/das/testManager/getPaperTestClassDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    type: ''
                }
                let data = await this.api.get(url, params, {loading: true})
                if(data){
                    this.gradeReportList = data.reportList
                    console.log(data)
                }
            },
            async getPaperTestClassDetail(){
                this.curActive = 'class'
                let url = '/das/testManager/getPaperTestClassDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    type: ''
                }
                let data = await this.api.get(url, params, {loading:  true})
                if(data){
                    this.classReportList = data.reportList
                    console.log(data)
                }
            },
            async getClassList(){
                this.curActive = 'person'
                let url = '/das/homework/relation/classes'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    testHomeworkId: this.taskId
                }
                let data = await this.api.get(url, params, {loading: true})
                if(data){
                    this.classList = data.classList
                    this.classId = this.classList[0].classId
                    this.getPaperTestStuDetail()
                    console.log(data)
                }
            },
            async getPaperTestStuDetail(){
                let url = '/das/testManager/getPaperTestStuDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    classid: this.classId,
                    type: ''
                }
                let data = await this.api.get(url, params, {loading: true})
                if(data){
                    this.personReportList = data.reportList
                    console.log(data)
                }
            },
            downGradeReport(row){
                console.log(row)
            },
            downClassReport(row){
                console.log(row)
            },
            dealScore(row){
                return row.maxScore + '/' + row.totalScore
            }
        }
    }
</script>

<style scoped>

</style>