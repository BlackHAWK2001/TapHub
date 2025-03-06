import express from "express";
import {login, register, logout, editProfile, getSuggestedUsers, folowOrUnfollow, getProfile} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";


const router = express.Router();

router.route('/register').post(register);
router.route('/logout').get(logout);
router.route('/login').post(login);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/followorunfollow/:id').post(isAuthenticated, folowOrUnfollow);

export default router;
