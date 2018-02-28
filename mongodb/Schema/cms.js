const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const cms_article_info = new Schema({ //文章资讯
    id: { type: Number, unique: true },
    article_title: { type: String },
    article_url: { type: String },
    type: { type: String },
    image_url: { type: Array },
    media_video: { type: Object },
    summary: { type: String },
    content:{ type: String },
    create_date: { type: Date, default: Date.now },
    start_date: { type: Date ,default: Date.now},
    end_date: { type: Date ,default: Date.now},
    status: { type: Number ,default: 9}
},{ collection: "cms_article_info"});

cms_article_info.index({ create_date: 1 , status: -1, id: 1 }); 


const cms_goods_category = new Schema({ //资讯分类
    id: { type: Number, unique: true },
    product_list: { type: Array },
    type: { type: String },
    summary: { type: String },
    content: { type: String },
    image_url: { type: Array },
    create_date: { type: Date, default: Date.now },
    start_date: { type: Date ,default: Date.now},
    end_date: { type: Date ,default: Date.now},
    status: { type: Number ,default: 9}
},{ collection: "cms_goods_category"});
cms_goods_category.index({ start_date: 1 });


const SchemaModule = {
    Article: mongoose.model('cms_article_info',cms_article_info),
    GoodsCategory: mongoose.model('cms_goods_category',cms_goods_category)
}



module.exports = SchemaModule;