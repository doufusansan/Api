var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var Utils = require('../../public/javascripts/utils');
var md5 = require('md5');

var storage = multer.diskStorage({
  destination: function (req, file, cb) { //文件存放目录
    cb(null, path.join(__dirname, '../../resouces'))
  },
  filename: function (req, file, cb) { //文件信息
    cb(null, new Date().getFullYear() + '' + (new Date().getMonth() == 0 ? 1 : new Date().getMonth()) + '' + new Date().getDate() + '' + new Date().getHours() + '' + new Date().getMinutes() + '' + new Date().getSeconds() + md5(file.originalname) + '.' + file.originalname.toLowerCase().split('.').splice(-1)[0])
  }
});
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 209715200
  }
}); //上传文件大小限制200MB
router.post('/uploadfile', upload.any(), (req, res, next) => {
  if (req.files.length <= 0 || req.files == null) return Utils.ErrMsg(res, {});
  req.files.map((item,index)=>{
    item.filename=  `https://awei.fun/api/resouces/${item.filename}`
    if(req.files.length-1 === index)return Utils.SuccessMsg(res, {data: req.files});
  })
});
module.exports = router;