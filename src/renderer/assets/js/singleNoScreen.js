const axios = require("axios")
const {execFile} = require('child_process')
const {getReportModel, getPart, baseURL} = require('./common')
const fse = require('fs-extra')
const fs = require('fs')


let singleNoScreen = function (reportIdList, obj, myEmitter) {
    if (!obj.savePath) {
        myEmitter.emit('warn', {text: '请先设置报告的下载路径！'})
        return
    } else if (!fs.existsSync(obj.savePath)) {
        myEmitter.emit('warn', {text: '报告的下载路径不存在，请重新设置！'})
        return
    }
    let pdfServerBasePath = obj.appPath, savePath = obj.savePath, correctList = [], errList = [], failPdfList = [],
        successPdfList = [], index = 0
    let {header, footer, cover, content} = getPart(obj.type)
    let reportModel = getReportModel(obj.type)
    if (obj.type == 1 || obj.type == 2) {
        reportIdList.forEach((item) => {
            getReportData(item, function (item) {
                correctList.push(item)
                if (correctList.length + errList.length == reportIdList.length) {
                    getPdf(correctList, obj)
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
                errList.push(params)
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
            if (correctList[index].isDown) {
                if(correctList[index].repeatCount == undefined){
                    correctList[index].repeatCount = 0
                    correctList[index].status = 2 //正在下载
                }else{
                    correctList[index].repeatCount++
                    correctList[index].status = 6  //正在重新下载
                }
                let id = correctList[index].id, pdfName
                let name = correctList[index].studentName ? correctList[index].studentName : correctList[index].name
                name = name.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\(\)（）【】\[\]\s]*/g, '')
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
                } else {
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
                    if (error) {
                        console.error(`${id}报告生成失败`, stderr);
                        console.log(error)
                        if (stderr.includes("Error: Unable to write to destination")) {
                            console.log("文件操作失败，请确保报告Id为${id}的文件没有被打开！")
                            myEmitter.emit('warn', {text: `文件操作失败，请确保报告Id为${id}的文件没有被打开！`})
                        }
                        //如果错误的pdf连续生成了3次还是生成错误就不再生成了
                        if (correctList[index].repeatCount < 3) {
                            correctList[index].status = 5 //下载异常
                            getPdf(reportIdList, obj)
                        } else {
                            correctList[index].status = 4 //下载失败
                            failPdfList.push(correctList[index])
                            index++
                            getPdf(correctList, obj)
                        }
                    } else {
                        reportIdList[index].status = 3  //下载成功
                        reportIdList[index].savePath = pdfName
                        successPdfList.push(correctList[index])
                        index++
                        console.log(`${id}报告生成成功`);
                        getPdf(correctList, obj)
                    }
                })
            } else {
                index++
                getPdf(correctList, obj)
            }
        } else {
            console.log('complete')
            myEmitter.emit('complete', {})
        }
    }
}

module.exports = singleNoScreen