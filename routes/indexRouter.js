var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

/* GET home page. */
router.get('/', indexController.home);
router.get('/discovery', indexController.discovery);
router.post('/discoveryMore', indexController.discoveryMore);
router.get('/microBook', indexController.microBook);
router.get('/works', indexController.works);
router.get('/kdh', indexController.kdh);

module.exports = router;
