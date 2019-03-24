const express = require('express')

const fs = require('fs')

const app = express()

if(!fs.existsSync('public')){
  fs.mkdirSync('public')
}

app.use(express.static('public'))

app.get('/', function (req, res) {
    res.send('Hello World!');
});


app.listen(13004, function () {
  console.log('Example app listening on port 3000!')
})