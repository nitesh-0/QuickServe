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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined');
}
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const query = 'SELECT * FROM Hotels WHERE email = $1';
        const result = yield db_1.default.query(query, [email]);
        if (result.rows.length === 0) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        const hotel = result.rows[0];
        // Verify the password
        const isMatch = yield bcrypt_1.default.compare(password, hotel.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate a JWT token
        const token = jsonwebtoken_1.default.sign({ hotel_id: hotel.hotel_id, email: hotel.email }, SECRET_KEY);
        // Set the JWT token in a secure, HTTP-only cookie
        res.cookie('jwtToken', token, {
            httpOnly: true,
        });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (e) {
        console.error('Error logging in:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
router.post("/logout", (req, res) => {
    // Clear the JWT cookie
    res.clearCookie('jwtToken', {
        httpOnly: true,
    });
    res.status(200).json({ message: 'Logout successful' });
});
