import express, { Request, Response } from "express";
import pool from "../db"; 
import authMiddleware from "../middleware";
import QRCode from "qrcode";

const router = express.Router();

const FRONTEND_URL = "https://quick-serve-weld.vercel.app/"; // Ensure correct frontend URL

/**
 * @route POST /api/v1/tables/add
 * @desc Create tables using table_no and generate QR codes
 * @access Private (Only Hotel Owners)
 */
router.post("/add", authMiddleware, async (req: Request, res: Response) => {
  const { tables } = req.body; // Expecting an array of table numbers
  const hotel_id = (req as any).user.hotel_id;

  if (!Array.isArray(tables) || tables.length === 0) {
    res.status(400).json({ error: "Invalid table data" });
    return
  }

  try {
    const insertedTables = [];
    const alreadyExists: number[] = [];

    for (const table_no of tables) {
      // Check if the table_no already exists for this hotel
      const existingTable = await pool.query(
        "SELECT table_no FROM tables WHERE table_no = $1 AND hotel_id = $2",
        [table_no, hotel_id]
      );

      if (existingTable.rows.length > 0) {
        alreadyExists.push(table_no);
        continue; // Skip if table already exists
      }

      // Generate QR Code using table_no (not table_id)
      const qrData = `${FRONTEND_URL}/menu/${hotel_id}/${table_no}`;
      const qr_code_url = await QRCode.toDataURL(qrData);

      // Insert the table
      const result = await pool.query(
        "INSERT INTO tables (table_no, qr_code_url, hotel_id) VALUES ($1, $2, $3) RETURNING *",
        [table_no, qr_code_url, hotel_id]
      );

      insertedTables.push(result.rows[0]);
    }

    if (alreadyExists.length > 0) {
      res.status(201).json({ message: "Some tables already existed", alreadyExists });
      return
    }

    res.status(201).json({ message: "Tables created successfully", tables: insertedTables });
    return
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
    return
  }
});

/**
 * @route GET /api/v1/tables/all
 * @desc Get all tables and their QR codes for a hotel
 * @access Private (Authenticated Owners)
 */
router.get("/all", authMiddleware, async (req: Request, res: Response) => {
  const hotel_id = (req as any).user.hotel_id;

  try {
    const result = await pool.query(
      "SELECT table_no, qr_code_url FROM tables WHERE hotel_id = $1 ORDER BY table_no ASC",
      [hotel_id]
    );
    res.json(result.rows);
    return
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
    return
  }
});

export default router;
