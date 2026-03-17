import express from 'express';
import cors from 'cors';
import taskRouter from './tasks/task-routes.js';
import authRouter from './auth/auth-routes.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use('/auth', authRouter);
app.use('/tasks', taskRouter);

export default app;