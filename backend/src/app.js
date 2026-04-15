import express from 'express'
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js'
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
export default app;
