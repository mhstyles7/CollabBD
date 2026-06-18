import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message';
import DirectMessage from '../models/DirectMessage';
import Conversation from '../models/Conversation';
import Room from '../models/Room';

interface AuthSocket extends Socket {
  userId?: string;
}

export const registerSocketHandlers = (io: SocketServer): void => {
  // Auth middleware for socket
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
        socket.userId = decoded.id;
      } catch {
        // Allow unauthenticated connections for read-only
      }
    }
    next();
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId || 'guest'})`);

    // Join user's personal notification room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    // Join a community room
    socket.on('join_room', (slug: string) => {
      socket.join(`room_${slug}`);
      socket.to(`room_${slug}`).emit('user_joined', { userId: socket.userId });
    });

    // Leave a community room
    socket.on('leave_room', (slug: string) => {
      socket.leave(`room_${slug}`);
    });

    // Send a message in a community room
    socket.on('send_message', async (data: { slug: string; content: string; type?: string }) => {
      if (!socket.userId) return;
      try {
        const room = await Room.findOne({ slug: data.slug });
        if (!room) return;
        const message = await Message.create({
          room: room._id,
          sender: socket.userId,
          content: data.content,
          type: data.type || 'text',
        });
        await message.populate('sender', 'name avatar badges');
        io.to(`room_${data.slug}`).emit('new_message', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { slug: string; isTyping: boolean }) => {
      socket.to(`room_${data.slug}`).emit('user_typing', { userId: socket.userId, isTyping: data.isTyping });
    });

    // Join a DM conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conv_${conversationId}`);
    });

    // Send a direct message (real-time)
    socket.on('send_dm', async (data: { conversationId: string; content: string }) => {
      if (!socket.userId) return;
      try {
        const conv = await Conversation.findOne({ _id: data.conversationId, participants: socket.userId });
        if (!conv) return;
        const message = await DirectMessage.create({
          conversation: data.conversationId,
          sender: socket.userId,
          content: data.content.trim(),
        });
        await message.populate('sender', 'name avatar');
        // Update conversation last message
        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: data.content.trim(),
          lastMessageAt: new Date(),
        });
        io.to(`conv_${data.conversationId}`).emit('dm_received', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // DM typing indicator
    socket.on('dm_typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conv_${data.conversationId}`).emit('dm_user_typing', { userId: socket.userId, isTyping: data.isTyping });
    });

    // Toggle "Available Now" real-time
    socket.on('toggle_availability', (isAvailable: boolean) => {
      if (socket.userId) {
        io.emit('user_availability_changed', { userId: socket.userId, isAvailable });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId) {
        io.emit('user_offline', { userId: socket.userId });
      }
    });
  });
};
