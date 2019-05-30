
const del = require('del')
let api_url, type = 1   //1正式 2 测试
function delTemp(dataPath) {
    del.sync(`${dataPath}/public/html/*`, {force: true})
    del.sync(`${dataPath}/public/report/clip_tool/images/*`, {force: true})
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
        api_url = ''
        break
    case 2:
        api_url = ''
        break
    default:
        api_url = ''
}
export default {
    api_url,
    version_url: 'http://download-emingren-com.oss-cn-hangzhou.aliyuncs.com/reportDownTool/win', //判断是否有新的版本
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
    downTaskList: [],  //下载报告列表
    isDownTaskComplete: true,
    myEmitter: '',  //事件监听
    errReportList: [] //错误报告列表
}
