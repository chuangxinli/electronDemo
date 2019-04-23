
const del = require('del')
let dev = false
function delTemp() {
    del.sync('public/html/*')
    del.sync('public/report/clip_tool/images/*')
}
export default {
    api_url: 'http://das.51youpu.com',
    version_url: 'http://39.96.186.199/win', //判断是否有新的版本
    dev,
    sid: '',
    uid: '',
    roleId: '',
    roleName: '',
    nickName: '',
    schoolName: '',
    schoolId: '',
    delTemp,
    downTaskList: [],  //下载报告列表
    isDownTaskComplete: false,  //当前所有下载任务是否完成
    myEmitter: '',  //时间监听
    errReportList: [] //错误报告列表
}