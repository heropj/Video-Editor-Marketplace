import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const headerjwtAuth = (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        const token=req.cookies?.token
        if(!token) return res.redirect('/user/login')
        // return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode token
        req.user = decoded; // Attach user data to req.user
        next(); // Move to next middleware/route
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};

export default headerjwtAuth;
