import { Router } from 'express';
import { registerUser, loginUser } from './auth-service.js';

const router = Router();

router.post('/register', async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await registerUser(email, password);

    res.status(201).json({ user });

  } catch (err) {

    res.status(400).json({ error: err.message });

  }

});

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    const token = await loginUser(email, password);

    res.status(200).json({ token });

  } catch (err) {

    res.status(401).json({ error: err.message });

  }

});

router.post('/logout', (req, res) => {
  res.sendStatus(200);
});

export default router;