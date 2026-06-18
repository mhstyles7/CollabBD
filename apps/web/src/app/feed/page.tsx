'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Briefcase, Users, Globe,
  Palette, Code2, PenTool, BookOpen, FlaskConical, Camera, Megaphone, Rocket,
  Music, Languages, MoreHorizontal, Star, Eye, ChevronRight, ShieldCheck,
  AlertCircle, RefreshCw, Loader2, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = [
  { key: 'all', label: 'All', Icon: Globe },
  { key: 'design', label: 'Design', Icon: Palette, color: '#ec4899' },
  { key: 'development', label: 'Dev', Icon: Code2, color: '#6366f1' },
  { key: 'writing', label: 'Writing', Icon: PenTool, color: '#8b5cf6' },
  { key: 'tutoring', label: 'Tutoring', Icon: BookOpen, color: '#06b6d4' },
  { key: 'research', label: 'Research', Icon: FlaskConical, color: '#10b981' },
  { key: 'photography', label: 'Photo', Icon: Camera, color: '#f59e0b' },
  { key: 'marketing', label: 'Marketing', Icon: Megaphone, color: '#ef4444' },
  { key: 'startup', label: 'Startup', Icon: Rocket, color: '#f97316' },
  { key: 'music', label: 'Music', Icon: Music, color: '#a855f7' },
  { key: 'language', label: 'Language', Icon: Languages, color: '#14b8a6' },
  { key: 'other', label: 'Other', Icon: MoreHorizontal, color: '#94a3b8' },
];

const CAT_COLOR: Record<string, string> = {
  design: '#ec4899', development: '#6366f1', writing: '#8b5cf6',
  tutoring: '#06b6d4', research: '#10b981', photography: '#f59e0b',
  marketing: '#ef4444', startup: '#f97316', music: '#a855f7',
  language: '#14b8a6', other: '#94a3b8',
};

// ── Types ──
interface Post {
  _id: string;
  title: string;
  category: string;
  isEmergency: boolean;
  isRemote: boolean;
  budget: { min: number; max: number; currency: string; isNegotiable: boolean };
  location: { city: string; district?: string };
  skills: string[];
  applicationsCount: number;
  views: number;
  createdAt: string;
  postedBy: { name: string; avatar: string | null; badges: string[]; rating: number; isAvailableNow: boolean };
}

