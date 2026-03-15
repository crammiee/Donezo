import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/db.js';
import { v4 as uuidv4 } from 'uuid';

export async function registerUser(email, password) {

  // check if email already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('Email already exists');
  }

  const id = uuidv4();
  const passwordHash = await hashPassword(password);

  await query(
    `INSERT INTO users (id, email, password_hash, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [id, email, passwordHash]
  );

  return { id, email };
}

export async function loginUser(email, password) {

  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    throw new Error('Invalid email or password');
  }

  return generateToken(user.id);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}