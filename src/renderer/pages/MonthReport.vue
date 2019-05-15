<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>月考报告</el-breadcrumb-item>
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
            <el-select v-model="selectSubjectId" size="small" placeholder="请选择" class="mRight20" @change="getTestList()">
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
                        prop="examName"
                        label="考试名称"
                        width="">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="examId"
                        label="考试ID"
                        width="100">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="subjectName"
                        label="当前学科"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="examTime"
                        label="考试日期"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="examType"
                        label="考试类型"
                        width="100">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="gradeName"
                        label="考试年级"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        prop="createTime"
                        label="创建日期"
                        width="120">
                </el-table-column>
                <el-table-column
                        align="center"
                        label="操作"
                        width="100">
                    <template slot-scope="scope">
                        <el-button @click="seeMonthReport(scope.row)" type="text" size="small">查看报告</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <paging class="mTop20" :current-page="currentPage" :total-num="total" :page-size="pageSize" @childrenChange="pageChange"
                    v-show="testList && testList.length > 0"></paging>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                gradeList: [],
                selectGradeId: '',
                subjectList: [],
                selectSubjectId: '',
                currentPage: 1,
                pageSize: 10,
                total: 0,
                testList: []
            }
        },
        mounted() {
            this.getSubjectGradeCondition()
        },
        methods: {
            async getSubjectGradeCondition() {
                let url = '/das/scanExam/getSubjectGradeCondition'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    roleId: this.global.roleId,
                    schoolId: this.global.schoolId
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    console.log(data)
                    this.gradeList = data.infoData.gradeList
                    this.gradeList.unshift({
                        gradeCode: 0,
                        gradeName: '全部'
                    })
                    this.selectGradeId = this.gradeList[0].gradeCode
                    this.subjectList = data.infoData.subjectList
                    this.subjectList.unshift({
                        subjectName: '全部',
                        subjectCode: 0
                    })
                    this.selectSubjectId = this.subjectList[0].subjectCode
                    this.getTestList()
                }
            },
            async getTestList() {
                let url = '/das/scanExam/getExamReportList'
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
                    console.log(data)
                    this.testList = data.infoList
                    this.total = data.count
                }
            },
            pageChange(currentPage, pageSize) {
                this.currentPage = currentPage
                this.pageSize = pageSize
                this.getTestList()
            },
            seeMonthReport(row){
                console.log(row.homeworkId)
                this.$router.push({
                    path: `/Home/SeeMonthReport/${row.homeworkId}/${row.subjectName}/${row.gradeName}/${row.subjectId}`
                })
            }
        }
    }
</script>

<style scoped>

</style>