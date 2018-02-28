const mongoose = require('mongoose')
const Schema = mongoose.Schema;

sys_statis_visits = new Schema({ //访问量
    create_date : { type: Date, default: Date.now },
    country: { type: String },
    province: { type: String },
    city: { type: String },
    isp: { type: String }
},{
    collection: "sys_statis_visits"
})
sys_statis_visits.index({ 
    create_date: -1
}); 

sys_statis_api = new Schema({ //api 调用次数
    create_date : { type: Date, default: Date.now }
},{
    collection: "sys_statis_api"
})
sys_statis_api.index({ 
    create_date: -1
}); 

sys_statis_user = new Schema({ //统计用户
    create_date : { type: Date, default: Date.now }
},{
    collection: "sys_statis_user"
})
sys_statis_user.index({ 
    create_date: -1
}); 

sys_statis_order = new Schema({ //统计订单
    create_date : { type: Date, default: Date.now },
    order_no: { type: String }
},{
    collection: "sys_statis_order"
})
sys_statis_order.index({ 
    create_date: -1
}); 

sys_statis_shop = new Schema({ //统计店铺
    create_date : { type: Date, default: Date.now }
},{
    collection: "sys_statis_shop"
})
sys_statis_shop.index({ 
    create_date: -1
}); 

sys_statis_admin = new Schema({ //统计管理员
    create_date : { type: Date, default: Date.now }
},{
    collection: "sys_statis_admin"
})
sys_statis_admin.index({ 
    create_date: -1
}); 

sys_statis_article = new Schema({ //统计资讯
    create_date : { type: Date, default: Date.now }
},{
    collection: "sys_statis_article"
})
sys_statis_article.index({ 
    create_date: -1
}); 


const SchemaModule = {
    Statis_User: mongoose.model('sys_statis_user',sys_statis_user),
    Statis_Order: mongoose.model('sys_statis_order',sys_statis_order),
    Statis_Shop: mongoose.model('sys_statis_shop',sys_statis_shop),
    Statis_Admin: mongoose.model('sys_statis_admin',sys_statis_admin),
    Statis_Article: mongoose.model('sys_statis_article',sys_statis_article),
    Statis_Visits: mongoose.model('sys_statis_visits',sys_statis_visits),
    Statis_Api: mongoose.model('sys_statis_api',sys_statis_api)
}

module.exports = SchemaModule;