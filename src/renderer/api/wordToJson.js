const express = require('express')
const appExpress = express()
const bodyParser = require('body-parser')
const { dealJson } = require("./dealJson/dealJson.js")


appExpress.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

appExpress.use(bodyParser.json())
appExpress.use(bodyParser.urlencoded({extended: false}))



appExpress.post('/word-to-json',function (req, res) {
    console.log(req.body)
    console.log(req.body.docxList)
    dealJson(res, req.body.docxList)
})

appExpress.get('/hello', function (req, res) {
   res.send('hello！')
})

appExpress.listen(3003)
console.log('3003 success')

