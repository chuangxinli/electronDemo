const pug = require('pug')
const fs = require('fs')
const fse = require('fs-extra')
const axios = require('axios')
const {baseURL} = require('./common')
const {exec} = require('child_process')



let singleScreen = function (reportIdList, obj, myEmitter) {
  console.log('1111')
  let correctIdList = [], errIdList = [], noPayList = []
  reportIdList.forEach((item) => {
    getHtml(item, function (correctIdList) {
      let correctIds = [], pathStrUrls = [], isStrs
      correctIdList.forEach((item) => {
        correctIds.push(item.id)
        pathStrUrls.push(`${obj.appPath}/public/img/${item.id}`)
      })
      console.log(pathStrUrls)
      isStrs = correctIds.toString()
      pathStrUrls = pathStrUrls.toString()
      console.log('正确id：' + correctIds)
      console.log('image 生成中...');
      console.log(isStrs);
      console.log(pathStrUrls);
      let cmdStr = `phantomjs public/pug/screen_shot.js ${pathStrUrls} ${isStrs}`;
      console.log(cmdStr)
      exec(cmdStr, function (err, stdout, stderr) {
        console.log('image 生成结束...')

        if (err) {
          console.error(`图片生成失败`, stderr)
          return;
        }
        //getPdf(correctIds,2);
        //getPdf2(correctIds, routType, 0);
        //console.log(`图片生成成功`);
      });
    })
  })
  function getHtml(params, callback) {
    axios({
      url: '/das/learningreport/getReportContent',
      method: 'get',
      baseURL: baseURL,
      params: {id: params.id},
    }).then(function (response) {
      console.log(response)
      if(response.data.recode == 0){
        if(obj.type == 1 || obj.type == 2){
          if (response.data.contentType === 'all') {
            let temp = pug.renderFile('public/pug/report.pug', response.data)
            fs.writeFileSync(`public/html/${params.id}/${params.id}.html`, temp)
            correctIdList.push(params)
          } else {
            noPayList.push(params)
          }
        }else if(obj.type == 5 || obj.type == 6){
          let temp = pug.renderFile('public/pug/classReport.pug', response.data)
          fs.writeFileSync(`public/html/${params.id}.html`, temp)
          correctIdList.push(params)
        }
        if(noPayList.length + errIdList.length + correctIdList.length === reportIdList.length){
          callback(correctIdList)
          console.log('完成了！')
        }
      }else{
        errIdList.push(params)
        console.log(params.id + ' 报告调取api失败：');
        console.log(error);
      }
    })
      .catch(function (error) {
        errIdList.push(params)
        console.log(params.id + ' 报告调取api失败：');
        console.log(error);
      });
  }
}

module.exports = singleScreen