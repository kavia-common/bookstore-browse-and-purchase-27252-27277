/**
 * Books routes
 */
const express = require('express');
const {
  listBooks,
  countBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../db/repositories/books');
const { requireAuth } = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: List all books
 *     description: Supports pagination and filters.
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search in title/author
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of books (and total when paginated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, author, minPrice, maxPrice, limit, offset } = req.query || {};
    const query = { q, author, minPrice, maxPrice, limit, offset };
    const data = await listBooks(query);
    // When pagination present, also return total count
    if (limit !== undefined || offset !== undefined) {
      const total = await countBooks(query);
      return res.json({ data, total });
    }
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book by id
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book found
 *       404:
 *         description: Book not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const book = await getBookById(Number(req.params.id));
    if (!book) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.json(book);
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, description, price, stock]
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               cover_image: { type: string }
 *     responses:
 *       201:
 *         description: Book created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, author, description, price, stock, cover_image } = req.body || {};
    if (!title || !author || !description || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'title, author, description, price, stock are required' });
    }
    const book = await createBook({
      title: String(title),
      author: String(author),
      description: String(description),
      price: Number(price),
      stock: Number(stock),
      cover_image: cover_image ? String(cover_image) : null,
    });
    return res.status(201).json(book);
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update an existing book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               author: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               cover_image: { type: string }
 *     responses:
 *       200:
 *         description: Book updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Book not found
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const patch = {};
    const fields = ['title', 'author', 'description', 'price', 'stock', 'cover_image'];
    for (const f of fields) {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, f)) {
        patch[f] = f === 'price' ? Number(req.body[f]) :
                   f === 'stock' ? Number(req.body[f]) :
                   req.body[f];
      }
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    const updated = await updateBook(Number(req.params.id), patch);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict (e.g., FK constraint)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const count = await deleteBook(Number(req.params.id));
    if (!count) {
      return res.status(404).json({ message: 'Not found' });
    }
    return res.status(204).send();
  } catch (err) {
    // For FK constraint errors, sqlite emits specific codes; generalize to 409
    return res.status(409).json({ message: 'Cannot delete this book due to existing references' });
  }
});

module.exports = router;
