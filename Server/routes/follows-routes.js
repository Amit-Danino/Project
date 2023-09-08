const express = require('express');

//import users controllers
const usersController = require('../controllers/follows-controller');

const router = express.Router();

router.post("/addFollow", usersController.addFollow);
router.post("/removeFollow", usersController.removeFollow);
router.post("/checkIfUserFollows", usersController.checkIfUserFollows)
router.post("/followers", usersController.followers);
router.post("/following", usersController.following);
router.post("/remove", usersController.remove);
router.post("/unfollow", usersController.unfollow);
router.post("/follow", usersController.follow);
router.post("/getUsersNotFollow", usersController.getUsersNotFollow);


module.exports = router;