module.exports = {

    // 测试地址可用账户：liudong，密码：123456
    // 线上地址可用账户：biankeliudong,密码：123456
    /***********************************************数据服务器地址************************************************/

    // serverAddr: "http://192.168.107.112:8098/resource/api/command", // 本地地址
    serverAddr: "http://kandian.cnki.net/resource/api/command", // 线上地址

    /***********************************************账号服务器地址************************************************/

    // accountAddr: 'http://192.168.107.112:9987/resource/api/account',                          // 本地地址
    accountAddr: 'http://kandian.cnki.net/passport/resource/api/account', // 线上地址
    // accountAddr: 'http://192.168.51.95:9987/resource/api/account',                         // 刘东本地调试地址

    /***********************************************支付服务器地址************************************************/

    paymentAddr: 'http://kandian.cnki.net/pay/cnki/pay', // 线上地址
    // paymentAddr: 'http://192.168.51.95:10123/cnki/pay',                        // 刘东本地调试地址

    /***********************************************充值服务器地址************************************************/

    rechargeAddr: 'http://kandian.cnki.net/recharge/general/recharge', // 线上地址

    /***********************************************电商订单状态查询地址************************************************/
    orderCheckAddr: 'http://kandian.cnki.net/recharge/online/recharge/verify.action', // 线上地址
    // orderCheckAddr: 'http://192.168.107.112:10125/online/recharge/verify.action',                       // 本地地址

    /***********************************************会员地址************************************************/

    vipAddr: "http://kandian.cnki.net/pay/cnki/vip", // 线上地址


    /***********************************************图片服务器地址************************************************/

    imgServerAddr: 'http://192.168.107.112:8093', // 看典号页面使用
};