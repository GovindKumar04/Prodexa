import express from 'express'
import { register, signIn } from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.route('/register').post(register)
authRouter.route('/login').post(signIn);
export default authRouter;