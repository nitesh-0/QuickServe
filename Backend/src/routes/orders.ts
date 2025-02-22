import { Router, Request, Response } from "express";
import pool from "../db";
import authMiddleware from "../middleware";

const router = Router();

// Fetch menu items based on hotel_id
router.get("/menu/:hotelId", async (req: Request, res: Response) => {
  const { hotelId } = req.params;

  if (!hotelId || isNaN(Number(hotelId))) {
    res.status(400).json({ error: "Invalid hotel ID" });
    return
  }

  try {
    // Fetch menu items for the given hotel_id
    const menuResult = await pool.query(
      "SELECT menu_item_id AS id, name, price, category FROM menu_items WHERE hotel_id = $1",
      [hotelId]
    );

    if (menuResult.rows.length === 0) {
      res.status(404).json({ error: "No menu items found for this hotel" });
      return
    }

    res.json(menuResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Place an order
router.post("/place-order", async (req: Request, res: Response) => {
  const { hotelId, table_no, items } = req.body;

  if (!hotelId || !table_no || !items || items.length === 0) {
    res.status(400).json({ error: "Invalid order details." });
    return
  }

  try {
    // Fetch the correct table_id using hotel_id and table_no
    const tableResult = await pool.query(
      "SELECT table_id FROM tables WHERE hotel_id = $1 AND table_no = $2",
      [hotelId, table_no]
    );

    if (tableResult.rows.length === 0) {
      res.status(400).json({ error: "Table not found." });
      return
    }

    const tableId = tableResult.rows[0].table_id;

    // Insert into orders table with the correct table_id
    const orderResult = await pool.query(
      `INSERT INTO orders (table_id, status, total_price, created_at)
       VALUES ($1, 'pending', $2, NOW()) RETURNING order_id`,
      [
        tableId,
        items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      ]
    );

    const orderId = orderResult.rows[0].order_id;

    // Insert ordered items into order_items table
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, subtotal_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, item.price * item.quantity]
      );
    }

    res.json({ message: "Order placed successfully", orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Fetch all orders placed at a table (No authentication required)
router.get("/table-orders/:hotelId/:table_no", async (req: Request, res: Response) => {
  const { hotelId, table_no } = req.params;

  try {
    const tableResult = await pool.query(
      "SELECT table_id FROM tables WHERE hotel_id = $1 AND table_no = $2",
      [hotelId, table_no]
    );

    if (tableResult.rows.length === 0) {
      res.status(404).json({ error: "Table not found." });
      return
    }

    const tableId = tableResult.rows[0].table_id;

    const ordersResult = await pool.query(
      `SELECT o.order_id, o.status, o.total_price, o.created_at, 
      json_agg(
        json_build_object(
          'menu_item_name', m.name,
          'quantity', oi.quantity,
          'subtotal_price', oi.subtotal_price
        )
      ) AS items
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN menu_items m ON oi.menu_item_id = m.menu_item_id
      WHERE o.table_id = $1
      GROUP BY o.order_id, o.status, o.total_price, o.created_at
      ORDER BY o.created_at DESC`,
      [tableId]
    );

    res.json(ordersResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Cancel an order (No authentication required)
router.delete("/cancel-order/:orderId", async (req: Request, res: Response) => {
  const { orderId } = req.params;

    try {
        // First, delete all items related to this order
        await pool.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);

        // Then, delete the order itself
        await pool.query("DELETE FROM orders WHERE order_id = $1", [orderId]);

        res.json({ message: "Order served and removed from database" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Fetch orders for a hotel
router.get("/:hotel_id", authMiddleware, async (req, res) => {
  const { hotel_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE hotel_id = $1 ORDER BY order_id DESC",
      [hotel_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
