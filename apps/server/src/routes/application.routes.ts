import { Router, Response } from 'express';
import Application from '../models/Application';
import Post from '../models/Post';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import { io } from '../index';

const router = Router();

// Apply to a post
router.post('/:postId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) { res.status(404).json({ message: 'Post not found' }); return; }
    if (String(post.postedBy) === req.user?.id) {
      res.status(400).json({ message: 'Cannot apply to your own post' }); return;
    }
    const existing = await Application.findOne({ post: req.params.postId, applicant: req.user?.id });
    if (existing) { res.status(400).json({ message: 'Already applied' }); return; }
    const application = await Application.create({ ...req.body, post: req.params.postId, applicant: req.user?.id });
    await Post.findByIdAndUpdate(req.params.postId, { $inc: { applicationsCount: 1 } });
    await application.populate('applicant', 'name avatar badges rating completedJobs');
    // Notify post owner via Socket.io
    io.to(`user_${post.postedBy}`).emit('new_application', { postId: req.params.postId, application });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Get applications for a post (post owner only)
router.get('/post/:postId', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findOne({ _id: req.params.postId, postedBy: req.user?.id });
    if (!post) { res.status(403).json({ message: 'Not authorized' }); return; }
    const applications = await Application.find({ post: req.params.postId })
      .populate('applicant', 'name avatar badges rating completedJobs skills bio')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my applications
router.get('/my', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ applicant: req.user?.id })
      .populate('post', 'title status category budget')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received applications (proposals on my posts)
router.get('/received', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // First find all posts by this user
    const myPosts = await Post.find({ postedBy: req.user?.id }).select('_id');
    const postIds = myPosts.map(p => p._id);
    
    // Find applications for these posts
    const applications = await Application.find({ post: { $in: postIds } })
      .populate('post', 'title budget status')
      .populate('applicant', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept/Reject application
router.patch('/:id/status', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body; // 'accepted' | 'rejected'
    const application = await Application.findById(req.params.id).populate('post');
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    const post = application.post as unknown as { postedBy: string; _id: string };
    if (String(post.postedBy) !== req.user?.id) {
      res.status(403).json({ message: 'Not authorized' }); return;
    }
    application.status = status;
    await application.save();
    // Notify applicant
    io.to(`user_${application.applicant}`).emit('application_status', { applicationId: req.params.id, status, postId: post._id });
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
