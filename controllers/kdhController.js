var cookieFilter = require('../filters/cookieFilter');
var async = require('async');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var url = webConfig.serverAddr;

module.exports = {
    home(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var orgid = req.params.orgid;
            async.parallel([
                // 看典号基本信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgBaseInfo',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
                // 看典号首页信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'OrgHomePage',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
                // 看典号首页图书
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgJournalBookList',
                        orgid: orgid,
                        offset: 0,
                        limit: 5,
                        sort: 'addtime',
                        typeid: 2
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
                // 首页banner图
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetBannerListByOrgId',
                        orgid: orgid,
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
            ], function(err, results) {
                if (err) {
                    throw err;
                }
                console.log(JSON.parse(results[1]).data);
                var kdhIndexInfo = JSON.parse(results[1]).data;
                var { collectionlist, journallist } = kdhIndexInfo;
                if (collectionlist && collectionlist.length > 0) {
                    var listimgtxt = collectionlist.filter(item => item.mediatype === 1);
                    var listaudio = collectionlist.filter(item => item.mediatype === 2);
                    var listvideo = collectionlist.filter(item => item.mediatype === 3);
                    var listpic = collectionlist.filter(item => item.mediatype === 4);
                }
                if (journallist && journallist.length > 0) {
                    var journalArr = [];
                    journallist.forEach(item => {
                        const magalist = item.magalist;
                        if (magalist && magalist.length > 0) {
                            magalist.forEach(item => {
                                journalArr.push(item);
                            });
                        }
                    });
                }
                viewModel.data = {
                    kdhBaseInfo: JSON.parse(results[0]).data,
                    kdhIndexInfo,
                    listimgtxt,
                    listaudio,
                    listvideo,
                    listpic,
                    journallist: journalArr,
                    bookInfo: JSON.parse(results[2]).data,
                    bannerList: JSON.parse(results[3]).data
                };
                res.render('kdh/kdhHomeView', { title: '看典号首页', viewModel: viewModel });
            });
        })
    },
    works(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var orgid = req.params.orgid;
            var limit = req.query.limit || 10;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var sort = req.query.sort || 'SubmitTime'; //SubmitTime 最新，viewcount 最热
            var orgcateid = req.query.orgcateid || '-1';
            var keyword = req.query.keyword || '';
            var mediatype = req.query.mediatype || -1; //全部作品-1 作品类型 1-图文；2-音频；3-视频；4-图集
            var isAsync = req.query.isAsync || 0;
            async.parallel([
                // 看典号基本信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgBaseInfo',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
                // 看典号首页信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'OrgHomePage',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
                // 看典号作品列表
                function(cb) {
                    var formData = {
                        username: viewModel.user.name,
                        appid: 'web',
                        code: 'GetOrgCollectionListByOrgId',
                        orgid,
                        offset,
                        limit,
                        sort,
                        orgcateid,
                        keyword,
                        mediatype
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            console.log(mediatype);
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
            ], function(err, results) {
                if (err) {
                    throw err;
                }
                var kdhIndexInfo = JSON.parse(results[1]).data;
                var { collectionlist } = kdhIndexInfo;
                if (collectionlist && collectionlist.length > 0) {
                    var listimgtxt = collectionlist.filter(item => item.mediatype === 1);
                    var listaudio = collectionlist.filter(item => item.mediatype === 2);
                    var listvideo = collectionlist.filter(item => item.mediatype === 3);
                    var listpic = collectionlist.filter(item => item.mediatype === 4);
                }
                var pageStr = pagerHelper(JSON.parse(results[1]).data.total, limit, 5, pageNum);
                viewModel.data = {
                    kdhBaseInfo: JSON.parse(results[0]).data,
                    kdhIndexInfo,
                    listimgtxt,
                    listaudio,
                    listvideo,
                    listpic,
                    mediatype,
                    pageStr
                };

                if (isAsync == 0) {
                    res.render('kdh/kdhWorksView', { title: '看典号作品', viewModel: viewModel });
                } else {
                    res.json(JSON.parse(results[2]));
                }

            });
        })
    },
    microbook(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var orgid = req.params.orgid;
            var keyword = req.query.keyword || '';
            var sort = req.query.sort || 'SubmitTime';
            var limit = 8;
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * limit;
            var isAsync = req.query.isAsync || 0;

            async.parallel([
                // 看典号基本信息
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgBaseInfo',
                        orgid: orgid,
                        username: viewModel.user.name
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
                // 微刊
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetOrgMircBookListByOrgId',
                        orgid: orgid,
                        offset: offset,
                        limit: limit,
                        sort: sort,
                        keyword: keyword
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err('无数据');
                            }
                        });
                },
            ], function(err, results) {
                if (err) {
                    throw err;
                }
                var pageStr = pagerHelper(JSON.parse(results[1]).data.total, limit, 5, pageNum);
                viewModel.data = {
                    kdhBaseInfo: JSON.parse(results[0]).data,
                    microbookData: JSON.parse(results[1]).data,
                    sort,
                    keyword,
                    pageStr
                };

                if (isAsync == 0) {
                    res.render('kdh/kdhMicrobookView', { title: '看典号微刊', viewModel: viewModel });
                } else {
                    res.json(JSON.parse(results[1]));
                }

            });
        })
    },
    // 书店页
    showBookshop(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var orgid = req.params.orgid;
            var otype = req.query.otype;
            var formData = {
                appid: 'web',
                code: 'GetOrgBaseInfo',
                orgid: orgid,
                username: viewModel.user.name
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        if (resData.code == 0) {
                            viewModel.data = {
                                kdhBaseInfo: resData.data,
                                otype: otype
                            };
                            res.render('kdh/kdhBookshopView', { title: '看典号书店', viewModel: viewModel });
                        } else {
                            res.json('无数据返回！请检查看典书店页接口');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 获取书店页期刊和图书列表
    getPeriodAndBook(req, res, next) {
        var orgid = req.params.orgid;
        var pageNum = req.query.pageNum || 1;
        var limit = req.query.limit;
        var offset = (pageNum - 1) * limit;
        var sort = req.query.sort || 'addtime';
        var typeid = req.query.typeid || 1;
        var cateid = req.query.cateid || 0;

        var formData = {
            appid: 'web',
            code: 'GetOrgJournalBookList',
            orgid: orgid,
            offset: offset,
            limit: limit,
            sort: sort,
            typeid: typeid,
            journalcount: 10,
            cateid: cateid
        };
        request.post({
                url: url,
                form: formData
            },
            function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    console.log(resData);
                    if (resData.code == 0) {
                        res.json(resData);
                    } else {
                        res.json('请检查获取看典书店分页列表！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    // 获取作品页分类
    getWorksCategory(req, res, next) {
        var orgid = req.params.orgid;
        var formData = {
            appid: 'web',
            code: 'GetOrgCategoryList',
            orgid: orgid
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
                        res.json('请检查获取看典号自定义分类列表！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    // 获取看典号基本信息
    getBaseInfo(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var orgid = req.params.orgid;
            var formData = {
                appid: 'web',
                code: 'GetOrgBaseInfo',
                orgid: orgid,
                username: viewModel.user.name
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
                            res.json('请检查获取看典号基本信息！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 关注或者取消关注
    addOrCancelConcern(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var orgid = req.params.orgid;
            var otype = req.query.otype;
            var formData = {
                appid: 'web',
                code: 'AddConcern',
                username: viewModel.user.name,
                typeid: 0,
                foreignkeyid: orgid,
                otype: otype,
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    console.log(formData);
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        console.log(resData);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            res.json('请检查关注或者取消关注方法！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    // 获取期刊年信息列表
    getPeriodYear(req, res, next) {
        var magacode = req.query.magacode;
        var formData = {
            appid: 'web',
            code: 'GetMagaYearListByCode',
            magacode: magacode
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
                        res.json('请检查获取期刊年信息列表！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    // 获取书店图书分类
    getBookCategory(req, res, next) {
        var orgid = req.params.orgid;
        var formData = {
            appid: 'web',
            code: 'GetCateOrgBook',
            orgid: orgid
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
                        res.json('请检查获取看典号图书分类！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },

};