// ── Skeleton card ──
function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.68)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', padding: '28px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(148,163,184,0.2)', borderRadius: '24px 24px 0 0' }} />
      {[{ w: '30%', h: 22 }, { w: '80%', h: 26, mt: 16 }, { w: '60%', h: 18, mt: 8 }, { w: '100%', h: 1, mt: 20 }, { w: '40%', h: 18, mt: 20 }].map((s, i) => (
        <div key={i} style={{ width: s.w, height: s.h, borderRadius: 8, background: 'rgba(148,163,184,0.15)', marginTop: s.mt || 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const accent = CAT_COLOR[post.category] || '#6366f1';
  return (
    <Link href={`/post/${post._id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        style={{
          background: 'rgba(255,255,255,0.68)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: '1.5px solid rgba(255,255,255,0.85)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
          padding: '28px 28px 24px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'box-shadow 0.3s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 48px ${accent}18, 0 4px 12px rgba(0,0,0,0.06)`; e.currentTarget.style.borderColor = `${accent}40`; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.85)'; }}
      >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}88)`, borderRadius: '24px 24px 0 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {post.isEmergency && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <Zap size={11} strokeWidth={3} /> Urgent
            </span>
          )}
          {post.isRemote && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <Globe size={11} strokeWidth={2.5} /> Remote
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
          {timeAgo(post.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.3 }}>
        {post.title}
      </h3>

      {/* Skills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {post.skills.slice(0, 3).map((skill) => (
          <span key={skill} style={{ padding: '4px 12px', borderRadius: 999, background: `${accent}10`, border: `1px solid ${accent}25`, color: accent, fontSize: 12, fontWeight: 700 }}>
            {skill}
          </span>
        ))}
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#475569', fontWeight: 600 }}>
          <Briefcase size={14} color="#94a3b8" /> ৳{post.budget.min.toLocaleString()} – {post.budget.max.toLocaleString()}
          {post.budget.isNegotiable && <span style={{ color: '#94a3b8', fontWeight: 500 }}>(nego)</span>}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#475569', fontWeight: 600 }}>
          <MapPin size={14} color="#94a3b8" /> {post.location.city}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#475569', fontWeight: 600 }}>
          <Eye size={14} color="#94a3b8" /> {post.views}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid rgba(148,163,184,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${accent}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {post.postedBy.name[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
              {post.postedBy.name}
              {post.postedBy.badges.includes('verified') && <ShieldCheck size={13} color="#6366f1" strokeWidth={2.5} />}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Star size={11} color="#f59e0b" fill="#f59e0b" /> {post.postedBy.rating}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
            <Users size={13} style={{ display: 'inline', marginRight: 4 }} />{post.applicationsCount} applied
          </span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={16} color={accent} strokeWidth={2.5} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function FeedPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); }
  }, [user, router]);
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (emergencyOnly) params.isEmergency = 'true';
      if (remoteOnly) params.isRemote = 'true';
      if (search.trim()) params.q = search.trim(); // backend uses ?q= for text search

      const res = await api.get('/posts', { params });
      // backend returns { posts: [...], total, page, pages }
      const data = res.data;
      setPosts(Array.isArray(data) ? data : (data.posts ?? []));
    } catch (err: any) {
      console.error('Feed fetch error:', err);
      setError('Could not load posts. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, emergencyOnly, remoteOnly, search]);

  // Debounce search so we don't fire on every keystroke
  useEffect(() => {
    const t = setTimeout(() => { fetchPosts(); }, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchPosts]);

  const filtered = posts; // server already filters

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-5%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo_web.png" alt="CollabBD" style={{ height: 'auto', maxHeight: 120, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Link href="/feed" style={{ fontSize: 15, fontWeight: 700, color: '#6366f1', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Browse</Link>
            <Link href="/rooms" style={{ fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#6366f1'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>Community</Link>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '10px 24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>Sign In</Link>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 1 }}>
        {/* Hero search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 16 }}>
            Browse <span style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Open Needs</span>
          </h1>
          <p style={{ fontSize: 18, color: '#64748b', fontWeight: 500, marginBottom: 32 }}>Find tasks that match your skills and start earning today.</p>

          {/* Search bar */}
          <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={20} /></div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by skill, keyword, city..."
              style={{
                width: '100%', height: 60, paddingLeft: 52, paddingRight: 24,
                background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(99,102,241,0.15)',
                borderRadius: 20, fontSize: 16, fontWeight: 500, color: '#0f172a',
                outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                boxShadow: '0 8px 32px rgba(99,102,241,0.08)', fontFamily: "'Inter', sans-serif",
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 8px 32px rgba(99,102,241,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(99,102,241,0.15)'; e.target.style.boxShadow = '0 8px 32px rgba(99,102,241,0.08)'; }}
            />
          </div>
        </motion.div>

        {/* Category pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.key;
            return (
              <motion.button
                key={cat.key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: active ? (cat.color || '#6366f1') : 'rgba(255,255,255,0.7)',
                  color: active ? '#fff' : '#475569',
                  fontSize: 14, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: active ? `0 4px 14px ${cat.color || '#6366f1'}40` : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s', backdropFilter: 'blur(10px)',
                  border: active ? 'none' : '1.5px solid rgba(148,163,184,0.2)',
                }}
              >
                <cat.Icon size={15} strokeWidth={2.5} />
                {cat.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Quick filters */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
          {[
            { label: 'Emergency Only', icon: <Zap size={14} strokeWidth={2.5} />, key: 'emergency', active: emergencyOnly, toggle: () => setEmergencyOnly(p => !p), color: '#ef4444' },
            { label: 'Remote Only', icon: <Globe size={14} strokeWidth={2} />, key: 'remote', active: remoteOnly, toggle: () => setRemoteOnly(p => !p), color: '#10b981' },
          ].map((f: any) => (
            <button
              key={f.key}
              onClick={f.toggle}
              style={{
                padding: '8px 20px', borderRadius: 999, cursor: 'pointer',
                background: f.active ? `${f.color}15` : 'rgba(255,255,255,0.6)',
                border: `1.5px solid ${f.active ? f.color : 'rgba(148,163,184,0.2)'}`,
                color: f.active ? f.color : '#64748b', fontSize: 14, fontWeight: 700,
                transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif",
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              {f.icon}{f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>
            {isLoading ? (
              <span style={{ color: '#94a3b8' }}>Loading…</span>
            ) : error ? (
              <span style={{ color: '#ef4444' }}>Failed to load</span>
            ) : (
              <><span style={{ color: '#0f172a', fontSize: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{filtered.length}</span> open {filtered.length === 1 ? 'need' : 'needs'} found</>
            )}
          </span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {!isLoading && !error && (
              <button onClick={fetchPosts} title="Refresh" style={{ width: 38, height: 38, borderRadius: 10, border: '1.5px solid rgba(99,102,241,0.2)', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={16} color="#6366f1" />
              </button>
            )}
            <Link href="/post/new" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}>
              + Post a Need
            </Link>
          </div>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <AlertCircle size={40} color="#ef4444" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Server not responding</p>
            <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
              Make sure the backend is running on <code style={{ background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 6, fontSize: 13, color: '#6366f1' }}>localhost:5000</code>
            </p>
            <button onClick={fetchPosts} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 48, padding: '0 28px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 6px 18px rgba(99,102,241,0.3)' }}>
              <RefreshCw size={18} /> Try Again
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <Search size={52} style={{ margin: '0 auto 20px', opacity: 0.35 }} />
            <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>No needs found</p>
            <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500, marginBottom: 28 }}>Try adjusting your filters — or be the first to post one!</p>
            <Link href="/post/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 48, padding: '0 28px', borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              + Post a Need
            </Link>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {filtered.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
