import express from 'express'
import { register } from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.route('/register').post(register)

export default authRouter;