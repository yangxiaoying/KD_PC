var express = require('express');
var router = express.Router();
var pcController = require('../controllers/pcController');

// 我的已购
router.get('/purchased', pcController.purchased);
// 我的收藏
router.get('/collected', pcController.collected);
router.get('/collectedDetail', pcController.collectedDetail);
// 我的关注
router.get('/follow', pcController.follow);

module.exports = router;