const express = require('express');

//import users controllers
const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post("/register", usersController.register);
router.post("/getUsers", usersController.allUsers);
router.post("/encryptPass", usersController.encryptPass)
router.post("/getUserId", usersController.getUserId)
router.post("/getUserCountry", usersController.getUserCountry)
router.post("/getUserFullname", usersController.getUserFullname);
router.post("/removeUser", usersController.removeUser);

module.exports = router;