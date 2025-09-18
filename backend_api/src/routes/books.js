/**
 * Books routes
 */
const express = require('express');
const { listBooks, getBookById } = require('../db/repositories/books');

const router = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: List all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res, next) => {
  try {
    const books = await listBooks();
    res.json(books);
  } catch (err) {
    next(err);
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

module.exports = router;
