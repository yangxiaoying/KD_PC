var cookieFilter = require('../filters/cookieFilter');
var async = require('async');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var worksCategory = require('../data/category');
var url = webConfig.serverAddr;

module.exports = {
    home: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'GetSysIndexSelectedData',
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        resData = JSON.parse(body);
                        // console.log(resData.data);
                        if (resData.code == 0) {
                            viewModel.data = resData.data;
                            res.render('homeView', { title: '首页', viewModel: viewModel });
                        } else {
                            res.json(resData);
                        }


                    } else {
                        throw err;
                    }
                });
        })
    },
    discovery: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            async.parallel([
                // 作品推荐
                function(cb) {
                    var formData = {
                        offset: 0,
                        limit: 15,
                        sort: 'id',
                        order: 'desc',
                        code: 'GetCollectionList',
                        appid: 'web',
                        username: viewModel.user.name,
                        categorycode: '',
                        mediatype: -1,
                        isboutique: 1
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }
                        });
                },
                // 微刊精选
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetRecommendMircBookByMicBookId',
                        id: 6
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }
                        });
                },
                // 看典号
                function(cb) {
                    var formData = {
                        username: 'wsk10073',
                        appid: 'web',
                        code: 'GetOrgList',
                        keyword: '',
                        offset: 0,
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                var organizationList = JSON.parse(body).data.rows;
                                organizationList.sort(function(obj1, obj2) {
                                    var num1 = obj1.collectioncount;
                                    var num2 = obj2.collectioncount;
                                    if (num1 > num2) {
                                        return -1;
                                    } else if (num1 == num2) {
                                        return 0;
                                    } else {
                                        return 1;
                                    }
                                });
                                cb(null, organizationList);
                            } else {
                                throw err;
                            }
                        });
                }
            ], function(err, results) {
                if (err) {
                    throw err;
                }
                viewModel.data = {
                    selectedWorks: JSON.parse(results[0]).data.collectionlist.collectionlist,
                    microBooks: JSON.parse(results[1]).data.mircbooklist,
                    organizationList: results[2]
                };
                // console.log(viewModel.data.microBooks)
                res.render('discoveryView', { title: '发现', viewModel: viewModel });
            });
        })
    },

    // 发现 加载更多作品
    discoveryMore: function(req, res, next) {
        var categorycode = req.body.categorycode || '';
        var mediatype = req.body.mediatype || -1;
        var offset = req.body.offset || 0;
        var limit = req.body.count || 10;
        var isBoutique = req.body.isBoutique || 1;
        var sort = req.body.sort || 'id';

        cookieFilter(req, res, function(viewModel) {
            var formData = {
                offset: offset,
                limit: limit,
                sort: sort,
                order: 'desc',
                code: 'GetCollectionList',
                appid: 'web',
                username: viewModel.user.name,
                categorycode: categorycode,
                mediatype: mediatype,
                isboutique: isBoutique
            };
            // console.log(formData)
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        res.json({ list: JSON.parse(body).data.collectionlist.collectionlist });
                    } else {
                        throw err;
                    }
                });
        });

    },
    // 微刊页 异步获取关联微刊
    microBook: function(req, res, next) {
        var pageNum = req.query.pageNum || 1;
        var sort = req.query.sort || 'id';
        var displayNum = 8; // 一页显示的数量
        var limit = req.query.limit || 8;
        var keyword = req.query.keyword || null;
        var isAsync = req.query.async || false; // 判断是否异步
        var isBoutique = req.query.isBoutique || 1;
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                offset: (pageNum - 1) * displayNum,
                limit: limit,
                sort: sort, // id最新, viewcount最热
                order: 'desc',
                code: 'GetMircBookList',
                appid: 'web',
                keyword: keyword,
                isboutique: isBoutique
            };
            // console.log(formData)
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        // console.log(resData)
                        if (resData.code == 0) {
                            var pageStr = pagerHelper(resData.data.total, displayNum, 5, pageNum);
                            viewModel.data = {
                                microBooks: resData.data.rows,
                                pageStr: pageStr
                            };
                            if (isAsync) {
                                res.json(resData.data);
                            } else {
                                res.render('microBookView', {
                                    title: '微刊',
                                    viewModel: viewModel,
                                    serverAddr: webConfig.serverAddr,
                                    sort: sort
                                });
                            }
                        } else {
                            console.log('请检查获取微刊分页列表接口！');
                        }


                    } else {
                        throw err;
                    }
                });
        })
    },
    works: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            viewModel.category = worksCategory;
            var sort = req.query.sort || 'id';
            var mediatype = req.query.mediatype || -1;
            var classifyId = req.query.classifyId || null; // 分类
            var pageNum = req.query.pageNum || 1;
            var offset = (pageNum - 1) * 7;
            var positionX = req.query.positionX || -1; // positionX、positionY、positionZ为菜单显示位置
            var positionY = req.query.positionY || -1;
            var positionZ = req.query.positionZ || -1;

            async.parallel([
                // 作品
                function(cb) {
                    var formData = {
                        offset: offset,
                        limit: 7,
                        sort: sort,
                        order: 'desc',
                        code: 'GetCollectionList',
                        appid: 'web',
                        username: viewModel.user.name,
                        categorycode: classifyId,
                        mediatype: mediatype
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }
                        });
                },
                // 微刊 轮播图
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetRecommendMircBookByCollectionPlatformCateId',
                        limit: 5,
                        platformCateId: classifyId ? classifyId.substring(0, 1) : null
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, JSON.parse(body).data.list);
                            } else {
                                throw err;
                            }
                        });
                },
                // 看典号
                function(cb) {
                    var formData = {
                        limit: 3,
                        platformCateId: classifyId ? classifyId.substring(0, 1) : '',
                        code: 'GetRecommendOrgByCollectionPlatformCateId',
                        appid: 'web'
                    };
                    request.post({
                            url: url,
                            form: formData
                        },
                        function(err, response, body) {
                            if (!err && response.statusCode == 200) {
                                var organizationList = JSON.parse(body).data.list;
                                // organizationList.sort(function (obj1, obj2) {
                                //     var num1 = obj1.collectioncount;
                                //     var num2 = obj2.collectioncount;
                                //     if (num1 > num2) {
                                //         return -1;
                                //     } else if (num1 == num2) {
                                //         return 0;
                                //     } else {
                                //         return 1;
                                //     }
                                // });
                                cb(null, organizationList);
                            } else {
                                throw err;
                            }
                        });
                }
            ], function(err, results) {
                if (err) {
                    throw err;
                }
                // 作品数据
                var worksData = JSON.parse(results[0]).data.collectionlist;

                // 页码
                var worksPageStr = pagerHelper(worksData.total, 7, 5, pageNum);

                // 菜单位置
                viewModel.menuPosition = {
                    x: positionX,
                    y: positionY,
                    z: positionZ
                };

                // 通过position获取菜单名字
                var navName = {
                    XName: 0,
                    YName: 0
                };
                if (positionX >= 0) {
                    navName.XName = worksCategory[positionX].name;
                    if (positionY >= 0) {
                        navName.YName = worksCategory[positionX].childlist[positionY].name;
                    }
                }
                // 通过classifyId获取菜单位置
                // var letterStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                // if(classifyId != null){
                //
                // }

                // 生成三级菜单
                viewModel.thirdList = [];
                if (positionX >= 0 && positionY >= 0) {
                    var thirdList = worksCategory[positionX].childlist[positionY].childlist; // 三级菜单列表
                    if (thirdList.length > 0) {
                        for (var i = 0; i < thirdList.length; i++) {
                            var obj = { val: thirdList[i].name, code: thirdList[i].code };
                            viewModel.thirdList.push(obj);
                        }
                        // 添加数组项 主题 全部
                        viewModel.thirdList.unshift({ val: '全部', code: thirdList[0].code.substring(0, 3) });
                        viewModel.thirdList.unshift({ val: '主题', code: thirdList[0].code.substring(0, 3) });
                    }
                }

                // mediatype对象数组
                viewModel.mediatypeList = [{ val: '类型', code: -1 }, { val: '全部', code: -1 }, {
                    val: '图文',
                    code: 1
                }, { val: '音频', code: 2 }, { val: '视频', code: 3 }, { val: '图集', code: 4 }];

                viewModel.navName = navName;
                viewModel.data = {
                    works: worksData,
                    worksPageStr: worksPageStr,
                    microBooks: results[1],
                    organizationList: results[2],
                    classifyId: classifyId,
                    mediatype: parseInt(mediatype),
                    sort: sort
                };
                // console.log(viewModel.data)
                var pageTitle = '';
                switch (parseInt(mediatype)) {
                    case 1:
                        pageTitle = '图文作品_看典';
                        break;
                    case 2:
                        pageTitle = '音频作品_看典';
                        break;
                    case 3:
                        pageTitle = '视频作品_看典';
                        break;
                    case 4:
                        pageTitle = '图集作品_看典';
                        break;
                    default:
                        pageTitle = '全部作品';
                }
                // console.log(viewModel.data.microBooks)
                res.render('worksView', {
                    title: pageTitle,
                    viewModel: viewModel,
                    serverAddr: webConfig.serverAddr
                });
            });
        })
    },
    kdh: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var pageNum = req.query.pageNum || 1;
            var sort = req.query.sort || 'UpdateTime';
            var formData = {
                username: viewModel.user.name,
                appid: 'web',
                code: 'GetOrgList',
                offset: (pageNum - 1) * 16,
                limit: 16,
                sort: sort,
                order: 'DESC'
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var orgInfo = JSON.parse(body);
                        console.log(orgInfo.data.rows);
                        var kdhPageStr = pagerHelper(orgInfo.data.total, 16, 5, pageNum, '/kdh', { sort: sort });
                        viewModel.data = {
                            org: orgInfo,
                            pageNum: pageNum,
                            kdhPageStr: kdhPageStr,
                            sort: sort
                        };

                        res.render('kdhView', {
                            title: '看典号',
                            viewModel: viewModel,
                            imgServerAddr: webConfig.imgServerAddr
                        });
                    } else {
                        throw err;
                    }
                });
        })
    }
};