var express = require('express');
var router = express.Router();
var paymentController = require('../controllers/paymentController');
/*payPages*/
router.get('/checkout', paymentController.checkout);
router.get('/membersCheckout', paymentController.membersCheckout);
router.get('/paySuccess', paymentController.paySuccess);
router.get('/confirmPay', paymentController.confirmPay);
router.get('/success', paymentController.success);
module.exports = router;