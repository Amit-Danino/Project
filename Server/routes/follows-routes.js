const express = require('express');

//import users controllers
const usersController = require('../controllers/follows-controller');

const router = express.Router();

router.post("/addFollow", usersController.addFollow);
router.post("/removeFollow", usersController.removeFollow);
router.post("/checkIfUserFollows", usersController.checkIfUserFollows)


module.exports = router;