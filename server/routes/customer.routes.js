import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getProfile, createProfile, updateProfile, deleteProfile } from '../controllers/customer.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.post('/', createProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
