import express from "express";
import pool from '../db';
import zod from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config()

const signupZod = zod.object({
    name: zod.string(),
    email: zod.string().email(),
    password: zod.string().min(6),
    address: zod.string(),
});

const SECRET_KEY = process.env.SECRET_KEY; //Replace with your secret key
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined');
}

router.post("/signup", async (req, res) => {
    const { name, email, password, address } = req.body;

    const validnput = signupZod.safeParse(req.body);

    if (!validnput.success) {
        res.status(400).json({ message: 'Invalid input', error: validnput.error });
        return;
    }

    try {
        // Check if the email already exists
        const checkSameHotelWithEmail = 'SELECT * FROM Hotels WHERE email = $1';
        const hotelCheckResult = await pool.query(checkSameHotelWithEmail, [email]);

        if (hotelCheckResult.rows.length > 0) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new hotel into the database
        const insertQuery = `
            INSERT INTO Hotels (name, email, password, address)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(insertQuery, [name, email, hashedPassword, address]);

        // Generate a JWT token
        const token = jwt.sign(
            { hotel_id: result.rows[0].hotel_id, email: result.rows[0].email },
            SECRET_KEY,
        );

        // Set the JWT token in a secure, HTTP-only cookie
        res.cookie('jwtToken', token, {
            httpOnly: true, // Ensures the cookie can't be accessed via JavaScript
            secure: false, // Set to true if your app is served over HTTPS
        });

        res.status(201).json({ message: 'Hotel registered successfully', hotel: result.rows[0] });
    } catch (e) {
        console.error('Error signing up hotel:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const query = 'SELECT * FROM Hotels WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            res.status(400).json({ message: 'Invalid email or password' });
            return
        }

        const hotel = result.rows[0];

        // Verify the password
        const isMatch = await bcrypt.compare(password, hotel.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid email or password' });
            return
        }

        // Generate a JWT token
        const token = jwt.sign(
            { hotel_id: hotel.hotel_id, email: hotel.email },
            SECRET_KEY,
        );

        // Set the JWT token in a secure, HTTP-only cookie
        res.cookie('jwtToken', token, {
            httpOnly: true, 
            secure: false,
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (e) {
        console.error('Error logging in:', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post("/logout", (req, res) => {
    // Clear the JWT cookie
    res.clearCookie('jwtToken', {
        httpOnly: true, 
    });

    res.status(200).json({ message: 'Logout successful' });
});

router.delete("/delete-account", async (req, res) => {
    const { hotel_id } = req.query; 

    try {
        // Delete the user's account from the database
        const deleteQuery = 'DELETE FROM Hotels WHERE hotel_id = $1 AND email = $2 RETURNING *';
        const result = await pool.query(deleteQuery, [hotel_id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Account not found' });
            return
        }

        // Clear the JWT token from the cookies
        res.clearCookie('jwtToken');

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

export default router;