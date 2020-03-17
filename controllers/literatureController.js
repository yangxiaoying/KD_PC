const cookieFilter = require('../filters/cookieFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const pagerHelper = require('../helpers/pagerHelper');
const prevNextPagerHelper = require('../helpers/prevNextPagerHelper');
const url = webConfig.serverAddr;
const libraryStaticData = require('../data/library/indexData');
const loginFilter = require('../filters/loginFilter');
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const jsEncryptHelper = require('../helpers/jsEncryptHelper');

module.exports = {
    // 文献搜索首页
    home: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('literature/literatureHomeView', {title: '文献库_看典', viewModel: viewModel, addr: webConfig});
        })
    },
    // 搜索结果 高级搜索结果 单个库搜索结果
    literatureResult: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
            var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var field = req.query.field || null; // 筛选：ztcode：专题代码 year：年 author：作者代码，unit：机构代码 fund：基金代码 level：文献标识码 source 拼音刊名
            var fieldValue = req.query.fieldValue || null; //筛选的type对应的code
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            var fulltext = req.query.fulltext || null;
            var topic = req.query.topic || null;
            var title = req.query.title || null;
            var keyword = req.query.keyword || null;
            var author = req.query.author || null;
            var workUnit = req.query.workuunit || null;
            var source = req.query.source || null;
            var fund = req.query.fund || null;
            var publishDate = req.query.publishdate || null; // 发表时间 两个时间用,（英文逗号）分割例如 2015,2019
            var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.keyword || req.query.author || req.query.workuunit || req.query.source || req.query.fund || null;
            // var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0]; // 第一个字段
            var isAdvancedSearch = req.query.isAdvancedSearch || 0; // 0普通搜索 1高级搜索
            var isAsync = req.query.isAsync || 0;

            var searchWordName = ''; // 比如搜全文 此处值为fulltext
            switch (searchWordValue) {
                case req.query.fulltext:
                    searchWordName = 'fulltext';
                    break;
                case req.query.topic:
                    searchWordName = 'topic';
                    break;
                case req.query.title:
                    searchWordName = 'title';
                    break;
                case req.query.keyword:
                    searchWordName = 'keyword';
                    break;
                case req.query.author:
                    searchWordName = 'author';
                    break;
                case req.query.workuunit:
                    searchWordName = 'workuunit';
                    break;
                case req.query.source:
                    searchWordName = 'source';
                    break;
                case req.query.fund:
                    searchWordName = 'fund';
                    break;
            }


            var dropdownList = {
                fulltext: '全文',
                topic: '主题',
                title: '篇名',
                keyword: '关键词',
                author: '作者',
                source: '来源',
                publishdate: '发表时间'
            };

            // 高级搜索 搜索词组
            var searchWordsStr = '';
            var newQuery = {};

            delete req.query.isAdvancedSearch;
            delete req.query.order;
            delete req.query.pageNum;

            var newQuery = req.query;

            //高级搜索 多个字段组合
            var queryStr = '';
            for (let obj in newQuery) {
                queryStr += '&' + obj + '=' + newQuery[obj];
            }
            queryStr = queryStr.substring(1);

            for (var item in newQuery) {
                searchWordsStr += dropdownList[item] + ':' + newQuery[item] + '; '
            }
            searchWordsStr = searchWordsStr.replace(',', '-'); // 处理时间 如1915-2019

            var formData = {
                appid: 'web',
                code: 'getKBaseArticlesByAlbum',
                album: album,
                order: order,
                field: field,
                fieldvalue: fieldValue,
                pageIndex: pageIndex,
                pageSize: pageSize,
                fulltext: fulltext,
                topic: topic,
                title: title,
                keyword: keyword,
                author: author,
                workuunit: workUnit,
                source: source,
                fund: fund,
                publishdate: publishDate
            };
            // console.log(formData);
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        console.log('列表：', resData.data.list)

                        if (resData.code == 0) {
                            var options = {};
                            // options[searchWordName] = searchWordValue;
                            Object.assign(options, options, newQuery);
                            options.order = order;
                            options.isAdvancedSearch = isAdvancedSearch;
                            // var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex, '/literature/literatureResult', options);
                            // var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex, '/literature/literatureResult', options);
                            var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex);
                            var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex);
                            viewModel.data = resData.data;
                            viewModel.searchWordValue = searchWordValue;
                            viewModel.searchWordName = searchWordName;
                            viewModel.resultPage = resultPage;
                            viewModel.prevNextPage = prevNextPage;
                            viewModel.dropdownList = dropdownList;
                            viewModel.isAdvancedSearch = isAdvancedSearch;
                            viewModel.queryStr = queryStr;
                            viewModel.params = {
                                order: order,
                                pageNum: pageIndex
                            };
                            viewModel.searchWordsStr = searchWordsStr;

                            if (isAsync == 0) {
                                res.render('literature/literatureResultView', {
                                    title: '搜索结果',
                                    viewModel: viewModel,
                                    addr: webConfig
                                });
                            } else {
                                res.json(resData);
                            }

                        } else {
                            console.log('请检查文献结果页接口或查看请求参数是否正确！')
                        }
                    } else {
                        throw new Error('无数据');
                    }
                });
        })
    },
    // 单个库搜索结果 高级搜索结果
    libraryResult: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
            var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var field = req.query.field || null; // 筛选：ztcode：专题代码 year：年 author：作者代码，unit：机构代码 fund：基金代码 level：文献标识码 source 拼音刊名
            var fieldValue = req.query.fieldValue || null; //筛选的type对应的code
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            var fulltext = req.query.fulltext || null;
            var topic = req.query.topic || null;
            var title = req.query.title || null;
            var keyword = req.query.keyword || null;
            var author = req.query.author || null;
            var workUnit = req.query.workuunit || null;
            var source = req.query.source || null;
            var fund = req.query.fund || null;
            var publishDate = req.query.publishdate || null; // 发表时间 两个时间用,（英文逗号）分割例如 2015,2019
            var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.keyword || req.query.author || req.query.workuunit || req.query.source || req.query.fund || null; // 比如搜历史，此处为值历史
            // var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0]; // 第一个字段
            var searchWordName = ''; // 比如搜全文 此处值为fulltext
            switch (searchWordValue) {
                case req.query.fulltext:
                    searchWordName = 'fulltext';
                    break;
                case req.query.topic:
                    searchWordName = 'topic';
                    break;
                case req.query.title:
                    searchWordName = 'title';
                    break;
                case req.query.keyword:
                    searchWordName = 'keyword';
                    break;
                case req.query.author:
                    searchWordName = 'author';
                    break;
                case req.query.workuunit:
                    searchWordName = 'workuunit';
                    break;
                case req.query.source:
                    searchWordName = 'source';
                    break;
                case req.query.fund:
                    searchWordName = 'fund';
                    break;
            }
            var dropdownList = {
                fulltext: '全文',
                topic: '主题',
                title: '篇名',
                keyword: '关键词',
                author: '作者',
                source: '来源',
                publishdate: '发表时间'
            };
            var isAdvancedSearch = req.query.isAdvancedSearch || 0; // 0普通搜索 1高级搜索
            var isAsync = req.query.isAsync || 0;
            var isLiterature = req.query.isLiterature || 0; // 区分单库文献和期刊搜索 0 文献 1 期刊
            var libraryType = '';
            if (album == 'V') {
                libraryType = 'cjfvtotal';
            } else if (album == 'U') {
                libraryType = 'cjfutotal';
            }
            if (album == 'T') {
                libraryType = 'cjfttotal';
            }
            var periodStaticData = libraryStaticData.period;

            //------------------------------------------------------------------------
            // 文献 高级搜索 搜索词组

            var searchWordsStr = '';
            var newQuery = {};

            delete req.query.isAdvancedSearch;
            delete req.query.order;
            delete req.query.pageNum;
            delete req.query.album;
            delete req.query.isLiterature;

            newQuery = req.query;

            //高级搜索 多个字段组合
            var queryStr = '';
            for (let obj in newQuery) {
                queryStr += '&' + obj + '=' + newQuery[obj];
            }
            queryStr = queryStr.substring(1);

            for (var item in newQuery) {
                searchWordsStr += dropdownList[item] + ':' + newQuery[item] + '; ';
            }
            searchWordsStr = searchWordsStr.replace(',', '-'); // 处理时间 如1915-2019


            var formData = {
                appid: 'web',
                code: 'getKBaseArticlesByAlbum',
                album: album,
                order: order,
                field: field,
                fieldvalue: fieldValue,
                pageIndex: pageIndex,
                pageSize: pageSize,
                fulltext: fulltext,
                topic: topic,
                title: title,
                keyword: keyword,
                author: author,
                workuunit: workUnit,
                source: source,
                fund: fund,
                publishdate: publishDate
            };
            // console.log(formData)
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        // console.log(resData.data.list)

                        if (resData.code == 0) {
                            // var options = {};
                            // options[searchWordName] = searchWordValue;
                            // Object.assign(options, options, newQuery);
                            // options.order = order;
                            // options.isAdvancedSearch = isAdvancedSearch;
                            var resultPage = pagerHelper(resData.data.total, 10, 5, pageIndex);
                            var prevNextPage = prevNextPagerHelper(resData.data.total, 10, 1, pageIndex);
                            viewModel.data = resData.data;
                            viewModel.album = album;

                            viewModel.searchWordValue = searchWordValue;
                            viewModel.searchWordName = searchWordName;
                            viewModel.resultPage = resultPage;
                            viewModel.prevNextPage = prevNextPage;
                            viewModel.dropdownList = dropdownList;
                            viewModel.isAdvancedSearch = isAdvancedSearch;
                            viewModel.queryStr = queryStr;
                            viewModel.params = {
                                order: order,
                                pageNum: pageIndex
                            };
                            viewModel.searchWordsStr = searchWordsStr;
                            viewModel.libraryType = libraryType;
                            viewModel.libraryStaticData = libraryStaticData;
                            viewModel.periodStaticData = periodStaticData; // 导航分类数据
                            viewModel.isLiterature = isLiterature;

                            // 文献库综合搜索
                            if (isAsync == 0) {
                                res.render('literature/libraryResultView', {
                                    title: '搜索结果',
                                    viewModel: viewModel,
                                    addr: webConfig
                                });
                            } else { // 单个库搜索
                                res.json(resData);
                            }

                        } else {
                            console.log('请检查文献结果页接口或查看请求参数是否正确！')
                        }
                    } else {
                        throw new Error('无数据');
                    }
                });
        })
    },
    // 获取分类 作者 机构 来源 发表年度等
    getLiteratureSortList: function (req, res, next) {
        // var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0];
        var searchWordName = '';
        var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.keyword || req.query.author || req.query.workuunit || req.query.source || req.query.fund || null;
        var zjCode = req.query.zjCode || 'U,V,T';
        switch (searchWordValue) {
            case req.query.fulltext:
                searchWordName = 'fulltext';
                break;
            case req.query.topic:
                searchWordName = 'topic';
                break;
            case req.query.title:
                searchWordName = 'title';
                break;
            case req.query.keyword:
                searchWordName = 'keyword';
                break;
            case req.query.author:
                searchWordName = 'author';
                break;
            case req.query.workuunit:
                searchWordName = 'workuunit';
                break;
            case req.query.source:
                searchWordName = 'source';
                break;
            case req.query.fund:
                searchWordName = 'fund';
                break;
        }
        var formData = {
            appid: 'web',
            code: 'GetArticleFilter',
            zjcode: zjCode
        };
        formData[searchWordName] = searchWordValue;
        formData.filtertype = req.query.filterType;
        // console.log(formData)
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    // console.log(data.data.list)
                    if (data.code == 0) {
                        res.json(data);
                    } else {
                        res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 根据分类 作者 机构 来源 发表年度详细分类获取列表
    getLiteratureDetailSortList: function (req, res, next) {
        var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
        var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
        var field = req.query.field || null; // 筛选：ztcode：专题代码 year：年 author：作者代码，unit：机构代码 fund：基金代码 level：文献标识码 source 拼音刊名
        var fieldValue = req.query.fieldvalue || null; //筛选的type对应的code
        var pageIndex = req.query.pageNum || 1;
        var pageSize = req.query.pageSize || 10;
        var searchWordValue = req.query.fulltext || req.query.topic || req.query.title || req.query.keyword || req.query.author || req.query.workuunit || req.query.source || req.query.fund || null;
        var searchWordName = req.url.substring(req.url.indexOf('?') + 1).split('=')[0];
        // var dropdownList = {
        //     fulltext: '全 文',
        //     topic: '主 题',
        //     title: '篇 名',
        //     keyword: '关键词',
        //     author: '作 者',
        //     source: '来 源'
        // };

        var formData = {
            appid: 'web',
            code: 'getKBaseArticlesByAlbum',
            album: album,
            order: order,
            field: field,
            fieldvalue: fieldValue,
            pageIndex: pageIndex,
            pageSize: pageSize
        };
        formData[searchWordName] = searchWordValue;
        // formData.filtertype = req.query.filterType;
        // console.log(formData)
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    // console.log(data.data.list)
                    if (data.code == 0) {
                        res.json(data);
                    } else {
                        res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 根据关键字 获取相关联看典号
    getOrgListByKeyword: function (req, res, next) {
        var keyword = decodeURI(req.query.keyword);
        var limit = req.query.limit;

        var formData = {
            appid: 'web',
            code: 'GetOrgList',
            keyword: keyword,
            order: 'DESC',
            offset: 0,
            limit: limit,
            sort: 'ClickCount'
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    // console.log(data)
                    if (data.code == 0) {
                        res.json(data.data);
                    } else {
                        res.json('请检查获取看典号列表信息接口，或查看传参是否正确！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 文献库高级搜索
    advancedSearch: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('literature/advancedSearchView', {title: '高级搜索', viewModel: viewModel, addr: webConfig});
        })
    },
    // 频道 高级搜索
    channelSearch: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var libraryType = req.query.dbName;
            var album = '';
            if (libraryType == 'cjfvtotal') {
                album = 'V';
            } else if (libraryType == 'cjfutotal') {
                album = 'U';
            } else if (libraryType == 'cjfttotal') {
                album = 'T';
            }
            viewModel.album = album;
            viewModel.libraryType = libraryType;
            viewModel.libraryStaticData = libraryStaticData;
            var periodStaticData = libraryStaticData.period;
            viewModel.periodStaticData = periodStaticData; // 导航分类数据
            res.render('literature/channelSearchView', {title: '高级搜索', viewModel: viewModel, addr: webConfig});
        })
    },
    // 文献详细页
    literatureDetail: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var filename = req.query.filename;
            var dbType = req.query.dbType;
            var libraryType = dbType.toLowerCase() + 'total';
            var periodStaticData = libraryStaticData.period;
            var formData = {
                appid: 'web',
                code: 'GetArticleInfo',
                filename: filename,
                dbtype: dbType
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var data = JSON.parse(body);
                        // console.log(data)
                        if (data.code == 0) {
                            viewModel.libraryType = libraryType;
                            viewModel.data = data.data;
                            viewModel.libraryStaticData = libraryStaticData;
                            viewModel.periodStaticData = periodStaticData; // 导航分类数据
                            viewModel.filename = filename;
                            res.render('literature/literatureDetailView', {
                                viewModel: viewModel,
                                title: data.data.artilce.title + '_看典文献库'
                            });
                        } else {
                            res.json('无数据返回！请检查文献详细页接口');
                        }
                    } else {
                        throw new Error('无数据');
                    }
                });
        })
    },
    // 文献下载页
    literatureDownload: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let filename = req.query.filename;
                let title = req.query.title;
                let year = req.query.year;
                let period = req.query.period;
                let pageCount = req.query.pageCount;
                let source = req.query.source;
                let signature = jsEncryptHelper.encrypt(req.session.uid);

                async.parallel([
                    // 账户余额
                    function (cb) {
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
                                        cb(null, resData.rows)
                                    } else {
                                        console.log('未查询到账户余额信息！')
                                    }
                                } else {
                                    throw err;
                                }
                            });
                    },
                    // 获取文献价格
                    function (cb) {
                        let formData = {
                            "signature": signature,
                            "channel": '1',
                            "code": filename,
                            "ordertype": 0,
                            "openid": req.session.openId,
                            "action": "check",
                            "identifier": appId,
                            "secret": secret,
                        };
                        // console.log('获取文献价格参数:', formData);
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: formData
                            },
                            function (err, response, body) {
                            console.log('获取文献价格返回:',body)
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    // console.log('check:', resData);
                                    cb(null, resData);
                                } else {
                                    throw new Error('支付接口action:check，错误');
                                }
                            });
                    },
                ], function (err, results) {
                    if (err) {
                        throw err;
                    }
                    viewModel.filename = filename;
                    viewModel.title = title;
                    viewModel.year = year;
                    viewModel.period = period;
                    viewModel.pageCount = pageCount;
                    viewModel.source = source;
                    viewModel.account = results[0];
                    viewModel.check = results[1];

                    let price = parseFloat(results[1].Price);
                    viewModel.sufficient = 0;
                    // console.log('价格：', results[0].Money, price);
                    if (parseFloat(results[0].Money) >= price) {
                        viewModel.sufficient = 1;
                    }
                    res.render('literature/literatureDownloadView', {viewModel: viewModel, title: '文献下载'});
                });


            });
        })
    },
    // 文献立即下载
    download: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            loginFilter(req, res, viewModel, function () {
                let filename = req.query.filename;
                // let price = req.query.price;
                // let title = req.query.title;
                // let year = req.query.year;
                // let period = req.query.period;
                // let pageCount = req.query.pageCount;
                // let source = req.query.source;
                let signature = jsEncryptHelper.encrypt(req.session.uid);
                async.waterfall([
                    // 购买
                    function (cb) {
                        let formData = {
                            "signature": signature,
                            "channel": '1',
                            "code": filename,
                            "ordertype": 0,
                            "openid": req.session.openId,
                            "action": "pay",
                            "identifier": appId,
                            "secret": secret,
                        };
                        // console.log('参数:', formData)
                        request({
                                url: webConfig.paymentAddr + '/commit.do',
                                method: 'post',
                                headers: {
                                    "content-type": "application/json"
                                },
                                json: true,
                                body: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    let resData = body;
                                    console.log('pay:', resData);
                                    cb(null, resData);
                                } else {
                                    throw err;
                                }
                            });
                    },
                    // 文献下载
                    function (arg, cb) {
                        if (arg.ErrorMessage = '购买成功') {
                            let formData = {
                                code: 'Download',
                                appid: 'web',
                                filename: filename,
                                desn: '',
                                uname: viewModel.user.name,
                                type: 'Article',
                                savefilename: 'literatureDownload',
                                ftype: 'pdf'
                            };
                            request.post({
                                    url: url,
                                    form: formData
                                },
                                function (err, response, body) {
                                    if (!err && response.statusCode == 200) {
                                        let resData = JSON.parse(body);
                                        console.log('下载：', resData);
                                        cb(null, resData);
                                    } else {
                                        throw err;
                                    }
                                });
                        } else {
                            throw new Error(arg.ErrorMessage)
                        }

                    },
                ], function (err, results) {
                    if (err) {
                        throw err;
                    }
                    let url = results.data.downloadurl.substring(1, results.data.downloadurl.length - 1);
                    res.redirect(url);
                });


            });
        })
    },

    // 文艺、文化、科普库
    library: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var dbName = req.query.dbname || 'cjfutotal,cjtvtotal,cjfttotal'; // U:精品文化;V"精品文艺;T:精品科普
            var orderby = req.query.orderby || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var ztCode = req.query.ztcode || null; //筛选的type对应的code
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            var isAsync = req.query.isAsync || 0;
            var album = 'U,V,T';
            var libraryName = '';
            var periodStaticData = libraryStaticData.period;
            if (dbName == 'cjfutotal') {
                album = 'U';
                libraryName = '文化';
            } else if (dbName == 'cjfvtotal') {
                album = 'V';
                libraryName = '文艺作品';
            } else if (dbName == 'cjfttotal') {
                album = 'T';
                libraryName = '科普';
            }

            var formData = {
                appid: 'web',
                code: 'GetRecommendArticle',
                dbname: dbName,
                orderby: orderby,
                ztcode: ztCode,
                pageindex: pageIndex,
                pagesize: pageSize,
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        // console.log(resData.data)

                        if (resData.code == 0) {
                            if (isAsync == 0) {
                                viewModel.data = resData.data;
                                viewModel.libraryType = dbName;
                                viewModel.libraryStaticData = libraryStaticData; // 导航分类数据
                                viewModel.periodStaticData = periodStaticData; // 导航分类数据

                                viewModel.ztcode = ztCode;
                                viewModel.album = album;
                                res.render('literature/libraryView', {
                                    viewModel: viewModel,
                                    title: '中国精品' + libraryName + '期刊文献库_看典'
                                });
                            } else {
                                res.json(resData);
                            }
                        } else {
                            console.log('请检查文献库接口！')
                        }
                    } else {
                        throw new Error('无数据');
                    }
                });
        })
    },
    // 库频道
    channel: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var album = req.query.album || 'U,V,T'; // U:精品文化;V"精品文艺;T:精品科普
            var order = req.query.order || 3; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var subject = req.query.subject || null;
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 10;
            var publishDate = req.query.publishdate || null;
            var dbName = req.query.dbname;
            var isAsync = req.query.isAsync || 0;
            var x = req.query.x || -1; // 一级分类位置
            var ztName = decodeURI(req.query.ztName);
            var isRecommended = req.query.isRecommended || 1; // 0：全部，1：精选
            if (ztName == 'undefined') {
                ztName = 0; // 作为标示在前端判断
            }
            var periodStaticData = libraryStaticData.period;
            var formData = {
                appid: 'web',
                code: 'GetKBaseArticlesBySubject',
                album: album,
                order: order,
                subject: subject,
                pageIndex: pageIndex,
                pageSize: pageSize,
                publishdate: publishDate,
                IsRecommend: isRecommended
            };
            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        // console.log(resData.data)

                        if (resData.code == 0) {
                            if (isAsync == 0) {
                                viewModel.data = resData.data;
                                viewModel.libraryType = dbName;
                                viewModel.libraryStaticData = libraryStaticData; // 导航分类数据
                                viewModel.position = {
                                    x: x
                                };
                                viewModel.album = album;
                                viewModel.ztName = ztName;
                                viewModel.ztCode = subject;
                                viewModel.pageStr = pagerHelper(resData.data.total, 10, 5, pageIndex);
                                viewModel.periodStaticData = periodStaticData; // 导航分类数据
                                var title = '';
                                if (viewModel.libraryType == 'cjfvtotal') {
                                    // 文艺库
                                    title = '文艺库';
                                } else if (viewModel.libraryType == 'cjfutotal') {
                                    // 文化库
                                    title = '文化库';
                                } else if (viewModel.libraryType == 'cjfttotal') {
                                    // 科普库
                                    title = '科普库';
                                }
                                res.render('literature/channelView', {viewModel: viewModel, title: title});
                            } else {
                                res.json(resData);
                            }

                        } else {
                            console.log('请检查获取文献频道接口！')
                        }
                    } else {
                        throw new Error('无数据');
                    }
                });
        })
    },
    // 文艺、文化、科普期刊
    period: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var qkMark = req.query.qkMark || null;
            var magaName = req.query.magaName || null;
            var issn = req.query.issn || null;
            var cn = req.query.cn || null;
            var cbd = req.query.cbd || null;
            var organizers = req.query.organizers || null;
            var orderby = req.query.orderby || 1; // 排序 0：相关度1：更新时间
            var pageNum = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 20;
            var dbCode = req.query.dbCode || 'U;V;T';
            var isAsync = req.query.isAsync || 0;
            var periodStaticData = libraryStaticData.period;
            var qkName = req.query.qkName || null;
            var libraryType = '';
            var isPeriodSearch = req.query.isPeriodSearch || 0; // 0 期刊页  1 单库期刊高级搜索
            var ArgsList = {
                magaName: '刊名',
                issn: 'ISSN',
                cn: 'CN',
                cbd: '出版地',
                organizers: '出版单位'
            };
            var pageTitle = '';

            if (isPeriodSearch == 1) {
                //------------------------------------------------------------------------
                // 期刊 高级搜索 搜索词组
                var searchWordsStr = '';
                var newQuery = {};

                delete req.query.isAdvancedSearch;
                delete req.query.orderby;
                delete req.query.pageSize;
                delete req.query.isPeriodSearch;
                delete req.query.dbCode;

                newQuery = req.query;

                //高级搜索 多个字段组合
                var queryStr = '';
                for (let obj in newQuery) {
                    queryStr += '&' + obj + '=' + newQuery[obj];
                }
                queryStr = queryStr.substring(1);

                for (var item in newQuery) {
                    searchWordsStr += ArgsList[item] + ':' + newQuery[item] + '; ';
                }
                searchWordsStr = searchWordsStr.replace(',', '-'); // 处理时间 如1915-2019
            }

            if (dbCode == 'V') {
                libraryType = 'cjfvtotal';
                pageTitle = '文艺库';
            } else if (dbCode == 'U') {
                libraryType = 'cjfutotal';
                pageTitle = '文化库';
            } else if (dbCode == 'T') {
                libraryType = 'cjfttotal';
                pageTitle = '科普库';
            }
            var formData = {
                appid: 'web',
                code: 'GetMagaInfoList',
                qkmark: qkMark,
                maganame: magaName,
                issn: issn,
                cn: cn,
                cbd: cbd,
                organizers: organizers,
                orderby: orderby,
                pageindex: pageNum,
                pagesize: pageSize,
                dbcode: dbCode
            };
            // console.log(formData)

            request.post({
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        // console.log(resData.data.list);

                        if (resData.code == 0) {
                            if (isAsync == 0) {
                                viewModel.pageStr = pagerHelper(resData.data.totalcount, 25, 5, pageNum);
                                viewModel.prevNextPage = prevNextPagerHelper(resData.data.totalcount, 25, 5, pageNum);
                                viewModel.data = resData.data;
                                viewModel.periodStaticData = periodStaticData;
                                viewModel.dbCode = dbCode;
                                viewModel.qkMark = qkMark;
                                viewModel.qkName = qkName;
                                viewModel.libraryType = libraryType;
                                viewModel.libraryStaticData = libraryStaticData;
                                viewModel.queryStr = queryStr;
                                viewModel.searchWordsStr = searchWordsStr;
                                viewModel.pageNum = pageNum;
                                viewModel.magaName = magaName;
                                viewModel.searchWordValue = magaName;
                                if (isPeriodSearch == 0) {
                                    res.render('literature/periodView', {viewModel: viewModel, title: pageTitle});
                                } else {
                                    res.render('literature/libraryPeriodResultView', {
                                        viewModel: viewModel,
                                        title: '搜索结果'
                                    });
                                }

                            } else {
                                res.json(resData);
                            }
                        } else {
                            console.log('请检查获取期刊信息列表接口！')
                        }
                    } else {
                        throw new Error('GetMagaInfoList错误');
                    }
                });
        })
    },
    // 获取相似文献
    getSimilarLiterature: function (req, res, next) {

        var filename = req.query.filename;
        var dbname = req.query.dbname || 'cjtutotal,cjtvtotal,cjfttotal';

        var formData = {
            appid: 'web',
            code: 'GetSimilarArticlesList',
            filename: filename,
            count: 10
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    // console.log(data)
                    if (data.code == 0) {
                        res.json(data);
                    } else {
                        res.json('请检查相似文献接口！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 获取文献图片
    getLiteraturePics: function (req, res, next) {

        var filename = req.query.filename;

        var formData = {
            fn: filename,
            db: 'CJFD',
            s: 0,
            type: 'XML'
        };
        request.post({
                url: 'http://bianke.cnki.net/api/WebApi/GetArticleImgsByFn',
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    // console.log(data)
                    if (data.Code == 1) {
                        res.json(data);
                    } else {
                        res.json('请检查文献图片接口！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 获取非学术库文章和期刊总数
    getArticleAndMagaCount: function (req, res, next) {

        var dbCode = req.query.dbCode;

        var formData = {
            code: 'GetArticleAndMagaCount',
            appid: 'web',
            dbcode: dbCode
        };

        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    // console.log(data)
                    if (data.code == 0) {
                        res.json(data);
                    } else {
                        res.json('请检查获取非学术库文章和期刊总数接口！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 获取往期期刊
    getPastPeriod: function (req, res, next) {

        var thname = req.query.thName;

        var formData = {
            code: 'GetMagaPastPeriodList',
            appid: 'web',
            thname: thname
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    console.log(data)
                    if (data.code == 0) {
                        res.json(data.data);
                    } else {
                        res.json('请检查获取往期期刊接口！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 获取文献库推荐期刊数据 好刊推荐
    getRecommendPeriod: function (req, res, next) {

        var pageindex = req.query.pageIndex || 1;
        var pagesize = req.query.pageSize || 6;
        // var searchday = req.query.searchDay || 1;
        var typeid = req.query.typeId;

        var formData = {
            pageindex: pageindex,
            pagesize: pagesize,
            code: 'GetSysIndexSelectedTableList',
            appid: 'web',
            // searchday: searchday,
            typeid: typeid
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    // console.log(resData.data)
                    if (resData.code == 0) {
                        res.json(resData);
                    } else {
                        res.json('请检查获取文献库推荐期刊数据！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 获取首页作品分页列表（只提推荐作品）大家都在看
    getRecommendWorks: function (req, res, next) {

        var offset = req.query.offset || 0;
        var limit = req.query.limit || 5;
        var sort = req.query.sort || 'id';
        var mediatype = req.query.mediatype || -1;

        var formData = {
            offset: offset,
            limit: limit,
            sort: sort,
            order: 'desc',
            code: 'GetCollectionList',
            appid: 'web',
            categorycode: '',
            mediatype: mediatype,
            isboutique: 1
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    // console.log(resData)
                    if (resData.code == 0) {
                        res.json(resData);
                    } else {
                        res.json('请检查获取首页作品分页列表（只提推荐作品）！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 相关作品
    getRelatedWorks: function (req, res, next) {

        var offset = req.query.offset || 0;
        var limit = req.query.limit || 3;
        var sort = req.query.sort || 'id';
        var searchTitle = req.query.searchTitle || '';

        var formData = {
            offset: offset,
            limit: limit,
            sort: sort, // 	排除方式 默认id,viewcount 热门
            order: 'desc',
            code: 'GetSearchRelevantCollection',
            appid: 'web',
            // username: '',
            searchtitle: searchTitle
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    // console.log(JSON.parse(resData.collectionlist))
                    if (resData.code == 0) {
                        res.json(JSON.parse(resData.collectionlist));
                    } else {
                        res.json('请检查获取文献库搜索右侧相关作品列表 ！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    },
    // 文献库检索页，相关微刊列表
    getSearchRelevantMicroBook: function (req, res, next) {

        var keyword = req.query.keyword || null;
        var limit = req.query.limit || 3;

        var formData = {
            limit: limit,
            code: 'GetSearchRelevantMicroBook',
            appid: 'web',
            keyword: keyword
        };
        request.post({
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    if (resData.code == 0) {
                        res.json(JSON.parse(resData.data.list));
                    } else {
                        res.json('请检查文献库检索页，相关微刊列表接口 ！');
                    }
                } else {
                    throw new Error('无数据');
                }
            });
    }
};