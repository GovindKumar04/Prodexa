import express from 'express'
import authRouter from './routes/auth.routes.js'
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
export default app;
