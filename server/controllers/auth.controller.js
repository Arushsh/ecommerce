import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    res.cookie('token', token, cookieOptions);
    const { password, ...userData } = user.toObject();
    res.status(statusCode).json({ success: true, user: userData, token });
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    sendToken(user, 201, res);
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }
    const user = await User.findOne({ username }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    sendToken(user, 200, res);
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
});

// PUT /api/auth/change-password
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(oldPassword))) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
});
