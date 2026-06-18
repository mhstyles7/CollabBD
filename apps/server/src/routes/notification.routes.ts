import { Router, Response } from 'express';
import Notification from '../models/Notification';
import { protect, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all notifications for current user
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ user: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user?.id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a single notification as read
router.patch('/:id/read', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      { isRead: true }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ user: req.user?.id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to create a notification (used internally by other routes)
export async function createNotification({
  userId, type, title, body, link
}: {
  userId: string;
  type: 'application' | 'verification' | 'message' | 'review' | 'system';
  title: string;
  body: string;
  link?: string;
}) {
  return Notification.create({ user: userId, type, title, body, link });
}

export default router;
