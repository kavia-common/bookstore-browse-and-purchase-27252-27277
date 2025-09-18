const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser, getUserById } = require('../db/repositories/users');

const DEFAULT_JWT_EXPIRES_IN = '7d';
const DEFAULT_BCRYPT_ROUNDS = 10;

/**
 * PUBLIC_INTERFACE
 * registerUser(email, password, name)
 * Registers a user with hashed password and returns safe user + token.
 */
async function registerUser(email, password, name) {
  /** Creates a new user after hashing the password; throws if email exists. */
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || DEFAULT_BCRYPT_ROUNDS, 10);
  const password_hash = await bcrypt.hash(password, saltRounds);
  const user = await createUser({ email, password_hash, name });

  const token = issueJwt(user);
  return { user, token };
}

/**
 * PUBLIC_INTERFACE
 * loginUser(email, password)
 * Authenticates with email/password and returns safe user + token.
 */
async function loginUser(email, password) {
  /** Verifies credentials; throws on invalid login. */
  const record = await findUserByEmail(email);
  if (!record) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, record.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  // Fetch safe user (without password)
  const user = await getUserById(record.id);
  const token = issueJwt(user);
  return { user, token };
}

/**
 * PUBLIC_INTERFACE
 * issueJwt(user)
 * Issues a JWT for the given user.
 */
function issueJwt(user) {
  /** Signs and returns a JWT using env JWT_SECRET. */
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  const payload = { sub: String(user.id), email: user.email, name: user.name };
  const expiresIn = process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * PUBLIC_INTERFACE
 * verifyJwt(token)
 * Verifies token and returns decoded payload.
 */
function verifyJwt(token) {
  /** Verifies and returns decoded JWT payload. */
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, secret);
}

module.exports = {
  // PUBLIC_INTERFACE
  registerUser,
  // PUBLIC_INTERFACE
  loginUser,
  // PUBLIC_INTERFACE
  issueJwt,
  // PUBLIC_INTERFACE
  verifyJwt,
};
