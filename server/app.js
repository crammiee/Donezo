import express from 'express';
import cors from 'cors';
import taskRouter from './api/tasks/task-router.js';
import authRouter from './api/auth/auth-router.js';

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.get('/health', (_req, res) => res.sendStatus(200));
app.use('/auth', authRouter);
app.use('/tasks', taskRouter);

export default app;