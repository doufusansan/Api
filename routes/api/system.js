const express = require('express');
const router = express.Router();
const Utils = require('../../public/javascripts/utils');
const Sys = require('../../mongodb/Schema/admin');
const Admin = Sys.Admin;
const Mbr = require('../../mongodb/Schema/member');
const Member = Mbr.Member;
const Shop = require('../../mongodb/Schema/shop');
const Category = Shop.Category; // 商品分类
const Product = Shop.Product; //   商品信息
const Order = Shop.Order; //   订单
const Shop_info = Shop.Shop; //店铺信息
const Cms = require('../../mongodb/Schema/cms');
const Article = Cms.Article;
const GoodsCategory = Cms.GoodsCategory;
const GoodsList = Cms.GoodsList;
var md5 = require('md5');

router.post('/CreateUser', function (req, res) { // 创建管理员
    let params = req.body;
    // {"rootId":"123","username":"admin","password":"123456","roles":"root"}
    if (!params.username || !params.password || !params.roles) return Utils.ErrMsg(res, {});
    let newAdmin = {
        username: params.username,
        password: md5(params.password),
        roles: params.roles,
        phone: params.phone || null,
        province: params.province || null,
        city: params.city || null,
        area: params.area || null,
        address: params.address || null,
        status: 9
    }
    if (params.photo_url) {
        newAdmin.photo_url = params.photo_url
    };
    new Admin(newAdmin).save().then(response => {
        Utils.StatisNewsAdmin()
        return Utils.SuccessMsg(res, {});
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    })
});

router.post('/LoginUser', function (req, res) { //登陆管理员
    let params = req.body;
    if (!params.username || !params.password) return Utils.ErrMsg(res, {});
    Admin.findOne({
        username: params.username,
        password: md5(params.password)
    }, {
        __v: 0,
        password: 0
    }).then(response => {
        if (!response) return Utils.ErrMsg(res, {
            msg: '用户信息不存在'
        });
        if (response.status !== 1) return Utils.ErrMsg(res, {
            msg: '账号审核未通过'
        });
        Utils.StatisNewsVisits(req);
        return Utils.SuccessMsg(res, {
            data: response._id
        });
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    });
})

router.post('/GetAdminList', function (req, res) { //获取管理员账户列表信息
    let params = req.body;
    if (!params.AdminToken) return Utils.ErrMsg(res, {});
    Utils.permissionValidate(res,params.AdminToken,['root']).then(success=>{
        Admin.find({}, {
            __v: 0,
            password: 0
        }).then(response => {
            return Utils.SuccessMsg(res, {
                data: response
            });
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        });
    })
})

router.post('/GetAdminInfo', function (req, res) { //获取管理员账户信息
    let params = req.body;
    if (!params.AdminToken) return Utils.ErrMsg(res, {});  
    Admin.findOne({
        _id: params.AdminToken
    }, {
        __v: 0,
        password: 0
    }).then(response => {
        if (!response) return Utils.ErrMsg(res, {
            msg: '用户信息不存在'
        });
        return Utils.SuccessMsg(res, {
            data: response
        });
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    });
})

router.post('/EditAdminInfo', function (req, res) { //编辑管理员账户信息
    let params = req.body;
    if (!params.TargetId || !params.AdminToken) return Utils.ErrMsg(res, {});
    let UpdatedData = {};
    if (params.roles) {
        UpdatedData.roles = params.roles
    };
    if (params.phone) {
        UpdatedData.phone = params.phone
    };
    if (params.province) {
        UpdatedData.province = params.province
    };
    if (params.city) {
        UpdatedData.city = params.city
    };
    if (params.area) {
        UpdatedData.area = params.area
    };
    if (params.address) {
        UpdatedData.address = params.address
    };
    if (params.status) {
        UpdatedData.status = params.status
    };
    Utils.permissionValidate(res,params.AdminToken,['root']).then(success=>{
        Admin.updateOne({
            _id: params.TargetId
        }, UpdatedData, {
            upsert: false
        }).then(response => {
            if (!response) return Utils.ErrMsg(res, {
                msg: '用户信息不存在'
            });
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        });
    })  
})

router.post('/DelectAdmin', function (req, res) { //删除管理员
    let params = req.body;
    if (!params.AdminToken) return Utils.ErrMsg(res, {});
    Utils.permissionValidate(res,params.AdminToken,['root']).then(success=>{
        Admin.deleteOne({
            _id: params.AdminToken
        }).then(response => {
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        })
    })
})



