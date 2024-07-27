const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

async function adminMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ msg: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    if (!token) {
        return res.status(401).json({ msg: "Token missing" });
    }

    try {
        const decodedValue = await jwt.verify(token, JWT_SECRET);
        
        if (decodedValue.adminId) {
            req.adminId = decodedValue.adminId; // Attach adminId to the request object
            next();
        } else {
            res.status(403).json({ msg: "You are not authenticated" });
        }
    } catch (e) {
        res.status(403).json({ msg: "Invalid token" });
    }
}

module.exports = adminMiddleware;
