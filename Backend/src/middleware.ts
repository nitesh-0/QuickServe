import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined');
}

// Middleware to check the JWT token
const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.cookies.jwtToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user; // Attach the user data to the request
        next();
    });
};

export default authMiddleware;