router.post('/AuthorizedAdmin', function (req, res) { //审核认证管理员
    let params = req.body;
    if (!params.rootId || !params.AdminToken || !params.status) return Utils.ErrMsg(res, {});
    Utils.permissionValidate(res,params.AdminToken,['root']).then(success=>{
        Admin.updateOne({
            _id: params.othersId
        }, {
            status: params.status
        }, {
            upsert: false
        }).then(response => {
            if (!response) return Utils.ErrMsg(res, {
                msg: '用户信息不存在'
            });
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        });
    })
})



//后台管理用户模块

router.post('/GetUserList', function (req, res) { //获取用户信息列表
    let params = req.body;
    if (!params.pageIndex || params.pageIndex <= 0 || !params.pageSize) return Utils.ErrMsg(res, {});
    let querySkip = (parseInt(params.pageIndex) - 1) * parseInt(params.pageSize);
    let querylimit = parseInt(params.pageSize);
    Member.find({}, {
        _v: 0,
        password: 0
    }).skip(querySkip).limit(querylimit).then(response => {
        Member.find({}).count().then(Counter => {
            return Utils.SuccessMsg(res, {
                data: response,
                total: Counter
            })
        });
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    });
});

router.post('/GetGoodsList', function (req, res) { //获取商品列表
    let params = req.body;
    if (!params.pageIndex || params.pageIndex <= 0 || !params.pageSize) return Utils.ErrMsg(res, {});
    let querySkip = (parseInt(params.pageIndex) - 1) * parseInt(params.pageSize);
    let querylimit = parseInt(params.pageSize);
    Product.find({}, {
        _v: 0
    }).skip(querySkip).limit(querylimit).then(response => {
        Product.find({}).count().then(Counter => {
            return Utils.SuccessMsg(res, {
                data: response,
                total: Counter
            })
        });
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    });
});

router.post('/DeleteGoods', function (req, res) { //删除商品
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Product.deleteOne({
            _id: params.Id
        }).then(response => {
            return Utils.SuccessMsg(res, {})
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        });
    })
});

router.post('/EditGoods', function (req, res) { //编辑商品信息
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    let UpdatedData = {};
    if (params.productName) {
        UpdatedData.productName = params.productName
    };
    if (params.categoryId) {
        UpdatedData.categoryId = params.categoryId
    };
    if (params.image_url) {
        UpdatedData.image_url = params.image_url
    };
    if (params.content) {
        UpdatedData.content = params.content
    };
    if (params.summary) {
        UpdatedData.summary = params.summary
    };
    if (params.price) {
        UpdatedData.price = params.price
    };
    if (params.stocks) {
        UpdatedData.stocks = params.stocks
    };
    if (params.shopId) {
        UpdatedData.shopId = params.shopId
    };
    if (params.status) {
        UpdatedData.status = params.status
    };
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Product.updateOne({
            productNo: params.Id
        }, UpdatedData, {
            upsert: false
        }).then(response => {
            if (!response) return Utils.ErrMsg(res, {
                msg: '商品不存在'
            });
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        });
    })    
})

router.post('/GetAllCategory', function (req, res) { //获取商品目录信息
    let params = req.body;
    Category.find({}, {
        _id: 0,
        __v: 0
    }).then(Callback => {
        Category.find({}).count().then(Counter => {
            return Utils.SuccessMsg(res, {
                data: Callback,
                total: Counter
            });
        })
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    })
})

router.post('/CreatedProduct', function (req, res) { // - 添加商品
    let params = req.body;
    if (!params.shopId || !params.status || !params.productName || !params.image_url || !params.categoryId || !params.content || !params.summary || !params.price || !params.stocks) return Utils.ErrMsg(res, {});
    let imgArray = '';
    try {
        imgArray = JSON.parse(params.image_url);
    } catch (error) {
        imgArray = params.image_url;
    }
    let ProductList = new Product({
        productName: params.productName,
        categoryId: params.categoryId,
        productNo: parseInt(Utils.GenerateChallengecode(15)),
        image_url: imgArray,
        content: params.content,
        summary: params.summary,
        price: params.price,
        stocks: params.stocks,
        shopId: params.shopId,
        status: params.status
    });
    ProductList.save(function (err, success) {
        Utils.SuccessMsg(res, {
            data: success
        });
    })
});


