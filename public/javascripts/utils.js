const Mbr = require('../../mongodb/Schema/member');
const Member = Mbr.Member;
const smsClient = require('../../SMS/sms-sdk');
const Sms  = require('../../mongodb/Schema/sms');
const ChallengeCode = Sms.SMS_ChallengeCode;
const { 
    Statis_User,
    Statis_Order,
    Statis_Shop,
    Statis_Admin,
    Statis_Article,
    Statis_Visits,
    Statis_Api
} = require('../../mongodb/Schema/statis'); //统计
const {
    Admin
} = require('../../mongodb/Schema/admin');
const request = require('request');


class Utils {
    ErrMsg(res,option = { Code, msg }){ //抛出错误
        return res.send({
            Code: option.Code ? option.Code : 1,
            Message: option.msg ? option.msg : '参数错误',
            Data: null
        })
    }
    SuccessMsg(res,option={ msg, data, total }){ //抛出成功
        return res.send({
            Code: 0,
            Message: option.msg ? option.msg : 'ok',
            Data: option.data ? option.data : 1,
            total: option.total ? option.total : null
        })
    }
    GenerateChallengecode(maxLength) { //生成指定位数位随机验证码
        var Challengecode = "";
        for (var i = 0; i < maxLength; i++) {
            Challengecode += Math.floor(Math.random() * 10);
        }
        return Challengecode;
    }
    DateRandomFormate(str){
        if(!str)return;
        let Year = str.getFullYear().toString();
        let Month = str.getMonth().toString();
        let Day = str.getDate().toString();
        let Hours = str.getHours().toString();
        let Minutes = str.getMinutes().toString();
        let Seconds = str.getSeconds().toString();
        let trmap = new Date().getTime().toString();
        let newDate = Year+Month+Day+Hours+Minutes+Seconds+trmap;
        return newDate;
    }
    FormatDate(date,AddDayCount){
        if(!date)return '';
        if(AddDayCount){
          var dd = new Date();
          dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
          date = dd;
        }
        return {
            y: date.getFullYear(),
            m: (date.getMonth() + 1)<10 ? '0'+(date.getMonth() + 1) : (date.getMonth() + 1),
            d: date.getDate() <10 ? '0' + date.getDate() : date.getDate(),
            h: date.getHours() <10 ? '0' + date.getHours() : date.getHours(),
            i: date.getMinutes() <10 ? '0'+date.getMinutes():date.getMinutes(),
            s: date.getSeconds()<10? '0'+date.getSeconds():date.getSeconds(),
            a: date.getDay()<10? '0'+date.getDay():date.getDay()
        }
      }
    CheckChallengecode(res,phone,challengecode){ //检查验证码是否过期
        let myself = this;
        return new Promise((resolve,reject)=>{
            return ChallengeCode.findOne({phone:phone,challengecode: challengecode,Status: 1}).then(response=>{
                if(!response){
                    myself.ErrMsg(res,{msg:"验证码错误"})
                    return reject()
                }
                let resDate = new Date(response.createTime).getMinutes();
                if((new Date().getMinutes() - resDate) >=5){
                    ChallengeCode.updateOne({phone:phone,challengecode: challengecode,Status: 1},{Status: 9}).then(success=>{
                        if(!success){
                            myself.ErrMsg(res,{msg:'验证码已过期或不存在！'});
                            return reject()
                        }
                        return resolve(success);
                    },error=>{
                        myself.ErrMsg(res,{msg:error.message});
                        return reject(error)
                    })
                }else{
                    return resolve(response);
                }
            })
        })
    }
    StatisNewsUser(){ //统计新增用户
        new Statis_User({}).save().then(response=>{})
    }
    StatisNewsOrder(order_no){   //统计新增订单
        new Statis_Order({
            order_no: order_no
        }).save().then(response=>{})
    }
    StatisNewsShop(){ //统计新增店铺
        new Statis_Shop({}).save().then(response=>{})
    }
    StatisNewsAdmin(){ //统计新增管理员
        new Statis_Admin({}).save().then(response=>{})
    }
    StatisNewsVisits(req){ //统计访问量
        if(!req)return;
        let ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
        request.post(`http://ip.taobao.com/service/getIpInfo.php?ip=${ip}`, function (error, response, body) {
            let Data = JSON.parse(body);
            if(Data.code == 0){
                let { data } = Data;
                new Statis_Visits({
                    country: data.country,
                    province: data.region,
                    city: data.city,
                    isp: data.isp
                }).save().then(response=>{})
            }
        })
    }
    StatisNewsApi(){ //统计接口调用次数
        new Statis_Api({}).save().then(response=>{})
    }
    StatisNewsArticle(){ //统计新增文章
        new Statis_Article({}).save().then(response=>{})
    }
    SendPhoneMessage(res,phone) { //发送短信验证码
        let GenerateChallengecode = this.GenerateChallengecode(5);
        let NewChallengeCode = new ChallengeCode({
            username: null,
            phone: phone,
            challengecode: GenerateChallengecode,
            Status: 1
        })
        smsClient.sendSMS({
            PhoneNumbers: phone,
            SignName: '阿威',
            TemplateCode: 'SMS_117520206',
            TemplateParam: JSON.stringify({code:GenerateChallengecode})
        }).then(data => {
            let {Code}=data
            if (Code === 'OK') {
                //处理返回参数
                NewChallengeCode.save((err,resCallback)=>{
                    if(err){
                        return this.ErrMsg(res,{Code:500,msg: err.message});
                    }else{
                        setTimeout(()=>{
                            ChallengeCode.updateOne({phone: phone,challengecode:GenerateChallengecode},{Status:9},function(errcall,successcall){});
                        },300000) //五分钟过期
                        return this.SuccessMsg(res,{msg:"ok"});
                    }
                })
            }
        }, err => {
            return this.ErrMsg(res,{msg: err.code});
        })
    }
    hashCode(str){ //生成 Hash值
        var h = 0, off = 0;
        var len = str.length;
        for(var i = 0; i < len; i++){
            h = 31 * h + str.charCodeAt(off++);
        }
        return h;
    }
    checkToken(res,MemberToken){ //判断用户是否登陆
        let myself = this;
        return new Promise((resolve, reject) => {
            Member.findOne({_id:MemberToken},{password:0,paymentPassword:0}).then(response=>{
                if(!response){
                    return myself.ErrMsg(res,{Code:2,msg:'用户不存在或已过期'});
                }
                return resolve(response);
            })
        })
    }
    permissionValidate(res,AdminToken,permissionList){ //后台用户权限验证
        return new Promise((resolve,reject)=>{
            Admin.findOne({
                _id: AdminToken
            },{password:0}).then(adminInfo => {
                if (!adminInfo) return this.ErrMsg(res, {
                    msg: '用户信息不存在'
                });
                if (permissionList.indexOf(adminInfo.roles)===-1) return this.ErrMsg(res, {
                    msg: '用户权限不足'
                });
                return resolve(adminInfo)
            },error=>{
                this.ErrMsg(res, {
                    msg: error.message
                });
                return reject();
            })
        })
    }
    getMemberToken(res,username) { //获取用户标识
        let myself = this;
        return new Promise((resolve, reject) => {
            return Member.findOne({username:username},function(err,rescalback) {
                if (err)return reject();
                if(!rescalback)return reject();
                return resolve({
                    Code: 0,
                    Message: 'ok',
                    Data: rescalback._id,
                    total: null
                });
            })      
        })
    }
}

module.exports = new Utils()