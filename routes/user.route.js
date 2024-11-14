const express= require('express');
const { register, logout, login, getprofile, editProfile, getSuggestedusers, followOrUnfollow } = require('../controllers/user.controller');
const isAuthenticated = require('../middleware/isAuthenticated');
const upload = require('../middleware/multer');
const router=express.Router();

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/:id/profile').get(isAuthenticated,getprofile)
router.route('/:id/edit').post(isAuthenticated,upload.single("profilePhoto"),editProfile)
router.route('/suggested').get(isAuthenticated,getSuggestedusers);
router.route('/followunfollow/:id').get(isAuthenticated,followOrUnfollow)

module.exports=router;

