const express = require('express');
const successstoriesController = require('../controllers/successstories-controller');
const router = express.Router();

router.get("/selectSuccessStories", (req, res) => {
    console.log("Route reached.");
    successstoriesController.selectSuccessStories(req, res);
});

module.exports = router;