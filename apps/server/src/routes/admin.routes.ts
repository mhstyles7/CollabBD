import { Router, Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import Application from '../models/Application';
import { protect, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Middleware to check if user is admin
const adminOnly = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
    return;
  }
  next();
};

// Apply protect and adminOnly middleware to all admin routes
router.use(protect);
router.use(adminOnly);

// Get all users (with pagination and filtering)
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.verificationStatus = status;

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const users = await User.find(filter)
      .select('-password -otp -otpExpiry')
      .skip(skip)
      .limit(parseInt(String(limit)))
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      total,
      page: parseInt(String(page)),
      pages: Math.ceil(total / parseInt(String(limit)))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Approve or Reject user verification
router.patch('/users/:id/verify', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body; // 'verified' or 'unverified'
    if (!['verified', 'unverified'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.verificationStatus = status;
    
    // Add or remove 'verified' badge
    if (status === 'verified' && !user.badges.includes('verified')) {
      user.badges.push('verified');
    } else if (status === 'unverified') {
      user.badges = user.badges.filter(b => b !== 'verified');
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Get admin stats
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });
    const totalPosts = await Post.countDocuments();
    const activePosts = await Post.countDocuments({ status: 'open' });
    const totalApplications = await Application.countDocuments();

    res.json({
      users: { total: totalUsers, verified: verifiedUsers, pending: pendingVerifications },
      posts: { total: totalPosts, active: activePosts },
      applications: totalApplications
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

export default router;
