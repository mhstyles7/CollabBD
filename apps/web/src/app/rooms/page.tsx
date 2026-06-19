'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Search, Users, Zap, Code2, Palette, BookOpen, Briefcase, Globe, Music, FlaskConical, Megaphone, ArrowRight, Hash, TrendingUp, Star, Plus, Loader2, Lightbulb, Camera } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { useEffect } from 'react';

const CATEGORIES = [
  { key: 'all', label: 'All Rooms' },
  { key: 'technology', label: 'Technology' },
  { key: 'business', label: 'Business' },
  { key: 'education', label: 'Education' },
  { key: 'design', label: 'Design' },
  { key: 'creative', label: 'Creative' },
];

// Map room icon names from DB to Lucide components (rendered inline)
const ROOM_ICON_MAP: Record<string, React.ReactNode> = {
  'Bot': <Code2 size={22} />,
  'Rocket': <Zap size={22} />,
  'BookOpen': <BookOpen size={22} />,
  'Code2': <Code2 size={22} />,
  'Briefcase': <Briefcase size={22} />,
  'Palette': <Palette size={22} />,
  'Music': <Music size={22} />,
  'FlaskConical': <FlaskConical size={22} />,
  'Megaphone': <Megaphone size={22} />,
  'Globe': <Globe size={22} />,
  'Users': <Users size={22} />,
};

function RoomCard({ room, index }: { room: any; index: number }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [joined, setJoined] = useState(() => user ? room.members?.includes(user._id) || room.members?.some((m: any) => m === user._id || m._id === user._id) : false);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinLeave = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsLoading(true);
    try {
      if (joined) {
        await api.post(`/rooms/${room.slug}/leave`);
        setJoined(false);
      } else {
        await api.post(`/rooms/${room.slug}/join`);
        setJoined(true);
      }
    } catch (err) {
      console.error('Failed to join/leave room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      style={{
        background: 'rgba(255,255,255,0.68)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 24,
        border: '1.5px solid rgba(255,255,255,0.85)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 48px ${room.coverColor}18`; e.currentTarget.style.borderColor = `${room.coverColor}40`; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.85)'; }}
    >
      {/* Cover */}
      <div style={{ height: 80, background: `linear-gradient(135deg, ${room.coverColor}ee, ${room.coverColor}88)`, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0, position: 'relative', zIndex: 1, color: '#fff' }}>
          {ROOM_ICON_MAP[room.icon] || <ShieldCheck size={22} />}
        </div>
        {room.isOfficial && (
          <span style={{ position: 'absolute', top: 12, right: 16, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '0.5px', zIndex: 1 }}>
            OFFICIAL
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
            {room.name}
          </h3>
        </div>

        <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, fontWeight: 500, marginBottom: 16, minHeight: 40 }}>
          {room.description}
        </p>

        {/* Last message preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)', marginBottom: 16 }}>
          <Hash size={13} color="#94a3b8" />
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {room.lastMessage || 'Say hi to the community!'}
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#475569', fontWeight: 700 }}>
              <Users size={14} color="#94a3b8" /> {room.memberCount.toLocaleString()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#10b981', fontWeight: 700 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
              {room.isOnline || room.onlineCount || 0} online
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={joined ? () => router.push(`/rooms/${room.slug}`) : handleJoinLeave}
            disabled={isLoading && !joined}
            style={{
              height: 36, padding: '0 18px', borderRadius: 12, border: 'none', cursor: isLoading && !joined ? 'not-allowed' : 'pointer',
              background: joined ? 'rgba(99,102,241,0.1)' : `linear-gradient(135deg, ${room.coverColor}, ${room.coverColor}cc)`,
              color: joined ? '#6366f1' : '#fff',
              fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: joined ? 'none' : `0 4px 12px ${room.coverColor}35`,
              border: joined ? '1.5px solid rgba(99,102,241,0.25)' : 'none',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', opacity: isLoading && !joined ? 0.7 : 1
            }}
          >
            {joined ? 'Open Chat' : isLoading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Join</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RoomsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setRooms(res.data);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [user, router]);

  const filtered = rooms.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', color: '#6366f1', fontWeight: 700 }}><Loader2 size={24} className="animate-spin" style={{ marginRight: 10 }} /> Loading rooms...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-5%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '5%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 100 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo_web.png" alt="CollabBD" className="logo-light" />
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <Link href="/feed" style={{ fontSize: 15, fontWeight: 600, color: '#475569' }} onMouseEnter={e => e.currentTarget.style.color = '#6366f1'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>Browse Needs</Link>
            <Link href="/rooms" style={{ fontSize: 15, fontWeight: 700, color: '#6366f1' }}>Community</Link>
            {user ? (
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '10px 24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>{user.name[0]}</div>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '10px 24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>Sign In</Link>
            )}
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 999, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1', fontSize: 13, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 24, textTransform: 'uppercase' }}>
            <Users size={14} strokeWidth={2.5} /> {rooms.reduce((a, r) => a + (r.memberCount || 0), 0).toLocaleString()} total members
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 16 }}>
            Join the{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Community
            </span>
          </h1>
          <p style={{ fontSize: 18, color: '#64748b', fontWeight: 500, marginBottom: 36 }}>
            Chat, collaborate and grow with thousands of professionals across Bangladesh.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 580, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={20} /></div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rooms by name or topic..."
              style={{
                width: '100%', height: 60, paddingLeft: 52, paddingRight: 24,
                background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(99,102,241,0.15)',
                borderRadius: 20, fontSize: 16, fontWeight: 500, color: '#0f172a',
                outline: 'none', boxSizing: 'border-box',
                boxShadow: '0 8px 32px rgba(99,102,241,0.08)', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 8px 32px rgba(99,102,241,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.15)'; e.target.style.boxShadow = '0 8px 32px rgba(99,102,241,0.08)'; }}
            />
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}
        >
          {[
            { value: rooms.length + '+', label: 'Active Rooms', color: '#6366f1' },
            { value: rooms.reduce((a, r) => a + (r.memberCount || 0), 0).toLocaleString() + '+', label: 'Total Members', color: '#10b981' },
            { value: rooms.reduce((a, r) => a + (r.isOnline || 25), 0).toLocaleString(), label: 'Online Now', color: '#f97316' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px 28px', borderRadius: 18, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}
        >
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: '9px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: active ? '#6366f1' : 'rgba(255,255,255,0.7)',
                  color: active ? '#fff' : '#475569',
                  fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: active ? '0 4px 14px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.04)',
                  border: active ? 'none' : '1.5px solid rgba(148,163,184,0.2)',
                  transition: 'all 0.2s', backdropFilter: 'blur(10px)',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Rooms Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <p style={{ fontSize: 18, fontWeight: 700 }}>No rooms found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filtered.map((room, i) => <RoomCard key={room._id || room.slug || i} room={room} index={i} />)}
          </div>
        )}

        {/* Create Room CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ marginTop: 56, textAlign: 'center' }}
        >
          <div style={{
            display: 'inline-block', padding: '40px 60px', borderRadius: 28,
            background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 32px rgba(99,102,241,0.08)',
          }}>
            <div style={{ marginBottom: 12 }}>
              <Lightbulb size={40} color="#f59e0b" strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>
              Don't see your community?
            </h3>
            <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500, marginBottom: 24, maxWidth: 400 }}>
              Create your own room and bring your niche community together.
            </p>
            <button style={{ height: 52, padding: '0 32px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 8px 20px rgba(99,102,241,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} /> Create a Room
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
