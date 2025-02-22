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
const zod_1 = __importDefault(require("zod"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const router = express_1.default.Router();
dotenv_1.default.config();
const signupZod = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
    address: zod_1.default.string(),
});
const SECRET_KEY = process.env.SECRET_KEY; //Replace with your secret key
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined');
}
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, address } = req.body;
    const validnput = signupZod.safeParse(req.body);
    if (!validnput.success) {
        res.status(400).json({ message: 'Invalid input', error: validnput.error });
        return;
    }
    try {
        // Check if the email already exists
        const checkSameHotelWithEmail = 'SELECT * FROM Hotels WHERE email = $1';
        const hotelCheckResult = yield db_1.default.query(checkSameHotelWithEmail, [email]);
        if (hotelCheckResult.rows.length > 0) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Insert the new hotel into the database
        const insertQuery = `
            INSERT INTO Hotels (name, email, password, address)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = yield db_1.default.query(insertQuery, [name, email, hashedPassword, address]);
        // Generate a JWT token
        const token = jsonwebtoken_1.default.sign({ hotel_id: result.rows[0].hotel_id, email: result.rows[0].email }, SECRET_KEY);
        // Set the JWT token in a secure, HTTP-only cookie
        res.cookie('jwtToken', token, {
            httpOnly: true, // Ensures the cookie can't be accessed via JavaScript
            secure: false, // Set to true if your app is served over HTTPS
        });
        res.status(201).json({ message: 'Hotel registered successfully', hotel: result.rows[0] });
    }
    catch (e) {
        console.error('Error signing up hotel:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
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
            secure: false,
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
router.delete("/delete-account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hotel_id } = req.query;
    try {
        // Delete the user's account from the database
        const deleteQuery = 'DELETE FROM Hotels WHERE hotel_id = $1 AND email = $2 RETURNING *';
        const result = yield db_1.default.query(deleteQuery, [hotel_id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Account not found' });
            return;
        }
        // Clear the JWT token from the cookies
        res.clearCookie('jwtToken');
        res.status(200).json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
