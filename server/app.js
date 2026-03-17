import express from 'express';
import cors from 'cors';
import authRouter from './auth/auth-routes.js';
const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use('/auth', authRouter);

export default app;
