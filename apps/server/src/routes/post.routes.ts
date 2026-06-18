import { Router, Response } from 'express';
import Post from '../models/Post';
import { protect, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Create post
router.post('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.create({ ...req.body, postedBy: req.user?.id });
    await post.populate('postedBy', 'name avatar badges rating isAvailableNow');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Get all posts (with filters)
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { category, city, isEmergency, isRemote, minBudget, maxBudget, status = 'open', page = '1', limit = '12', q } = req.query;
    const filter: Record<string, unknown> = { status };
    if (category) filter.category = category;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (isEmergency === 'true') filter.isEmergency = true;
    if (isRemote === 'true') filter.isRemote = true;
    if (minBudget || maxBudget) {
      filter['budget.min'] = {};
      if (minBudget) (filter['budget.min'] as Record<string, unknown>)['$gte'] = parseInt(String(minBudget));
      if (maxBudget) (filter['budget.min'] as Record<string, unknown>)['$lte'] = parseInt(String(maxBudget));
    }
    if (q) filter['$or'] = [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const posts = await Post.find(filter)
      .populate('postedBy', 'name avatar badges rating isAvailableNow')
      .skip(skip)
      .limit(parseInt(String(limit)))
      .sort({ isEmergency: -1, createdAt: -1 });
    const total = await Post.countDocuments(filter);
    res.json({ posts, total, page: parseInt(String(page)), pages: Math.ceil(total / parseInt(String(limit))) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Nearby posts (geospatial)
router.get('/nearby', async (req, res: Response): Promise<void> => {
  try {
    const { lng, lat, radius = '5000' } = req.query; // radius in meters
    if (!lng || !lat) { res.status(400).json({ message: 'lng and lat required' }); return; }
    const posts = await Post.find({
      status: 'open',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(String(lng)), parseFloat(String(lat))] },
          $maxDistance: parseInt(String(radius)),
        },
      },
    })
      .populate('postedBy', 'name avatar badges rating')
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('postedBy', 'name avatar badges rating completedJobs isAvailableNow location bio');
    if (!post) { res.status(404).json({ message: 'Post not found' }); return; }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findOne({ _id: req.params.id, postedBy: req.user?.id });
    if (!post) { res.status(404).json({ message: 'Post not found or not authorized' }); return; }
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, postedBy: req.user?.id });
    if (!post) { res.status(404).json({ message: 'Post not found or not authorized' }); return; }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// My posts
router.get('/user/my', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const posts = await Post.find({ postedBy: req.user?.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
