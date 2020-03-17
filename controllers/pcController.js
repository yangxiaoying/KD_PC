const cookieFilter = require('../filters/cookieFilter');
const loginFilter = require('../filters/loginFilter');
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const jsEncryptHelper = require('../helpers/jsEncryptHelper');
const pagerHelper = require('../helpers/pagerHelper');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const url = webConfig.serverAddr;
module.exports = {
    //我的已购 同步 异步
    purchased: function (req, res, next) {
            cookieFilter(req, res, function (viewModel) {
                loginFilter(req, res, viewModel, function () {
                    let isAsync = req.query.isAsync || 0;
                    let pageIndex = req.query.pageIndex || 1;
                    let type = req.query.type || 17; // 1-期刊；5-图书；17-作品；18-微刊；9-文献
                    var formData = {
                        username: viewModel.user.name,
                        type: type,
                        platform: 'KDPC',
                        rows: 16,
                        page: pageIndex,
                        // colmunname: '',
                        // order: '',
                        appid: 'web',
                        code: 'GetPurchasedProducts'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                var resData = JSON.parse(body);
                                if(resData.code == 0){
                                    console.log('已购：',resData.data.list);
                                    viewModel.data = resData.data;
                                    if(isAsync == 0){
                                        res.render('personalCenter/purchasedView', {title: '我的已购', viewModel: viewModel});
                                    }else{
                                        res.json(resData);
                                    }
                                }else{
                                    res.json(resData.msg);
                                }

                            } else {
                                throw new Error('已购接口错误');
                            }
                        });




                });
            })
        },

    //我的收藏
    collected: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                const limit = 12;
                let isAsync = req.query.isAsync || 0;
                let pageNum = req.query.pageNum || 1;
                let offset = (pageNum-1)*limit;
                let formData = {
                    code: 'GetUserCollect',
                    appid: 'web',
                    username: viewModel.user.name,
                    offset: offset,
                    limit: limit
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            let resData = JSON.parse(body);
                            console.log('我的收藏',resData.data.list);
                            if(resData.code==0){
                                if(isAsync==0){
                                    let pageStr = pagerHelper(resData.data.total, 12, 5, pageNum);
                                    viewModel.data = resData.data;
                                    viewModel.pageStr = pageStr;
                                    res.render('personalCenter/collectedView', {title: '我的收藏', viewModel: viewModel});
                                }else{
                                    res.json(resData);
                                }

                            }else{
                                throw new Error(resData.msg);
                            }
                        } else {
                            throw new Error('我的收藏接口错误');
                        }
                    });




            });
        })
    },

    // collected: function (req, res, next) {
    //     cookieFilter(req, res, function (viewModel) {
    //         res.render('personalCenter/collectedView', {title: '我的收藏', viewModel: viewModel});
    //     })
    // },
    //收藏夹详情
    collectedDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('personalCenter/collectedDetailView', {title: '我的收藏', viewModel: viewModel});
        })
    },
    //我的关注
    follow: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let isAsync = req.query.isAsync || 0;
                let pageIndex = req.query.pageIndex || 1;
                let type = req.query.type || 17; // 1-期刊；5-图书；17-作品；18-微刊；9-文献
                var formData = {
                    username: viewModel.user.name,
                    appid: 'web',
                    code: 'GetConcernList'
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            var resData = JSON.parse(body);
                            if(resData.code == 0){
                                console.log('已购：',resData.data);
                                viewModel.data = resData.data;
                                if(isAsync == 0){
                                    res.render('personalCenter/followView', {title: '我关注的看典号', viewModel: viewModel});
                                }else{
                                    res.json(resData);
                                }
                            }else{
                                res.json(resData.msg);
                            }

                        } else {
                            throw new Error('我关注的看典号接口错误');
                        }
                    });




            });
        })
    },

};
