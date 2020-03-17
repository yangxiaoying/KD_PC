var cookieFilter = require('../filters/cookieFilter');
var async = require('async');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var worksCategory = require('../data/category');
var url = webConfig.serverAddr;

module.exports = {
    showHome(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var keyword = req.query.keyword;
            res.render('search/searchHomeView', {title: '综合搜索首页', viewModel,keyword});
        })
    },
    showWorks(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var keyword = req.query.keyword;
            var mediatype = req.query.mediatype || 9;
            let worksCateArr = [];
            worksCateArr.push({
                "code": '',
                "name": '全部'
            })
            worksCategory.forEach(item => {
                const {code,name} = item;
                worksCateArr.push({
                    "code": code,
                    "name": name
                })
            });
            res.render('search/searchWorksView', {title: '综合搜索作品', viewModel,keyword,mediatype,worksCateArr});
        })
    },
    showMicrobook(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var keyword = req.query.keyword;
            res.render('search/searchMicrobookView', {title: '综合搜索微刊', viewModel,keyword});
        })
    },
    showPeriod(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var keyword = req.query.keyword;
            res.render('search/searchPeriodView', {title: '综合搜索期刊', viewModel,keyword});
        })
    },
    showBook(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var keyword = req.query.keyword;
            res.render('search/searchBookView', {title: '综合搜索图书', viewModel,keyword});
        })
    },
    showKdh(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var keyword = req.query.keyword;
            res.render('search/searchKdhView', {title: '综合搜索看典号', viewModel,keyword});
        })
    },
    showLiterature(req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var keyword = req.query.keyword;
            res.render('search/searchLiteratureView', {title: '综合搜索文献', viewModel,keyword});
        })
    },
    getSearchResult(req, res, next){
        cookieFilter(req, res, function (viewModel) {
            var pageNum = req.query.pageNum || 1;
            var limit = req.query.limit || 10;
            var offset = (pageNum - 1) * limit;
            var type = req.query.type || 0; //0 全部 1 微刊 2好文 3音频 4视频 5图集 6看典号 7期刊 8 图书
            var sort = req.query.sort || 'id'; //默认id,viewcount 热门
            if (type == 7 || type == 8) {
                 sort = req.query.sort || ''; 
            }
            var keyword = req.query.keyword;
            var categorycode = req.query.categorycode || '';

            var formData = {
                appid: 'web',
                code: 'multiplesearchpc',
                username: viewModel.user.name,
                offset,
                limit,
                sort,    
                type,    
                keyword,
                order: 'desc',
                categorycode 
            };
            request.post(
            {
                url: url,
                form: formData
            },
            function (err, response, body) {
                console.log(formData);
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    if (resData.code == 0) {
                        res.json(resData);
                    } else {
                        res.json('请检查综合搜索！');
                    }
                } else {
                    throw err('无数据');
                }
            });
        })
    },
};