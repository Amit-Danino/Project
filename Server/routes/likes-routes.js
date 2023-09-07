const express = require('express');

//import users controllers
const usersController = require('../controllers/likes-controller');

const router = express.Router();

router.post("/checkIfUserDislikes", usersController.checkIfUserDislikes);
router.post("/checkIfUserLikes", usersController.checkIfUserLikes);


module.exports = router;