router.post('/GetOrderList', function (req, res) { //获取所有订单列表
    let params = req.body;
    if (!params.pageIndex || params.pageIndex <= 0 || !params.pageSize) return Utils.ErrMsg(res, {});
    let querySkip = (parseInt(params.pageIndex) - 1) * parseInt(params.pageSize);
    let querylimit = parseInt(params.pageSize);
    Order.find({}, {
        _v: 0
    }).skip(querySkip).limit(querylimit).then(response => {
        Order.find({}).count().then(Counter => {
            return Utils.SuccessMsg(res, {
                data: response,
                total: Counter
            })
        });
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    });
});

router.post('/GetOrder', function (req, res) { //获取订单详细信息
    let params = req.body;
    if (!params.OrderNo) return Utils.ErrMsg(res, {});
    Order.findOne({
        "orderInfo.OrdertNo": params.OrderNo
    }, {
        __v: 0,
        _id: 0
    }).then(response => {
        if (!response) return Utils.ErrMsg(res, {
            msg: '订单号不存在'
        });
        return Utils.SuccessMsg(res, {
            data: response
        });
    }, fail => {
        return Utils.ErrMsg(res, {
            msg: fail.message
        })
    })
});



//分类
router.post('/CreatedCategory', function (req, res) { //创建新的节点
    let params = req.body;
    if (!params.name || !params.parentId) return Utils.ErrMsg(res, {});
    let fromData = {
        Id: Utils.GenerateChallengecode(5),
        name: params.name,
        parentId: params.parentId
    };
    if (params.image_url) {
        fromData.image_url = params.image_url
    }
    if (params.desc) {
        fromData.desc = params.desc
    }
    new Category(fromData).save().then(response => {
        return Utils.SuccessMsg(res, {
            msg: 'ok'
        });
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    })
})

router.post('/DeleteCategory', function (req, res) { //删除一个节点
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Category.deleteOne({
            Id: params.Id
        }).then(response => {
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        });
    })    
})

router.post('/EditCategory', function (req, res) { //编辑节点
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    let fromData = {};
    if (params.name) {
        fromData.name = params.name
    }
    if (params.image_url) {
        fromData.image_url = params.image_url
    }
    if (params.parentId) {
        fromData.parentId = params.parentId
    }
    if (params.desc) {
        fromData.desc = params.desc
    }
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Category.updateOne({
            Id: params.Id
        }, fromData, {
            upsert: false
        }).then(response => {
            if (!response) return Utils.ErrMsg(res, {
                msg: '节点不存在'
            });
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        })
    })    
})

//cms
router.post('/CreatedArticle', function (req, res) { // 新增文章
    let params = req.body;
    if (!params.article_title || !params.type) return Utils.ErrMsg(res, {});
    let formData = {
        id: Utils.GenerateChallengecode(6),
        article_title: params.article_title,
        type: params.type
    };
    if (params.article_url) {
        formData.article_url = params.article_url
    };
    if (params.image_url) {
        formData.image_url = params.image_url
    };
    if (params.media_video) {
        formData.media_video = params.media_video
    };
    if (params.summary) {
        formData.summary = params.summary
    };
    if (params.content) {
        formData.content = params.content
    };
    if (params.start_date) {
        formData.start_date = params.start_date
    };
    if (params.end_date) {
        formData.end_date = params.end_date
    };
    if (params.status) {
        formData.status = params.status
    };
    new Article(formData).save().then(response => {
        Utils.StatisNewsArticle()
        return Utils.SuccessMsg(res, {
            msg: 'ok',
            data: response
        });
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        })
    });
})

router.post('/DeleteArticle', function (req, res) { // 删除文章信息
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Article.deleteOne({
            id: params.Id
        }).then(response => {
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, error => {
            return Utils.ErrMsg(res, {
                msg: error.message
            });
        })
    })
})

router.post('/EditArticle', function (req, res) { // 编辑文章信息
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    let formData = {
        article_title: params.article_title || null,
        article_url: params.article_url || null,
        type: params.type || null,
        image_url: params.image_url || null,
        media_video: params.media_video || null,
        summary: params.summary || null,
        content: params.content || null,
        start_date: params.start_date || null,
        end_date: params.end_date || null,
        status: params.status || null
    };
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Article.updateOne({
            id: params.Id
        }, formData, {
            upsert: false
        }).then(response => {
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, error => {
            return Utils.ErrMsg(res, {
                msg: error.message
            });
        })
    })    
})

