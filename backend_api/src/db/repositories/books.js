/**
 * PUBLIC_INTERFACE
 * BooksRepository
 * Data access functions for Books table using Knex.
 */
const { getDb } = require('../connection');

/**
 * PUBLIC_INTERFACE
 * listBooks({ q, author, minPrice, maxPrice, limit, offset } = {})
 * Returns books with optional filters and pagination.
 */
async function listBooks({ q, author, minPrice, maxPrice, limit, offset } = {}) {
  /** Fetches books from the database with optional search and pagination. */
  const db = getDb();
  const query = db('books').select('*');

  if (q) {
    query.where((qb) => {
      qb.where('title', 'like', `%${q}%`).orWhere('author', 'like', `%${q}%`);
    });
  }
  if (author) {
    query.andWhere('author', 'like', `%${author}%`);
  }
  if (minPrice !== undefined) {
    query.andWhere('price', '>=', Number(minPrice));
  }
  if (maxPrice !== undefined) {
    query.andWhere('price', '<=', Number(maxPrice));
  }

  query.orderBy('id', 'asc');

  if (limit !== undefined) {
    query.limit(Number(limit));
  }
  if (offset !== undefined) {
    query.offset(Number(offset));
  }

  return query;
}

/**
 * PUBLIC_INTERFACE
 * countBooks({ q, author, minPrice, maxPrice } = {})
 * Returns total count for filters.
 */
async function countBooks({ q, author, minPrice, maxPrice } = {}) {
  const db = getDb();
  const query = db('books');
  if (q) {
    query.where((qb) => {
      qb.where('title', 'like', `%${q}%`).orWhere('author', 'like', `%${q}%`);
    });
  }
  if (author) query.andWhere('author', 'like', `%${author}%`);
  if (minPrice !== undefined) query.andWhere('price', '>=', Number(minPrice));
  if (maxPrice !== undefined) query.andWhere('price', '<=', Number(maxPrice));
  const [{ count }] = await query.count({ count: '*' });
  return Number(count);
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

/**
 * PUBLIC_INTERFACE
 * createBook({ title, author, description, price, stock, cover_image })
 * Inserts a new book and returns it.
 */
async function createBook({ title, author, description, price, stock, cover_image }) {
  const db = getDb();
  const [inserted] = await db('books').insert(
    { title, author, description, price, stock, cover_image },
    ['id']
  );
  const id = typeof inserted === 'object' && inserted !== null ? inserted.id : inserted;
  return getBookById(id);
}

/**
 * PUBLIC_INTERFACE
 * updateBook(id, patch)
 * Updates fields for a book and returns updated row.
 */
async function updateBook(id, patch) {
  const db = getDb();
  const count = await db('books').where({ id }).update(
    { ...patch, updated_at: db.fn.now() }
  );
  if (!count) return undefined;
  return getBookById(id);
}

/**
 * PUBLIC_INTERFACE
 * deleteBook(id)
 * Deletes a book. Will fail if FK constraints prevent deletion (e.g., in existing orders).
 */
async function deleteBook(id) {
  const db = getDb();
  return db('books').where({ id }).del();
}

module.exports = {
  // PUBLIC_INTERFACE
  listBooks,
  // PUBLIC_INTERFACE
  countBooks,
  // PUBLIC_INTERFACE
  getBookById,
  // PUBLIC_INTERFACE
  createBook,
  // PUBLIC_INTERFACE
  updateBook,
  // PUBLIC_INTERFACE
  deleteBook,
};
