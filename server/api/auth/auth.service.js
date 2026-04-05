import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../db/db.js';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

export async function registerUser(email, password) {
  if (!isValidEmail(email)) throw new Error('Invalid email format');
  if (password.length < 8) throw new Error('Password must be at least 8 characters');

  const passwordHash = await hashPassword(password);
  try {
    const result = await query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, passwordHash]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === '23505') throw new Error('Email already exists');
    throw new Error('Registration failed');
  }
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

// Helpers
function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
