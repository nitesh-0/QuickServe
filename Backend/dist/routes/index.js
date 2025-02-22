"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const menu_items_1 = __importDefault(require("./menu_items"));
const qrgenerate_1 = __importDefault(require("./qrgenerate"));
const orders_1 = __importDefault(require("./orders"));
const placedorders_1 = __importDefault(require("./placedorders"));
const router = (0, express_1.default)();
router.use("/auth", auth_1.default);
router.use("/menu", menu_items_1.default);
router.use("/tables", qrgenerate_1.default);
router.use("/orders", orders_1.default);
router.use("/owner", placedorders_1.default);
exports.default = router;
