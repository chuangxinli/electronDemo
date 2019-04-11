const pug = require('pug')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const {baseURL, getReportModel} = require('./common')
const {execFile} = require('child_process')
const fse = require("fs-extra")


let singleScreen = function (reportIdList, obj, myEmitter) {
  if (!obj.savePath) {
    myEmitter.emit('warn', {text: '请先设置报告的下载路径！'})
    return
  }
  let pdfServerBasePath = obj.appPath, savePath = obj.savePath, correctList = [], errList = [], noPayList = [],
    failPdfList = [], successList = [], index = 0
  let reportModel = getReportModel(obj.type)
  reportIdList.forEach((item) => {
    getHtml(item, function (correctList) {
      let correctIds = [], pathStrUrls = [], isStrs
      correctList.forEach((item) => {
        correctIds.push(item.id)
        pathStrUrls.push(path.normalize(`${obj.appPath}/public/html/${item.id}.html`))
      })
      if (correctList.length === 1) {
        correctIds.push(correctIds[0])
        pathStrUrls.push(pathStrUrls[0])
      }
      console.log(pathStrUrls)
      isStrs = correctIds.toString()
      pathStrUrls = pathStrUrls.toString()
      console.log('正确id：' + correctIds)
      console.log('image 生成中...');
      execFile('public/exe/phantomjs.exe', ['public/pug/screen_shot.js', pathStrUrls, isStrs], function (err, stdout, stderr) {
        console.log('image 生成结束...')
        if (err) {
          console.error(`图片生成失败`, stderr)
          return;
        }
        getPdf(correctList, obj)
      })
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
      if (response.data.recode == 0) {
        if (obj.type == 1 || obj.type == 2) {
          if (response.data.contentType === 'all') {
            let temp = pug.renderFile('public/pug/report.pug', response.data)
            fs.writeFileSync(`public/html/${params.id}.html`, temp)
            correctList.push(params)
          } else {
            noPayList.push(params)
          }
        } else if (obj.type == 5 || obj.type == 6) {
          let temp = pug.renderFile('public/pug/classReport.pug', response.data)
          fs.writeFileSync(`public/html/${params.id}.html`, temp)
          correctList.push(params)
        }
        if (noPayList.length + errList.length + correctList.length === reportIdList.length) {
          console.log('完成了！')
          callback(correctList)
        }
      } else {
        errList.push(params)
        console.log(params.id + ' 报告调取api失败：');
        console.log(error);
      }
    })
      .catch(function (error) {
        errList.push(params)
        console.log(params.id + ' 报告调取api失败：');
        console.log(error);
      });
  }

  function getPdf(correctList, obj) {
    if (index < correctList.length) {
      console.log('index', index)
      let id = correctList[index].id, pdfName
      let name = correctList[index].studentName ? correctList[index].studentName : correctList[index].name
      name = name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\(\)（）【】\[\]\s]*/g, '')
      console.log('name', name)
      if (obj.isBatch && obj.type == 5 || obj.type == 6) {
        pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告/${id}(${name}).pdf`
        if (!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告`)) {
          fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告`)
        }
      } else if (obj.isBatch && obj.type == 3 || obj.type == 4) {
        pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告/${id}(${name}).pdf`
        if (!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告`)) {
          fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告`)
        }
      } else {
        pdfName = `${savePath}/${id}(${name}).pdf`;
      }
      let params = {
        footer: `file:///${pdfServerBasePath}/public/report/${reportModel}/Footer.html?id=${id}`,
        header: `file:///${pdfServerBasePath}/public/report/${reportModel}/Header.html?id=${id}`,
        cover: `file:///${pdfServerBasePath}/public/report/${reportModel}/Cover.html?id=${id}`,
        content: `file:///${pdfServerBasePath}/public/report/${reportModel}/Report.html?id=${id}`,
        pdfName: pdfName
      }
      console.log(params)
      execFile('public/exe/wkhtmltopdf.exe', ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], {maxBuffer: 1000 * 1024}, (error, stdout, stderr) => {
        console.log('execFile')
        if (error) {
          failPdfList.push(correctList[index])
          index++
          console.error(`${id}报告生成失败`, stderr);
          console.log(error)
          if (stderr.includes("Error: Unable to write to destination")) {
            console.log("文件操作失败，请确保同样名称的文件没有没打开！")
          }
          getPdf(reportIdList, obj)
        } else {
          successList.push(correctList[index])
          index++
          console.log(`${id}报告生成成功`);
          getPdf(reportIdList, obj)
        }
      })
    } else {
      console.log('complete')
      myEmitter.emit('complete', {failPdfList, successList, obj})
    }
  }
}

module.exports = singleScreen