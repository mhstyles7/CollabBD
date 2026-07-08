import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get current user
router.get('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password -otp -otpExpiry');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public profile
router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpiry -email -phone');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/me', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowedFields = ['name', 'namebn', 'bio', 'biobn', 'skills', 'portfolioLinks', 'university', 'isAvailableNow', 'language', 'location', 'title', 'hourlyRate', 'qualifications', 'portfolio'];
    const updates: Record<string, unknown> = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user?.id, updates, { new: true }).select('-password -otp');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle "Available Now"
router.patch('/me/availability', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    user.isAvailableNow = !user.isAvailableNow;
    await user.save();
    res.json({ isAvailableNow: user.isAvailableNow });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users by skill/location
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { skill, city, available, page = '1', limit = '12' } = req.query;
    const filter: Record<string, unknown> = { accountType: 'worker' };
    if (skill) filter.skills = { $in: [skill] };
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (available === 'true') filter.isAvailableNow = true;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const users = await User.find(filter)
      .select('-password -otp -otpExpiry')
      .skip(skip)
      .limit(parseInt(String(limit)))
      .sort({ rating: -1 });
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: parseInt(String(page)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/me/password', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'Old and new password (min 6 chars) are required' }); return;
    }
    const user = await User.findById(req.user?.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const isMatch = await bcrypt.compare(oldPassword, user.password as string);
    if (!isMatch) { res.status(400).json({ message: 'Current password is incorrect' }); return; }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
