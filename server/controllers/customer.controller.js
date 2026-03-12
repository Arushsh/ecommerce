import Customer from '../models/Customer.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/customer/profile
export const getProfile = asyncHandler(async (req, res) => {
    const addresses = await Customer.find({ userId: req.user._id });
    res.json({ success: true, addresses });
});

// POST /api/customer/profile
export const createProfile = asyncHandler(async (req, res) => {
    const { name, locality, city, mobile, state, zipcode } = req.body;
    const address = await Customer.create({ userId: req.user._id, name, locality, city, mobile, state, zipcode });
    res.status(201).json({ success: true, address });
});

// PUT /api/customer/profile/:id
export const updateProfile = asyncHandler(async (req, res) => {
    const address = await Customer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    const { name, locality, city, mobile, state, zipcode } = req.body;
    Object.assign(address, { name, locality, city, mobile, state, zipcode });
    await address.save();
    res.json({ success: true, address });
});

// DELETE /api/customer/profile/:id
export const deleteProfile = asyncHandler(async (req, res) => {
    await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Address deleted' });
});
