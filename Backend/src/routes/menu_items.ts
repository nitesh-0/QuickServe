import express, { Request, Response } from "express";
import pool from "../db";
import dotenv from "dotenv";
import zod from "zod";
import authMiddleware from "../middleware"; // Import the middleware

dotenv.config();

const router = express();

const menuZod = zod.object({
  name: zod.string(),
  price: zod.number(),
  category: zod.string(),
});

// Route to add a menu item
router.post("/add", authMiddleware, async (req: Request, res: Response) => {
  const { name, price, category } = req.body;
  const hotel_id = (req as any).user.hotel_id; // Extracting hotel_id from authenticated user
  console.log("Hotel id:", hotel_id); // Debugging

  const validInput = menuZod.safeParse(req.body);
  if (!validInput.success) {
    res.status(400).json({ error: "Invalid input", message: validInput.error });
    return;
  }

  try {
    const result = await pool.query(
      "INSERT INTO menu_items (name, price, category, hotel_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, price, category, hotel_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all menu items for a hotel
router.get("/all", authMiddleware, async (req: Request, res: Response) => {
  const hotel_id = (req as any).user.hotel_id;

  try {
    const result = await pool.query("SELECT * FROM menu_items WHERE hotel_id = $1", [hotel_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Route to edit a menu item
router.put("/edit/:id", authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const hotel_id = (req as any).user.hotel_id;

  try {
    const result = await pool.query(
      "UPDATE menu_items SET name=$1, price=$2, category=$3 WHERE id=$4 AND hotel_id=$5 RETURNING *",
      [name, price, category, id, hotel_id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Menu item not found or unauthorized" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete a menu item
router.delete(
  "/delete/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const hotel_id = (req as any).user.hotel_id;

    try {
      // Check if the menu item exists
      const menuCheck = await pool.query(
        "SELECT * FROM menu_items WHERE menu_item_id=$1 AND hotel_id=$2",
        [id, hotel_id]
      );

      if (menuCheck.rows.length === 0) {
        res.status(404).json({ error: "Menu item not found or unauthorized" });
        return
      }

      // First, delete all items related to this menu item in order_items
      await pool.query("DELETE FROM order_items WHERE menu_item_id = $1", [id]);

      // Then, delete the menu item itself
      const result = await pool.query(
        "DELETE FROM menu_items WHERE menu_item_id=$1 AND hotel_id=$2 RETURNING *",
        [id, hotel_id]
      );

      res.json({ message: "Menu item deleted successfully", deletedItem: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


export default router;
