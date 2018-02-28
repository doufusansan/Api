const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const member_info = new Schema({
    username: { type: String, index: true, unique: true},
    createTime: { type: Date, default: Date.now},
    password: String,
    Sex: Number,
    photoUrl: { type: String, default: 'https://static.hdslb.com/images/akari.jpg'},
    nickName: String,
    phone: { type: String, unique: true },
    validWalletAmount: { type: Number, default: 0 },
    paymentPassword: { type: String, default: null }
},{ collection: "member_info"});

member_info.index({ username: 1, createTime: -1 }); 

// const a = {"Phone":"13650928419","Province":"广东省","City":"广州市","Area":"天河区","Address":"车陂街","Selected":1,"MemberToken":"5a3b193704b4352464599ac2"};
const address = new Schema({
    Phone: String,
    Province: String,
    City: String,
    Area: String,
    Address: String,
    Selected: Number,
    nickName: String,
    MemberToken: String
},{ collection: "address_info"});

const favorite_shop = new Schema({

},{ collection: "member_favorite_shop" })

const SchemaModule = {
    Member: mongoose.model('member_info',member_info),
    Address: mongoose.model('address',address),
    FavoriteShop: mongoose.model('favorite_shop',favorite_shop)
}

module.exports = SchemaModule;