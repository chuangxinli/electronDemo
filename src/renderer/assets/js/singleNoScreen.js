const {execFile} = require('child_process')
const axios = require("axios")
//const fse = require('fs-extra')


let baseURL = 'http://das.51youpu.com'

let singleNoScreen = function (reportIdList, obj, myEmitter) {
    let pdfServerBasePath = obj.appPath, savePath = obj.savePath, correctIdList = [], errIdList = [], failIdList = [],
        successIdList = [], index = 0
    let {header, footer, cover, content} = getPart(obj.type)
    let reportModel = getReportModel(obj.type)
    if (obj.isBatch) {
        let reportType
        if (obj.type == 5 || obj.type == 6) {
            reportType = '班级报告'
        } else if (obj.type == 3 || obj.type == 4) {
            reportType = '年级报告'
        }
        savePath = `${obj.savePath}/${obj.gradeName}${obj.subjectName}/${reportType}`
    } else {
        savePath = `${obj.savePath}`
    }
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
            console.log('index', index)
            let id = correctIdList[index].id
            let name = correctIdList[index].studentName ? correctIdList[index].studentName : correctIdList[index].name
            console.log('name', name)
            let pdfName = `${savePath}/${id}(${name}).pdf`;
            let params = {
                footer: `file:///${pdfServerBasePath}/public/report/${reportModel}/${footer}?id=${id}`,
                header: `file:///${pdfServerBasePath}/public/report/${reportModel}/${header}?id=${id}`,
                cover: `file:///${pdfServerBasePath}/public/report/${reportModel}/${cover}?id=${id}`,
                content: `file:///${pdfServerBasePath}/public/report/${reportModel}/${content}?id=${id}`,
                pdfName: pdfName
            }
            console.log(params)
            execFile('exe/wkhtmltopdf.exe', ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], (error, stdout, stderr) => {
                console.log('execFile')
                if (error) {
                    failIdList.push(correctIdList[index])
                    index++
                    console.error(`${id}报告生成失败`, stderr);
                    if (stderr.includes("Error: Unable to write to destination")) {
                        console.log("文件操作失败，请确保同样名称的文件没有没打开！")
                    }
                    getPdf(reportIdList, obj)
                } else {
                    successIdList.push(correctIdList[index])
                    index++
                    console.log(`${id}报告生成成功`);
                    getPdf(reportIdList, obj)
                }
            })
        } else {
            console.log('complete')
            myEmitter.emit('complete', {failIdList, successIdList, obj})
        }
    }
}


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


module.exports = singleNoScreen