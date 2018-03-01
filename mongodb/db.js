const mongoose = require('mongoose')
const DB_URL = 'mongodb://admin:123456@127.0.0.1:27017/meituan';
// const DB_URL = 'mongodb://127.0.0.1:27017/meituan';
mongoose.Promise = global.Promise
mongoose.connect( DB_URL, {
    useMongoClient: true
})

/**
  * 连接成功
  */
mongoose.connection.on('connected', function () {    
    console.log('数据库连接成功: ');  
});    


/**
 * 连接异常
 */
mongoose.connection.on('error',function (err) {    
    console.log('数据库连接出现异常 error: ' + err);  
});    
 
/**
 * 连接断开
 */
mongoose.connection.on('disconnected', function () {    
    console.log('数据库连接断开 ');  
}); 

module.exports = mongoose;