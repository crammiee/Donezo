import { Router } from 'express';
import { registerUser, loginUser } from './auth-service.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required' 
    });
  }
  try {
    const user = await registerUser(email, password);
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }
  try {
    const token = await loginUser(email, password);
    res.status(200).json({ token });
  } catch (err) {
    res.status(401).json({
      error: err.message
    });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (err) {
    res.status(500).json({
      error: 'Logout failed'
    });
  }
});

export default router;