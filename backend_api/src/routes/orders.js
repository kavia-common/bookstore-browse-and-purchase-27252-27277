'use strict';
const express = require('express');
const { requireAuth } = require('../middleware');
const { placeOrder, getMyOrders, getMyOrderDetail } = require('../services/orders');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Endpoints for managing orders
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order for the authenticated user
 *     description: Creates an order with one or more items. Stock is decremented atomically.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 description: Array of items to order
 *                 items:
 *                   type: object
 *                   required: [book_id, quantity]
 *                   properties:
 *                     book_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Validation error or insufficient stock
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body || {};
    const order = await placeOrder(req.user.id, items);
    return res.status(201).json(order);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const orders = await getMyOrders(req.user.id);
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get an order detail
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order detail
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await getMyOrderDetail(req.user.id, Number(req.params.id));
    return res.json(order);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
});

module.exports = router;
