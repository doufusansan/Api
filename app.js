var express = require('express');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const Utils = require('./public/javascripts/utils');
// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'text/plain' }))
// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/plain' }))

app.use(bodyParser.urlencoded({ extended: false }))  //本地调试的时候记得开启

app.use(cookieParser());
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('./mongodb/db');
// var io = require('./socketIo/index');
//index
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true"); //可以带cookies
  res.header("X-Powered-By", '3.2.1');
  Utils.StatisNewsApi();
  if (req.method == 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

var index = require('./routes/index');

//api
var member = require('./routes/api/member');
var shop = require('./routes/api/shop');
var cms = require('./routes/api/cms');
var admin = require('./routes/api/system');
var statis = require('./routes/api/statis');
//Unit

var Unit = require('./routes/unit/unit');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
var cors = require('cors');
var whitelist = ['http://awei.fun', 'http://localhost:8080']
var corsOptions = {
  origin: function (origin, callback) {
    // if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    // } else {
    //   callback(new Error('Not allowed by CORS'))
    // }
  },credentials: true
}
app.options('*', cors(corsOptions)) // include before other routes
app.use(cors(corsOptions))

app.use('/', index);
app.use('/api/member', member);
app.use('/api/shop', shop);
app.use('/api/cms', cms);
app.use('/system', admin);
app.use('/statis', statis);
app.use('/unit', Unit);


// var proxyMiddleWare = require("http-proxy-middleware");
// var proxyPath = "http://awei.fun:3333";//目标后端服务地址(公司同事电脑地址)
// var proxyOption ={target:proxyPath,changeOrigoin:true};
// app.use("/api",proxyMiddleWare(proxyOption))//这里要注意"/discern" 是匹配的路由,它会将匹配的路由进行转发，没匹配到的就不会转发。('/discern'完全可以写成'/'就是说所有路由都可以访问)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;