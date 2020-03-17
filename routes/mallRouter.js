var express = require('express');
var router = express.Router();
var mallController = require('../controllers/mallController');

router.get('/home', mallController.showHome);
router.get('/booklist', mallController.showBooklist);
router.get('/booklistDetail', mallController.showBooklistDetail);
router.get('/rank', mallController.showRank);
router.get('/free', mallController.showFree);
router.get('/getMallHomepage', mallController.getMallHomepage);
router.get('/getMallBooklist', mallController.getMallBooklist);
router.get('/getBooklistCateGory', mallController.getBooklistCateGory);
router.get('/getBooklistDetail', mallController.getBooklistDetail);
router.get('/getRankList', mallController.getRankList);

module.exports = router;