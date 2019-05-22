<template>
    <div style="position: relative;">
        <div class="login_background"></div>
        <div class="login_background_2">
            <div class="login_left">
                <div class="left_img">
                    <img src="../assets/img/login_3.png" alt="">
                </div>
            </div>
            <div class="login_right">
                <div class="right_box">
                    <div class="login_box">
                        <h2 class="title">请您使用您的有谱教师账号登录</h2>
                        <el-form :label-position="labelPosition" label-width="80px" :model="formLabelAlign" class="signin">
                            <div class="input_box" :class="{'ipt_active': iptUserActive}">
                                <i class="iconfont icon-yonghu2"></i>
                                <input type="text" v-model="formLabelAlign.username" @keyup.enter="beforeLogin" placeholder="请输入用户名" @focus="iptUserActive = true" @blur="iptUserActive = false">
                            </div>
                            <div class="input_box" :class="{'ipt_active': iptPwdActive}">
                                <i class="iconfont icon-mima"></i>
                                <input type="password" v-model="formLabelAlign.password" @keyup.13="beforeLogin" placeholder="请输入密码" @focus="iptPwdActive = true" @blur="iptPwdActive = false">
                            </div>
                            <div class="remeber_box">
                                <el-checkbox v-model="formLabelAlign.remember" class="remember">记住密码</el-checkbox>
                            </div>
                            <div class="onSubmit_box">
                                <el-button type="primary" @click="beforeLogin" class="onSubmit mLeft40">登录</el-button>
                            </div>
                        </el-form>
                    </div>
                </div>
            </div>
        </div>
        <close-tip></close-tip>
        <!--提示有新版本-->
        <el-dialog
                title="友情提示"
                :visible.sync="isDownDialogVisible"
                width="400px"
                center>
            <p class="center">检测到了新的版本是否下载！</p>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isDownDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="conformDown()">确 定</el-button>
            </span>
        </el-dialog>
        <!--新版本下载进度-->
        <el-dialog
                title="友情提示"
                :visible.sync="downDialogVisible"
                :close-on-click-modal="false"
                width="400px"
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
    const os = require('os')
    const path = require('path')
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
                downloadPercent: 0,
                iptUserActive: false,
                iptPwdActive: false,
                exeVersion: require('../../../package.json').version
            }
        },
        computed: {
            appPath() {
                return this.$store.state.reportData.appPath
            },
            dataPath() {
                return this.$store.state.reportData.dataPath
            }
        },
        created() {
            if (this.formLabelAlign.remember) {
                console.log('记住密码')
                this.formLabelAlign.username = localStorage.getItem('username')
                this.formLabelAlign.password = localStorage.getItem('password')
            }
            if (!this.global.myEmitter) {
                console.log('myEmitter')
                this.global.myEmitter = new MyEmitter()
                this.global.myEmitter.on('complete_all', (data) => {

                })
                this.global.myEmitter.on('pdf_error', (data) => {
                    for(let i = 0, len = this.global.errReportList.length; i < len; i++){
                        if(this.global.errReportList[i].id == data.id){
                            return
                        }
                    }
                    this.global.errReportList.push(data)
                })
                this.global.myEmitter.on('pdf_error_redown', (id) => {
                    for(let i = 0, len = this.global.errReportList.length; i < len; i++){
                        if(this.global.errReportList[i].id == id){
                            this.global.errReportList.splice(i, 1)
                            return
                        }
                    }
                })
                this.global.myEmitter.on('complete_single_class', (data) => {
                })
                this.global.myEmitter.on('complete_single', (data) => {

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
                this.global.myEmitter.on('kill_wk', (data) => {
                    console.log('kill_wk 触发事件');
                    /*this.$notify({
                        title: '提示',
                        message: data.text,
                        duration: 0,
                        type: 'warning'
                    });*/
                })
                this.global.myEmitter.on('down_report_success', (data) => {
                })
            }
            if(process.env.NODE_ENV === 'production'){
                this.detectionVersion()
            }
        },
        mounted() {
            console.log('--------------------')
            console.log(process.env.NODE_ENV)
            console.log('--------------------')
            console.log(this.appPath)
            if(/[\u4e00-\u9fa5]/.test(this.appPath)){
                this.$notify({
                    title: '提示',
                    message: `检测到您把该应用安装在了包含中文的目录下面了，为了不影响你的使用，请您重新安装！`,
                    duration: 0,
                    type: 'success'
                });
            }
            console.log(this.appPath.split('\\node_modules')[0])
            if(process.env.NODE_ENV === 'development'){
                this.$store.dispatch('GET_DATA_PATH', {
                    dataPath: this.appPath.split('\\node_modules')[0]
                })
            }else{  //production
                this.$store.dispatch('GET_DATA_PATH', {
                    dataPath: os.homedir().split(':')[0] + ':' + path.sep + 'ProgramData' + path.sep + 'downloadreport'
                })
            }
            let that = this
            window.addEventListener('online', function () {
                that.$notify({
                    title: '提示',
                    message: `网络连接成功！`,
                    duration: 0,
                    type: 'warning'
                });
                console.log('有网络了');
            })
            window.addEventListener('offline', function () {
                that.$notify({
                    title: '提示',
                    message: `网络异常，请您检查一下网络问题！`,
                    duration: 0,
                    type: 'warning'
                });
                console.log('断网了');
            })
        },
        methods: {
            conformDown() {
                this.isDownDialogVisible = false
                this.downDialogVisible = true
                ipcRenderer.send("update");
                ipcRenderer.on("message", (event, text) => {
                    this.tips = text;
                });
                ipcRenderer.on("downloadProgress", (event, progressObj) => {
                    this.downloadPercent = parseInt(progressObj.percent || 0);
                });
                ipcRenderer.on("isUpdateNow", () => {
                    ipcRenderer.send("isUpdateNow");
                });
            },
            async detectionVersion() {
                let data = await this.api.get(`${this.global.version_url}/data.json?${new Date().getTime()}`, {})
                if (data) {
                    function isDown(curVersion, remoteVertion) {
                        curVersion = curVersion.split('.')
                        remoteVertion = remoteVertion.split('.')
                        console.log(curVersion, remoteVertion)
                        if (curVersion[0] < remoteVertion[0]) { //每次更新时依次对比每一位的数字大小，都为1位数字
                            return true
                        } else if (curVersion[1] < remoteVertion[1]) {
                            return true
                        } else if (curVersion[2] < remoteVertion[2]) {
                            return true
                        } else {
                            return false
                        }
                    }
                    if (isDown(this.exeVersion, data.version)) {
                        this.isDownDialogVisible = true
                    }
                }
            },
            getPublic(){
                let loadingInstance = Loading.service({
                    lock: true,
                    text: '数据处理中请稍后...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.5)'
                })
                setTimeout(() => {
                    console.log(this.appPath, this.dataPath)
                    try {
                        console.log(this.appPath, this.dataPath)
                        asar.extractAll(this.appPath, this.dataPath)
                        if (!fs.existsSync(`${this.dataPath}${path.sep}public${path.sep}html`)) {
                            fs.mkdirSync(`${this.dataPath}${path.sep}public${path.sep}html`)
                        }
                        fse.removeSync(`${this.dataPath}${path.sep}node_modules`)
                        fse.removeSync(`${this.dataPath}${path.sep}data.json`)
                        fse.removeSync(`${this.dataPath}${path.sep}dist`)
                        fs.writeFileSync(`${this.dataPath}${path.sep}version.json`, JSON.stringify({
                           version: this.exeVersion
                        }))
                    }catch (e) {
                        console.log(e)
                    }
                    loadingInstance.close()
                    this.onSubmit()
                }, 500)
            },
            beforeLogin() {
                if(process.env.NODE_ENV !== 'development'){
                    //如果public文件不存在或者不是最新的就处理
                    if (!fs.existsSync(`${this.dataPath}/public`) || !fse.pathExistsSync(`${this.dataPath}${path.sep}version.json`)) {
                        this.getPublic()
                    }else {
                        if(JSON.parse(fs.readFileSync(`${this.dataPath}${path.sep}version.json`).toString()).version != this.exeVersion){
                            this.getPublic()
                        }else{
                            this.onSubmit()
                        }
                    }
                }else{
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
                    username: this.formLabelAlign.username.trim(),
                    password: this.formLabelAlign.password.trim(),
                    type: 1 //教师
                }
                let data = await this.api.get(url, params, {loading: true})
                if (data) {
                    this.global.uid = data.uid
                    this.global.sid = data.sid
                    sessionStorage.setItem('sid', data.sid)
                    sessionStorage.setItem('uid', data.uid)
                    if (!this.formLabelAlign.remember) {
                        localStorage.removeItem('remember')
                        localStorage.removeItem('username')
                        localStorage.removeItem('password')
                    } else {
                        localStorage.setItem('remember', 'true')
                        localStorage.setItem('username', this.formLabelAlign.username.trim())
                        localStorage.setItem('password', this.formLabelAlign.password.trim())
                    }
                    this.getInfoByUid()
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
                    this.global.roleNickName = roleObj.nickName
                    sessionStorage.setItem('roleId', roleObj.roleId)
                    sessionStorage.setItem('roleName', roleObj.roleName)
                    sessionStorage.setItem('roleNickName', roleObj.nickName)
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
                    this.global.schoolName = data.infoList[0].schoolName
                    this.global.schoolId = data.infoList[0].schoolId
                    sessionStorage.setItem('schoolName', data.infoList[0].schoolName)
                    sessionStorage.setItem('schoolId', data.infoList[0].schoolId)
                    this.$router.push({
                        path: '/Home'
                    })
                }
            },
            async getInfoByUid() {
                let url = '/das/commonInfo/getInfoByUid'
                let params = {
                    sid: this.global.sid,
                    uid: this.global.uid
                }
                let data = await this.api.get(url, params)
                if (data) {
                    this.global.nickName = data.infoData.nickName
                    sessionStorage.setItem('nickName', data.infoData.nickName)
                }
            }
        }
    }
</script>

<style scoped>

    .login_background {
        width: 100%;
        height: 100%;
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        background: url(../assets/img/login_1.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }

    .login_background_2 {
        width: 88%;
        height: 88%;
        position: fixed;
        margin: auto;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        background: url(../assets/img/login_5.png);
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }


    .login_left {
        float: left;
        width: 50%;
        height: 100%;
    }

    .login_left .left_img {
        width: 100%;
        height: 100%;
        position: relative;
    }

    .login_left .left_img > img {
        width: 80%;
        position: absolute;
        margin: auto;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }

    .login_right {
        float: left;
        width: 50%;
        height: 100%;
        position: relative;
    }
    .right_box{
        margin-top: 20%;
    }
    .signin {
        width: 460px;
        height: 400px;
        text-align: center;
        z-index: 22;
    }
    .login_box{
        width: 460px;
        height: 400px;
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        margin: auto;
    }
    .login_right .title{
        font-weight: 700;
        color: #00b0f0;
        text-align: center;
        font-size: 26px;
        height: 40px;
        line-height: 40px;
    }
    .input_box{
        margin-top: 40px;
        text-align: left;
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #cdcdcd;
    }
    .input_box i{
        font-size: 20px;
        margin-top: 10px;
    }
    .input_box input{
        width: 400px;
        margin-left: 20px;
        border: none;
        height: 30px;
        line-height: 30px;
        font-size: 16px;
        color: #666666;
    }
    .remeber_box{
        margin-top: 40px;
        height: 40px;
        line-height: 40px;
        text-align: left;
    }
    .onSubmit_box{
        margin-top: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
    }
    .onSubmit{
        width: 200px;
    }
    .ipt_active{
        border-bottom: 1px solid #66b1ff;
    }
</style>