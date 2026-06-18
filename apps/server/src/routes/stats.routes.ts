import { Router, Request, Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';

const router = Router();

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    
    // Get unique cities
    const cities = await User.distinct('location.city');
    const cityCount = cities.length;

    // Get a recent filled/resolved emergency task or just any recent task
    const latestFilledTask = await Post.findOne({ status: 'resolved' })
      .sort({ updatedAt: -1 })
      .populate('postedBy', 'name');

    res.json({
      activeUsers: userCount,
      cities: cityCount,
      jobsDone: postCount, // Since it's a new platform, we'll just show total posts as jobs
      latestTask: latestFilledTask ? {
        title: latestFilledTask.title,
        minutesAgo: Math.max(1, Math.floor((Date.now() - new Date(latestFilledTask.updatedAt).getTime()) / 60000)),
        isEmergency: latestFilledTask.isEmergency
      } : null
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

export default router;
