var express = require('express');
var router = express.Router();
var personalCenterController = require('../controllers/personalCenterController');

router.get('/home', personalCenterController.home);
router.get('/purchased', personalCenterController.purchased);
router.get('/allyearPeriod', personalCenterController.allyearPeriod);
router.get('/collected', personalCenterController.collected);
router.get('/collectedDetail', personalCenterController.collectedDetail);
router.get('/follow', personalCenterController.follow);
router.get('/history', personalCenterController.history);
router.get('/connect', personalCenterController.connect);
router.get('/message', personalCenterController.message);
router.get('/transfer', personalCenterController.transfer);
router.get('/delWarn', personalCenterController.delWarn);
router.get('/cancelFollow', personalCenterController.cancelFollow);
router.get('/myAccount', personalCenterController.myAccount);
router.get('/myBills', personalCenterController.myBills);
router.get('/myBills', personalCenterController.myBills);
router.get('/myBillsConsumeRecord', personalCenterController.myBillsConsumeRecord);
router.get('/invoice', personalCenterController.invoice);
router.get('/invoiceInfo', personalCenterController.invoiceInfo);
router.get('/invoiceDetail', personalCenterController.invoiceDetail);
router.get('/invoiceDetail', personalCenterController.invoiceDetail);
router.get('/personalInfo', personalCenterController.personalInfo);
//修改个人资料
router.get('/updatePersonalInfo', personalCenterController.updatePersonalInfo);
//修改密码
router.get('/updatePassword', personalCenterController.updatePassword);
// 验证手机号
router.get('/verifyPhoneNum', personalCenterController.verifyPhoneNum);
// 发送验证码
router.get('/sendCaptcha', personalCenterController.sendCaptcha);
//绑定手机号
router.get('/updatePhone', personalCenterController.updatePhone);
//是否是VIP会员
router.get('/isMember', personalCenterController.isMember);
router.get('/membersHome', personalCenterController.membersHome);
//会员详情
router.get('/vipDetail', personalCenterController.vipDetail);
router.get('/membersCenter', personalCenterController.membersCenter);
module.exports = router;