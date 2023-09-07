const express = require('express');
//import users controllers
const postsController = require('../controllers/feature-controller');

const router = express.Router();

router.post('/modify', postsController.modify);
router.post('/getFeatureData', postsController.getFeatureData)

module.exports = router;