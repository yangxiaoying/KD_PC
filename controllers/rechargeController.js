const cookieFilter = require('../filters/cookieFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const url = webConfig.serverAddr;
const loginFilter = require('../filters/loginFilter');
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const qrcode = require('qrcode');
const moment = require('moment');

module.exports = {
    // 充值首页
    home: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let payType = req.query.payType || 13; // 默认选择支付宝
                viewModel.payType = payType;
                res.render('recharge/homeView', {title: '充值中心', viewModel: viewModel});
            });
        })
    },
    // 下一步
    generateOrder: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let userName = viewModel.user.name;
                let amount = parseFloat(req.query.rechargeMoney);
                let rechargeType = parseFloat(req.query.rechargeType);
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let openId = req.session.openId;
                let bonus = req.query.bonus;

                let formData = {
                    UserName: userName,
                    AppTag: "kdpc",
                    Amount: amount,
                    RechargeType: rechargeType,
                    RechargeMoney: amount,
                    ActuFee: amount,
                    SignatureInfo: signature,
                    OpenId: openId,
                    RechargeFlag: 0,    // 0=普通充值；1.优惠券充值；
                    DiscountType: '',   // 优惠类型 quan=使用优惠券,ma=使用优惠码
                    DiscountCouponID: '',
                    DiscountCode: '',
                    MobilePhoneNumber: '',
                    RechargeCardNumber: '',
                    RechargeCardPassword: '',
                };
                // console.log('formData:', formData)
                request({
                        url: webConfig.rechargeAddr + '/register.do',
                        method: 'post',
                        headers: {
                            "Content-Type": "application/json",
                            "AppKey": appId,
                            "AppSecret": secret
                        },
                        json: true,
                        body: formData
                    },
                    function (err, response, body) {
                        console.log('生成订单：', body);
                        if (!err && response.statusCode == 200) {
                            let resData = body;
                            if (resData.ErrorCode == 'E0051') {
                                viewModel.data = resData;
                                viewModel.rechargeMoney = amount;
                                viewModel.rechargeType = rechargeType;
                                viewModel.bonus = bonus;
                                let title = '';
                                if (rechargeType == 13) {
                                    title = '支付宝订单';
                                    viewModel.name = '支付宝';
                                    res.render('recharge/orderView', {title: title, viewModel: viewModel});
                                } else if (rechargeType == 12) {
                                    qrcode.toDataURL(body.WechatQRCodeUrl, function (err, url) {
                                        viewModel.qrcode = url;
                                        title = '微信订单';
                                        viewModel.name = '微信';
                                        res.render('recharge/orderView', {title: title, viewModel: viewModel});
                                    });
                                } else if (rechargeType == 7) {
                                    title = '银联订单';
                                    viewModel.name = '银联';
                                    viewModel.unionPayUrl = resData.UnionPayUrl;
                                    res.render('recharge/orderView', {title: title, viewModel: viewModel});
                                }

                            } else {
                                console.log(resData.ErrorMessage);
                            }
                        } else {
                            throw err;
                        }
                    });
            });
        })
    },
    // 订单轮询
    orderCheck: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let order = req.query.id;
                let payType = req.query.payType;
                // console.log('查询地址：', webConfig.orderCheckAddr + '?id=' + order + '&payType=' + payType);
                request({
                        url: webConfig.orderCheckAddr + '?id=' + order + '&payType=' + payType,
                        method: 'get',
                    },
                    function (err, response, body) {
                        console.log('订单状态查询结果：', body);
                        let resData = JSON.parse(body);
                        if (!err && response.statusCode == 200) {
                            if (resData.ErrorCode == 'E0056') {
                                res.json({
                                    errorCode: 1,
                                    errorMessage: '充值成功'
                                })
                            } else {
                                res.json({
                                    errorCode: 0,
                                    errorMessage: '充值失败'
                                })
                            }
                        } else {
                            throw err;
                        }
                    });
            });
        })
    },

    // 支付宝APP快捷支付
    alipayApp: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let userName = viewModel.user.name;
                let amount = parseFloat(req.query.rechargeMoney);
                // let rechargeType = parseFloat(req.query.rechargeType);
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                let openId = req.session.openId;
                // let bonus = req.query.bonus;

                let formData = {
                    UserName: userName,
                    AppTag: "kdpc",
                    Amount: amount,
                    RechargeType: 0,  // 支付宝快捷支付 = 0,支付宝WAP = 1
                    RechargeMoney: amount,
                    ActuFee: amount,
                    SignatureInfo: signature,
                    OpenId: openId,
                    RechargeFlag: 0,    // 0=普通充值；1.优惠券充值；
                    DiscountType: '',   // 优惠类型 quan=使用优惠券,ma=使用优惠码
                    DiscountCouponID: '',
                    DiscountCode: '',
                    MobilePhoneNumber: '',
                    RechargeCardNumber: '',
                    RechargeCardPassword: '',
                };
                // console.log('formData:', formData)
                request({
                        url: webConfig.rechargeAddr + '/register.do',
                        method: 'post',
                        headers: {
                            "Content-Type": "application/json",
                            "AppKey": appId,
                            "AppSecret": secret
                        },
                        json: true,
                        body: formData
                    },
                    function (err, response, body) {
                        console.log('支付宝网页支付：', body);
                        if (!err && response.statusCode == 200) {
                            res.json('接入中,请稍后...')
                            // let resData = body;
                            // if (resData.ErrorCode == 'E0051') {
                            //     viewModel.data = resData;
                            //     viewModel.rechargeMoney = amount;
                            //     viewModel.rechargeType = rechargeType;
                            //     viewModel.bonus = bonus;
                            //     let title = '';
                            //     if (rechargeType == 13) {
                            //         title = '支付宝订单';
                            //         viewModel.name = '支付宝';
                            //         res.render('recharge/orderView', {title: title, viewModel: viewModel});
                            //     } else if (rechargeType == 12) {
                            //         qrcode.toDataURL(body.WechatQRCodeUrl, function (err, url) {
                            //             viewModel.qrcode = url;
                            //             title = '微信订单';
                            //             viewModel.name = '微信';
                            //             res.render('recharge/orderView', {title: title, viewModel: viewModel});
                            //         });
                            //     } else if (rechargeType == 7) {
                            //         title = '银联订单';
                            //         viewModel.name = '银联';
                            //         viewModel.unionPayUrl = resData.UnionPayUrl;
                            //         res.render('recharge/orderView', {title: title, viewModel: viewModel});
                            //     }
                            //
                            // } else {
                            //     console.log(resData.ErrorMessage);
                            // }
                        } else {
                            throw err;
                        }
                    });
            });
        })
    },




    alipay: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var formData = {};
            request.post(
                {
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    res.render('recharge/alipayOrderView', {title: '支付宝支付', viewModel: viewModel});
                });
        })
    },
    wechat: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var formData = {};
            request.post(
                {
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    res.render('recharge/wechatOrderView', {title: '微信支付', viewModel: viewModel});
                });
        })
    },
    unionpay: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var formData = {};
            request.post(
                {
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    res.render('recharge/unionpayOrderView', {title: '银联支付', viewModel: viewModel});
                });
        })
    },
    success: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            let rechargeMoney = parseFloat(req.query.rechargeMoney);
            let bonus = parseFloat(req.query.bonus);
            let rechargeTime = parseInt(req.query.rechargeTime);
            viewModel.rechargeMoney = rechargeMoney.toFixed(2);
            viewModel.bonus = bonus;
            viewModel.rechargeTime = moment(rechargeTime).format('YYYY-MM-DD HH:mm:ss');
            let signature = jsEncryptHelper.encrypt(req.session.uid);

            // 用户账户余额
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
                    console.log('用户余额查询：', body);
                    if (!err && response.statusCode == 200) {
                        let resData = body;
                        if (resData.errorcode == 1) {
                            viewModel.data = resData.rows;
                            // 判断余额是否充足
                            res.render('recharge/successView', {title: '充值成功', viewModel: viewModel});
                        } else {
                            res.json(resData.errorMessage);
                        }
                    } else {
                        throw err;
                    }
                });
        })
    },
    fail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var formData = {};
            request.post(
                {
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    res.render('recharge/failView', {title: '充值失败', viewModel: viewModel});
                });
        })
    },
    jemodal: function (req, res, next) {
        res.render('recharge/jemodalView', {title: ''});
    },

    modal: function (req, res, next) {
        res.render('recharge/modalView', {title: ''});
    }

};
