import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';

const router = Router();

// Ensure public/uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP formats are allowed'));
    }
  },
});

// Upload profile picture
router.post('/avatar', protect, upload.single('avatar'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user?.id, { avatar: avatarUrl }, { new: true }).select('-password');
    res.json({ message: 'Avatar updated', user, avatarUrl });
  } catch (err: any) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Upload Student ID for verification
router.post('/verify', protect, upload.single('studentId'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No document uploaded' });
      return;
    }
    const documentUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { studentIdUrl: documentUrl, verificationStatus: 'pending' },
      { new: true }
    ).select('-password');
    res.json({ message: 'Verification document submitted', user, documentUrl });
  } catch (err: any) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;
