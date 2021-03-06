const pug = require('pug')
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const {baseURL, getReportModel, existsPublic, wkTimeout, pdfFailRepeatCount} = require('./common')
const {execFile} = require('child_process')
const fse = require("fs-extra")


let singleScreen = function (reportInfo, obj, myEmitter) {
  existsPublic(obj.appPath, obj.dataPath)
  if (!obj.savePath) {
    myEmitter.emit('warn', {text: '请先设置报告的下载路径（在设置里面设置报告的下载路径）！'})
    return
  } else if (!fs.existsSync(obj.savePath)){
    myEmitter.emit('warn', {text: '报告的下载路径不存在，请重新设置（在设置里面设置报告的下载路径）！'})
    return
  }
  let pdfServerBasePath = obj.dataPath, savePath = obj.savePath, correctList = [], errList = [], noPayList = [], failPdfList = [], successList = [], index = 0, reportIdList = (reportInfo.classReportList && reportInfo.classReportList.length > 0) ? reportInfo.classReportList : reportInfo.singlePersonList  //可能是个人也可能是班级报告
  let reportModel = getReportModel(obj.type)
  //错误列表中下载的报告的存放地址
  if(obj.errReport){
    savePath = `${obj.savePath}/重新下载的错误报告`
    if(!fs.existsSync(savePath)){
      fs.mkdirSync(savePath)
    }
  }
  reportIdList.forEach((item) => {
    reportInfo.progress = 2
    getHtml(item, function (correctList) {
      let correctIds = [], pathStrUrls = [], isStrs
      correctList.forEach((item) => {
        correctIds.push(item.id)
        pathStrUrls.push(path.normalize(`${obj.dataPath}/public/html/${item.id}.html`))
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
      execFile(`${obj.dataPath}/public/exe/phantomjs.exe`, [`${obj.dataPath}/public/pug/screen_shot.js`, pathStrUrls, isStrs, obj.dataPath], function (err, stdout, stderr) {
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
      if (response.data.recode == 0) {
        if (obj.type == 1 || obj.type == 2) {
          if (response.data.contentType === 'all') {
            let temp = pug.renderFile(`${obj.dataPath}/public/pug/report.pug`, response.data)
            fs.writeFileSync(`${obj.dataPath}/public/html/${params.id}.html`, temp)
            correctList.push(params)
          } else {
            noPayList.push(params)
          }
        } else if (obj.type == 5 || obj.type == 6) {
          let temp = pug.renderFile(`${obj.dataPath}/public/pug/classReport.pug`, response.data)
          fs.writeFileSync(`${obj.dataPath}/public/html/${params.id}.html`, temp)
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

  function getPdf(correctList, obj, pdfName) {
    if (index < correctList.length) {
      reportInfo.progress = 3
      if(correctList[index].isDown){
        if(correctList[index].repeatCount == undefined){
          correctList[index].repeatCount = 0
          correctList[index].status = 2 //正在下载
        }else{
          correctList[index].repeatCount++
          correctList[index].status = 6  //正在重新下载
        }
        let id = correctList[index].id
        let name = correctList[index].studentName ? correctList[index].studentName : correctList[index].name
        name = name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\(\)（）【】\[\]\s]*/g, '')
        if(!pdfName){
          if (obj.isBatch && obj.type == 5 || obj.type == 6) {
            pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告/${id}(${name}).pdf`
            if (!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告`)) {
              fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/班级报告`)
            }
          } else if (obj.isBatch && obj.type == 3 || obj.type == 4) {
            pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告/${id}(${name}).pdf`
            if (!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告`)) {
              fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/年级报告`)
            }
          } else if(obj.isBatch && obj.type == 1 || obj.type == 2){
            pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${obj.className}/${id}(${name}).pdf`
            if (!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${obj.className}`)) {
              fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${obj.className}`)
            }
          } else {
            pdfName = `${savePath}/${id}(${name}).pdf`;
          }
        }
        let params = {
          footer: `file:///${pdfServerBasePath}/public/report/${reportModel}/Footer.html?id=${id}`,
          header: `file:///${pdfServerBasePath}/public/report/${reportModel}/Header.html?id=${id}`,
          cover: `file:///${pdfServerBasePath}/public/report/${reportModel}/Cover.html?id=${id}`,
          content: `file:///${pdfServerBasePath}/public/report/${reportModel}/Report.html?id=${id}`,
          pdfName: pdfName
        }
        wkFunc()
        function wkFunc(){
          //如果3分钟后wkhtmltopdf命令的回调函数还没有执行，就假设wkhtmltopdf进程中断了；杀掉该子进程，重新函数
          let killSubChild = false, timer
          let subChild = execFile(`${obj.dataPath}/public/exe/wkhtmltopdf.exe`, ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], {maxBuffer: 1000 * 1024}, (error, stdout, stderr) => {
            if(!killSubChild){ //没有该杀掉
              clearTimeout(timer)
            }else{ //执行了杀掉子进程
              return
            }
            if (error) {
              console.error(`${id}报告生成失败`, stderr);
              console.log(error)
              let tempPdfName
              if (stderr.includes("Error: Unable to write to destination")) {
                console.log("文件操作失败，请确保报告Id为${id}的文件没有被打开！")
                for(let i = 1; i < 99999; i++){
                  tempPdfName = pdfName.replace(/\.pdf$/, `(${i}).pdf`)
                  if(!fs.existsSync(tempPdfName)){
                    break;
                  }
                }
              }
              if(correctList[index].repeatCount < pdfFailRepeatCount){
                myEmitter.emit('pdf_error', {id, type: obj.type})
                correctList[index].status = 5 //下载异常
                getPdf(reportIdList, obj, tempPdfName)
              }else{
                let belongTo = ''
                if([3, 4, 5, 6].includes(obj.type)){
                  belongTo = obj.gradeName
                }else{
                  belongTo = obj.gradeName + '（' + obj.className + '）'
                }
                myEmitter.emit('pdf_error', {
                  id,
                  name: correctList[index].name,
                  belongTo,
                  type: obj.type,
                  subjectName: obj.subjectName,
                  isDown: true,
                  isShow: true,
                  isDelete: false,
                  status: 1,
                  obj
                })
                correctList[index].status = 4 //下载失败
                failPdfList.push(correctList[index])
                reportInfo.errNum++
                index++
                getPdf(correctList, obj)
              }
            } else {
              if(obj.errReport){
                myEmitter.emit('pdf_error_redown', id)
              }
              successList.push(correctList[index])
              correctList[index].status = 3 //下载成功
              correctList[index].savePath = pdfName
              reportInfo.successNum++
              index++
              console.log(`${id}报告生成成功`);
              myEmitter.emit('down_report_success', {id})
              getPdf(correctList, obj)
            }
          })
          timer = setTimeout(() => {
            myEmitter.emit('kill_wk', {
              text: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()}--此时的报告id为${id}--杀掉了子进程`
            })
            killSubChild = true
            subChild.kill('SIGTERM')
            wkFunc()
          }, wkTimeout)
        }
      }else{
        index++
        getPdf(correctList, obj)
      }
    } else {
      reportInfo.isComplete = true
      console.log('complete_single')
      myEmitter.emit('complete_single', {})
    }
  }
}

module.exports = singleScreen