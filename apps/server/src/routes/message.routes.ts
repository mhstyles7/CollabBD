import { Router, Response } from 'express';
import Conversation from '../models/Conversation';
import DirectMessage from '../models/DirectMessage';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

// Get all conversations for the current user
router.get('/conversations', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name avatar')
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start or get a conversation with another user
router.post('/conversations', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { recipientId } = req.body;
    if (!recipientId) { res.status(400).json({ message: 'Recipient ID required' }); return; }
    if (userId === recipientId) { res.status(400).json({ message: 'Cannot message yourself' }); return; }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [new mongoose.Types.ObjectId(userId!), new mongoose.Types.ObjectId(recipientId)] }
    }).populate('participants', 'name avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
      });
      conversation = await Conversation.findById(conversation._id).populate('participants', 'name avatar') as any;
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    // Verify user is part of this conversation
    const conv = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    if (!conv) { res.status(403).json({ message: 'Forbidden' }); return; }

    // Mark messages as read
    await DirectMessage.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, read: false },
      { read: true }
    );

    // Reset unread count
    const unreadUpdate: Record<string, number> = {};
    unreadUpdate[`unreadCount.${userId}`] = 0;
    await Conversation.findByIdAndUpdate(conversationId, { $set: unreadUpdate });

    const messages = await DirectMessage.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) { res.status(400).json({ message: 'Message cannot be empty' }); return; }

    const conv = await Conversation.findOne({ _id: conversationId, participants: userId });
    if (!conv) { res.status(403).json({ message: 'Forbidden' }); return; }

    const message = await DirectMessage.create({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
    });

    const populated = await DirectMessage.findById(message._id).populate('sender', 'name avatar');

    // Update conversation's last message
    const otherParticipant = conv.participants.find(p => String(p) !== userId);
    const updateData: any = {
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
    };
    if (otherParticipant) {
      const key = `unreadCount.${String(otherParticipant)}`;
      updateData[`$inc`] = { [key]: 1 };
    }
    await Conversation.findByIdAndUpdate(conversationId, updateData);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

export default router;
