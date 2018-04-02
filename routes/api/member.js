const express = require('express');
const router = express.Router();
const mongoose = require('../../mongodb/db');
var md5 = require('md5');

const Mbr  = require('../../mongodb/Schema/member');
const Member = Mbr.Member; //用户信息
const Address = Mbr.Address; //用户地址信息
const FavoriteShop = Mbr.FavoriteShop; //用户收藏的店铺信息

const Utils = require('../../public/javascripts/utils');

const Sms  = require('../../mongodb/Schema/sms');
const ChallengeCode = Sms.SMS_ChallengeCode;

const Shop = require('../../mongodb/Schema/shop');
const Category = Shop.Category; // 商品分类
const Product = Shop.Product; //   商品信息
const Comment = Shop.Comment; //   商品评论
const Package = Shop.Package; //   购物车商品
const Order = Shop.Order; //   订单
const Shop_info = Shop.Shop; // 店铺信息

router.post('/GetUserInfo', function (req, res) { //获取用户信息
    let params =  req.body;
    if(!params.MemberToken)return Utils.ErrMsg(res,{msg: '用户标识错误'});
    if(!Number(params.MemberToken)){
        Member.findOne({_id: params.MemberToken},{_id:0,__v:0,password:0}).then(response=>{
            if(!response)return Utils.ErrMsg(res,{msg:'用户不存在'});
            return Utils.SuccessMsg(res,{data: response})
        },err=>{return Utils.ErrMsg(res,{msg: err.message})})
    }else{
        Member.findOne({phone: params.MemberToken},{_id:0,__v:0,password:0}).then(response=>{
            if(!response)return Utils.ErrMsg(res,{msg:'用户不存在'});
            return Utils.SuccessMsg(res,{data: response})
        },err=>{return Utils.ErrMsg(res,{msg: err.message})})
    }
})

router.post('/SendPhoneMessage', function(req,res){
    let params = req.body;
    if(!params.phone)return Utils.ErrMsg(res,{msg:"手机号码有误"});
    Utils.SendPhoneMessage(res,params.phone);
})
// var a = {"username":"awei","password":"123456","phone":"13650928419","Sex":0,"challengecode":95800};
router.post('/Registered', function(req,res) {  //注册账号
    let params =  req.body;
    if(!params.username || !params.password)return Utils.ErrMsg(res,{msg:"用户名或密码不能为空"});
    if(!params.phone || !params.challengecode)return Utils.ErrMsg(res,{msg:"Phone or challengecode information can not be empty"});
    Utils.CheckChallengecode(res,params.phone,params.challengecode).then(response=>{
        Member.findOne({username: params.username},function(error,callback){
            if(error)return Utils.ErrMsg(res,{msg:error});
            if(callback){
                return Utils.ErrMsg(res,{msg:"用户名已存在"})
            }else{
                let newMemberInfo = new Member({
                    username: params.username,
                    password: md5(params.password),
                    validWalletAmount: 200000,
                    Sex: params.Sex ?  params.Sex : null,
                    phone: params.phone,
                    nickName: 'jd_' + Utils.GenerateChallengecode(10)
                })
                newMemberInfo.save().then(resCallback=>{
                    ChallengeCode.updateOne({phone:params.phone,challengecode: params.challengecode,Status: 1},{Status: 9}).then(successcode=>{
                        Utils.StatisNewsUser();
                        return Utils.SuccessMsg(res,{msg:"注册成功"});
                    },codeerror=>{
                        return Utils.ErrMsg(res,{msg:codeerror.message});
                    })
                },saveError=>{return Utils.ErrMsg(res,{msg: saveError.message});})
            }
        })
    },error=>{
        return Utils.ErrMsg(res,{msg:"错误"})
    })
})

router.post('/EditUserInfo',function(req,res) { //修改用户信息
    let params =  req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        let UpdatedData = {};
        if(params.Sex){UpdatedData.Sex = params.Sex};
        if(params.photoUrl){UpdatedData.photoUrl = params.photoUrl};
        if(params.nickName){UpdatedData.nickName = params.nickName};
        Member.updateOne({_id:params.MemberToken},UpdatedData,{upsert:false}).then(successCallback=>{
            return Utils.SuccessMsg(res,{});
        },error=>{return Utils.ErrMsg(res,{msg:err.message});})
    })
})

