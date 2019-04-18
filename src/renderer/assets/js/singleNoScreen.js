const {execFile} = require('child_process')
const axios = require("axios")
const {getReportModel, getPart, baseURL} = require('./common')
const fse = require('fs-extra')


let singleNoScreen = function (reportIdList, obj, myEmitter) {
  if (!obj.savePath) {
    myEmitter.emit('warn', {text: '请先设置报告的下载路径！'})
    return
  } else if (!fs.existsSync(obj.savePath)){
    myEmitter.emit('warn', {text: '报告的下载路径不存在，请重新设置！'})
    return
  }
  let pdfServerBasePath = obj.appPath, savePath = obj.savePath, correctIdList = [], errIdList = [], failIdList = [],
    successIdList = [], index = 0
  let {header, footer, cover, content} = getPart(obj.type)
  let reportModel = getReportModel(obj.type)
  if (obj.type == 1 || obj.type == 2) {
    reportIdList.forEach((item) => {
      getReportData(item, function (item) {
        correctIdList.push(item)
        if (correctIdList.length + errIdList.length == reportIdList.length) {
          getPdf(correctIdList, obj)
        }
      })
    })
  } else {
    getPdf(reportIdList, obj)
  }
  function getReportData(params, callback) {
    axios({
      url: '/das/learningreport/getReportContent',
      method: 'get',
      baseURL: baseURL,
      params: {id: params.id},
    }).then(function (response) {
      console.log(response)
      if (response.data.contentType === 'all') {
        callback(params);
      } else {
        errIdList.push(params)
      }
    })
      .catch(function (error) {
        errIdList.push(params)
        console.log(params.id + ' 报告调取api失败：');
        console.log(error);
      });
  }

  function getPdf(correctIdList, obj) {
    if (index < correctIdList.length) {
      if(correctIdList[index].isDown){
        correctIdList[index].status = 2
        //myEmitter.emit('begin', correctIdList[index])
        console.log('index', index)
        let id = correctIdList[index].id, pdfName
        let name = correctIdList[index].studentName ? correctIdList[index].studentName : correctIdList[index].name
        name = name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\(\)（）【】\[\]\s]*/g, '')
        console.log('name', name)
        if(obj.isBatch && obj.type == 5 || obj.type == 6){
          pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告/${id}(${name}).pdf`
          if(!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告`)){
            fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告`)
          }
        }else if(obj.isBatch && obj.type == 3 || obj.type == 4){
          pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告/${id}(${name}).pdf`
          if(!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告`)){
            fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告`)
          }
        }else{
          pdfName = `${savePath}/${id}(${name}).pdf`;
        }
        let params = {
          footer: `file:///${pdfServerBasePath}/public/report/${reportModel}/${footer}?id=${id}`,
          header: `file:///${pdfServerBasePath}/public/report/${reportModel}/${header}?id=${id}`,
          cover: `file:///${pdfServerBasePath}/public/report/${reportModel}/${cover}?id=${id}`,
          content: `file:///${pdfServerBasePath}/public/report/${reportModel}/${content}?id=${id}`,
          pdfName: pdfName
        }
        console.log(params)
        execFile('public/exe/wkhtmltopdf.exe', ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], {maxBuffer: 1000 * 1024}, (error, stdout, stderr) => {
          console.log('execFile')
          if (error) {
            correctIdList[index].status = 4
            failIdList.push(correctIdList[index])
            index++
            console.error(`${id}报告生成失败`, stderr);
            console.log(error)
            if (stderr.includes("Error: Unable to write to destination")) {
              console.log("文件操作失败，请确保同样名称的文件没有没打开！")
            }
            getPdf(reportIdList, obj)
          } else {
            reportIdList[index].status = 3
            reportIdList[index].savePath = pdfName
            //myEmitter.emit('singleReportComplete', reportIdList[index])
            successIdList.push(correctIdList[index])
            index++
            console.log(`${id}报告生成成功`);
            getPdf(reportIdList, obj)
          }
        })
      }else{
        index++
        getPdf(reportIdList, obj)
      }
    } else {
      console.log('complete')
      myEmitter.emit('complete', {failIdList, successIdList, obj})
    }
  }
}

module.exports = singleNoScreen