router.post('/GetGoodsCategoryList', function (req, res) { //获取活动列表
    let params = req.body;
    if (!params.pageIndex || params.pageIndex <= 0 || !params.pageSize) return Utils.ErrMsg(res, {});
    let querySkip = (parseInt(params.pageIndex) - 1) * parseInt(params.pageSize);
    let querylimit = parseInt(params.pageSize);
    let formData = {};
    if (params.Type) {
        formData.type = params.Type
    };
    GoodsCategory.find(formData, {
        _id: 0
    }).skip(querySkip).limit(querylimit).then(response => {
        GoodsCategory.findOne(formData).count().then(Counter => {
            return Utils.SuccessMsg(res, {
                data: response,
                total: Counter
            })
        })
    }, error => {
        return Utils.ErrMsg(res, {
            msg: error.message
        })
    })
})

router.post('/GetGoodsCategory', function (req, res) { //获取活动
    let params = req.body;
    if (!params.Id) return Utils.ErrMsg(res, {});
    GoodsCategory.findOne({
        id: params.Id
    }, {
        _id: 0
    }).then(response => {
        return Utils.SuccessMsg(res, {
            data: response
        })
    }, error => {
        return Utils.ErrMsg(res, {
            msg: error.message
        })
    })
})

router.post('/CreateGoodsCategory', function (req, res) { //创建活动
    let params = req.body;
    if (!params.product_list || !params.type) return Utils.ErrMsg(res, {});
    let formData = {
        id: Utils.GenerateChallengecode(6),
        product_list: params.product_list,
        type: params.type,
        summary: params.summary || null,
        content: params.content || null,
        image_url: params.image_url || [],
        start_date: params.start_date || null,
        end_date: params.end_date || null,
        status: params.status || null
    };
    new GoodsCategory(formData).save().then(response => {
        return Utils.SuccessMsg(res, {
            data: response
        })
    }, error => {
        return Utils.ErrMsg(res, {
            msg: error.message
        });
    })
})

router.post('/EditGoodsCategory', function (req, res) { //编辑活动
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    let formData = {
        product_list: params.product_list || [],
        type: params.type || null,
        image_url: params.image_url || [],
        content: params.content || '',
        summary: params.summary || '',
        start_date: params.start_date,
        end_date: params.end_date,
        status: params.status || 9
    };
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        GoodsCategory.updateOne({
            id: params.Id
        }, formData, {
            upsert: false
        }).then(response => {
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            })
        }, error => {
            return Utils.ErrMsg(res, {
                msg: error.message
            });
        })
    })
})

router.post('/DeleteGoodsCategory', function (req, res) { //删除活动
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        GoodsCategory.deleteOne({
            id: params.Id
        }).then(response => {
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            });
        }, err => {
            return Utils.ErrMsg(res, {
                msg: err.message
            })
        });
    })
})

router.post('/GetProductList', function (req, res) { //获取商品列表
    let params = req.body;
    let param = {};
    if (!params.pageIndex || params.pageIndex <= 0 || !params.pageSize) return Utils.ErrMsg(res, {});
    if (params.Keywords) {
        param = {
            $or: [ 
                {
                    productName: {
                        $regex: new RegExp(params.Keywords),
                    }
                },
                {
                    summary: {
                        $regex: new RegExp(params.Keywords),
                    }
                }
                // {
                //     categoryId: {
                //         $regex: new RegExp(params.Keywords),
                //     }
                // },
                // {
                //     shopId: {
                //         $regex: new RegExp(params.Keywords),
                //     }
                // },
                // {
                //     productNo: {
                //         $regex: new RegExp(params.Keywords),
                //     }
                // },
            ]
        }
    };
    let querySkip = (parseInt(params.pageIndex) - 1) * parseInt(params.pageSize);
    let querylimit = parseInt(params.pageSize);
    Product.find(param, {
        _id: 0,
        __v: 0
    }).skip(querySkip).limit(querylimit).then(response => {
        Product.find(param, {
            _id: 0,
            __v: 0
        }).count().then(Counter=>{
            return Utils.SuccessMsg(res, {
                data: response,
                total: Counter
            });
        })
    }, err => {
        return Utils.ErrMsg(res, {
            msg: err.message
        });
    })
})

router.post('/GetShop',function(req,res){ //获取店铺
    let params = req.body;
    if(!params.ShopId)return Utils.ErrMsg(res,{});
    Shop_info.findOne({id: params.ShopId}).then(response=>{
        return Utils.SuccessMsg(res,{data:response})
    },error=>{return Utils.ErrMsg(res,{msg:error.message})})
})

router.post('/GetShopList',function(req,res){ //获取店铺列表
    let params = req.body;
    if (!params.pageIndex || params.pageIndex <= 0 || !params.pageSize) return Utils.ErrMsg(res, {});
    let querySkip = (parseInt(params.pageIndex) - 1) * parseInt(params.pageSize);
    let querylimit = parseInt(params.pageSize);
    Shop_info.find({}).skip(querySkip).limit(querylimit).then(response=>{
        Shop_info.find({}).count().then(Counter=>{
            return Utils.SuccessMsg(res,{data:response,total: Counter})
        })
    },error=>{return Utils.ErrMsg(res,{msg:error.message})})
})


