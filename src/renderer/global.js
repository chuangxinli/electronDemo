const del = require('del')
let dev = false
function delTemp() {
  del.sync('public/html/*')
  del.sync('public/report/clip_tool/images/*')
}
export default {
  api_url: 'http://das.51youpu.com',
  static_url: 'http://39.96.186.199/static/public.zip',
  version_url: 'http://39.96.186.199/win',
  dev,
  sid: '',
  uid: '',
  roleId: '',
  roleName: '',
  nickName: '',
  schoolName: '',
  schoolId: '',
  delTemp,
  downTaskList: [],
  downErrInfo: {
    failPdfList: []
  },
  isDownTaskComplete: false
}
