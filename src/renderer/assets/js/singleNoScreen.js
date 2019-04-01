const {execFile, exec} = require('child_process')
const axios = require("axios")
const fse = require('fs-extra')



let pdfServerBasePath = 'http://localhost:13004/report'
let baseURL = 'http://das.51youpu.com'

let singleNoScreen = function (reportIdList, obj) {
    let correctIdList = [], errIdList = [], failIdList =[], successIdList = [], time = new Date().getTime(), index = 0
    let {header, footer, cover, content} = getPart(obj.type)
    let reportModel = getReportModel(obj.type)
    if(!fse.pathExistsSync(`public/export/${time}`)){
        fse.mkdirsSync(`public/export/${time}`)
    }
    if(obj.type == 1 || obj.type == 2){
        reportIdList.forEach((item) => {
            getReportData({id: item.id}, function (id) {
                correctIdList.push(id)
                if(correctIdList.length + errIdList.length == reportIdList.length){
                    getPdf(correctIdList, obj)
                }
            })
        })
    } else {
        getPdf(reportIdList, obj)
    }
    function getPdf(correctIdList, obj) {
        if(index < correctIdList.length){
            let id = correctIdList[index].id
            let pdfName = `public/export/${time}/${id}.pdf`;
            let params = {
                footer: `${pdfServerBasePath}/${reportModel}/${footer}?id=${id}`,
                header: `${pdfServerBasePath}/${reportModel}/${header}?id=${id}`,
                cover: `${pdfServerBasePath}/${reportModel}/${cover}?id=${id}`,
                content: `${pdfServerBasePath}/${reportModel}/${content}?id=${id}`,
                pdfName: pdfName
            }
            /*let params = {
                footer: `http://localhost:8081/DownLoadReport/reportModal/report/classsReport_M/classReportFooter.html?id=200655`,
                header: `http://localhost:8081/DownLoadReport/reportModal/report/classsReport_M/classReportHeader.html?id=200655`,
                cover: `http://localhost:8081/DownLoadReport/reportModal/report/classsReport_M/classReportCover.html?id=200655`,
                content: `http://localhost:8081/DownLoadReport/reportModal/report/classsReport_M/classReport.html?id=200655`,
                pdfName: '333.pdf'
            }*/
            console.log(params)
            /*exec('wkhtmltopdf --outline-depth 2 --footer-html http://localhost:13004/report/classsReport_M/classReportFooter.html?id=200713 --header-html http://localhost:13004/report/classsReport_M/classReportHeader.html?id=200713 cover http://localhost:13004/report/classsReport_M/classReportCover.html?id=200713 http://localhost:13004/report/classsReport_M/classReport.html?id=200713 f:/test/000.pdf', function (err, stout, sterr) {
                if(err){
                    console.log(err)
                    return
                }
                console.log('success')
            })*/
            //--no-stop-slow-scripts  --javascript-delay 100000
            execFile('exe/wkhtmltopdf.exe', ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], (error, stdout, stderr) => {
                if (error) {
                    failIdList.push(correctIdList[index])
                    index++
                    console.error(`${id}报告生成失败`, stderr);
                    setTimeout(() => {
                        getPdf(reportIdList, obj)
                    }, 50)
                    return;
                }
                if(stderr){
                    console.log(stderr)
                    console.log('stderr', id)
                }
                successIdList.push(correctIdList[index])
                index++
                console.log(`${id}报告生成成功`);
                setTimeout(() => {
                    getPdf(reportIdList, obj)
                }, 50)
            })
        }else{
            console.log('complete')
            if(obj.isBatch){
                let reportType
                if(obj.type == 5 || obj.type == 6){
                    reportType = '班级报告'
                }else if(obj.type == 3 || obj.type == 4){
                    reportType = '年级报告'
                }
                fse.moveSync(`public/export/${time}`, `${obj.savePath}/${obj.gradeName}${obj.subjectName}/${reportType}`, {overwrite: true })
                console.log('move success')
            }
        }
    }
}

function getReportData(params,callback) {
    axios({
        url:'/das/learningreport/getReportContent',
        method:'get',
        baseURL: baseURL,
        params: params,
    }).then(function (response) {
        if(response.data.contentType === 'all') {
            callback(params.id);
        } else {
            errIdList.push(params.id)
        }
    })
        .catch(function (error) {
            errIdList.push(params.id)
            console.log(params.id + ' 报告调取api失败：');
            console.log(error);
        });
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
    switch (type){
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