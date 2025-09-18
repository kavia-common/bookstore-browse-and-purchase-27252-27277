'use strict';
const { createOrder, getOrderById, listOrdersByUser } = require('../db/repositories/orders');

/**
 * PUBLIC_INTERFACE
 * placeOrder(userId, items)
 * Validates and creates an order for the user.
 */
async function placeOrder(userId, items) {
  /** Ensures items are valid and delegates to repository create in a transaction. */
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('items must be a non-empty array');
    err.status = 400;
    throw err;
  }
  const normalized = items.map((it) => ({
    book_id: Number(it.book_id),
    quantity: Math.max(1, Number(it.quantity || 1)),
  }));
  return createOrder({ userId: Number(userId), items: normalized });
}

/**
 * PUBLIC_INTERFACE
 * getMyOrders(userId)
 * Returns list of orders for a user.
 */
async function getMyOrders(userId) {
  /** Fetch order summaries by user. */
  return listOrdersByUser(Number(userId));
}

/**
 * PUBLIC_INTERFACE
 * getMyOrderDetail(userId, orderId)
 * Returns order detail ensuring it belongs to the user.
 */
async function getMyOrderDetail(userId, orderId) {
  /** Fetch single order with items; verify ownership. */
  const order = await getOrderById(Number(orderId));
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  if (Number(order.user_id) !== Number(userId)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return order;
}

module.exports = {
  // PUBLIC_INTERFACE
  placeOrder,
  // PUBLIC_INTERFACE
  getMyOrders,
  // PUBLIC_INTERFACE
  getMyOrderDetail,
};
