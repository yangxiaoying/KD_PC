var cookieFilter = require('../filters/cookieFilter');
var async = require('async');
var request = require('request');
var webConfig = require('../config/web.config');
var pagerHelper = require('../helpers/pagerHelper');
var jsEncryptHelper = require('../helpers/jsEncryptHelper');
var url = webConfig.serverAddr;
module.exports = {
    // 包括图文、音视频、图集
    workDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            let workId = req.query.id;
            let mediatype = req.query.mediatype;
            let isPurchased = 0; // 购买作品 0未购买 1已购买
            // let originalUrl = req._parsedOriginalUrl.path;
            // console.log('originalUrl:', originalUrl);

            // 用户未登录
            if (viewModel.user.name == null) {
                let formData = {
                    appid: 'web',
                    code: 'GetOrgCollectionByIdFromPC',
                    id: workId,
                    mediatype: mediatype,
                    username: viewModel.user.name
                };
                request.post({
                        url: url,
                        form: formData
                    },
                    function(err, response, body) {
                        if (!err && response.statusCode == 200) {
                            var data = JSON.parse(body);
                            // console.log(data)
                            if (data.code == 0) {
                                viewModel.data = data.data;
                                viewModel.workId = workId;
                                viewModel.platformcatename = JSON.parse(data.data.collection.platformcatename);
                                viewModel.mediatype = mediatype;
                                viewModel.isPurchased = isPurchased;
                                // viewModel.originalUrl = originalUrl;
                                // console.log('viewModel.data:', viewModel.data);
                                if (mediatype == 1) {
                                    res.render('detail/graphicDetailView', {
                                        title: data.data.collection.title + '_看典',
                                        viewModel: viewModel,
                                        addr: webConfig
                                    });
                                } else if (mediatype == 2 || mediatype == 3) {
                                    res.render('detail/multimediaDetailView', {
                                        title: data.data.collection.title + '_看典',
                                        viewModel: viewModel,
                                        addr: webConfig
                                    });
                                } else if (mediatype == 4) {
                                    res.render('detail/imgCollectionDetailView', {
                                        title: data.data.collection.title + '_看典',
                                        viewModel: viewModel,
                                        addr: webConfig
                                    });
                                } else {
                                    res.json('作品类型错误!');
                                }
                            } else {
                                res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                            }
                        } else {
                            throw err;
                        }
                    });
            }
            // 用户已登录，需要查询是否购买当前作品
            else {
                async.parallel([
                    // 获取作品数据
                    function(cb) {
                        var formData = {
                            appid: 'web',
                            code: 'GetOrgCollectionByIdFromPC',
                            id: workId,
                            mediatype: mediatype,
                            username: viewModel.user.name
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function(err, response, body) {
                                // console.log(JSON.parse(body))
                                if (!err && response.statusCode == 200) {
                                    let resData = JSON.parse(body);
                                    if (resData.code != -1) {
                                        cb(null, resData);
                                    } else {
                                        throw new Error('作品不存在！');
                                    }

                                } else {
                                    throw err;
                                }
                            });
                    },
                    // 查询是否购买相关作品
                    function(cb) {
                        var formData = {
                            username: viewModel.user.name,
                            type: 17,
                            appid: 'web',
                            code: 'HasProductPurchased',
                            productcode: workId
                        };
                        request.post({
                                url: url,
                                form: formData
                            },
                            function(err, response, body) {
                                if (!err && response.statusCode == 200) {
                                    console.log('查询是否购买', JSON.parse(body));
                                    cb(null, JSON.parse(body));
                                } else {
                                    throw err;
                                }
                            });
                    },
                ], function(err, results) {
                    if (err) {
                        throw err;
                    }
                    viewModel.data = results[0].data;
                    if (results[1].code == 1) {
                        if (results[1].rows == 'true') {
                            isPurchased = 1;
                        } else {
                            isPurchased = 0;
                        }
                    } else {
                        console.log('查询是否购买失败！');
                    }

                    viewModel.isPurchased = isPurchased;
                    viewModel.workId = workId;
                    // console.log('results[0].data:', results[0])
                    viewModel.platformcatename = JSON.parse(results[0].data.collection.platformcatename);
                    viewModel.mediatype = mediatype;
                    if (mediatype == 1) {
                        res.render('detail/graphicDetailView', {
                            title: results[0].data.collection.title + '_看典',
                            viewModel: viewModel,
                            addr: webConfig
                        });
                    } else if (mediatype == 2 || mediatype == 3) {
                        console.log('viewModel', viewModel)
                        res.render('detail/multimediaDetailView', {
                            title: results[0].data.collection.title + '_看典',
                            viewModel: viewModel,
                            addr: webConfig
                        });
                    } else if (mediatype == 4) {
                        res.render('detail/imgCollectionDetailView', {
                            title: results[0].data.collection.title + '_看典',
                            viewModel: viewModel,
                            addr: webConfig
                        });
                    } else {
                        res.json('作品类型错误!');
                    }
                });
            }
        })
    },

    // 微刊
    microBookDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var microBookId = req.query.id;
            var pageNum = req.query.pageNum || 1;
            async.parallel([
                // 微刊详情
                function(cb) {
                    var formData = {
                        code: 'GetMircBookDetailByMicBookId',
                        appid: 'web',
                        username: viewModel.user.name,
                        id: microBookId
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
                // 微刊目录
                function(cb) {
                    var formData = {
                        appid: 'web',
                        code: 'GetMircBookCollectionListByMicBookId',
                        id: microBookId,
                        offset: (pageNum - 1) * 8,
                        limit: 8,
                        sort: 'SubmitTime' // 默认排序 SortNum ，最新排序SubmitTime
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
                }
            ], function(err, results) {
                if (err) {
                    throw err;
                }
                var microBookCatalogData = JSON.parse(results[1]).data;
                var microBookCatalogPageStr = pagerHelper(microBookCatalogData.total, 8, 5, pageNum, '/detail/microBookDetail', { id: microBookId });
                viewModel.data = {
                    microBookDetail: JSON.parse(results[0]).data.mircbook,
                    microBookCatalog: JSON.parse(results[1]).data.rows,
                    microBookCatalogPageStr: microBookCatalogPageStr,
                    microBookId: microBookId
                };
                // console.log(viewModel.data)
                res.render('detail/microBookDetailView', { title: '微刊', viewModel: viewModel, addr: webConfig });
            });
        })
    },

    // 根据机构id获取看典号信息
    getOrgIdById: function(req, res, next) {
        var orgId = req.params.id;
        var formData = {
            appid: 'web',
            code: 'GetOrgBaseInfo',
            orgid: orgId
        };
        request.post({
                url: url,
                form: formData
            },
            function(err, response, body) {

                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    if (resData.code == 0) {
                        res.json(resData.data.org);
                    } else {
                        console.log('请检查看典号接口或检查请求参数！')
                    }
                } else {
                    throw err;
                }
            });
    },

    // 获取微刊详情页推荐作品
    getMicroBookRecommendWorks: function(req, res, next) {
        var microBookId = req.params.id;
        var formData = {
            appid: 'web',
            code: 'GetRecommendCollectionForDetailTinyJournal',
            id: microBookId,
            limit: 5,
        };
        request.post({
                url: url,
                form: formData
            },
            function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    if (resData.code == 0) {
                        res.json(resData.data);
                    } else {
                        console.log('请检查微刊目录接口或检查请求参数！')
                    }
                } else {
                    throw err;
                }
            });
    },

    // 获取微刊详情页推荐微刊
    getMicroBookRecommendMicroBooks: function(req, res, next) {
        var microBookId = req.params.id;
        var formData = {
            appid: 'web',
            code: 'GetRecommendMircBookByMicBookId',
            id: microBookId
        };
        request.post({
                url: url,
                form: formData
            },
            function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    var resData = JSON.parse(body);
                    if (resData.code == 0) {
                        res.json(resData.data);
                    } else {
                        console.log('请检查微刊目录接口或检查请求参数！')
                    }
                } else {
                    throw err;
                }
            });
    },

    // 获取音视频推荐列表
    getMultimediaRecommendList: function(req, res, next) {
        var workId = req.body.id;
        var formData = {
            appid: 'web',
            code: 'GetRecommendCollectionForDetailCollection',
            id: workId,
            limit: 10
        };
        request.post({
                url: url,
                form: formData
            },
            function(err, response, body) {
                if (!err && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    // console.log(data.data.list)
                    if (data.code == 0) {
                        res.json(data);
                    } else {
                        res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                    }
                } else {
                    throw err;
                }
            });
    },

    // 图集预览
    imgPreview: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var imgId = req.query.id;
            var isAsync = req.query.isAsync || 0;
            var formData = {
                appid: 'web',
                code: 'GetOrgCollectionPicList',
                collectionid: imgId,
                order: 0 // 0升序；1降序
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var data = JSON.parse(body);
                        // console.log(data.data)
                        if (data.code == 0) {
                            viewModel.data = data.data;
                            if (isAsync == 0) {
                                res.render('detail/imgPreviewView', {
                                    title: '图集预览',
                                    viewModel: viewModel,
                                    addr: webConfig
                                });
                            } else {
                                res.json(data);
                            }
                        } else {
                            res.json('无数据返回！请查看请求参数是否正确或检查是否有数据！');
                        }
                    } else {
                        throw err;
                    }
                });
        })
    },

    // 图书详情
    showBookDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('detail/bookDetailView', { title: '图书详情', viewModel });
        })
    },
    // 期刊详情
    showPeriodDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('detail/periodDetailView', { title: '期刊详情', viewModel });
        })
    },
    // 单本期刊详情
    showSinglePeriodDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            res.render('detail/singlePeriodDetailView', { title: '期刊详情', viewModel });
        })
    },
    //获取图书详情数据
    getBookDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var id = req.params.id;
            var ismember = req.query.ismember || 0;
            var formData = {
                appid: 'android',
                code: 'getBookDetail',
                username: viewModel.user.name,
                id: id,
                ismember: ismember,
                recommendbooklimit: 7,
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
                            res.json('请检查PC图书详情页！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    //获取图书人气榜
    getBookHotBank: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var formData = {
                appid: 'web',
                code: 'GetBookList',
                IsAPPSale: 0,
                offset: 0,
                limit: 6,
                sort: 'viewcount',
                order: 'desc'
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
                            res.json('请检查PC图书人气榜！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    //作品评论分页
    getCommentList: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var id = req.params.id;
            var pageNum = req.query.pageNum || 1;
            var limit = req.query.limit || 3;
            var offset = (pageNum - 1) * limit;
            var sort = req.query.sort || 'id'; //AgreeCount 最热 ID 最新

            var formData = {
                appid: 'web',
                code: 'GetCommentList',
                currentuser: viewModel.user.name,
                offset,
                limit,
                sort,
                id,
                typeid: 2
            };
            request.post({
                    url: url,
                    form: formData
                },
                function(err, response, body) {
                    if (!err && response.statusCode == 200) {
                        var resData = JSON.parse(body);
                        // console.log(resData);
                        if (resData.code == 0) {
                            res.json(resData);
                        } else {
                            res.json('请检查获取作品评论分页列表！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    //获取单期期刊详情
    getSinglePeriodDetail: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var id = req.params.id;
            var formData = {
                appid: 'web',
                code: 'GetMagazineDetail',
                username: viewModel.user.name,
                thname: id
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
                            res.json('请检查获取期刊详细信息！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    //获取整本期刊所有年份
    getPeriodYear: function(req, res, next) {
        var id = req.params.id;
        var formData = {
            appid: 'web',
            code: 'getMagaYearListByCode',
            magacode: id
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
                        res.json('请检查获取期刊详细信息！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    //按年份获取期刊列表
    getPeriodListByYear: function(req, res, next) {
        var magacode = req.params.id;
        var year = req.query.year;
        var pageNum = req.query.pageNum || 1;
        var limit = parseInt(req.query.limit) || 100;
        var offset = (pageNum - 1) * limit;
        var formData = {
            appid: 'web',
            code: 'getMagaYearPeriodList',
            magacode,
            year,
            offset,
            limit
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
                        res.json('请检查按年份获取期刊列表！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    //获取期刊目录
    getPeriodCatalog: function(req, res, next) {
        var thname = req.params.id;
        var formData = {
            appid: 'web',
            code: 'GetMagaCatelog',
            dbcode: 'CJFUTOTAL,CJFVTOTAL,CJFTTOTAL',
            thname: thname,
            orderby: 0
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
                        res.json('请检查获取期刊目录！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    // 文献搜索结果
    getLiteratureResult: function(req, res, next) {
        cookieFilter(req, res, function(viewModel) {
            var album = req.query.album || 'D';
            var order = req.query.order || 0; // 0:相关度，1:下载频次，2：被引频次，3：发表时间
            var pageIndex = req.query.pageNum || 1;
            var pageSize = req.query.pageSize || 20;
            var fulltext = req.query.fulltext || null;
            var topic = req.query.topic || null;
            var title = req.query.title || null;
            var keyword = req.query.keyword || null;
            var author = req.query.author || null;
            var workUnit = req.query.workuunit || null;
            var source = req.query.source || null;
            var fund = req.query.fund || null;
            var thname = req.query.thname;

            var formData = {
                appid: 'web',
                code: 'getKBaseArticlesByAlbum',
                album: album,
                order: order,
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
                thname: thname
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
                            res.json('请检查文献结果页接口或查看请求参数是否正确！');
                        }
                    } else {
                        throw err('无数据');
                    }
                });
        })
    },
    //获取期刊全部栏目层次
    getPeriodColumn: function(req, res, next) {
        var thname = req.params.id;
        var pageIndex = req.query.pageNum || 1;
        var pageSize = req.query.pageSize || 10;
        var formData = {
            appid: 'web',
            code: 'GetLevelList',
            thname,
            pageIndex,
            pageSize
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
                        res.json('请检查获取期刊全部栏目层次！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    //按期刊栏目层次展示文献列表
    getLiteratureByColumn: function(req, res, next) {
        var thname = req.params.id;
        var pageIndex = req.query.pageNum || 1;
        var pageSize = req.query.pageSize || 10;
        var level = req.query.level;
        var formData = {
            appid: 'web',
            code: 'GetKBaseArticlesByLevel',
            thname,
            level,
            pageIndex,
            pageSize,
            order: 5
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
                        res.json('请检查按期刊栏目层次展示文献列表！');
                    }
                } else {
                    throw err('无数据');
                }
            });
    },
    // 是否为会员
    checkVip: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var signature = jsEncryptHelper.encrypt(req.session.uid);
            request({
                    url: webConfig.vipAddr + '/is.do',
                    method: 'post',
                    headers: {
                        "content-type": "application/json"
                    },
                    json: true,
                    body: {
                        "signature": signature,
                        "username": viewModel.user.name,
                    }
                },
                function (err, response, body) {
                    if (!err && response.statusCode == 200) {                                     
                        res.json(body);
                    } else {
                        throw err;
                    }
            });
        })
    },
};