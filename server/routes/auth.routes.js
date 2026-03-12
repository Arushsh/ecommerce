import express from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, logout, getMe, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Middleware to check express-validator results and return first error
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array(),
        });
    }
    next();
};

router.post(
    '/register',
    [
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 chars'),
        body('email').isEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    ],
    validate,
    register
);

router.post(
    '/login',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    login
);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;
