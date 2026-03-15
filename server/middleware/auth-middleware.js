import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = payload.userId;

    next();

  } catch (err) {

    return res.sendStatus(401);

  }

}