router.post('/CreatedShop',function(req,res){ //创建店铺
    let params = req.body;
    if(!params.shop_name || !params.shop_logo || !params.cms_content || !params.shop_summary)return Utils.ErrMsg(res,{});
    let formData = {
        id: Utils.GenerateChallengecode(5),
        shop_name: params.shop_name,
        shop_logo: params.shop_logo,
        cms_content: params.cms_content,
        shop_summary: params.shop_summary,
        category_info: [
            {
                Id: 1,
                createTime: new Date(),
                desc: '根目录',
                image_url: [],
                name: '根目录',
                parentId: 0
            }
        ],
        cms_banner: params.cms_banner || [],
        goods_total_num: 0,
        like_count: 0,
        goods_list: params.goods_list || [],
    };
    if(formData.goods_list&&formData.goods_list.length>0){formData.goods_total_num = formData.goods_list.length}
    new Shop_info(formData).save().then(response=>{
        Utils.StatisNewsShop()
        return Utils.SuccessMsg(res,{data:response});
    },error=>{return Utils.ErrMsg(res,{msg:error.message})})
})

router.post('/EditShop', function (req, res) { //编辑店铺
    let params = req.body;
    if (!params.Id || !params.AdminToken) return Utils.ErrMsg(res, {});
    let formData = {
        shop_name: params.shop_name || '',
        shop_logo: params.shop_logo || [],
        cms_content: params.cms_content!==''&&params.cms_content!=null ? params.cms_content : '',
        category_info: params.category_info || [],
        cms_banner: params.cms_banner || [],
        goods_total_num: 0,
        goods_list: params.goods_list || [],
        shop_summary: params.shop_summary || '',
    };
    if(formData.goods_list&&formData.goods_list.length>0){formData.goods_total_num = formData.goods_list.length}
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Shop_info.updateOne({
            id: params.Id
        }, formData, {
            upsert: false
        }).then(response => {
            return Utils.SuccessMsg(res, {
                msg: 'ok'
            })
        }, error => {
            return Utils.ErrMsg(res, {
                msg: error.message
            });
        })
    })    
})

router.post('/EditShopCategory',function(req,res){ //编辑店铺的商品分类
    let params = req.body;
    if(!params.Id || !params.categoryId || !params.category_info || !params.AdminToken)return Utils.ErrMsg(res,{});
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Shop_info.updateOne({id: params.Id,"category_info.Id":params.categoryId},{
            $set:{
                "category_info.$": params.category_info
            }
        },{upsert: false}).then(response=>{
            return Utils.SuccessMsg(res,{msg: 'ok'})
        },error=>{Utils.ErrMsg(res,{msg:error.message})})
    })    
})
router.post('/AddShopCategory',function(req,res){ //添加店铺的商品分类
    let params = req.body;
    if(!params.Id || !params.category_info)return Utils.ErrMsg(res,{});
    params.category_info.Id = Number(Utils.GenerateChallengecode(5));
    Shop_info.updateOne({id: params.Id},{$push: {"category_info": params.category_info}},{upsert: false}).then(response=>{
        return Utils.SuccessMsg(res,{msg: 'ok'})
    },error=>{Utils.ErrMsg(res,{msg:error.message})})
})
router.post('/DeleteShopCategory',function(req,res){ //删除店铺的商品分类
    let params = req.body;
    if(!params.Id || !params.categoryId || !params.AdminToken)return Utils.ErrMsg(res,{});
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Shop_info.updateOne({id: params.Id},{$pull: {"category_info": {Id: params.categoryId}}},{upsert: false}).then(response=>{
            return Utils.SuccessMsg(res,{msg: 'ok'})
        },error=>{Utils.ErrMsg(res,{msg:error.message})})
    })    
})

router.post('/DeleteShop',function(req,res){ //删除店铺
    let params = req.body;
    if(!params.ShopId || !params.AdminToken)return Utils.ErrMsg(res,{});
    Utils.permissionValidate(res,params.AdminToken,['root','admin']).then(success=>{
        Shop_info.deleteOne({id: params.ShopId}).then(response=>{
            return Utils.SuccessMsg(res,{msg:'ok'})
        },error=>{return Utils.ErrMsg(res,{msg:error.message})})
    })
})

module.exports = router;