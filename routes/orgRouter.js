var express = require('express');
var router = express.Router();
var orgController = require('../controllers/orgController');


router.get('/:institutionid', orgController.home);
router.get('/microBook/:institutionid', orgController.microBook);
router.get('/works/:institutionid', orgController.works);


module.exports = router;
