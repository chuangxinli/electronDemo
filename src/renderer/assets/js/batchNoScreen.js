const {execFile} = require('child_process')
const axios = require("axios")
const {getReportModel, getPart, baseURL, idURL, existsPublic, wkTimeout, pdfFailRepeatCount} = require('./common')
const fse = require('fs-extra')
const fs = require('fs')

//批量下载报告下载的是每个班级里面的个人报告。下载班级报告和年级报告不走批量下载接口
let batchNoScreen = function (classInfo, obj, myEmitter) {
    existsPublic(obj.appPath, obj.dataPath)
    if (!obj.savePath) {
        myEmitter.emit('warn', {text: '请先设置报告的下载路径（在设置里面设置报告的下载路径）！'})
        return
    } else if (!fs.existsSync(obj.savePath)){
        myEmitter.emit('warn', {text: '报告的下载路径不存在，请重新设置（在设置里面设置报告的下载路径）！'})
        return
    }
    classInfo[0].status = 2
    let classList = classInfo[0].children
    let pdfServerBasePath = obj.dataPath, savePath = obj.savePath, errClassList = [], index = 0, classIndex = 0
    let {header, footer, cover, content} = getPart(obj.type)
    let reportModel = getReportModel(obj.type)
    //先获取单个班级中学生的id

    for (let i = classIndex; i < classList.length; i++) {
        if (classList[i].isDown) {
            classList[i].progress = 2
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
        classList[classIndex].status = 7
        axios({
            url: '/detector/api/view/v4/getClassReportIds',
            method: 'get',
            baseURL: idURL,
            params: params,
        }).then(function (response) {
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
            if (response.data.contentType === 'all') {
                correctList.push({id: id, studentName: response.data.report.cover.studentName,
                    name: `${id}（${response.data.report.cover.studentName}）`,
                    type: obj.type,
                    isShow: true,
                    isDown: true,
                    isOpen: true,
                    isDelete: false,
                    status: 1,});
            } else {
                noPayList.push(id)
            }
            if (correctList.length + noPayList.length + errList.length === personList.length) {
                classList[classIndex - 1].children = correctList
                classList[classIndex - 1].allNum = correctList.length
                classList[classIndex - 1].status = 2
                classList[classIndex - 1].children = correctList
                getPdf(correctList, errList, noPayList, failPdfList)
            }
        })
            .catch(function (error) {
                errList.push(id)
                console.log(id + ' 报告调取api失败：');
                console.log(error);
            });
    }

    function getPdf(correctList, errList, noPayList, failPdfList, pdfName) {
        if (index < correctList.length) {
            classList[classIndex - 1].progress = 3
            if(correctList[index].isDown){
                if(correctList[index].repeatCount == undefined){
                    correctList[index].repeatCount = 0
                    correctList[index].status = 2 //正在下载
                }else{
                    correctList[index].repeatCount++
                    correctList[index].status = 6  //正在重新下载
                }
                let id = correctList[index].id
                let name = correctList[index].studentName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\(\)（）【】\[\]\s]*/g, '')
                if(!pdfName){
                    pdfName = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}/${id}(${name}).pdf`;
                    if (!fse.pathExistsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`)) {
                        fse.mkdirsSync(`${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`)
                    }
                }
                let params = {
                    footer: `file:///${pdfServerBasePath}/public/report/${reportModel}/${footer}?id=${id}`,
                    header: `file:///${pdfServerBasePath}/public/report/${reportModel}/${header}?id=${id}`,
                    cover: `file:///${pdfServerBasePath}/public/report/${reportModel}/${cover}?id=${id}`,
                    content: `file:///${pdfServerBasePath}/public/report/${reportModel}/${content}?id=${id}`,
                    pdfName: pdfName
                }
                wkFunc()
                function wkFunc(){
                    let killSubChild = false, timer
                    let subChild = execFile(`${obj.dataPath}/public/exe/wkhtmltopdf.exe`, ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], {maxBuffer: 1000 * 1024}, (error, stdout, stderr) => {
                        if(!killSubChild){
                            clearTimeout(timer)
                        }else{
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
                                correctList[index].status = 5 //下载异常
                                getPdf(correctList, errList, noPayList, failPdfList, tempPdfName)
                            }else{
                                let belongTo = ''
                                if([3, 4, 5, 6].includes(obj.type)){
                                    belongTo = obj.gradeName
                                }else{
                                    belongTo = obj.gradeName + '（' + classList[classIndex - 1].name + '）'
                                }
                                myEmitter.emit('pdf_error', {
                                    id,
                                    belongTo,
                                    type: obj.type,
                                    subjectName: obj.subjectName,
                                    name,
                                    isDown: true,
                                    isShow: true,
                                    isDelete: false,
                                    status: 1,
                                    obj
                                })
                                correctList[index].status = 4 //下载失败
                                failPdfList.push(correctList[index])
                                classList[classIndex - 1].errNum++
                                index++
                                getPdf(correctList, errList, noPayList, failPdfList)
                            }
                        } else {
                            correctList[index].status = 3  //下载成功
                            correctList[index].savePath = pdfName
                            classList[classIndex - 1].successNum++
                            index++
                            console.log(`${id}报告生成成功`);
                            myEmitter.emit('down_report_success', {id})
                            getPdf(correctList, errList, noPayList, failPdfList)
                        }
                    })
                    timer = setTimeout(() => {
                        myEmitter.emit('kill_wk', {
                            text: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getMinutes()}--此时的报告id为${id}--此时班级为${classList[classIndex - 1].className}--杀掉了wk子进程`
                        })
                        killSubChild = true
                        subChild.kill('SIGTERM')
                        wkFunc()
                    }, wkTimeout)
                }
            } else {
                index++
                getPdf(correctList, obj)
            }
        } else {
            classList[classIndex - 1].status = 3
            classList[classIndex - 1].savePath = `${savePath}/${obj.gradeName}${obj.subjectName}_${obj.taskId}/${classList[classIndex - 1].className}`
            classList[classIndex - 1].isComplete = true
            myEmitter.emit('complete_single_class', {})
            if (classIndex < classList.length) {
                for (let i = classIndex; i < classList.length; i++) {
                    if (classList[i].isDown) {
                        classList[i].progress = 2
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
                classInfo[0].isComplete = true
                classInfo[0].status = 3
                myEmitter.emit('complete_all', {})
            }
        }
    }
}

module.exports = batchNoScreen