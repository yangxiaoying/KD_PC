var cookieFilter = require('../filters/cookieFilter');
var request = require('request');
var webConfig = require('../config/web.config');
var url = webConfig.serverAddr;

module.exports = {
    // 添加收藏
    addCollect(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var id = req.params.id;
            var typeid = req.query.typeid || 0; //收藏类型0:作品 1:微刊 2:朗读 3:典言 4:期刊 5:图书 6文献
            var formData = {
                appid: 'web',
                code: 'GoCollect',
                username: viewModel.user.name,
                typeid: 0,
                foreignkeyid: id,
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
                            res.json('请检查收藏方法！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 取消收藏
    cancelCollect(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var id = req.params.id;
            var typeid = req.query.typeid || 0;
            var formData = {
                appid: 'web',
                code: 'GoCancleCollect',
                username: viewModel.user.name,
                typeid: 0,
                foreignkeyid: id,
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
                            res.json('请检查取消收藏方法！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    //评论提交
    commentSubmit: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var id = req.params.id;
            var typeid = parseInt(req.query.typeid);
            var content = req.query.content;
            var score = req.query.score || 0;
            var formData = {
                appid: 'web',
                code: 'AddComment',
                username: viewModel.user.name,
                foreignkeyid: id,
                typeid, //0-看典图文评论，1-看典朗读评论，2-书评
                content,
                score,
                mediainfo: ''
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
                            res.json('请检查作品提交评论！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
};