const express = require('express')
const appExpress = express()
const bodyParser = require('body-parser')
const { htmlToJson } = require("./htmlToJson/htmlToJson.js")

//用于输出 json文件和html文件
const path = require('path');
const writeFile = require('write');
const EventEmitter = require('events');
class MyEmitter extends EventEmitter{}
const myEmitter = new MyEmitter()
myEmitter.on('success', function (obj) {
  let fileBaseName = path.basename(obj.path, '.docx')
  let time = new Date().getTime()
  writeFile(path.join(__dirname, `./fileOfJsonAndHtml/${time}__${obj.i + 1}__${fileBaseName}/${fileBaseName}.json`), JSON.stringify(obj.jsonObj), (err) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('json_success！')
  })
  writeFile(path.join(__dirname, `./fileOfJsonAndHtml/${time}__${obj.i + 1}__${fileBaseName}/${fileBaseName}.html`), obj.temp, (err) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('html_success！')
  })
})



appExpress.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

appExpress.use(bodyParser.json())
appExpress.use(bodyParser.urlencoded({extended: false}))



appExpress.post('/word-to-json',function (req, res) {
  htmlToJson(res, req.body.docxList, myEmitter)
})

appExpress.get('/hello', function (req, res) {
   res.send('hello！')
})

appExpress.listen(3003)
console.log('3003 success')

