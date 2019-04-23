<template>
    <div>
        <el-form :label-position="labelPosition" label-width="80px" :model="formLabelAlign" class="signin">
            <el-form-item label="账号：" class="mBot50 mTop80">
                <el-input v-model="formLabelAlign.username" @keyup.native.enter="beforeLogin"></el-input>
            </el-form-item>
            <el-form-item label="密码：" class="mBot50">
                <el-input v-model="formLabelAlign.password" type="password" @keyup.native.13="beforeLogin"></el-input>
            </el-form-item>
            <el-checkbox v-model="formLabelAlign.remember" class="remember">记住密码</el-checkbox>
            <el-button type="primary" @click="beforeLogin" class="onSubmit mLeft40">登录</el-button>
        </el-form>
        <div class="box"></div>
        <el-dialog
                title="友情提示"
                :visible.sync="isDownDialogVisible"
                width="40%"
                center>
            <p class="center">检测到了新的版本是否下载！</p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isDownDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="conformDown()">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog
                title="友情提示"
                :visible.sync="downDialogVisible"
                width="40%"
                center>
            <p class="center">正在下载中。。。。。。请耐心等待！</p>
            <div class="center mTop20">
                <el-progress type="circle" :percentage="downloadPercent" color="#8e71c7"></el-progress>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    const fs = require('fs')
    const asar = require('asar')
    import {Loading} from 'element-ui'
    const fse = require('fs-extra')
    const {ipcRenderer} = require('electron')
    const EventEmitter = require('events');

    class MyEmitter extends EventEmitter {
    }

    export default {
        data() {
            return {
                labelPosition: 'center',
                formLabelAlign: {
                    username: '',
                    password: '',
                    remember: localStorage.getItem('remember') ? true : false,
                },
                downDialogVisible: false,
                isDownDialogVisible: false,
                tips: '',
                downloadPercent: 0
            }
        },
        computed: {
            appPath() {
                return this.$store.state.reportData.appPath
            }
        },
        mounted() {
            if(!this.global.myEmitter){
                this.global.myEmitter = new MyEmitter()
                this.global.myEmitter.on('complete_all', (data) => {
                    if (this.global.isDownTaskComplete) {
                        this.$notify({
                            title: '提示',
                            message: `当前所有报告下载任务均已下载完毕！`,
                            duration: 0,
                            type: 'success'
                        });
                    }
                })
                this.global.myEmitter.on('pdf_error', (data) => {
                    this.global.errReportList.push(data)
                })
                this.global.myEmitter.on('complete_single_class', (data) => {

                })
                this.global.myEmitter.on('complete_single', (data) => {
                    if (this.global.isDownTaskComplete) {
                        this.$notify({
                            title: '提示',
                            message: `当前所有报告下载任务均已下载完毕！！`,
                            duration: 0,
                            type: 'success'
                        });
                    }
                })
                this.global.myEmitter.on('warn', (data) => {
                    console.log('warn 触发事件');
                    this.$notify({
                        title: '提示',
                        message: data.text,
                        duration: 0,
                        type: 'warning'
                    });
                })
            }
            console.log(this.appPath)
            console.log(require('../../../package.json').version)
            if (this.formLabelAlign.remember) {
                this.formLabelAlign.username = localStorage.getItem('username')
                this.formLabelAlign.password = localStorage.getItem('password')
            }
            this.detectionVersion()
        },
        methods: {
            conformDown(){
                this.isDownDialogVisible = false
                this.downDialogVisible = true
                ipcRenderer.send("update");
                ipcRenderer.on("message", (event, text) => {
                    console.log(arguments);
                    this.tips = text;
                });
                ipcRenderer.on("downloadProgress", (event, progressObj) => {
                    console.log(progressObj);
                    this.downloadPercent = parseInt(progressObj.percent || 0);
                });
                ipcRenderer.on("isUpdateNow", () => {
                    ipcRenderer.send("isUpdateNow");
                });
            },
            async detectionVersion() {
                let data = await this.api.get(`${this.global.version_url}/data.json?${new Date().getTime()}`, {})
                if (data) {
                    console.log(data.version)
                    function isDown(curVersion, remoteVertion) {
                        curVersion = curVersion.split('.')
                        remoteVertion = remoteVertion.split('.')
                        if (curVersion[0] < remoteVertion[0]) {
                            return true
                        } else if (curVersion[1] < remoteVertion[1]) {
                            return true
                        } else if (curVersion[2] < remoteVertion[2]) {
                            return true
                        } else {
                            return false
                        }
                    }

                    if (isDown(require('../../../package.json').version, data.version)) {
                        this.isDownDialogVisible = true
                    }
                }
            },
            beforeLogin() {
                //首次登录处理
                if (!fs.existsSync('public')) {
                    let loadingInstance = Loading.service({
                        lock: true,
                        text: '首次登录配置中...',
                        spinner: 'el-icon-loading',
                        background: 'rgba(0, 0, 0, 0.5)'
                    })
                    setTimeout(() => {
                        asar.extractAll(this.appPath, '')
                        if(!fs.existsSync('public/html')){
                            fs.mkdirSync('public/html')
                        }
                        fse.removeSync('node_modules')
                        fse.removeSync('data.json')
                        fse.removeSync('dist')
                        loadingInstance.close()
                        this.onSubmit()
                    },500)
                } else {
                    this.onSubmit()
                }
            },
            async onSubmit() {
                if (!this.formLabelAlign.username) {
                    this.$message({
                        type: 'warning',
                        message: '账号不能为空！',
                        showClose: true,
                        duration: 2000
                    })
                    return
                }
                if (!this.formLabelAlign.password) {
                    this.$message({
                        type: 'warning',
                        message: '密码不能为空！',
                        showClose: true,
                        duration: 2000
                    })
                    return
                }
                let url = '/login'
                let params = {
                    username: this.formLabelAlign.username,
                    password: this.formLabelAlign.password,
                    type: 1 //教师
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    console.log(data)
                    this.global.uid = data.uid
                    this.global.sid = data.sid
                    sessionStorage.setItem('sid', data.sid)
                    sessionStorage.setItem('uid', data.uid)
                    console.log(this.formLabelAlign.remember)
                    if (!this.formLabelAlign.remember) {
                        localStorage.removeItem('remember')
                        localStorage.removeItem('username')
                        localStorage.removeItem('password')
                    } else {
                        localStorage.setItem('remember', 'true')
                        localStorage.setItem('username', this.formLabelAlign.username)
                        localStorage.setItem('password', this.formLabelAlign.password)
                    }
                    this.getRoleList()
                }
            },
            async getRoleList() {
                let url = '/das/systemManage/getRoleListByUid'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid
                }
                let data = await this.api.get(url, params)
                if (data) {
                    let roleObj = data.infoList.filter(function (item) {
                        return item.default == 1
                    })[0] ? data.infoList.filter(function (item) {
                        return item.default == 1
                    })[0] : data.infoList[0]
                    this.global.roleId = roleObj.roleId
                    this.global.roleName = roleObj.roleName
                    this.global.nickName = roleObj.nickName
                    sessionStorage.setItem('roleId', roleObj.roleId)
                    sessionStorage.setItem('roleName', roleObj.roleName)
                    sessionStorage.setItem('nickName', roleObj.nickName)
                    this.getTeacherSchool()
                }
            },
            async getTeacherSchool() {
                let url = '/das/scanExam/getTeacherSchool'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid,
                    teacherId: this.global.uid
                }
                let data = await this.api.get(url, params)
                if (data) {
                    console.log(data)
                    this.global.schoolName = data.infoList[0].schoolName
                    this.global.schoolId = data.infoList[0].schoolId
                    sessionStorage.setItem('schoolName', data.infoList[0].schoolName)
                    sessionStorage.setItem('schoolId', data.infoList[0].schoolId)
                    this.$router.push({
                        path: '/Home'
                    })
                }
            }
        }
    }
</script>

<style scoped>
    .signin {
        width: 400px;
        height: 400px;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        text-align: center;
        z-index: 22;
    }

    .box {
        width: 600px;
        height: 400px;
        border: 1px solid #cdcdcd;
        border-radius: 30px;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        text-align: center;
    }

    .signinBtn {
        width: 200px;
        margin-left: 20px;
    }
</style>