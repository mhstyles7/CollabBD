import { Router, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendOTPEmail } from '../utils/mailer';

const router = Router();

const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const generateOTP = (): string => crypto.randomInt(100000, 999999).toString();

// Register
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  accountType: z.enum(['worker', 'client']).optional(),
});

router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, accountType } = registerSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }
    const user = await User.create({
      name,
      email,
      password,
      phone,
      accountType: accountType || 'client',
      isEmailVerified: true,
    });
    const token = generateToken(String(user._id), user.role);
    res.status(201).json({
      message: 'Registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        verificationStatus: user.verificationStatus,
        isEmailVerified: user.isEmailVerified,
        badges: user.badges,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: err.errors });
      return;
    }
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const token = generateToken(String(user._id), user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        verificationStatus: user.verificationStatus,
        isEmailVerified: user.isEmailVerified,
        badges: user.badges,
        avatar: user.avatar,
        language: user.language,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Verify Email OTP
router.post('/verify-email', async (req, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPEmail(email, otp, user.name);
    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

// Google OAuth callback (token-based)
router.post('/google', async (req, res: Response): Promise<void> => {
  try {
    const { email, name, googleId, avatar } = req.body;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        isEmailVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isEmailVerified = true;
      await user.save();
    }
    const token = generateToken(String(user._id), user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        verificationStatus: user.verificationStatus,
        isEmailVerified: user.isEmailVerified,
        badges: user.badges,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) });
  }
});

export default router;
