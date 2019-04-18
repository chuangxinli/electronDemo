const pug = require('pug')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const {baseURL, getReportModel, idURL} = require('./common')
const {execFile} = require('child_process')
const fse = require("fs-extra")


//批量下载报告下载的是每个班级里面的个人报告。下载班级报告和年级报告不走批量下载接口
let batchScreen = function (classInfo, obj, myEmitter) {
  if (!obj.savePath) {
    myEmitter.emit('warn', {text: '请先设置报告的下载路径！'})
    return
  } else if (!fs.existsSync(obj.savePath)){
    myEmitter.emit('warn', {text: '报告的下载路径不存在，请重新设置！'})
    return
  }
  let classList = classInfo[0].children
  console.log(classList)
  let pdfServerBasePath = obj.appPath, savePath = obj.savePath, successList = [], index = 0, classIndex = 0, errClassList = []
  let reportModel = getReportModel(obj.type)


  for(let i = classIndex; i < classList.length; i++){
    if(classList[i].isDown){
      classIndex = i
      getPersonIds({classId: classList[classIndex].classId, testId: obj.taskId, subjectId: obj.subjectId, reportType: obj.reportType}, function (reportList) {
        let correctList = [], errList = [], noPayList = [], failPdfList = []
        reportList.forEach((item) => {
          getHtml({id: item}, reportList, correctList, errList, noPayList, failPdfList, function (correctList, errList, noPayList, failPdfList) {
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
              getPdf(correctList, errList, noPayList, failPdfList)
            })
          })
        })
      })
      break;
    }
  }


  function getPersonIds(params, callback) {
    classList[classIndex].status = 2
    axios({
      url: '/detector/api/view/v4/getClassReportIds',
      method: 'get',
      baseURL: idURL,
      params: params,
    }).then(function (response) {
      console.log(response)
      classIndex++
      if (response.data.recode == 0) {
        callback(response.data.ids);
      }
    })
      .catch(function (error) {
        classList[classIndex].status = 4
        errClassList.push(params)
        console.log(params.classId + ' 报告调取api失败：');
        console.log(error);
      });
  }

  function getHtml(params, reportList, correctList, errList, noPayList, failPdfList, callback) {
    axios({
      url: '/das/learningreport/getReportContent',
      method: 'get',
      baseURL: baseURL,
      params: {id: params.id},
    }).then(function (response) {
      console.log(response)
      if (response.data.recode == 0) {
        params.studentName = response.data.report.cover.studentName
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
        if (noPayList.length + errList.length + correctList.length === reportList.length) {
          console.log('完成了！')
          callback(correctList, errList, noPayList, failPdfList)
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

  function getPdf(correctList, errList, noPayList, failPdfList) {
    if (index < correctList.length) {
      let id = correctList[index].id
      let name = correctList[index].studentName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\(\)（）【】\[\]\s]*/g, '')
      let pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}/${id}(${name}).pdf`;
      if(!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`)){
        fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`)
      }
      let params = {
        footer: `file:///${pdfServerBasePath}/public/report/${reportModel}/Footer.html?id=${id}`,
        header: `file:///${pdfServerBasePath}/public/report/${reportModel}/Header.html?id=${id}`,
        cover: `file:///${pdfServerBasePath}/public/report/${reportModel}/Cover.html?id=${id}`,
        content: `file:///${pdfServerBasePath}/public/report/${reportModel}/Report.html?id=${id}`,
        pdfName: pdfName
      }
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
          getPdf(correctList, errList, noPayList, failPdfList)
        } else {
          successList.push(correctList[index])
          index++
          console.log(`${id}报告生成成功`);
          getPdf(correctList, errList, noPayList, failPdfList)
        }
      })
    } else {
      classList[classIndex - 1].status = 3
      classList[classIndex - 1].savePath = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`
      console.log('complete')
      myEmitter.emit('complete_single_class', {failPdfList, obj})
      if(classIndex < classList.length){
        for (let i = classIndex; i < classList.length; i++) {
          if (classList[i].isDown) {
            index = 0
            classIndex = i
            getPersonIds({classId: classList[classIndex].classId, testId: obj.taskId, subjectId: obj.subjectId, reportType: obj.reportType}, function (reportList) {
              let correctList = [], errList = [], noPayList = [], failPdfList = []
              reportList.forEach((item) => {
                getHtml({id: item}, reportList, correctList, errList, noPayList, failPdfList, function (correctList, errList, noPayList, failPdfList) {
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
                    getPdf(correctList, errList, noPayList, failPdfList)
                  })
                })
              })
            })
            break
          }
        }
      }else{
        myEmitter.emit('complete_all', {})
      }
    }
  }
}

module.exports = batchScreen
