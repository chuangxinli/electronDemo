const {execFile} = require('child_process')
let pdfServerBasePath = 'http://localhost:13004'
let reportModel = 'report/studentReport_M'
let batchNoScreen = function (reportIdList) {
    console.log(reportIdList)
    reportIdList.forEach((item) => {
        let id = item.id
        console.log('id', id)
        let studentName = item.studentName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s*]/g, '')
        let pdfName = `public/${id}(${studentName}).pdf`;
        let params = {
            footer: `${pdfServerBasePath}/${reportModel}/Footer2.html?id=${id}`,
            header: `${pdfServerBasePath}/${reportModel}/Header2.html?id=${id}`,
            cover: `${pdfServerBasePath}/${reportModel}/Cover2.html?id=${id}`,
            content: `${pdfServerBasePath}/${reportModel}/Report2.html?id=${id}`,
            pdfName: pdfName
        }
        execFile('exe/wkhtmltopdf.exe', ['--outline-depth', '2', '--footer-html', params.footer, '--header-html', params.header, 'cover', params.cover, params.content, params.pdfName], (error, stdout, stderr) => {
            /*setTimeout(function(){
                getPdf2(pdfIdArray,routType,++index);
            },20);*/
            if(error) {
                console.error(`${id}报告生成失败`,stderr);
                //wrongPdfId.push(id);
                return;
            }
            console.log(`${id}报告生成成功`);
        })

    })
}

module.exports = batchNoScreen