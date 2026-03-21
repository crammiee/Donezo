import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid authorization' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function extractToken(req) {
  const header = req.headers['authorization'];
  if (!header) return null;
  return header.split(' ')[1] || null;
}
