<template>
  <div>
    <el-form :label-position="labelPosition" label-width="80px" :model="formLabelAlign" class="signin">
      <el-form-item label="账号：" class="mBot50 mTop80">
        <el-input v-model="formLabelAlign.username"></el-input>
      </el-form-item>
      <el-form-item label="密码：" class="mBot50">
        <el-input v-model="formLabelAlign.password" type="password"></el-input>
      </el-form-item>
      <el-checkbox v-model="formLabelAlign.remember" class="remember">记住密码</el-checkbox>
      <el-button type="primary" @click="onSubmit" class="onSubmit">登录</el-button>
    </el-form>
    <div class="box"></div>
    <el-dialog
      title="友情提示"
      :visible.sync="downDialogVisible"
      width="30%"
      center>
      <p class="center">首次使用需要初始化一些配置，为了不影响您的使用请耐心等待！</p>
      <div class="center mTop20">
        <el-progress type="circle" :percentage="downPer" color="#8e71c7"></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  const request = require('request')
  const extract = require('extract-zip')
  const path = require('path')
  const fs = require('fs')
  const asar = require('asar')
  const del = require('del')
  import {Loading} from 'element-ui'
  import {app, ipcRenderer} from 'electron'
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
        downPer: 0,
        tips: '',
        downloadPercent: 0
      }
    },
    computed: {
      appPath(){
        return this.$store.state.reportData.appPath
      }
    },
    mounted() {
      console.log(this.appPath)
      if (this.formLabelAlign.remember) {
        this.formLabelAlign.username = localStorage.getItem('username')
        this.formLabelAlign.password = localStorage.getItem('password')
      }
      this.detectionVersion()
    },
    methods: {
      async detectionVersion(){
        let data = await this.api.get(`${this.global.version_url}/data.json`, {})
        if(data){
          console.log(data)
          ipcRenderer.send("update");
          ipcRenderer.on("message", (event, text) => {
            console.log(arguments);
            this.tips = text;
          });
          ipcRenderer.on("downloadProgress", (event, progressObj)=> {
            console.log(progressObj);
            this.downloadPercent = progressObj.percent || 0;
          });
          ipcRenderer.on("isUpdateNow", () => {
            if(confirm('确认下载？')){
              ipcRenderer.send("isUpdateNow");
            }
          });
        }
      },
      getPubilc(){
        this.downDialogVisible = true
        let that = this, totalSize = 0, curSize = 0
        request
          .get(this.global.static_url)
          .on('error', function(err) {
            console.log(err)
          })
          .on('response', function(response) {
            console.log(response.statusCode) // 200
            totalSize = response.headers['content-length']
          })
          .on('data', function(data) {
            curSize += data.length
            that.downPer = parseInt(curSize / totalSize * 100)
          })
          .on('end', function () {
            console.log('结束了！')
            setTimeout(() => {
              extract('public.zip', {dir: that.appPath.split('downloadreport')[0] + 'downloadreport'}, function (err) {
                if(err){
                  return console.log(err)
                }
                console.log('unzip success')
                fs.unlink('public.zip', function(err){
                  if(err){
                    throw err;
                  }
                  console.log('文件:删除成功！');
                })
                that.downDialogVisible = false
              })
            }, 500)
          })
          .pipe(fs.createWriteStream('public.zip'))
      },
      beforeLogin(){
        //首次登录处理
        if(!fs.existsSync('public')){
          let loadingInstance = Loading.service({
            lock: true,
            text: '首次登录配置中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.5)'
          })
          setTimeout(() => {
            console.log(111)
            asar.extractAll(this.appPath, '')
            console.log(222)
            //del.sync('data.json', {force: true})
            //del.sync('dist/**', {force: true})
            //del.sync('node_modules/**', {force: true})
            loadingInstance.close()
            this.onSubmit()
          }, 500)
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
      async getTeacherSchool(){
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