var express = require('express');
var router = express.Router();
var commonController = require('../controllers/commonController');



router.get('/addCollect/:id', commonController.addCollect);
router.get('/cancelCollect/:id', commonController.cancelCollect);
router.get('/commentSubmit/:id', commonController.commentSubmit);

module.exports = router;