const cookieFilter = require('../filters/cookieFilter');
const loginFilter = require('../filters/loginFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const url = webConfig.serverAddr;
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const qrcode = require('qrcode');

module.exports = {
    // 支付方式选择
    checkout: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                // let originalUrl = req.query.originalUrl;
                let workId = req.query.id || req.query.code;
                let workTitle = decodeURI(req.query.title);
                let mediaType = req.query.mediaType;
                let price = req.query.price;
                let coverPic = req.query.coverPic;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                /* 0 文献 1期刊单期 2期刊年 3期刊全刊 4工具书 5词条 6 工具书包月、半年、年 7品得书院（图书） 8大成编客 9 活动 17 看典作品 18 看典微刊 19看典月会员 20看典年会员 */
                let orderType = req.query.ordertype  || 17;
                let period = req.query.period || '';
                let year = req.query.year || '';
                console.log(price);
                console.log(coverPic);
                console.log(workTitle);
                console.log(workId);
                console.log(orderType);
                async.parallel([
                    // 账户余额
                    function (cb) {
                        request({
                                url: webConfig.paymentAddr + '/userbalance.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: {
                                    "openid": req.session.openId,
                                    "identifier": appId,
                                    "secret": secret,
                                    "signature": signature
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    if (body.errorcode == 1) {
                                        console.log('余额：',resData)
                                        cb(null, resData);
                                    } else {
                                        throw new Error('账户余额查询失败！');
                                    }
                                } else {
                                    throw err;
                                }
                            });
                    },
                    // 支付宝二维码
                    function (cb) {
                        // console.log('支付宝参数:', formData)
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: {
                                    "signature": signature,
                                    "channel": '13',
                                    "code": workId,
                                    "ordertype": orderType,
                                    "period": period,
                                    "year": year,
                                    "openid": req.session.openId,
                                    "action": "pay",
                                    "identifier": appId,
                                    "secret": secret,
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    cb(null, resData);
                                } else {
                                    throw err;
                                }
                            });
                    },
                    // 微信二维码
                    function (cb) {
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json",
                                    "Cookies": "SID=110014"
                                },
                                json: true,
                                body: {
                                    "channel": '12',
                                    "code": workId,
                                    "ordertype": orderType,
                                    "period": period,
                                    "year": year,
                                    "signature": signature,
                                    "openid": req.session.openId,
                                    "action": "pay",
                                    "identifier": appId,
                                    "secret": secret,
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    cb(null, resData);
                                } else {
                                    throw err;
                                }
                            });
                    },
                    // 银联订单号
                    function (cb) {
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json",
                                    "Cookies": "SID=110014"
                                },
                                json: true,
                                body: {
                                    "channel": '7',
                                    "code": workId,
                                    "ordertype": orderType,
                                    "period": period,
                                    "year": year,
                                    "signature": signature,
                                    "openid": req.session.openId,
                                    "action": "pay",
                                    "identifier": appId,
                                    "secret": secret,
                                }
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    cb(null, resData);
                                } else {
                                    throw err;
                                }
                            });
                    },
                ], function (err, results) {
                    if (err) {
                        throw err;
                    }
                    // 作品相关信息数据
                    viewModel.workInfo = {
                        workId: workId,
                        workTitle: workTitle,
                        mediaType: mediaType,
                        price: parseFloat(price).toFixed(2),
                        coverPic: coverPic,
                        orderType: orderType,
                        period: period,
                        year: year
                    };
                    // console.log('阿里：', results[1]);
                    // console.log('微信：', results[2]);
                    // console.log('银联：', results[3]);
                    // 微信二维码处理
                    qrcode.toDataURL(results[2].wechatQRCodeUrl, function (err, url) {
                        viewModel.qrcode = url;
                        // 异步查询返回数据
                        viewModel.data = {
                            balance: results[0].rows,
                            wechat: results[2],
                            wechatQrcode: url,
                            alipay: results[1],
                            unionPay: results[3]
                        };

                        // 判断余额是否充足
                        if (parseFloat(results[0].rows.UsableMoney)+ parseFloat(results[0].rows.UsableTicket) >= parseFloat(price)) {
                            viewModel.balance = {
                                insufficient: 0
                            }
                        } else {
                            viewModel.balance = {
                                insufficient: 1
                            }
                        }
                        res.render('payment/checkoutView', {title: '支付', viewModel: viewModel});
                    });

                });
            });
        })
    },
    // 确认支付
    confirmPay: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let code = req.query.id;
                let channel = req.query.channel;
                let orderType = req.query.orderType;
                let year = req.query.year || '';
                let period = req.query.period || '';
                let openid = req.session.openId;
                let action = 'pay';
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let formData = {
                    "signature": signature,
                    "channel": channel,
                    "year": year,
                    "code": code,
                    "period": period,
                    "ordertype": orderType,  // 0文献  1期刊单期  2期刊年   7品得书院（图书） 17 看典作品  18 看典微刊
                    "openid": openid,
                    "action": action,
                    // "plateform": "2",
                    "identifier": appId,
                    "secret": secret
                };
                // console.log('确认提交参数：', formData);
                request({
                        url: webConfig.paymentAddr + '/commit.do',
                        method: 'post',
                        headers: {
                            "content-type": "application/json",
                            "Cookies": "SID=110014"
                        },
                        json: true,
                        body: formData
                    },
                    function (err, response, body) {
                        console.log(body);
                        if (!err && response.statusCode == 200) {
                            let resData = body;
                            if (resData.ErrorCode == 101 || resData.ErrorCode == 102) {
                                res.json({
                                    errorCode: 1,
                                    errorMessage: '支付成功！'
                                });
                            } else {
                                res.json(resData.ErrorMessage);
                            }
                        } else {
                            throw err;
                        }
                    });
            });
        })
    },
    // 支付成功
    success: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let workId = req.query.id;
            let mediaType = req.query.mediatype;
            var formData = {
                appid: 'web',
                code: 'getRecommendByPayed',
                cid: workId,
                username: viewModel.user.name,
                limit: '8',
                type: mediaType
            };
            request.post(
                {
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    let resData = JSON.parse(body);
                    console.log(resData)
                    if (!err && response.statusCode == 200) {
                        viewModel.workId = workId;
                        viewModel.mediaType = mediaType;
                        viewModel.data = resData.data;
                        res.render('payment/successView', {
                            title: '支付成功',
                            viewModel: viewModel
                        })
                    } else {
                        throw err;
                    }
                })
        })
    },
    //会员支付
    membersCheckout:function(req,res,next){
         cookieFilter(req, res, function (viewModel) {
            res.render('payment/membersCheckoutView', {title: '会员支付',viewModel: viewModel}) 
         })
    },
    //会员支付成功
    paySuccess:function(req,res,next){
         cookieFilter(req, res, function (viewModel) {
            res.render('payment/paySuccessView', {title: '会员支付成功',viewModel: viewModel}) 
         })
    },
}
