// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

if (!process.env.VERCEL) dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateToken(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Admin authentication is not configured on this server.' });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Access denied.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }
    req.user = user;
    next();
  });
}
