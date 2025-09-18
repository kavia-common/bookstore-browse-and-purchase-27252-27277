const { verifyJwt } = require('../services/auth');
const { getUserById } = require('../db/repositories/users');

/**
 * PUBLIC_INTERFACE
 * requireAuth
 * Express middleware that validates Bearer token and attaches req.user.
 */
async function requireAuth(req, res, next) {
  /** Validates Authorization header and loads the current user. */
  try {
    const header = req.get('Authorization') || req.get('authorization') || '';
    const [, token] = header.split(' ');
    if (!token) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }
    const decoded = verifyJwt(token);
    const user = await getUserById(Number(decoded.sub));
    if (!user) {
      return res.status(401).json({ message: 'Invalid token subject' });
    }
    req.user = user;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = {
  // PUBLIC_INTERFACE
  requireAuth,
};
