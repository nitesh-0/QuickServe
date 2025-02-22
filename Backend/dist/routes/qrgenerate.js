"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const middleware_1 = __importDefault(require("../middleware"));
const qrcode_1 = __importDefault(require("qrcode"));
const router = express_1.default.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"; // Ensure correct frontend URL
/**
 * @route POST /api/v1/tables/add
 * @desc Create tables using table_no and generate QR codes
 * @access Private (Only Hotel Owners)
 */
router.post("/add", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tables } = req.body; // Expecting an array of table numbers
    const hotel_id = req.user.hotel_id;
    if (!Array.isArray(tables) || tables.length === 0) {
        res.status(400).json({ error: "Invalid table data" });
        return;
    }
    try {
        const insertedTables = [];
        const alreadyExists = [];
        for (const table_no of tables) {
            // Check if the table_no already exists for this hotel
            const existingTable = yield db_1.default.query("SELECT table_no FROM tables WHERE table_no = $1 AND hotel_id = $2", [table_no, hotel_id]);
            if (existingTable.rows.length > 0) {
                alreadyExists.push(table_no);
                continue; // Skip if table already exists
            }
            // Generate QR Code using table_no (not table_id)
            const qrData = `${FRONTEND_URL}/menu/${hotel_id}/${table_no}`;
            const qr_code_url = yield qrcode_1.default.toDataURL(qrData);
            // Insert the table
            const result = yield db_1.default.query("INSERT INTO tables (table_no, qr_code_url, hotel_id) VALUES ($1, $2, $3) RETURNING *", [table_no, qr_code_url, hotel_id]);
            insertedTables.push(result.rows[0]);
        }
        if (alreadyExists.length > 0) {
            res.status(201).json({ message: "Some tables already existed", alreadyExists });
            return;
        }
        res.status(201).json({ message: "Tables created successfully", tables: insertedTables });
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
}));
/**
 * @route GET /api/v1/tables/all
 * @desc Get all tables and their QR codes for a hotel
 * @access Private (Authenticated Owners)
 */
router.get("/all", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hotel_id = req.user.hotel_id;
    try {
        const result = yield db_1.default.query("SELECT table_no, qr_code_url FROM tables WHERE hotel_id = $1 ORDER BY table_no ASC", [hotel_id]);
        res.json(result.rows);
        return;
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
}));
exports.default = router;
