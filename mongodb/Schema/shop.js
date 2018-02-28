const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const shop_category_info = new Schema({ //商品分类
    Id: {
        type: Number,
        unique: true
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    parentId: {
        type: Number
    },
    image_url: {
        type: Array
    },
    name: {
        type: String
    },
    desc: {
        type: String
    }
}, {
    collection: "shop_category_info"
});

shop_category_info.index({
    Id: 1,
    parentId: 1
});
// {"imge_url":"[{\"file_name\":\"macbook0\",\"file_path\":\"https://img10.360buyimg.com/n2/jfs/t15868/290/1256778221/94428/38da0bec/5a4f357bN37ff5a12.jpg\"},{\"file_name\":\"微软（Microsoft）Surface Laptop超轻薄触控笔记本（13.5英寸 i5-7200U 4G 128GSSD Windows10S）亮铂金 \",\"file_path\":\"https://img11.360buyimg.com/n1/s450x450_jfs/t6577/32/146245829/54834/6c530ea5/593a49a3Nc4a97321.jpg\"},{\"file_name\":\"微软（Microsoft）Surface Laptop超轻薄触控笔记本（13.5英寸 i5-7200U 4G 128GSSD Windows10S）亮铂金 \",\"file_path\":\"https://img11.360buyimg.com/cms/jfs/t6343/97/2697407639/49423/3da95345/5965f02eNe46d3232.jpg\"}]","content":"微软（Microsoft）Surface Laptop超轻薄触控笔记本（13.5英寸 i5-7200U 4G 128GSSD Windows10S）亮铂金 ","desc":"微软（Microsoft）Surface Laptop超轻薄触控笔记本（13.5英寸 i5-7200U 4G 128GSSD Windows10S）亮铂金 ","price":7688.88,"stocks":510}
const shop_product_info = new Schema({ //产品详情
    createTime: {
        type: Date,
        default: Date.now
    },
    productName: {
        type: String
    },
    categoryId: { //分类父级Id
        type: Number
    },
    shopId: { //该商品对应的店铺Id
        type: Number
    },
    productNo: {
        type: String,
        unique: true
    },
    image_url: {
        type: Array
    },
    content: {
        type: String
    },
    summary: {
        type: String
    },
    price: {
        type: Number
    },
    stocks: { //库存
        type: Number
    },
    status: { //1上架  9下架
        type: Number
    }
}, {
    collection: "shop_product_info"
});

shop_product_info.index({
    createTime: -1,
    status: 1
});

const shop_comment_info = new Schema({ //产品评论
    createTime: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String
    },
    username: {
        type: String
    },
    productNo: {
        type: String
    },
    star: {
        type: Number
    },
    image_url: {
        type: Array
    },
    content: {
        type: String
    },
    counter: {
        type: Number
    }
}, {
    collection: "shop_comment_info"
});

shop_comment_info.index({
    createTime: -1
});

const shop_package_product = new Schema({ // 购物车列表
    createTime: {
        type: Date,
        default: Date.now
    },
    memberToken: {
        type: String
    },
    checked: {
        type: Boolean,
        default: false
    },
    product: {
        type: Object
    },
    counter: {
        type: Number
    },
    status: {
        type: Number
    }
}, {
    collection: "shop_package_product"
});

shop_package_product.index({
    createTime: -1
});


const shop_order_info = new Schema({ // 订单信息
    orderInfo: {
        createTime: {
            type: Date,
            default: Date.now
        },
        addressInfo:{
            type: Object
        },
        OrdertNo: {
            type: String
        },
        memberToken: {
            type: String
        },
        total_fee: {
            type: Number
        },
        cancel_status: {
            type: Number
        },
        confirm_status: {
            type: Number
        },
        pay_status: {
            type: Number
        },
        finish_status: {
            type: Number
        },
        comment_status: {
            type: Number
        }
    },
    ProductList: {
        type: Array
    }
}, {
    collection: "shop_order_info"
});

shop_order_info.index({
    createTime: -1
});


const shop_info = new Schema({ //店铺信息
    shop_name: { type: String, unique: true },
    id: { type: Number, unique: true },
    shop_logo: { type: Array },
    cms_content: { type: String },
    category_info: { type: Array },
    cms_banner: { type: Array },
    like_count: { type: Number, default: 0},
    goods_total_num: { type: Number, default: 0},
    goods_list: { type: Array },
    shop_score: { 
        ship: { type: Number, default: 0},
        service: { type: Number, default: 0},
        goods: { tpye: Number, default: 0}
    },
    shop_summary: { type: String },
    shop_create_date: { type: Date, default: Date.now }
},{
    collection: "shop_info"
})
shop_info.index({
    shop_create_date: -1,
    like_count: -1
});

const SchemaModule = {
    Category: mongoose.model('shop_category_info', shop_category_info),
    Comment: mongoose.model('shop_comment_info', shop_comment_info),
    Product: mongoose.model('shop_product_info', shop_product_info),
    Package: mongoose.model('shop_package_product', shop_package_product),
    Order: mongoose.model('shop_order_info', shop_order_info),
    Shop: mongoose.model('shop_info',shop_info)
}
module.exports = SchemaModule;