router.post('/SetPassword', function(req,res) { //修改/设置密码
    let params =  req.body;
    if(!params.phone || !params.challengecode || !params.newpassword)return Utils.ErrMsg(res,{msg:"information can not be empty"});
    Utils.CheckChallengecode(res,params.phone,params.challengecode).then(response=>{
        Member.updateOne({phone:params.phone},{password:md5(params.newpassword)},{upsert:false}).then(scb=>{
            return Utils.SuccessMsg(res,{msg:"修改成功"});
        },error=>{
            return Utils.ErrMsg(res,{msg:error.message});
        })
    },error=>{return Utils.ErrMsg(res,{msg:error.message}) })
})


router.post('/Login', function(req,res) { //登陆
    let params =  req.body;
    if(!params.username || !params.password)return Utils.ErrMsg(res,{msg:"账号或密码有误"});
    return Utils.getMemberToken(res,params.username).then(Callback=>{ //username 换取 id(MemberToken)
        if(Callback.Code == 0){ //用户存在的话id查询用户信息
            Member.findById(Callback.Data,function(err,success) {
                if(err)return Utils.ErrMsg(res,{Code:500,msg:err});
                if(success.username === params.username && success.password === md5(params.password)){
                    // res.cookie('MemberToken',Callback.Data,{Domain: req.Origin}); //已去除
                    Utils.StatisNewsVisits(req);
                    return Utils.SuccessMsg(res,{msg:"ok",data: Callback.Data});
                }else{
                    return Utils.ErrMsg(res,{msg:"账号或密码错误"});
                }
            })
        }
    },err=>{ ///用户不存在的话 使用手机查询用户信息
        Member.findOne({phone: params.username},function(err,success) {
            if(err)return Utils.ErrMsg(res,{Code:500,msg:err});
            if(!success)return Utils.ErrMsg(res,{msg:'用户不存在'});
            if(success.password === md5(params.password)){
                // res.cookie('MemberToken',success._id,{Domain: req.Origin}); //已去除
                Utils.StatisNewsVisits(req);
                return Utils.SuccessMsg(res,{msg:"ok",data: success._id});
            }else{
                return Utils.ErrMsg(res,{msg:"账号或密码错误"});
            }
        })
    })
})

router.post('/LoginOut',function(req,res){  //退出登录
    res.clearCookie('MemberToken');
    return Utils.SuccessMsg(res,{});
})


router.post('/SaveAddress',function(req,res){ //保存地址
    let params =  req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        let newAddress = new Address({
            Phone: params.Phone || null,
            Province: params.Province || null,
            City: params.City || null,
            Area: params.Area || null,
            Address: params.Address || null,
            Selected: params.Selected || 9,
            MemberToken: params.MemberToken
        });
        if(newAddress.Selected === 1){
            Address.updateMany({"MemberToken":params.MemberToken,"Selected": 1},{"Selected": 9}).then(response=>{})    
        }
        if(!params.Id){
            newAddress.save().then(response=>{
                return Utils.SuccessMsg(res,{data: response});
            })
        }else{
            Address.updateOne({_id:params.Id},{
                Phone: params.Phone || null,
                Province: params.Province || null,
                City: params.City || null,
                Area: params.Area || null,
                Address: params.Address || null,
                Selected: params.Selected || 9
            }).then(response=>{
                return Utils.SuccessMsg(res,{msg:"编辑成功",data: response});
            })
        }
    })    
})

router.post('/GetAddress',function(req,res) { //获取单个地址信息
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        Address.findOne({MemberToken:params.MemberToken,_id:params.Id}).then(response=>{
            return Utils.SuccessMsg(res,{data:response});
        })
    })    
})

