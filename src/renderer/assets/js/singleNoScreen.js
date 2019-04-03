const {execFile} = require('child_process')
const axios = require("axios")
const {getReportModel, getPart, baseURL} = require('./common')


let singleNoScreen = function (reportIdList, obj, myEmitter) {
    if(!obj.savePath){
        myEmitter.emit('warn', {text: '请先设置报告的下载路径！'})
        return
    }
    let pdfServerBasePath = obj.appPath, savePath = obj.savePath, correctIdList = [], errIdList = [], failIdList = [], successIdList = [], index = 0
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
            execFile('public/exe/wkhtmltopdf.exe', ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], (error, stdout, stderr) => {
                console.log('execFile')
                if (error) {
                    failIdList.push(correctIdList[index])
                    index++
                    console.error(`${id}报告生成失败`, stderr);
                    console.log(error)
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

module.exports = singleNoScreen