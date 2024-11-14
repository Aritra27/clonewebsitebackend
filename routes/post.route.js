const express = require("express");
const {addnewPost,getAllPost,getUserPost,likePost,dislikePost,addcomment,getCommentsOfPost,deletePost,bookmarkPost,} = require("../controllers/post.controller");
const isAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/multer");


const router = express.Router();

router.route('/addpost').post(isAuthenticated,upload.single('image'),addnewPost);

router.route('/all').get(isAuthenticated,getAllPost);

router.route('userpost/all').get(isAuthenticated,getUserPost);
router.route('/:id/like').get(isAuthenticated,likePost);
router.route('/:id/dislike').get(isAuthenticated,dislikePost);
router.route('/:id/comment').post(isAuthenticated,addcomment);
router.route(':id/comment/all').post(isAuthenticated,getCommentsOfPost);
router.route('/delete/:id').delete(isAuthenticated,deletePost);
router.route('/:id/bookmark').post(isAuthenticated,bookmarkPost);

module.exports=router