router.post('/GetAddressList',function(req,res) {  //获取地址列表
    let params =  req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.pageIndex || !params.pageSize)return Utils.ErrMsg(res,{});
        let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
        let querylimit= parseInt(params.pageSize);
        Address.find({MemberToken:params.MemberToken}).sort({Selected: 1}).skip(querySkip).limit(querylimit).exec(function (err, success) {
            if(err){
                return Utils.ErrMsg(res,{Code: 1,msg:err.message});
            }else{
                Address.find({MemberToken:params.MemberToken}).count().then(Counter=>{
                    return Utils.SuccessMsg(res,{data: success,total: Counter});
                });
            }
        });
    })    
})
router.post('/GetDefaultAddress',function(req,res) {  //获取当前的默认地址
    let params = req.body;
    Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        Address.findOne({
            MemberToken: params.MemberToken,
            Selected: 1
        }).then(response=>{
            return Utils.SuccessMsg(res,{data: response})
        })
    })    
})
router.post('/RemoveAddress',function(req,res) { //删除地址
    let params =  req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.Id)return Utils.ErrMsg(res,{});
        Address.deleteOne({MemberToken:params.MemberToken,_id: params.Id},function(err,success) {
            if(err){
                return Utils.ErrMsg(res,{Code: 1,msg:err.message});
            }else{
                return Utils.SuccessMsg(res,{});
            }
        })
    })    
})


router.post('/PayByWallet',function(req,res){ // 使用钱包支付订单 
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.PaymentPassword || !params.PaymentNo)return Utils.ErrMsg(res,{});
        Member.findOne({_id:params.MemberToken}).then(userinfo=>{
            if(md5(userinfo.paymentPassword) !== md5(params.PaymentPassword))return Utils.ErrMsg(res,{msg:"支付密码错误"});
            Order.findOne({"orderInfo.memberToken":params.MemberToken,"orderInfo.OrdertNo":params.PaymentNo,"orderInfo.pay_status": 0}).then(response=>{
                if(!response || response.length<=0)return Utils.ErrMsg(res,{msg:"订单不存在"});
                let RemainingWalletAmount = parseFloat(userinfo.validWalletAmount - parseFloat(response.orderInfo.total_fee));
                if(RemainingWalletAmount<0)return Utils.ErrMsg(res,{msg:"账户余额不足"})
                Member.updateOne({_id:params.MemberToken},{validWalletAmount:RemainingWalletAmount}).then(remainRes=>{
                    Order.updateOne({"orderInfo.OrdertNo": params.PaymentNo},{
                        "orderInfo.confirm_status": 1,
                        "orderInfo.pay_status": 1
                    },{upsert:false}).then(response=>{
                        return Utils.SuccessMsg(res,{});
                    })
                },fail=>{return Utils.ErrMsg(res,{msg:fail.message})})
            },errormsg=>{return Utils.ErrMsg(res,{msg:errormsg.message})})
        },error=>{return Utils.ErrMsg(res,{msg:error.message})})
    })    
})

router.post('/ShopFavorite',function(req,res){ //收藏店铺
    let params = req.body;
    if(!params.Id)return Utils.ErrMsg(res,{});
    Shop_info.findOne({id:params.Id},{cms_content:0,category_info:0,cms_banner:0,goods_list:0,shop_score:0,shop_create_date:0}).then(response=>{
        if(response){
            new FavoriteShop(response).save().then(callback=>{
                Utils.SuccessMsg(res,{msg: 'ok'});
            })
        }
    })
})

router.post('/GetMyShopFavorite',function(req,res){ //获取我的收藏店铺
    let params = req.body;
    if (!params.pageIndex || params.pageIndex <= 0 || !params.pageSize) return Utils.ErrMsg(res, {});
    let querySkip = (parseInt(params.pageIndex) - 1) * parseInt(params.pageSize);
    let querylimit = parseInt(params.pageSize);
    FavoriteShop.find({},{_id: 0,__v:0}).skip(querySkip).limit(querylimit).then(response=>{
        FavoriteShop.find({},{_id: 0,__v:0}).count().then(Counter=>{
            return Utils.SuccessMsg(res,{data:response,total: Counter});
        },error=>{return Utils.ErrMsg(res,{msg:error.message})})
    })
})


module.exports = router;


