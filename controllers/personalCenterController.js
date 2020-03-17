var cookieFilter = require('../filters/cookieFilter');
var loginFilter = require('../filters/loginFilter');
var authorization = require('../config/authorization');
var appId = authorization.appId;
var secret = authorization.secret;
var jsEncryptHelper = require('../helpers/jsEncryptHelper');
var pagerHelper = require('../helpers/pagerHelper');
var worksCategory = require('../data/category');
var async = require('async');
var request = require('request');
var webConfig = require('../config/web.config');
var accountUrl = webConfig.accountAddr;
var url = webConfig.serverAddr;
module.exports={
             //个人中心首页
           home:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                    loginFilter(req, res, viewModel, function () {
                   var mediatype = req.body.mediatype || -1;
                   async.parallel([
                       //可能感兴趣的
                       function (cb) {
                             var pageIndex = req.query.pageNum || 1;
                             var pageSize = req.query.pageSize || 10;
                             var isAsync = req.query.isAsync || 0; 
                             var formData = {
                                pagesize:pageSize,
                                pageindex:pageIndex,
                                order:'desc',
                                appid:'web',
                                code: 'GetSysRecommendForPCPersonalCenter',
                                sort:'updatetime'
                            };
                            request.post(
                            {
                                url: url,
                                form: formData
                            },
                            function (err, response, body) {
                                if (!err && response.statusCode == 200) {
                                var resData=JSON.parse(body)
                                var recommendPersonalList = JSON.parse(body).data;
                                    if (resData.code == 0) {
                                        if (isAsync == 0) {
                                            cb(null,recommendPersonalList);
                                        }
                                        else {
                                            res.json(resData);
                                        }
                                    }
                                    else {
                                    console.log('请检查个人中心接口！')}
                                
                                } else {
                                throw err;
                                }
                            });     
                        },
                       //我关注的看点号
                       function(cb){
                        var formData ={
                            username:viewModel.user.name,
                            appid:'web',
                            code:'GetConcernList'
                        };
                        request.post(
                        {
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                          if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }  
                        })
                       },
                       //我收藏的作品
                       function(cb){
                         var formData ={
                            username:viewModel.user.name,
                            appid:'web',
                            code:'GetMyCollect',
                            type:0,
                            mediatype:mediatype,
                            //groupid:groupid,
                            offset:0,
                            limit:3
                        };
                        request.post(
                        {
                            url: url,
                            form: formData
                        },
                        function (err, response, body) {
                          if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }  
                        })
                       }
                   ],function (err, results) {
                    if (err) {
                        throw err;
                    }
                    viewModel.data ={
                      recommendPersonalList:results[0], 
                      concernList:JSON.parse(results[1]).data.concernlist,
                      myCollectList:JSON.parse(results[2]).data.list
                    };
                    console.log(viewModel.data.myCollectList)
                    res.render('personalCenter/homeView', {title: '个人中心首页', viewModel: viewModel});
                   })
                
                })
              })
            },           
            //我的已购
            purchased:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                var pageNum = req.query.pageNum || 1;   
                var formData = {
                username:viewModel.user.name,
                type:'',
                platform:'KDPC',
                rows:10,
                colmunname:'',
                order:'',
                appid:'web',
                code:'GetPurchasedProducts'
                };
                res.render('personalCenter/purchasedView', {title: '我的已购', viewModel: viewModel});
                })
            },
            //查看全年期刊
            allyearPeriod:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/allyearPeriodView', {title: '查看全年', viewModel: viewModel});
                })
            },
            //我的收藏
            collected:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/collectedView', {title: '我的收藏', viewModel: viewModel});
                })
            },
            //收藏夹详情
            collectedDetail:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/collectedDetailView', {title: '我的收藏', viewModel: viewModel});
                })
            },
            //我的关注
            follow:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/followView', {title: '我关注的看点号', viewModel: viewModel});
                })
            },
            //历史记录
            history:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/historyView', {title: '浏览历史', viewModel: viewModel});
                })
            },
            //账号关联
            connect:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/connectView', {title: '机构关联', viewModel: viewModel});
                })
            },
            //消息中心
            message:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/messageView', {title: '消息中心', viewModel: viewModel});
                })
            },
            //删除信息模态框
            delWarn:function (req, res, next) {   
                res.render('personalCenter/delWarnView', {title: '删除提示'});
               
            },
            //移至收藏夹
            transfer:function (req, res, next) {   
                res.render('personalCenter/transferView', {title: '转移至收藏夹'});                   
            },
            //取消关注
            cancelFollow:function (req, res, next) {   
                res.render('personalCenter/cancelFollowView', {title: '取消关注'});
            },
            //我的账户
            myAccount:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                    loginFilter(req, res, viewModel, function () {
                   let signature = jsEncryptHelper.encrypt(req.session.uid);
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
                  },function(err, response, body){
                      if (!err && response.statusCode == 200) {
                          let resData = body;
                          viewModel.data = resData.rows;
                          res.render('personalCenter/myAccountView', {title: '我的账户', viewModel: viewModel});                          
                      }else {
                        throw err;
                      }
                     });
                })
               })
            },
            //我的账单
            myBills:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) { 
                    loginFilter(req, res, viewModel, function () {
                         var spIds= req.query.spIds || '';
                         var userName =viewModel.user.name;
                         var url='http://kandian.cnki.net/recharge/online/recharge/history.action?userName='+userName;
                         var formData ={
                             username:viewModel.user.name,
                             spIds:''
                         };
                         request.post(
                            {
                            url: url,
                            form:formData
                            },
                        function (err, response, body) {
                          if (!err && response.statusCode == 200) {
                                let resData =JSON.parse(body);                                
                                 viewModel.data={
                                     rechargeRecordList:resData.Log
                                 }
                            res.render('personalCenter/myBillsView', {title: '我的账单', viewModel: viewModel});
                            } else {
                                throw err;
                            }  
                        }) 
                   })
               })
            },
            //我的账单消费记录
            myBillsConsumeRecord:function(req, res, next){
                cookieFilter(req, res, function (viewModel) {
                     loginFilter(req, res, viewModel, function () {
                    let signature = jsEncryptHelper.encrypt(req.session.uid);
                    let pageIndex = req.query.pageNum || 1;
                    let pageSize = req.query.pageSize || 15;
                    let username =viewModel.user.name;
                    let titKeyword = req.query.titKeyword ||'' 
                    request({
                        url: 'http://kandian.cnki.net/pay/cnki/order/record.do',
                        method: 'post',
                        headers: {
                        "content-type": "application/json"
                        },
                        json: true,
                        body: {
                            "username":username,
                            "signature": signature,
                            "type":"KD_CONSUME",
                            "pageindex":pageIndex,
                            "pagesize":pageSize
                        }
                        },function (err, response, body) {
                          if (!err && response.statusCode == 200) { 
                                 res.json({reslist: body });     
                            } else {
                                throw err;
                            }  
                        }) 
                })
               })
            },
            //发票索取
           invoice:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/invoiceView', {title: '发票索取', viewModel: viewModel});
                })
            },
           //填写发票信息
           invoiceInfo:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/invoiceInfoView', {title: '发票信息', viewModel: viewModel});
                })
            },
            //发票详情
            invoiceDetail:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/invoiceDetailView', {title: '发票详情', viewModel: viewModel});
                })
            },
            //个人资料
            personalInfo:function (req, res, next) {
               cookieFilter(req, res, function (viewModel) {
                 loginFilter(req, res, viewModel, function () {    
                viewModel.category=worksCategory;
                async.parallel([
                    function(cb){
                       var formData={
                         appid:'web',
                         code:'GetPCUserInfo',
                         //username:viewModel.user.name
                         username:"wsk10073"
                       };
                       request.post({
                            url: 'http://192.168.107.112:8098/resource/api/command',
                            form: formData
                        },function(err,response,body){
                           if (!err && response.statusCode == 200) {
                                cb(null, body);
                            } else {
                                throw err;
                            }  
                        }) 
                    }
                    
                ],function (err, results) {
                    if (err) {
                        throw err;
                    }
                 
                    viewModel.data ={
                      userInfoList:JSON.parse(results[0]).data
                    };
                    res.render('personalCenter/personalInfoView', {title: '个人资料', viewModel: viewModel});
                })
                
                })
              })
            },
            //修改个人资料
            updatePersonalInfo:function(req,res,next){
                cookieFilter(req, res, function (viewModel){
                    loginFilter(req, res, viewModel, function () { 
                        let username=req.query.username;
                        let avatar=req.query.avatar||'';
                        let nickname=req.query.nickname;
                        let gender =req.query.gender;
                        let age =req.query.age;
                        let mylocation=req.query.mylocation;
                        let cateids=req.query.cateids;
                        let formData={
                            appid:'web',
                            code:'UpdatePCUserInfo',
                            username:username,
                            avatar:avatar,
                            nickname:nickname,
                            gender:gender,
                            age:age,
                            location:mylocation,
                            cateids:cateids
                        };
                        request.post({
                            url:'http://192.168.107.112:8098/resource/api/command',
                            form:formData
                        },function(err,response,body){
                            if (!err && response.statusCode == 200) {                          console.log(body)
                                res.send(JSON.parse(body))
                                } else {
                                    throw err;
                                } 
                        })
                    })
                })
            },
            //更新密码
            updatePassword:function(req,res,next){
                cookieFilter(req, res, function (viewModel) {
                    let password = req.query.password;
                    let newPassword=req.query.newPassword;
                    request({
                         url:accountUrl+'/resetpwd',
                         headers:{
                             'Cookies': 'SID=110014',
                             'Content-Type': 'application/json',
                         },
                         json: true,
                         method: 'post',
                         body: {
                            "username": viewModel.user.name,
                            "password": password,
                            "newPassword":newPassword
                        }
                        },function(err,response,body){
                           if (!err && response.statusCode == 200) {
                                console.log(body);
                                res.json(body);
                                } else {
                                    throw err;
                                } 
                    })
                })
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
                            if (body.Success == true) {
                                console.log(body)
                                res.json({
                                    errorCode: 1,
                                    errorMessage: '发送成功',
                                    body:body
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
            //提交修改绑定手机号
            updatePhone:function(req,res,next){
                 cookieFilter(req, res, function (viewModel) {
                     let phonenumber=req.query.phonenumber;
                     let formData={
                        appid:'web',
                        code:'UpdatePCUserInfo',
                        username:'wsk10073',
                        phonenumber:phonenumber
                     }
                     request.post({
                         url:'http://192.168.107.112:8098/resource/api/command',
                         form:formData
                     },function(err,response,body){
                           if (!err && response.statusCode == 200) {                          
                                res.send(JSON.parse(body));
                                } else {
                                    throw err;
                                } 
                    })
                 })
            },
            //判断是否是会员
            isMember:function(req,res,next){
                cookieFilter(req, res, function (viewModel){
                     let username =viewModel.user.name;
                     let signature = jsEncryptHelper.encrypt(req.session.uid);
                     request({
                    url: 'http://kandian.cnki.net/pay/cnki/vip/is.do',
                    method: 'post',
                    headers: {
                        "content-type": "application/json"
                    },
                    json: true,
                    body: {
                        "username":username,
                        "signature": signature
                    }
                  },function(err, response, body){
                      if (!err && response.statusCode == 200) {
                          let resData = body;
                          res.send(resData);                          
                      }else {
                        throw err;
                      }
                     });                
                })
            },
            
            //会员首页
            membersHome:function(req,res,next){
               cookieFilter(req, res, function (viewModel) {
                res.render('personalCenter/membersHomeView', {title: '会员首页', viewModel: viewModel});
                }) 
            },
            //会员个人中心
            membersCenter:function(req,res,next){
               cookieFilter(req, res, function (viewModel) {
                  loginFilter(req, res, viewModel, function () {             
                            let signature = jsEncryptHelper.encrypt(req.session.uid);
                            let pageIndex = req.query.pageIndex || 1;
                            let pageSize = req.query.pageSize || 20;
                            let username =viewModel.user.name;
                            //let username ='summer10123';
                            request({
                        url: 'http://kandian.cnki.net/pay/cnki/order/record.do',
                        method: 'post',
                        headers: {
                        "content-type": "application/json"
                        },
                        json: true,
                        body: {
                            "username":username,
                            "signature": signature,
                            "type":"KD_VIP",
                            "pageindex":pageIndex,
                            "pagesize":pageSize
                        }
                        },function (err, response, body) {
                          if (!err && response.statusCode == 200) { 
                                viewModel.data={
                                    vipList:body
                                };
                                viewModel.pageStr = pagerHelper(viewModel.data.vipList.total, 20, 5, pageIndex);
                                //目前无total值
                                console.log(body,viewModel.pageStr)
                  res.render('personalCenter/membersCenterView', {title: '会员中心', viewModel: viewModel});
                    
                            } else {
                                throw err;
                            }  
                        }) 
                        
                }) 
             })
            },
            //会员详情
            vipDetail:function(req,res,next){
                 cookieFilter(req, res, function (viewModel) {
                    loginFilter(req, res, viewModel, function () {
                        let signature = jsEncryptHelper.encrypt(req.session.uid);
                            let pageIndex = req.query.pageNum || 1;
                            let pageSize = req.query.pageSize || 20;
                            let username =viewModel.user.name;
                            request({
                        url: 'http://kandian.cnki.net/pay/cnki/vip/detail.do',
                        method: 'post',
                        headers: {
                        "content-type": "application/json"
                        },
                        json: true,
                        body: {
                            "username":username,
                            "signature": signature,
                        }
                        },function (err, response, body) {
                          if (!err && response.statusCode == 200) { 
                                let  resData=body
                                res.send(resData)
                            } else {
                                throw err;
                            }  
                        })
                        
                    })
                 })
            }
}
