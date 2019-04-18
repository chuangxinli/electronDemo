const {execFile} = require('child_process')
const axios = require("axios")
const {getReportModel, getPart, baseURL, idURL} = require('./common')
const fse = require('fs-extra')

//批量下载报告下载的是每个班级里面的个人报告。下载班级报告和年级报告不走批量下载接口
let batchNoScreen = function (classInfo, obj, myEmitter) {
    if (!obj.savePath) {
        myEmitter.emit('warn', {text: '请先设置报告的下载路径！'})
        return
    } else if (!fs.existsSync(obj.savePath)){
        myEmitter.emit('warn', {text: '报告的下载路径不存在，请重新设置！'})
        return
    }
    let classList = classInfo[0].children
    console.log(classList)
    let pdfServerBasePath = obj.appPath, savePath = obj.savePath, errClassList = [], index = 0, classIndex = 0
    let {header, footer, cover, content} = getPart(obj.type)
    let reportModel = getReportModel(obj.type)
    //先获取单个班级中学生的id

    for (let i = classIndex; i < classList.length; i++) {
        if (classList[i].isDown) {
            classIndex = i
            getPersonIds({
                classId: classList[classIndex].classId,
                testId: obj.taskId,
                subjectId: obj.subjectId,
                reportType: obj.reportType
            }, function (personList) {
                let correctList = [], errList = [], noPayList = [], failPdfList = []
                personList.forEach((item) => {
                    getReportData(item, correctList, errList, noPayList, personList, failPdfList)
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

    function getReportData(id, correctList, errList, noPayList, personList, failPdfList) {
        axios({
            url: '/das/learningreport/getReportContent',
            method: 'get',
            baseURL: baseURL,
            params: {id}
        }).then(function (response) {
            console.log('id:', id)
            if (response.data.contentType === 'all') {
                correctList.push({id: id, studentName: response.data.report.cover.studentName});
            } else {
                noPayList.push(id)
            }
            if (correctList.length + noPayList.length + errList.length === personList.length) {
                getPdf(correctList, errList, noPayList, failPdfList)
            }
        })
            .catch(function (error) {
                errList.push(id)
                console.log(id + ' 报告调取api失败：');
                console.log(error);
            });
    }

    function getPdf(correctList, errList, noPayList, failPdfList) {
        if (index < correctList.length) {
            let id = correctList[index].id
            let name = correctList[index].studentName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\(\)（）【】\[\]\s]*/g, '')
            let pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}/${id}(${name}).pdf`;
            if (!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`)) {
                fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`)
            }
            let params = {
                footer: `file:///${pdfServerBasePath}/public/report/${reportModel}/${footer}?id=${id}`,
                header: `file:///${pdfServerBasePath}/public/report/${reportModel}/${header}?id=${id}`,
                cover: `file:///${pdfServerBasePath}/public/report/${reportModel}/${cover}?id=${id}`,
                content: `file:///${pdfServerBasePath}/public/report/${reportModel}/${content}?id=${id}`,
                pdfName: pdfName
            }
            execFile('public/exe/wkhtmltopdf.exe', ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], {maxBuffer: 1000 * 1024}, (error, stdout, stderr) => {
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
            if (classIndex < classList.length) {
                for (let i = classIndex; i < classList.length; i++) {
                    if (classList[i].isDown) {
                        index = 0
                        classIndex = i
                        getPersonIds({
                            classId: classList[classIndex].classId,
                            testId: obj.taskId,
                            subjectId: obj.subjectId,
                            reportType: obj.reportType
                        }, function (personList) {
                            let correctList = [], errList = [], noPayList = []
                            personList.forEach((item) => {
                                getReportData(item, correctList, errList, noPayList, personList, failPdfList)
                            })
                        })
                        break
                    }
                }
            } else {
                myEmitter.emit('complete_all', {})
            }
        }
    }
}

module.exports = batchNoScreen