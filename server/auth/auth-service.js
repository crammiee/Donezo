import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/db.js';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

export async function registerUser(email, password) {
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existingUser.rows.length > 0) {
    throw new Error('Email already exists');
  }
  const passwordHash = await hashPassword(password);
  const result = await query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email`,
    [email, passwordHash]
  );
  return result.rows[0];
}

export async function loginUser(email, password) {
  const result = await query(
    'SELECT id, password_hash FROM users WHERE email = $1',
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

// --- Helper functions ---
function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}