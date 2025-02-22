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
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = __importDefault(require("zod"));
const middleware_1 = __importDefault(require("../middleware")); // Import the middleware
dotenv_1.default.config();
const router = (0, express_1.default)();
const menuZod = zod_1.default.object({
    name: zod_1.default.string(),
    price: zod_1.default.number(),
    category: zod_1.default.string(),
});
// Route to add a menu item
router.post("/add", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, category } = req.body;
    const hotel_id = req.user.hotel_id; // Extracting hotel_id from authenticated user
    console.log("Hotel id:", hotel_id); // Debugging
    const validInput = menuZod.safeParse(req.body);
    if (!validInput.success) {
        res.status(400).json({ error: "Invalid input", message: validInput.error });
        return;
    }
    try {
        const result = yield db_1.default.query("INSERT INTO menu_items (name, price, category, hotel_id) VALUES ($1, $2, $3, $4) RETURNING *", [name, price, category, hotel_id]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Get all menu items for a hotel
router.get("/all", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hotel_id = req.user.hotel_id;
    try {
        const result = yield db_1.default.query("SELECT * FROM menu_items WHERE hotel_id = $1", [hotel_id]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Route to edit a menu item
router.put("/edit/:id", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, price, category } = req.body;
    const hotel_id = req.user.hotel_id;
    try {
        const result = yield db_1.default.query("UPDATE menu_items SET name=$1, price=$2, category=$3 WHERE id=$4 AND hotel_id=$5 RETURNING *", [name, price, category, id, hotel_id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Menu item not found or unauthorized" });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Route to delete a menu item
router.delete("/delete/:id", middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const hotel_id = req.user.hotel_id;
    try {
        // Check if the menu item exists
        const menuCheck = yield db_1.default.query("SELECT * FROM menu_items WHERE menu_item_id=$1 AND hotel_id=$2", [id, hotel_id]);
        if (menuCheck.rows.length === 0) {
            res.status(404).json({ error: "Menu item not found or unauthorized" });
            return;
        }
        // First, delete all items related to this menu item in order_items
        yield db_1.default.query("DELETE FROM order_items WHERE menu_item_id = $1", [id]);
        // Then, delete the menu item itself
        const result = yield db_1.default.query("DELETE FROM menu_items WHERE menu_item_id=$1 AND hotel_id=$2 RETURNING *", [id, hotel_id]);
        res.json({ message: "Menu item deleted successfully", deletedItem: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
