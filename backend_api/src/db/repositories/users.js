 /**
  * PUBLIC_INTERFACE
  * UsersRepository
  * Data access functions for Users table using Knex.
  */
const { getDb } = require('../connection');

/**
 * PUBLIC_INTERFACE
 * findUserByEmail(email)
 * Finds a user by email.
 */
async function findUserByEmail(email) {
  /** Returns the user record with the given email or undefined if not found. */
  const db = getDb();
  return db('users').where({ email }).first();
}

/**
 * PUBLIC_INTERFACE
 * createUser({ email, password_hash, name })
 * Inserts a new user and returns the created row.
 */
async function createUser({ email, password_hash, name }) {
  /** Creates a new user. Throws on unique violations. */
  const db = getDb();
  const [id] = await db('users').insert(
    { email, password_hash, name },
    ['id']
  );
  // For sqlite, insert returning array may vary; if id is number, normalize.
  const newId = typeof id === 'object' && id !== null ? id.id : id;
  return getUserById(newId);
}

/**
 * PUBLIC_INTERFACE
 * getUserById(id)
 * Fetches a user by id.
 */
async function getUserById(id) {
  /** Returns a single user or undefined. */
  const db = getDb();
  return db('users')
    .select('id', 'email', 'name', 'created_at', 'updated_at')
    .where({ id })
    .first();
}

module.exports = {
  // PUBLIC_INTERFACE
  findUserByEmail,
  // PUBLIC_INTERFACE
  createUser,
  // PUBLIC_INTERFACE
  getUserById,
};
