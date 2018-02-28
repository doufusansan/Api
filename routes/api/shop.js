const express = require('express');
const router = express.Router();
const mongoose = require('../../mongodb/db');

const Mbr  = require('../../mongodb/Schema/member');
const Member = Mbr.Member;
const Address = Mbr.Address;

const Shop = require('../../mongodb/Schema/shop');
const Product = Shop.Product; //   商品信息
const Order = Shop.Order; //   订单
const Category = Shop.Category; // 商品分类
const CommentModel = Shop.Comment; //   商品评论
const Package = Shop.Package; //   购物车商品
const Shop_info = Shop.Shop; //店铺信息
const Utils = require('../../public/javascripts/utils');
// const Cms  = require('../../mongodb/Schema/cms');
// const ChallengeCode = Cms.SMS_ChallengeCode;



router.post('/GetCategoryList',function(req,res){ //获取商品目录信息
    let params = req.body;
    if(!params.RootId)return Utils.ErrMsg(res,{});
    Category.find({parentId: params.RootId},{_id:0,__v:0}).then(Callback=>{
        return Utils.SuccessMsg(res,{data:Callback,total:Callback.length});
    },err=>{
        return Utils.ErrMsg(res,{msg:err.message});
    })
})

router.post('/GetProductList',function(req,res){ //获取商品列表
    let params = req.body;
    if(!params.CategoryId)return Utils.ErrMsg(res,{});
    let param = {categoryId:params.CategoryId};
    if(params.Keyword){param.productName={$regex: params.Keyword , $options: 'i'}};
    if(!params.pageIndex || params.pageIndex<=0 || !params.pageSize)return Utils.ErrMsg(res,{});
    let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
    let querylimit= parseInt(params.pageSize);
    Product.find(param,{_id:0,__v:0}).skip(querySkip).limit(querylimit).then(Callback=>{
        return Utils.SuccessMsg(res,{data:Callback,total:Callback.length});
    },err=>{
        return Utils.ErrMsg(res,{msg:err.message});
    })
})


router.post('/GetProduct',function(req,res){ // 获取商品详情
    let params = req.body;
    if(!params.ProductNo)return Utils.ErrMsg(res,{});
    Product.findOne({productNo: params.ProductNo},{_id:0,__v:0}).then(Callback=>{
        return Utils.SuccessMsg(res,{data:Callback});
    },err=>{
        return Utils.ErrMsg(res,{msg:err.message});
    })
})

router.post('/SearchGoods',function(req,res){ //搜索商品
    let params = req.body;
    if(!params.pageIndex || !params.pageSize)return Utils.ErrMsg(res,{});
    let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
    let querylimit= parseInt(params.pageSize);
    let queryData = {};
    if(params.categoryId){queryData.categoryId = params.categoryId}else{
        queryData.productName = {
            $regex: params.Keyword , $options: 'i'
        }
    }
    Product.find(queryData).skip(querySkip).limit(querylimit).then(response=>{
        return Utils.SuccessMsg(res,{data:response});
    },error=>{
        return Utils.ErrMsg(res,{msg:error.message});
    })
})

// `{"MemberToken":"5a80f6e6ec752f2950f50ef9","SelectedList":"[{\"ProductNo\":30940,\"Counter\":7},{\"ProductNo\":59878,\"Counter\":7},{\"ProductNo\":84347,\"Counter\":7}]"}

router.post('/SelectProduct',function(req,res){ //加入购物车
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.SelectedList)return Utils.ErrMsg(res,{});
        JSON.parse(params.SelectedList).map((item,index)=>{
            Product.findOne({productNo:item.ProductNo},{_id:0,__v:0}).then(Callback=>{ //查询这个单号 存不存在 
                if(!Callback)return false; //如果不存在 则跳过这个订单继续往下找
                let PackageData = {
                    memberToken: params.MemberToken,
                    product: Callback,
                    createTime: new Date(),
                    status: 1 // 1购物车 9是确认下单的产品
                };
                if(params.Increment){
                    PackageData.$inc = { 
                        counter: Number(params.Increment)
                    }
                }else{
                    PackageData.counter = params.Counter ? Number(params.Counter) : 1;
                }
                Package.updateOne(
                    {
                        memberToken:params.MemberToken,
                        "product.productNo":Callback.productNo,
                        status:1
                    },
                    PackageData,
                    {
                        upsert:true
                    }
                ).then(successCallback=>{  //订单存在的话就更新订单的状态，不存在的话则新增一条数据
                    if(index == JSON.parse(params.SelectedList).length-1){ //更新完毕后抛出一个成功提示
                        return Utils.SuccessMsg(res,{});
                    }
                },errorCallback=>{return Utils.ErrMsg(res,{msg:errorCallback.message});})
            },err=>{
                return Utils.ErrMsg(res,{msg:err.message});
            })
        });    
    })
})

