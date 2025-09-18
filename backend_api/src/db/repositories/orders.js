'use strict';
/**
 * PUBLIC_INTERFACE
 * OrdersRepository
 * Data access functions for Orders and OrderItems using Knex.
 */
const { getDb } = require('../connection');

/**
 * PUBLIC_INTERFACE
 * createOrder({ userId, items })
 * Creates an order and related order_items rows in a transaction.
 * Each item = { book_id, quantity }
 */
async function createOrder({ userId, items }) {
  /** Creates order and its items, calculates totals, enforces stock availability. */
  const db = getDb();
  return db.transaction(async (trx) => {
    // Fetch books and validate stock
    const bookIds = items.map((i) => i.book_id);
    const books = await trx('books').whereIn('id', bookIds);
    const bookMap = new Map(books.map((b) => [b.id, b]));
    // Validate
    for (const it of items) {
      const b = bookMap.get(it.book_id);
      if (!b) {
        const err = new Error(`Book ${it.book_id} not found`);
        err.status = 400;
        throw err;
      }
      if (b.stock < it.quantity) {
        const err = new Error(`Insufficient stock for book ${b.id}`);
        err.status = 400;
        throw err;
      }
    }

    // Create order shell
    const [orderIdInsert] = await trx('orders').insert(
      {
        user_id: userId,
        total_amount: 0,
        status: 'pending',
      },
      ['id']
    );
    const orderId =
      typeof orderIdInsert === 'object' && orderIdInsert !== null
        ? orderIdInsert.id
        : orderIdInsert;

    // Build order_items rows, update stock
    let total = 0;
    for (const it of items) {
      const b = bookMap.get(it.book_id);
      const unit_price = Number(b.price);
      const quantity = Number(it.quantity);
      const line_total = unit_price * quantity;
      total += line_total;

      await trx('order_items').insert({
        order_id: orderId,
        book_id: it.book_id,
        quantity,
        unit_price,
        line_total,
      });

      // decrement stock
      await trx('books').where({ id: it.book_id }).update({
        stock: b.stock - quantity,
        updated_at: trx.fn.now(),
      });
    }

    // Update order total
    await trx('orders').where({ id: orderId }).update({
      total_amount: total,
      updated_at: trx.fn.now(),
    });

    // Return composed order
    const order = await getOrderById(orderId, trx);
    return order;
  });
}

/**
 * PUBLIC_INTERFACE
 * getOrderById(id, dbOverride)
 * Gets order by id including items.
 */
async function getOrderById(id, dbOverride) {
  /** Fetches an order and its items with book info. */
  const db = dbOverride || getDb();
  const order = await db('orders').where({ id }).first();
  if (!order) return undefined;

  const items = await db('order_items as oi')
    .join('books as b', 'oi.book_id', 'b.id')
    .select(
      'oi.id',
      'oi.book_id',
      'b.title as book_title',
      'b.author as book_author',
      'oi.quantity',
      'oi.unit_price',
      'oi.line_total',
      'oi.created_at',
      'oi.updated_at'
    )
    .where('oi.order_id', id)
    .orderBy('oi.id', 'asc');

  return { ...order, items };
}

/**
 * PUBLIC_INTERFACE
 * listOrdersByUser(userId)
 * Lists orders for a user (without items by default, to keep it light).
 */
async function listOrdersByUser(userId) {
  /** Returns orders summary for a user ordered by newest first. */
  const db = getDb();
  return db('orders')
    .where({ user_id: userId })
    .select('*')
    .orderBy('id', 'desc');
}

module.exports = {
  // PUBLIC_INTERFACE
  createOrder,
  // PUBLIC_INTERFACE
  getOrderById,
  // PUBLIC_INTERFACE
  listOrdersByUser,
};
