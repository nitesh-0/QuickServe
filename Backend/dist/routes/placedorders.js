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
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const middleware_1 = __importDefault(require("../middleware"));
const router = (0, express_1.Router)();
// Get all tables for a hotel
router.get("/tables", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const hotelId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.hotel_id; // Extract hotel ID from user session
    if (!hotelId) {
        res.status(401).json({ error: "Unauthorized: Hotel ID not found" });
        return;
    }
    try {
        const result = yield db_1.default.query("SELECT table_id, table_no FROM tables WHERE hotel_id = $1 ORDER BY table_no ASC", [hotelId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// ✅ Get orders for a particular table
router.get("/orders/:table_no", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { table_no } = req.params;
    const hotelId = req.user.hotel_id;
    try {
        // Get table_id using hotel_id and table_no
        const tableResult = yield db_1.default.query("SELECT table_id FROM tables WHERE hotel_id = $1 AND table_no = $2", [hotelId, table_no]);
        if (tableResult.rows.length === 0) {
            res.status(404).json({ error: "Table not found." });
            return;
        }
        const tableId = tableResult.rows[0].table_id;
        // Fetch orders using the resolved table_id
        const result = yield db_1.default.query(`SELECT 
                o.order_id, o.status, o.total_price::numeric::float8 AS total_price, 
                o.created_at,
                json_agg(
                    json_build_object(
                        'menu_item_id', oi.menu_item_id,
                        'menu_item_name', m.name,
                        'quantity', oi.quantity,
                        'unit_price', oi.subtotal_price / oi.quantity,
                        'subtotal_price', oi.subtotal_price
                    )
                ) AS items
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN menu_items m ON oi.menu_item_id = m.menu_item_id
            WHERE o.table_id = $1 AND o.status != 'served'
            GROUP BY o.order_id, o.status, o.total_price, o.created_at
            ORDER BY o.created_at DESC`, [tableId]);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// ✅ Mark all orders as served for a given table_no (Updated Route)
// ✅ Update order status to "served" for a specific table
router.put("/orders/:table_no/serve", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { table_no } = req.params;
    const hotelId = req.user.hotel_id;
    try {
        // Ensure the table exists for the given hotel
        const tableResult = yield db_1.default.query("SELECT table_id FROM tables WHERE hotel_id = $1 AND table_no = $2", [hotelId, table_no]);
        if (tableResult.rows.length === 0) {
            res.status(404).json({ error: "Table not found." });
            return;
        }
        const tableId = tableResult.rows[0].table_id;
        // ✅ Update order status instead of deleting
        const result = yield db_1.default.query("UPDATE orders SET status = 'served' WHERE table_id = $1 AND status != 'served' RETURNING *", [tableId]);
        if (result.rowCount === 0) {
            res.status(400).json({ error: "No pending orders to serve." });
            return;
        }
        res.json({ message: `All orders for Table ${table_no} marked as served.` });
    }
    catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Mark order as paid
router.put("/orders/:orderId/pay", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    try {
        yield db_1.default.query("UPDATE orders SET payment_status = 'paid' WHERE order_id = $1", [orderId]);
        res.json({ message: "Order marked as paid." });
    }
    catch (err) {
        console.error("Error updating payment status:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Delete order (Only when paid)
router.delete("/orders/:orderId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    try {
        yield db_1.default.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);
        yield db_1.default.query("DELETE FROM orders WHERE order_id = $1 AND payment_status = 'paid'", [orderId]);
        res.json({ message: "Order deleted successfully." });
    }
    catch (err) {
        console.error("Error deleting order:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Update Order Status and Delete Order
//router.put("/orders/:orderId", authMiddleware, async (req: Request, res: Response) => {
//     const { orderId } = req.params;
//     try {
//         // First, delete all items related to this order
//         await pool.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);
//         // Then, delete the order itself
//         await pool.query("DELETE FROM orders WHERE order_id = $1", [orderId]);
//         res.json({ message: "Order served and removed from database" });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });
exports.default = router;
