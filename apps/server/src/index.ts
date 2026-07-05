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

// ── CORS origins: support comma-separated CLIENT_URL list ────────────
const rawOrigins = process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (Render health checks, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((allowed) => origin === allowed || origin.startsWith(allowed))) {
      return callback(null, true);
    }
    // Allow Vercel preview URLs
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((allowed) => origin === allowed || origin.startsWith(allowed))) {
        return callback(null, true);
      }
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Security Middleware ──────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight for all routes

// Sanitize data against NoSQL injection attacks
app.use(mongoSanitize());

// Body parser with size limit
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Global rate limiter — 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

// Strict rate limiter on auth routes — 20 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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

// Health check — also shows allowed origins for debugging
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'CollabBD API is running',
    timestamp: new Date(),
    allowedOrigins,
  });
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
    console.log(`[CollabBD] Server running on port ${PORT}`);
    console.log(`[CollabBD] Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}).catch((err) => {
  console.error('[CollabBD] Failed to connect to MongoDB:', err);
  process.exit(1);
});

export { io };
