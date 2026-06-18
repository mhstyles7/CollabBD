import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './utils/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import applicationRoutes from './routes/application.routes';
import roomRoutes from './routes/room.routes';
import reviewRoutes from './routes/review.routes';
import statsRoutes from './routes/stats.routes';
import uploadRoutes from './routes/upload.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import { registerSocketHandlers } from './socket/socket.handler';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Security Middleware ──────────────────────────────────────────────
// Set secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - strict origin whitelist
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Sanitize data against NoSQL injection attacks (e.g. $gt, $where)
app.use(mongoSanitize());

// Body parser with size limit to prevent abuse
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Global rate limiter — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// Strict rate limiter on auth routes — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again in 15 minutes.' },
});
app.use('/api/auth/', authLimiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// ── Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CollabBD API is running', timestamp: new Date() });
});

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Socket.io
registerSocketHandlers(io);

// Connect DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`[CollabBD] Server running on http://localhost:${PORT}`);
  });
});

export { io };
