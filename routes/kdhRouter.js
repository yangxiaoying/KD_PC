var express = require('express');
var router = express.Router();
var kdhController = require('../controllers/kdhController');


router.get('/home/:orgid', kdhController.home);
router.get('/works/:orgid', kdhController.works);
router.get('/getWorksCategory/:orgid', kdhController.getWorksCategory);
router.get('/microbook/:orgid', kdhController.microbook);
router.get('/bookshop/:orgid', kdhController.showBookshop);
router.get('/bookshop/getPeriodAndBook/:orgid', kdhController.getPeriodAndBook);
router.get('/getBookCategory/:orgid', kdhController.getBookCategory);
router.get('/getBaseInfo/:orgid', kdhController.getBaseInfo);
router.get('/getPeriodYear', kdhController.getPeriodYear);
router.get('/addOrCancelConcern/:orgid', kdhController.addOrCancelConcern);

module.exports = router;