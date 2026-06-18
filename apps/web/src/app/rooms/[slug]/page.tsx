'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft, Send, Users, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';
import { io, Socket } from 'socket.io-client';

export default function RoomChatPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineMembers, setOnlineMembers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${slug}`);
        setRoom(res.data);
        const msgRes = await api.get(`/rooms/${slug}/messages`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error('Failed to load room:', err);
        router.push('/rooms');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, { auth: { token } });
    
    newSocket.on('connect', () => {
      newSocket.emit('join_room', slug);
    });

    newSocket.on('new_message', (msg) => {
      if (msg.room === slug) {
        setMessages(prev => [...prev, msg]);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_room', slug);
      newSocket.disconnect();
    };
  }, [slug, user, token, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !room) return;
    
    const msgData = {
      roomId: room._id,
      text: newMessage.trim(),
    };
    socket.emit('send_message', msgData);
    setNewMessage('');
  };

  if (isLoading || !room) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', color: '#6366f1', fontWeight: 700 }}><Loader2 size={24} className="animate-spin" style={{ marginRight: 10 }} /> Loading chat...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4ff', overflow: 'hidden' }}>
      {/* Navbar */}
      <header style={{ flexShrink: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => router.push('/rooms')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', color: '#64748b', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(148,163,184,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${room.coverColor}, ${room.coverColor}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {room.icon || '💬'}
              </div>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{room.name}</h1>
                <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  {room.memberCount || 0} members
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => {
            const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;
            return (
              <motion.div
                key={msg._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  gap: 12,
                  maxWidth: '75%',
                }}
              >
                {!isMe && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800 }}>
                    {msg.sender?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  {!isMe && <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4, marginLeft: 4 }}>{msg.sender?.name || 'Unknown User'}</div>}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 18,
                    borderTopRightRadius: isMe ? 4 : 18,
                    borderTopLeftRadius: !isMe ? 4 : 18,
                    background: isMe ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#fff',
                    color: isMe ? '#fff' : '#0f172a',
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: isMe ? 'none' : '1px solid rgba(148,163,184,0.1)',
                  }}>
                    {msg.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button type="button" style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: 'none', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, height: 44, padding: '0 20px', borderRadius: 14, border: '1.5px solid rgba(148,163,184,0.2)', background: '#fff', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', fontFamily: "'Inter', sans-serif" }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.2)'}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              style={{ width: 44, height: 44, borderRadius: 14, background: newMessage.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e2e8f0', border: 'none', color: newMessage.trim() ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0 }}
            >
              <Send size={18} style={{ marginLeft: 2 }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
