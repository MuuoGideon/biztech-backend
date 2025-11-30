import express from 'express';
import {
	userSignUp,
	userLogin,
	getUser,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/signUp', userSignUp);
router.post('/login', userLogin);
router.get('/user/:id', getUser);

export default router;
