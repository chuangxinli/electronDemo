<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>有谱月考</el-breadcrumb-item>
            <el-breadcrumb-item>学情报告</el-breadcrumb-item>
            <el-breadcrumb-item>查看报告</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="mTop20">
            <el-button :type="curActive == 'person' ? 'primary' : ''" size="small" @click="getClassList()">个人报告</el-button>
            <el-button :type="curActive == 'class' ? 'primary' : ''" size="small" class="mLeft20" @click="getPaperTestClassDetail()">班级报告</el-button>
            <el-button :type="curActive == 'grade' ? 'primary' : ''" size="small" class="mLeft20" @click="getPaperTestGradeDetail()">年级报告</el-button>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return{
                taskId: '',
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
            this.getPaperTestGradeDetail()
            this.getPaperTestClassDetail()
            this.getClassList()
        },
        methods: {
            async getPaperTestGradeDetail(){
                this.curActive = 'grade'
                let url = '/das/testManager/getPaperTestGradeDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    type: 4
                }
                let data = await this.api.get(url, params, {loading: true})
                if(data){
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
                    type: 5
                }
                let data = await this.api.get(url, params, {loading:  true})
                if(data){
                    console.log(data)
                }
            },
            async getClassList(){
                this.curActive = 'person'
                let url = '/das/scanExam/getClassList'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    homeworkId: this.taskId
                }
                let data = await this.api.get(url, params, {loading: true})
                if(data){
                    console.log(data)
                }
            },
            async getPaperTestStuDetail(){
                let url = '/das/testManager/getPaperTestStuDetail'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    taskId: this.taskId,
                    classId: this.classId,
                    type: 6
                }
                let data = await this.api.get(url, params, {loading: true})
                if(data){
                    console.log(data)
                }
            }
        }
    }
</script>

<style scoped>

</style>