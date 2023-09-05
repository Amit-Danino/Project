const express = require('express');

//import users controllers
const usersController = require('../controllers/activitylog-controller');

const router = express.Router();

router.post("/addActivity", usersController.addActivity);
router.post("/getActivity", usersController.getActivity);



module.exports = router;