import { Router, Response } from 'express';
import Review from '../models/Review';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Create review
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewee, post, rating, comment } = req.body;
    if (String(reviewee) === req.user?.id) {
      res.status(400).json({ message: 'Cannot review yourself' }); return;
    }
    const review = await Review.create({ reviewer: req.user?.id, reviewee, post, rating, comment });
    // Update reviewee's rating average
    const reviews = await Review.find({ reviewee });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(reviewee, { rating: Math.round(avgRating * 10) / 10, ratingCount: reviews.length });
    await review.populate('reviewer', 'name avatar badges');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar badges')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
