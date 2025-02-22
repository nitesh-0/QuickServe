"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined');
}
// Middleware to check the JWT token
const authMiddleware = (req, res, next) => {
    var _a;
    const token = req.cookies.jwtToken || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user; // Attach the user data to the request
        next();
    });
};
exports.default = authMiddleware;
