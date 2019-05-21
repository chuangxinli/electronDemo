
const del = require('del')
let api_url, type = 1   //1正式 2 测试
let dev = true   //开发环境  打包成exe时，必须为false
function delTemp(dataPath) {
    del.sync(`${dataPath}/public/html/*`)
    del.sync(`${dataPath}/public/report/clip_tool/images/*`)
}
function isAllowDownReport(downTaskList) {
    let num = 0
    for(let i = 0, len = downTaskList.length; i < len; i++) {
        if(downTaskList[i].gradeReportInfo.gradeReportList && downTaskList[i].gradeReportInfo.gradeReportList.length > 0 && !downTaskList[i].gradeReportInfo.isComplete){
            num++
        }
        if(downTaskList[i].classReportInfo.classReportList && downTaskList[i].classReportInfo.classReportList.length > 0 && !downTaskList[i].classReportInfo.isComplete){
            num++
        }
        if(downTaskList[i].classPersonReportList && downTaskList[i].classPersonReportList.length > 0 && !downTaskList[i].classPersonReportList.isComplete){
            num++
        }
        if(downTaskList[i].singlePersonInfo.singlePersonList && downTaskList[i].singlePersonInfo.singlePersonList.length > 0 && !downTaskList[i].singlePersonInfo.isComplete){
            num++
        }
        if(num > 6){
            return false
        }
    }
    return true
}
switch (type) {
    case 1:
        api_url = 'http://das.51youpu.com'
        break
    case 2:
        api_url = 'http://120.27.195.10:8090'
        break
    default:
        api_url = 'http://das.51youpu.com'
}
export default {
    api_url,
    version_url: 'http://39.96.186.199/win', //判断是否有新的版本
    sid: '',
    uid: '',
    roleId: '',
    roleName: '',
    roleNickName: '',
    nickName: '',
    schoolName: '',
    schoolId: '',
    delTemp,
    isAllowDownReport,
    dev,
    downTaskList: [],  //下载报告列表
    isDownTaskComplete: true,
    myEmitter: '',  //事件监听
    errReportList: [] //错误报告列表
}
