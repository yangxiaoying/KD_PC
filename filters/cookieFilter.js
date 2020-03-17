const cookieConfig = require('../config/cookie.config');
const crypto = require('../utility/cryptoFunctions');
const async = require('async');
const authorization = require('../config/authorization');
const appId = authorization.appId;
const secret = authorization.secret;
const request = require('request');
const uuid = require('node-uuid');
const webConfig = require('../config/web.config');
const accountUrl = webConfig.accountAddr;

// 未登录用户，跳转到登录界面

module.exports = function (req, res, callback) {
    // console.log('req.session.id:', req.session.id);
    // console.log('req.session.username:', req.session.username);
    // console.log('kdpcUsername:', req.cookies[cookieConfig.cookieAutoLoginInUsername]);
    // console.log('connect.sid:', req.cookies['connect.sid']);
    // console.log('password:', req.cookies[cookieConfig.cookieAutoLoginInPswName]);

    const sessionId = req.session.id;
    const cookieId = req.cookies['connect.sid'];
    const kdpcUsername = req.cookies[cookieConfig.cookieAutoLoginInUsername];
    const encryptoPsw = req.cookies[cookieConfig.cookieAutoLoginInPswName];
    let viewModel = {
        user: {
            name: null
        }
    };
    // console.log('viewModel.user.name:', viewModel.user.name);
    // 登录状态
    if (typeof sessionId != 'undefined' && typeof req.session.username != 'undefined' && typeof cookieId != 'undefined' && cookieId.indexOf(sessionId) != -1) {
        viewModel.user.name = req.session.username;
        // console.log('当前为登录状态，viewModel.user.name:', viewModel.user.name);
        callback(viewModel);
    } else
    // 用户记住密码 30天有效
    if (kdpcUsername && encryptoPsw) {
        let password = crypto.aesDecrypt(encryptoPsw, Buffer.from(cookieConfig.secret.encryptSecret));
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
                            console.log('自动登录获取授权失败！');
                            cb(null, null);
                        }
                    });
            },
            // 登录验证
            function (arg, cb) {
                if (arg && arg.indexOf('bearer') != -1) {
                    let newArg = JSON.parse(arg);
                    request(
                        {
                            url: accountUrl + '/pclogin?username=' + kdpcUsername + '&password=' + password,
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
                                console.log('登录验证失败，删除cookie,重新登录！');
                                res.clearCookie(cookieConfig.cookieAutoLoginInPswName, {maxAge: 0});
                                res.clearCookie(cookieConfig.cookieAutoLoginInUsername, {maxAge: 0});
                                res.clearCookie('connect.sid', {maxAge: 0});
                                res.redirect('back');
                                // throw err;
                            }
                        });
                } else {
                    cb(null, null);
                }
            },
        ], function (err, results) {
            // console.log('results:', results)
            if (err) {
                throw err;
            }
            if (results && results.errorcode == 1) {
                // 设置cookie
                req.session.username = kdpcUsername;
                req.session.uid = results.uid;
                req.session.openId = results.openid;
                viewModel.user.name = kdpcUsername;
                // callback(viewModel);
            } else {
                console.log('账户自动登录失败！');
            }
            callback(viewModel);
        });
    } else {
        callback(viewModel);
    }

};

