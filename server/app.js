import express from 'express';
import cors from 'cors';
import taskRouter from './api/tasks/task.router.js';
import authRouter from './api/auth/auth.router.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use('/auth', authRouter);
app.use('/tasks', taskRouter);

export default app;