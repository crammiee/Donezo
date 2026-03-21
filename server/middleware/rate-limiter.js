import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  error: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

export function authLimiter(req, res, next) { 
  return loginLimiter(req, res, next);
}  // limit by IP on auth routes

const taskRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // max 30 actions per user
  keyGenerator: (req) => {
    // Use user ID if logged in, fallback to IP
    return req.userId || req.ip;
  },
  error: "Too many requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false
});

export function taskLimiter(req, res, next) {
  return taskRateLimiter(req, res, next);
}  // limit by user on task routes
