const express = require('express');
const router = express.Router();
const Utils = require('../../public/javascripts/utils');
const Cms = require('../../mongodb/Schema/cms');
const Article = Cms.Article;
const GoodsCategory = Cms.GoodsCategory;
router.post('/GetArticle', function(req,res){  //获取文章详情
    let params = req.body;
    if(!params.Id)return Utils.ErrMsg(res,{});
    Article.findOne({id:params.Id},{_id:0}).then(response=>{
        return Utils.SuccessMsg(res,{data:response});
    },error=>{
        return Utils.ErrMsg(res,{msg:error.message});
    })
})

router.post('/GetArticleList', function(req,res){  //获取文章详情
    let params = req.body;
    let formData = {};
    if(!params.pageIndex || !params.pageSize)return Utils.ErrMsg(res,{});
    let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
    let querylimit= parseInt(params.pageSize);
    if(params.Type){formData.type = params.Type}; //这里不传资讯类型的话默认查全部
    Article.find(formData,{_id:0}).skip(querySkip).limit(querylimit).then(response=>{
        Article.find(formData).count().then(Counter=>{
            return Utils.SuccessMsg(res,{data:response,total:Counter});
        })
    },error=>{
        return Utils.ErrMsg(res,{msg:error.message});
    })
})

router.post('/GetGoodsCategory',function(req,res){ //获取咨询分类列表
    let params = req.body;
    if(!params.Type)return Utils.ErrMsg(res,{});
    GoodsCategory.findOne({type: params.Type}).then(response=>{
        return Utils.SuccessMsg(res,{data:response})
    },error=>{
        return Utils.ErrMsg(res,{msg:error.message});
    })
})

router.post('/GetRecommend',function(req,res){ //获取推荐信息
    let params = req.body;
    if(!params.Type || !params.pageIndex || !params.pageSize)return Utils.ErrMsg(res,{});
    let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
    let querylimit= parseInt(params.pageSize);
    GoodsCategory.findOne({type: params.Type}).then(response=>{
        if(response && response.product_list){
            let newData = [];
            response.product_list.map((item,index)=>{
                if(index>=querySkip && newData.length<=querylimit){
                    newData.push(item);
                }
            })
            return Utils.SuccessMsg(res,{data:newData,total:response.product_list.length})
        }
    },error=>{
        return Utils.ErrMsg(res,{msg:error.message});
    })
})

router.post('/GetGoodsCategoryList',function(req,res){ //获取咨询分类列表
    let params = req.body;
    if(!params.pageIndex || !params.pageSize)return Utils.ErrMsg(res,{});
    let formData = {};
    if(params.Type){formData.type=params.Type}; //不传默认查全部
    let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
    let querylimit= parseInt(params.pageSize);
    GoodsCategory.find(formData).skip(querySkip).limit(querylimit).then(response=>{
        GoodsCategory.find(formData).count().then(Counter=>{
            return Utils.SuccessMsg(res,{data:response,total:Counter})
        });
    },error=>{
        return Utils.ErrMsg(res,{msg:error.message});
    })
})

router.post('/GetIndexCmsData',function(req,res){ //获取首页全部咨询
    let params = req.body;
    if(!params.pageIndex || !params.pageSize)return Utils.ErrMsg(res,{});
    let querySkip = (parseInt(params.pageIndex)-1) * parseInt(params.pageSize);
    let querylimit= parseInt(params.pageSize);
    let resultData = {};
    Article.findOne({type: 'banner'},{_id: 0,__v:0}).then(response=>{
        resultData.cmsBanner = response;
        return Article.find({type: 'life'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.life = response;
        return GoodsCategory.findOne({type: 'jd_kill'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_kill = response;
        return GoodsCategory.findOne({type: 'shop_kill'},{_id: 0,__v:0}) 
    }).then(response=>{
        resultData.shop_kill = response;
        return GoodsCategory.findOne({type: 'jd_goods_watch'},{_id: 0,__v:0}) 
    }).then(response=>{
        resultData.jd_goods_watch = response;
        return GoodsCategory.findOne({type: 'jd_hmzj'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_hmzj = response;
        return GoodsCategory.find({type: 'jd_loveLife'},{_id: 0,__v:0}).skip(querySkip).limit(querylimit)
    }).then(response=>{
        resultData.jd_loveLife = response;
        return GoodsCategory.findOne({type: 'jd_jiaju'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_jiaju = response;
        return GoodsCategory.findOne({type: 'jd_baobao'},{_id: 0,__v:0}) 
    }).then(response=>{
        resultData.jd_baobao = response;
        return GoodsCategory.findOne({type: 'jd_beautiful'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_beautiful = response;
        return GoodsCategory.findOne({type: 'jd_food'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_food = response;
        return GoodsCategory.findOne({type: 'jd_clothes'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_clothes = response;
        return GoodsCategory.findOne({type: 'jd_liqueur'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_liqueur = response;
        return GoodsCategory.findOne({type: 'jd_Mens'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_Mens = response;
        return GoodsCategory.findOne({type: 'jd_djd'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_djd = response;
        return GoodsCategory.findOne({type: 'jd_books'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_books = response;
        return GoodsCategory.findOne({type: 'jd_meishicheng'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_meishicheng = response;
        return GoodsCategory.findOne({type: 'jd_bangong'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_bangong = response;
        return GoodsCategory.findOne({type: 'jd_smxjd'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_smxjd = response;
        return GoodsCategory.findOne({type: 'jd_shengxian'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_shengxian = response;
        return GoodsCategory.findOne({type: 'jd_meizhuang'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_meizhuang = response;
        return GoodsCategory.findOne({type: 'jd_shuma'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_shuma = response;
        return GoodsCategory.findOne({type: 'jd_xiangbao'},{_id: 0,__v:0})
    }).then(response=>{
        resultData.jd_xiangbao = response;
        return Utils.SuccessMsg(res,{data: resultData,msg: 'ok'})
    })
})

module.exports = router;