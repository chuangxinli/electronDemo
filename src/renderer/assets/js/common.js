const fs = require('fs')
const asar = require('asar')
const fse = require('fs-extra')
const baseURL = 'http://das.51youpu.com'
const idURL = 'http://api.51youpu.com'
const wkTimeout = 3000 * 60
const pdfFailRepeatCount = 6
const path = require('path')

function getReportModel(type) {
  let reportModel;
  switch (type) {
    case 1:
      reportModel = 'studentReport_M';
      break;
    case 2:
      reportModel = 'studentReport_new';
      break;
    case 3:
      reportModel = 'gradeReport_new';
      break;
    case 4:
      reportModel = 'gradeReportMN';
      break;
    case 5:
      reportModel = 'classsReport_new';
      break;
    case 6:
      reportModel = 'classsReport_M';
      break;
    default:
      reportModel = 'studentReport_new'
      break;
  }
  return reportModel
}

function getPart(type) {
  let part = {}
  switch (type) {
    case 1:
      part.header = 'studentHeader.html'
      part.footer = 'studentFooter.html'
      part.cover = 'studentCover.html'
      part.content = 'studentReport.html'
      break
    case 2:
      part.header = 'studentHeader.html'
      part.footer = 'studentFooter.html'
      part.cover = 'studentCover.html'
      part.content = 'studentReport.html'
      break
    case 3:
      part.header = 'gradeReportHeader.html'
      part.footer = 'gradeReportFooter.html'
      part.cover = 'gradeReportCover.html'
      part.content = 'gradeReport.html'
      break
    case 4:
      part.header = 'Header.html'
      part.footer = 'Footer.html'
      part.cover = 'Cover.html'
      part.content = 'Report.html'
      break
    case 5:
      part.header = 'classReportHeader.html'
      part.footer = 'classReportFooter.html'
      part.cover = 'classReportCover.html'
      part.content = 'classReport.html'
      break
    case 6:
      part.header = 'classReportHeader.html'
      part.footer = 'classReportFooter.html'
      part.cover = 'classReportCover.html'
      part.content = 'classReport.html'
      break
  }
  return part
}

//判断是否存在public文件夹
function existsPublic(appPath, dataPath){
  try{
    if(!fs.existsSync(`${dataPath}${path.sep}public`)){
      asar.extractAll(appPath, dataPath)
      if(!fs.existsSync(`${dataPath}${path.sep}public${path.sep}html`)){
        fs.mkdirSync(`${dataPath}${path.sep}public${path.sep}html`)
      }
      fse.removeSync(`${dataPath}${path.sep}public${path.sep}node_modules`)
      fse.removeSync(`${dataPath}${path.sep}public${path.sep}data.json`)
      fse.removeSync(`${dataPath}${path.sep}public${path.sep}dist`)
    }
  }catch (e) {
    console.log(e)
  }
}

module.exports = {
  getReportModel,
  getPart,
  existsPublic,
  baseURL,
  idURL,
  wkTimeout,
  pdfFailRepeatCount
}
