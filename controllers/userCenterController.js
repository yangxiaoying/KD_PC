const cookieFilter = require('../filters/cookieFilter');
const async = require('async');
const request = require('request');
const webConfig = require('../config/web.config');
const authorization = require('../config/authorization');
const url = webConfig.serverAddr;
const accountUrl = webConfig.accountAddr;
const uuid = require('node-uuid');
const md5 = require('md5');
const crypto = require('../utility/cryptoFunctions');
const cookieConfig = require('../config/cookie.config');
const worksCategory = require('../data/category');
const appId = authorization.appId;
const secret = authorization.secret;

module.exports = {
    login: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            res.render('userCenter/loginView', {title: '登录'});
        })
    },
    register: function (req, res, next) {
        cookieFilter(req, res, function (viewModel) {
            var formData = {};
            request.post(
                {
                    url: url,
                    form: formData
                },
                function (err, response, body) {
                    res.render('userCenter/registerView', {title: '注册', viewModel: viewModel});
                });
        })
    },

    // 登录验证
    loginChecking: function (req, res, next) {
        let username = req.query.username;
        let password = req.query.password;
        let rememberPws = req.query.rememberPws;
        let claimedId = uuid.v4();
        async.waterfall([
            // 获取授权
            function (cb) {
                request({
                        url: 'https://xyz.cnki.net/cnkioauth/api/auth/access/token.html?appid=' + appId + '&secret=' + secret + '&claimedid=' + claimedId,
                        method: 'get',
                        headers: {
                            "content-type": "application/json"
                        }
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            cb(null, body);
                        } else {
                            throw err;
                        }
                    });
            },
            // 登录验证
            function (arg, cb) {
                if (arg && arg.indexOf('bearer') != -1) {
                    let newArg = JSON.parse(arg);
                    // console.log(newArg)
                    request(
                        {
                            url: accountUrl + '/pclogin?username=' + username + '&password=' + password,
                            method: 'get',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + newArg['access_token']
                            }
                        },
                        function (err, response, body) {
                            if (!err && response.statusCode == 200) {
                                cb(null, JSON.parse(body));
                            } else {
                                throw new Error('登录失败！');
                            }
                        });
                } else {
                    cb(null, null);
                }
            },
        ], function (err, results) {
            if (err) {
                throw err;
            } else {
                console.log("登录数据：", results)
                if (results && results.errorcode == 1) {
                    // 设置cookiey
                    req.session.username = username;
                    req.session.uid = results.uid;
                    req.session.openId = results.openid;
                    if (rememberPws == 1) {
                        // var pws = md5(password);
                        var psw = crypto.aesEncrypt(password, Buffer.from(cookieConfig.secret.encryptSecret));
                        res.cookie(cookieConfig.cookieAutoLoginInPswName, psw, {
                            httpOnly: true,
                            maxAge: cookieConfig.cookieMaxAge
                        });
                        res.cookie(cookieConfig.cookieAutoLoginInUsername, username, {
                            httpOnly: true,
                            maxAge: cookieConfig.cookieMaxAge
                        });
                    } else {
                        res.clearCookie('pws', {maxAge: 0});
                    }
                    res.json({
                        errorCode: 1,
                        errorMessage: '登录成功！'
                    })
                } else {
                    res.json({
                        errorCode: 0,
                        errorMessage: '登录失败！'
                    })
                }
            }
        });
    },

    // 退出登录
    quit: function (req, res, next) {
        // let quitUrl = accountUrl + '/logout';
        // request({
        //         url: quitUrl,
        //         method: 'post',
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         json: true,
        //         body: {
        //             uid: req.session.uid
        //         }
        //     },
        //     function (err, response, body) {
        //         // console.log(body);
        //         if (!err && response.statusCode == 200) {
        //             if (body.errorcode == 1) {
        //                 req.session.destroy(function (err) {
        //                     if (err) {
        //                         res.json({errorMessage: '退出登录失败!', errorCode: -1});
        //                     } else {
        //                         res.clearCookie('kdpcAutoLoginIn', {maxAge: 0});
        //                         res.clearCookie('connect.sid', {maxAge: 0});
        //                         res.redirect('back');
        //                     }
        //                 });
        //             } else {
        //                 res.json({errorMessage: '退出登录失败!', errorCode: -1});
        //             }
        //         } else {
        //             throw new Error('退出登录失败');
        //         }
        //     });
        req.session.destroy(function (err) {
            if (err) {
                res.json({errorMessage: '退出登录失败!', errorCode: -1});
            } else {
                res.clearCookie(cookieConfig.cookieAutoLoginInPswName, {maxAge: 0});
                res.clearCookie(cookieConfig.cookieAutoLoginInUsername, {maxAge: 0});
                res.clearCookie('connect.sid', {maxAge: 0});
                res.redirect('back');
            }
        });
    },

    // 验证手机号码是否可以注册
    verifyPhoneNum: function (req, res, next) {
        var phoneNum = req.query.phoneNum;
        request({
                url: accountUrl + '/checkeom',
                headers: {
                    'Cookies': 'SID=110014',
                    'Content-Type': 'application/json'
                },
                json: true,
                method: 'post',
                body: {
                    type: 'mobile',
                    key: phoneNum
                }
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    if (body.Code == 1) {
                        res.json(body);
                    }
                } else {
                    console.log('验证手机号码失败！')
                }
            });
    },

    // 验证手机号码是否可以注册
    sendCaptcha: function (req, res, next) {
        var phoneNum = req.query.phoneNum;
        request({
                url: accountUrl + '/send_verify_code',
                headers: {
                    'Cookies': 'SID=110014',
                    'Content-Type': 'application/json'
                },
                json: true,
                method: 'post',
                body: {
                    to: phoneNum,
                    app: 'bear'
                }
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    console.log(body);
                    if (body.Success == true) {
                        res.json({
                            errorCode: 1,
                            errorMessage: '发送成功'
                        });
                    } else {
                        res.json({
                            errorCode: 0,
                            errorMessage: '该手机号获取验证码已达上限，请明天再试。'
                        })
                    }
                } else {
                    console.log('验证码发送失败！')
                }
            });
    },

    // 注册
    signIn: function (req, res, next) {
        let phoneNum = req.query.phoneNum;
        let password = req.query.password;
        let captcha = req.query.captcha;
        let claimedId = uuid.v4();

        async.waterfall([
            // 获取授权
            function (cb) {
                request({
                        url: 'https://xyz.cnki.net/cnkioauth/api/auth/access/token.html?appid=' + appId + '&secret=' + secret + '&claimedid=' + claimedId,
                        method: 'get',
                        headers: {
                            "content-type": "application/json"
                        }
                    },
                    function (err, response, body) {
                        if (!err && response.statusCode == 200) {
                            cb(null, body);
                        } else {
                            throw err;
                        }
                    });
            },
            // 注册登录
            function (arg, cb) {
                if (arg && arg.indexOf('bearer') != -1) {
                    var arg = JSON.parse(arg);
                    console.log(phoneNum, password, phoneNum, captcha)
                    request({
                            url: accountUrl + '/register',
                            headers: {
                                'Cookies': 'SID=110014',
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + arg['access_token']
                            },
                            json: true,
                            method: 'post',
                            body: {
                                "username": phoneNum,
                                "password": password,
                                "regtype": "mobile",
                                "tele": phoneNum,
                                "captcha": captcha,
                                "platform": "kdpc"
                            }
                        },
                        function (err, response, body) {
                            console.log('response.statusCode:', response.statusCode)
                            console.log('body:', body)
                            if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                cb(null, null);
                            }
                        });
                } else {
                    cb(null, null);
                }
            },
        ], function (err, results) {
            if (err) {
                throw err;
            } else {
                // console.log(results)
                if (results && results.errorcode == 1) {
                    // 设置cookie
                    req.session.username = results.username;
                    req.session.uid = results.uid;

                    // 返回兴趣分类
                    let interest = [];
                    worksCategory.forEach(item => {
                        let obj = {
                            "code": item.code,
                            "id": item.id,
                            "name": item.name,
                            "selected": 0
                        };
                        interest.push(obj);
                    });
                    res.json({
                        errorCode: 1,
                        errorMessage: '注册成功！',
                        interest: interest
                    })
                } else {
                    res.json(results)
                }
            }
        });


    },

    // 修改用户信息
    updateUserInfo: function (req, res, next) {
        let username = req.query.username || null;
        let avatar = req.query.avatar || null;
        let nickname = req.query.nickname || null;
        let gender = req.query.gender || null;
        let age = req.query.age || null;
        let location = req.query.location || null;

        let formData = {
            appid: 'web',
            code: 'UpdateUserInfo',
            username: username,
            avatar: avatar,
            nickname: nickname,
            gender: gender,
            age: age,
            location: location
        };
        // console.log(formData, url)

        request.post(
            {
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    // console.log(body);
                    res.json(body);
                } else {
                    throw new Error('UpdateUserInfo错误！');
                }
            });


    },

    // 添加用户兴趣分类
    addUserCategory: function (req, res, next) {
        let username = req.query.username || null;
        let cateids = req.query.cateids || null;

        let formData = {
            appid: 'web',
            code: 'AddUserCategory',
            cateids: cateids,
            username: username,
            typeid: 0
        };
        // console.log(formData, url)

        request.post(
            {
                url: url,
                form: formData
            },
            function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    // console.log(body);
                    res.json(body);
                } else {
                    throw new Error('添加用户兴趣分类错误！');
                }
            });


    }
}
