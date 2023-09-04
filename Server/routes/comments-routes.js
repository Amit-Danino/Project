const express = require('express');

//import users controllers
const postsController = require('../controllers/comments-controller');

const router = express.Router();

router.post("/addComment", postsController.addComment);
router.post("/getCommentsFromPost", postsController.getCommentsFromPost);

module.exports = router;