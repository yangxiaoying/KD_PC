var cookieFilter = require('../filters/cookieFilter');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var url = webConfig.serverAddr;

module.exports = {
    showHome(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('mall/homeView', {title: '书刊商城首页',viewModel});
        })
    },
    showBooklist(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('mall/booklistView', {title: '书刊商城_书单',viewModel});
        })
    },
    showBooklistDetail(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('mall/booklistDetailView', {title: '书刊商城_书单详情',viewModel});
        })
    },
    showRank(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('mall/rankView', {title: '书刊商城_排行榜',viewModel});
        })
    },
    showFree(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('mall/freeView', {title: '书刊商城_限时免费',viewModel});
        })
    },
    // 获取书刊商城首页
    getMallHomepage(req, res, next) {   
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'getMallIndex'
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    console.log(formData);
                    if (!err && response.statusCode == 200) {
                        console.log(body);
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            res.json('请检查书刊商城首页！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 获取书单分类列表
    getBooklistCateGory(req, res, next) {   
        cookieFilter(req, res, function(viewModel) {
            var parentcode = req.query.parentcode;
            var formData = {
                appid: 'web',
                code: 'getShopShelfCategory',
                parentcode,
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            res.json('请检查获取书单分类列表');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 获取书单列表
    getMallBooklist(req, res, next) {   
        cookieFilter(req, res, function(viewModel) {
            var limit = req.query.limit;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var code = req.query.code || '';

            var formData = {
                appid: 'web',
                code: 'getShopShelf',
                category: code,
                limit,
                offset
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            res.json('请检查获取书单列表');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 获取书单详情页
    getBooklistDetail(req, res, next) {   
        cookieFilter(req, res, function(viewModel) {
            var limit = req.query.limit;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var shelfid = req.query.booklistId || '';

            var formData = {
                appid: 'web',
                code: 'getShopShelfDetail',
                shelfid,
                limit,
                offset
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            res.json('请检查获取书单详情页');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 获取榜单列表
    getRankList(req, res, next) {   
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'getRankingList',
                type: '0'  //1 榜单 0 书单
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        res.json(resData);
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
};