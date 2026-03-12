import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Read from httpOnly cookie first, then Authorization header
    if (req.cookies?.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});

export const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access only' });
    }
    next();
};

export const sellerOnly = (req, res, next) => {
    if (!['seller', 'admin'].includes(req.user?.role)) {
        return res.status(403).json({ success: false, message: 'Seller access only' });
    }
    next();
};
