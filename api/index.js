// api/index.js
// Vercel Serverless Function entry point for Express API
import app from '../server/server.js';

export default function handler(req, res) {
  return app(req, res);
}
