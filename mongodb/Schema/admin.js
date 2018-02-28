const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const sys_user_info = new Schema({ //管理员信息
    username: { type: String, unique: true },
    password: { type: String },
    create_date: { type: Date, default: Date.now },
    phone: { type: String },
    roles: { type: String }, //规则权限
    photo_url: { type: String, default: 'https://static.hdslb.com/images/akari.jpg'},
    province: { type: String },
    city: { type: String },
    area: { type: String },
    address: { type: String },
    status: { type: Number, default: 9 } //审核状态
},{ collection: "sys_user_info"});

sys_user_info.index({ 
    create_date: 1,
    status: 1
}); 

const SchemaModule = {
    Admin: mongoose.model('sys_user_info',sys_user_info)
}

module.exports = SchemaModule;