/**
 * PUBLIC_INTERFACE
 * BooksRepository
 * Data access functions for Books table using Knex.
 */
const { getDb } = require('../connection');

/**
 * PUBLIC_INTERFACE
 * listBooks()
 * Returns all books.
 */
async function listBooks() {
  /** Fetches all books from the database. */
  const db = getDb();
  return db('books').select('*').orderBy('id', 'asc');
}

/**
 * PUBLIC_INTERFACE
 * getBookById(id)
 * Returns a single book by its id.
 */
async function getBookById(id) {
  /** Fetches a single book by id from the database. */
  const db = getDb();
  return db('books').where({ id }).first();
}

module.exports = {
  // PUBLIC_INTERFACE
  listBooks,
  // PUBLIC_INTERFACE
  getBookById,
};
