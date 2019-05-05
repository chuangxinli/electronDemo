
const del = require('del')
let dev = false, api_url, type = 1   //1正式 2 测试
function delTemp() {
    del.sync('public/html/*')
    del.sync('public/report/clip_tool/images/*')
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
    dev,
    sid: '',
    uid: '',
    roleId: '',
    roleName: '',
    roleNickName: '',
    nickName: '',
    schoolName: '',
    schoolId: '',
    delTemp,
    downTaskList: [],  //下载报告列表
    downTaskInfo: {
        isDownTaskComplete: false,  //当前所有下载任务是否完成
        childProcessNum: 0 //wk工具进程个数
    },
    myEmitter: '',  //时间监听
    errReportList: [] //错误报告列表
}