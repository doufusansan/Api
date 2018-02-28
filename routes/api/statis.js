const express = require('express');
const router = express.Router();
const Utils = require('../../public/javascripts/utils');
const {
    Statis_User,
    Statis_Order,
    Statis_Shop,
    Statis_Admin,
    Statis_Article,
    Statis_Visits,
    Statis_Api
} = require('../../mongodb/Schema/statis');

router.post('/GetStatisData', function (req, res) { //获取统计数据
    let statisData = {
        MonthTotalData: [],
        UserDailyData: [],
        OrderDailyData: [],
        ShopDailyData: [],
        AdminDailyData: [],
        ArticleDailyData: [],
        VisitsDailyData: [],
        ApiDailyData: []
    };
    let i = 0;

    function test() {
        let afterDate = Utils.FormatDate(new Date(), -(30 - (i + 1)));
        let afterThirtyDate = Utils.FormatDate(new Date(), -(30 - i));
        let thirtyDateQuery = { //一个月的记录
            "create_date": {
                $gte: new Date(`${afterThirtyDate.y}-${afterThirtyDate.m}-${afterThirtyDate.d} 00:00:00`),
                $lt: new Date(`${afterDate.y}-${afterDate.m}-${afterDate.d} 00:00:00`)
            }
        };
        Statis_User.find(thirtyDateQuery).count().then(Counter => {
            statisData.UserDailyData.push(Counter);
            return Statis_Order.find(thirtyDateQuery).count()
        }).then(Counter => {
            statisData.OrderDailyData.push(Counter);
            return Statis_Shop.find(thirtyDateQuery).count()
        }).then(Counter => {
            statisData.ShopDailyData.push(Counter);
            return Statis_Admin.find(thirtyDateQuery).count()
        }).then(Counter => {
            statisData.AdminDailyData.push(Counter);
            return Statis_Article.find(thirtyDateQuery).count()
        }).then(Counter => {
            statisData.ArticleDailyData.push(Counter);
            return Statis_Visits.find(thirtyDateQuery).count()
        }).then(Counter => {
            statisData.VisitsDailyData.push(Counter);
            return Statis_Api.find(thirtyDateQuery).count()
        }).then(Counter => {
            statisData.ApiDailyData.push(Counter);
            statisData.MonthTotalData.push(`${afterDate.y}-${afterDate.m}-${afterDate.d}`);
            if (i >= 29) {
                return Utils.SuccessMsg(res, {
                    data: statisData
                })
            } else {
                i++;
                test(i)
            }
        })
    }
    test(i)
})

module.exports = router;