router.post('/RemoveSelectedProduct',function(req,res){ //删除选购产品
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.SelectedList)return Utils.ErrMsg(res,{});
        JSON.parse(params.SelectedList).map((item,index)=>{
            Package.deleteOne({memberToken:params.MemberToken,"product.productNo":item,status:1}).then(successCallback=>{ 
                if(index == JSON.parse(params.SelectedList).length-1){ //更新完毕后抛出一个成功提示
                    return Utils.SuccessMsg(res,{});
                }
            },errorCallback=>{return Utils.ErrMsg(res,{msg:errorCallback.message});})
        }); 
    })    
})



router.post('/GetSelectedProductList',function(req,res){ // 获取选购的产品信息
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        Package.find({memberToken:params.MemberToken,status:1},{_id:0,__v:0}).then(Callback=>{
            return Utils.SuccessMsg(res,{data:Callback,total: Callback.length});
        },err=>{
            return Utils.ErrMsg(res,{msg:err.message});
        })
    })
})


// {"SelectedList":"[\"30940\",\"59878\",\"84347\"]"};
router.post('/ConfirmSelectProduct',function(req,res){  //确认选购产品，将作为下单的产品信息
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.SelectedList)return Utils.ErrMsg(res,{});
        JSON.parse(params.SelectedList).map((item,index)=>{
            Package.updateOne({memberToken:params.MemberToken,"product.productNo":item,status:1},{status:9}).then(successCallback=>{  //订单存在的话就更新订单的状态，不存在的话则新增一条数据
                if(index == JSON.parse(params.SelectedList).length-1){ //更新完毕后抛出一个成功提示
                    return Utils.SuccessMsg(res,{});
                }
            },errorCallback=>{return Utils.ErrMsg(res,{msg:errorCallback.message});})
        })        
    })    
})


router.post('/GetConfirmSelectedProductList',function(req,res){  // 获取确认选购的产品信息
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        Package.find({memberToken:params.MemberToken,status:9},{_id:0,__v:0}).then(Callback=>{
            return Utils.SuccessMsg(res,{data:Callback,total: Callback.length});
        },err=>{
            return Utils.ErrMsg(res,{msg:err.message});
        })
    })    
})


// 
// {"MemberToken":"","AddressId":"5a3fa863b7f4bd67f7b6aebc"}
router.post('/CreateOrder',function(req,res){ //创建订单
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.AddressId)return Utils.ErrMsg(res,{});
        let AddressInfo = null;
        Address.findOne({MemberToken:params.MemberToken,_id:params.AddressId},{_id:0,MemberToken:0,__v:0}).then(success=>{
            if(!success)return Utils.ErrMsg(res,{msg:"The addressId does not exist"});
            AddressInfo = success;
            return Package.find({memberToken:params.MemberToken,status:9},{_id:0,__v:0,memberToken:0,status:0});
        },errorcall=>{return Utils.ErrMsg(res,{msg:errorcall.message})}).then(Callback=>{
            let OrderStatus = {
                PayStatus: 0,
                PaymentNo: null,
                TotalFee: null
            };
            Callback.map((item,index)=>{OrderStatus.TotalFee+=item.counter * item.product.price});
            let OrdertNo = Utils.DateRandomFormate(new Date())
            let NewOrder = new Order({
                orderInfo: {
                    OrdertNo: OrdertNo,
                    memberToken: params.MemberToken,
                    total_fee: OrderStatus.TotalFee,
                    cancel_status: 0,
                    confirm_status: 1,
                    addressInfo: AddressInfo,
                    pay_status: OrderStatus.PayStatus,
                    finish_status: 0,
                    comment_status: 0
                },
                ProductList: Callback
            });
            NewOrder.save().then(saveCallback=>{
                OrderStatus.PaymentNo = saveCallback.orderInfo.OrdertNo;
                Package.deleteMany({memberToken:params.MemberToken,status:9}).then(successok=>{
                    Utils.StatisNewsOrder(OrdertNo);
                    return Utils.SuccessMsg(res,{data:OrderStatus})
                },errorpack=>{return Utils.ErrMsg(res,{msg:errorpack.message})})
            },saveError=>{return Utils.ErrMsg(res,{msg:saveError.message})})
        },err=>{
            return Utils.ErrMsg(res,{msg:err.message});
        })
    })    
})

