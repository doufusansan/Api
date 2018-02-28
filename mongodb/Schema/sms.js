const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const sms_challengecode = new Schema({
    username: { type: String },
    phone: { type: String },
    createTime: { type: Date, default: Date.now},
    challengecode: { type: String,unique: true },
    Status: { type: Number }
},{ collection: "sms_challengecode"});

sms_challengecode.index({ createTime: 1 , Status: -1 }); 

const SchemaModule = {
    SMS_ChallengeCode: mongoose.model('sms_challengecode',sms_challengecode)
}
module.exports = SchemaModule;