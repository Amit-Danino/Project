const express = require('express');

//import users controllers
const postsController = require('../old_controllers/posts-controller');

const router = express.Router();

router.post("/feed", postsController.feed);
router.post("/explore", postsController.explore);

router.post('/like', postsController.like);
router.post('/dislike', postsController.dislike);
router.post('/cancel-like', postsController.cancelLike);
router.post('/cancel-dislike', postsController.cancelDislike);

router.post('/like-count', postsController.getUpdatedLikeCount);
router.post('/dislike-count', postsController.getUpdatedDislikeCount);

router.post('/addPost', postsController.addPost);

module.exports = router;