var express = require('express');
var router = express.Router();
var personalCenterController = require('../controllers/personalCenterController');

router.get('/home', personalCenterController.home);

module.exports = router;