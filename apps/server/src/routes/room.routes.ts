import { Router, Response } from 'express';
import mongoose from 'mongoose';
import Room from '../models/Room';
import Message from '../models/Message';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth.middleware';

const OFFICIAL_ROOMS = [
  { name: 'AI Bangladesh', namebn: 'এআই বাংলাদেশ', slug: 'ai-bangladesh', description: 'Artificial Intelligence enthusiasts in Bangladesh', descriptionbn: 'বাংলাদেশের কৃত্রিম বুদ্ধিমত্তা উৎসাহীদের জন্য', icon: 'Brain', coverColor: '#8B5CF6', isOfficial: true, category: 'tech' },
  { name: 'IELTS Prep', namebn: 'আইইএলটিএস প্রস্তুতি', slug: 'ielts-prep', description: 'IELTS study groups and speaking partners', descriptionbn: 'আইইএলটিএস স্টাডি গ্রুপ এবং স্পিকিং পার্টনার', icon: 'BookOpen', coverColor: '#06B6D4', isOfficial: true, category: 'education' },
  { name: 'Startup Dhaka', namebn: 'স্টার্টআপ ঢাকা', slug: 'startup-dhaka', description: 'Founders, cofounders, and startup builders in Dhaka', descriptionbn: 'ঢাকার ফাউন্ডার এবং স্টার্টআপ বিল্ডারদের জন্য', icon: 'Rocket', coverColor: '#F59E0B', isOfficial: true, category: 'startup' },
  { name: 'React BD', namebn: 'রিঅ্যাক্ট বিডি', slug: 'react-bd', description: 'React.js and Next.js developers community', descriptionbn: 'রিঅ্যাক্ট এবং নেক্সট.জেএস ডেভেলপারদের কমিউনিটি', icon: 'Code2', coverColor: '#3B82F6', isOfficial: true, category: 'tech' },
  { name: 'Freelancers Hub', namebn: 'ফ্রিল্যান্সার হাব', slug: 'freelancers-hub', description: 'Freelancers across all skills sharing tips and opportunities', descriptionbn: 'সব দক্ষতার ফ্রিল্যান্সারদের টিপস এবং সুযোগ শেয়ারের জায়গা', icon: 'Briefcase', coverColor: '#10B981', isOfficial: true, category: 'work' },
  { name: 'Design BD', namebn: 'ডিজাইন বিডি', slug: 'design-bd', description: 'Graphic designers, UI/UX, and creatives community', descriptionbn: 'গ্রাফিক ডিজাইনার, ইউআই/ইউএক্স এবং ক্রিয়েটিভদের কমিউনিটি', icon: 'Palette', coverColor: '#EC4899', isOfficial: true, category: 'design' },
];

const router = Router();

// Get all rooms — auto-seeds official rooms if DB is empty
router.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const count = await Room.countDocuments();
    if (count === 0) {
      for (const room of OFFICIAL_ROOMS) {
        await Room.findOneAndUpdate({ slug: room.slug }, room, { upsert: true, new: true });
      }
    }
    const rooms = await Room.find().sort({ memberCount: -1, isOfficial: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single room
router.get('/:slug', async (req, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) { res.status(404).json({ message: 'Room not found' }); return; }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Join room
router.post('/:slug/join', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) { res.status(404).json({ message: 'Room not found' }); return; }
    const userId = req.user?.id;
    if (!room.members.map(String).includes(userId!)) {
      room.members.push(new mongoose.Types.ObjectId(userId));
      room.memberCount += 1;
      await room.save();
      await User.findByIdAndUpdate(userId, { $addToSet: { rooms: room._id } });
    }
    res.json({ message: 'Joined room', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave room
router.post('/:slug/leave', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) { res.status(404).json({ message: 'Room not found' }); return; }
    const userId = req.user?.id;
    room.members = room.members.filter((m) => String(m) !== userId);
    room.memberCount = Math.max(0, room.memberCount - 1);
    await room.save();
    await User.findByIdAndUpdate(userId, { $pull: { rooms: room._id } });
    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages in a room
router.get('/:slug/messages', protect, async (req, res: Response): Promise<void> => {
  try {
    const room = await Room.findOne({ slug: req.params.slug });
    if (!room) { res.status(404).json({ message: 'Room not found' }); return; }
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const messages = await Message.find({ room: room._id })
      .populate('sender', 'name avatar badges')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(String(limit)));
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed official rooms (admin only or on startup)
router.post('/seed', async (_req, res: Response): Promise<void> => {
  try {
    const officialRooms = [
      { name: 'AI Bangladesh', namebn: 'এআই বাংলাদেশ', slug: 'ai-bangladesh', description: 'Artificial Intelligence enthusiasts in Bangladesh', descriptionbn: 'বাংলাদেশের কৃত্রিম বুদ্ধিমত্তা উৎসাহীদের জন্য', icon: 'Brain', coverColor: '#8B5CF6', isOfficial: true, category: 'tech' },
      { name: 'IELTS Prep', namebn: 'আইইএলটিএস প্রস্তুতি', slug: 'ielts-prep', description: 'IELTS study groups and speaking partners', descriptionbn: 'আইইএলটিএস স্টাডি গ্রুপ এবং স্পিকিং পার্টনার', icon: 'BookOpen', coverColor: '#06B6D4', isOfficial: true, category: 'education' },
      { name: 'Startup Dhaka', namebn: 'স্টার্টআপ ঢাকা', slug: 'startup-dhaka', description: 'Founders, cofounders, and startup builders in Dhaka', descriptionbn: 'ঢাকার ফাউন্ডার এবং স্টার্টআপ বিল্ডারদের জন্য', icon: 'Rocket', coverColor: '#F59E0B', isOfficial: true, category: 'startup' },
      { name: 'React BD', namebn: 'রিঅ্যাক্ট বিডি', slug: 'react-bd', description: 'React.js and Next.js developers community', descriptionbn: 'রিঅ্যাক্ট এবং নেক্সট.জেএস ডেভেলপারদের কমিউনিটি', icon: 'Code2', coverColor: '#3B82F6', isOfficial: true, category: 'tech' },
      { name: 'Freelancers Hub', namebn: 'ফ্রিল্যান্সার হাব', slug: 'freelancers-hub', description: 'Freelancers across all skills sharing tips and opportunities', descriptionbn: 'সব দক্ষতার ফ্রিল্যান্সারদের টিপস এবং সুযোগ শেয়ারের জায়গা', icon: 'Briefcase', coverColor: '#10B981', isOfficial: true, category: 'work' },
      { name: 'Design BD', namebn: 'ডিজাইন বিডি', slug: 'design-bd', description: 'Graphic designers, UI/UX, and creatives community', descriptionbn: 'গ্রাফিক ডিজাইনার, ইউআই/ইউএক্স এবং ক্রিয়েটিভদের কমিউনিটি', icon: 'Palette', coverColor: '#EC4899', isOfficial: true, category: 'design' },
    ];
    for (const room of officialRooms) {
      await Room.findOneAndUpdate({ slug: room.slug }, room, { upsert: true, new: true });
    }
    res.json({ message: 'Official rooms seeded', count: officialRooms.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