router.post('/FinishOrder',function(req,res){ //确认收货
    let params = req.body;
    if(!params.OrderNo)return Utils.ErrMsg(res,{});
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        Order.updateOne({"orderInfo.OrdertNo":params.OrderNo},{"orderInfo.cancel_status":0,"orderInfo.finish_status":1},{upsert: false}).then(response=>{
            return Utils.SuccessMsg(res,{})
        })
    })    
}) 

router.post('/CancelOrder',function(req,res){ //取消订单
    let params = req.body;
    if(!params.OrderNo)return Utils.ErrMsg(res,{});
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        Order.updateOne({"orderInfo.OrdertNo":params.OrderNo},{"orderInfo.cancel_status":1,"orderInfo.finish_status":0},{upsert: false}).then(response=>{
            return Utils.SuccessMsg(res,{})
        })
    })    
})

router.post('/GetOrderList',function(req,res){ //获取订单列表
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.pageIndex || !params.pageSize)return Utils.ErrMsg(res,{});
        let StatusQuery = {};
        StatusQuery["orderInfo.memberToken"] = params.MemberToken;
        if(params.cancel_status!=null){StatusQuery["orderInfo.cancel_status"] = params.cancel_status};
        if(params.confirm_status!=null){StatusQuery["orderInfo.confirm_status"] = params.confirm_status};
        if(params.pay_status!=null){StatusQuery["orderInfo.pay_status"] = params.pay_status};
        if(params.finish_status!=null){StatusQuery["orderInfo.finish_status"] = params.finish_status};
        let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
        let querylimit= parseInt(params.pageSize);
        Order.find(StatusQuery,{__v:0,_id:0}).skip(querySkip).limit(querylimit).sort({"orderInfo.createTime":-1}).then(Response=>{
            Order.find(StatusQuery).count().then(Counter=>{
                return Utils.SuccessMsg(res,{data:Response,total:Counter})
            });
        },err=>{return Utils.ErrMsg(res,{msg:err.message})})
    })
})

router.post('/GetOrder',function(req,res){ //获取订单详情
    let params = req.body;
    return Utils.checkToken(res,params.MemberToken).then(checkSuccess=>{
        if(!params.OrderNo)return Utils.ErrMsg(res,{});
        Order.findOne({"orderInfo.memberToken":params.MemberToken,"orderInfo.OrdertNo":params.OrderNo},{__v:0,_id:0}).then(response=>{
            if(!response)return Utils.ErrMsg(res,{msg:'OrderNo does not exist'});
            return Utils.SuccessMsg(res,{data:response});
        },fail=>{return Utils.ErrMsg(res,{msg:fail.message})})
    })
})

router.post('/GetShopInfo',function(req,res){ //获取店铺信息
    let params = req.body;
    if(!params.Id)return Utils.ErrMsg(res,{});
    Shop_info.findOne({id:params.Id},{__v:0,_id:0}).then(response=>{
        return Utils.SuccessMsg(res,{data:response});
    },error=>{return Utils.ErrMsg(res,{msg:error.message})})
})

router.post('/GetCommentList',(req,res)=>{ //商品评论列表
    let params = req.body;
    if(!params.ProductNo || !params.pageIndex || params.pageIndex<=0 || !params.pageSize)return Utils.ErrMsg(res,{});
    let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
    let querylimit= parseInt(params.pageSize);
    CommentModel.find({
        productNo: params.ProductNo
    }).skip(querySkip).limit(querylimit).then(response=>{
        CommentModel.find({
            productNo: params.ProductNo
        }).count().then(Counter=>{
            return Utils.SuccessMsg(res,{data: response,total: Counter})
        })
    })
})

router.post('/CommitMessage',(req,res)=>{
    let params = req.body;
    if(!params.CommentList || !params.OrderNo)return Utils.ErrMsg(res,{});
    return Utils.checkToken(res,params.MemberToken).then(userInfo=>{
        params.CommentList.map((item,index)=>{
            new CommentModel({
                username: userInfo.username,
                avatar: userInfo.photoUrl,
                productNo: item.ProductNo,
                star: item.Star,
                image_url: item.Image_url || [],
                content: item.Content,
                counter: item.Counter,
            }).save().then(response=>{
                if(index === params.CommentList.length-1){
                    Order.updateOne(
                        {
                            'orderInfo.OrdertNo': params.OrderNo,
                            'orderInfo.memberToken': params.MemberToken
                        },
                        {
                            'orderInfo.comment_status': 1
                        },
                        {
                            upsert: false
                        }
                    ).then(response=>{
                        return Utils.SuccessMsg(res,{})
                    })
                }
            })
        })
    })    
})

module.exports = router;


