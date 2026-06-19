'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, MapPin, Star, Briefcase, Clock, Users, Globe,
  Code2, Palette, PenTool, CheckCircle2, Edit2, MessageCircle,
  ArrowLeft, Award, TrendingUp, Eye, Loader2, Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { useEffect, useState } from 'react';



const BADGES: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  verified: { label: 'Verified', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: <ShieldCheck size={14} /> },
  top_rated: { label: 'Top Rated', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Star size={14} /> },
  fast_responder: { label: 'Fast Responder', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <Zap size={14} /> },
};

const SKILL_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#f97316'];

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuthStore();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification States
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authUser) {
      router.push('/login');
      return;
    }
    const fetchProfile = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/posts/user/my')
        ]);
        setUser({
          ...userRes.data,
          recentPosts: postsRes.data.slice(0, 3), // Get 3 recent posts
          reviews: [] // Keep empty for now as reviews aren't fully implemented
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [authUser, router]);

  if (isLoading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', color: '#6366f1', fontWeight: 700 }}><Loader2 size={24} className="animate-spin" style={{ marginRight: 10 }} /> Loading profile...</div>;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Update basic info
      await api.put('/users/me', { name: editName, bio: editBio });
      // 2. Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      // Refresh profile
      const userRes = await api.get('/users/me');
      setUser((prev: any) => ({ ...prev, ...userRes.data }));
      updateUser(userRes.data);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdFile) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('studentId', studentIdFile);
      await api.post('/users/verify', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      // Refresh profile
      const userRes = await api.get('/users/me');
      setUser((prev: any) => ({ ...prev, ...userRes.data }));
      setIsVerifyModalOpen(false);
      alert('Verification document submitted successfully!');
    } catch (err) {
      console.error('Verification failed:', err);
      alert('Failed to submit document');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallbacks for missing fields
  const displayBadges = user.badges || ['verified'];
  const displaySkills = user.skills || ['React'];
  const displayLocation = user.location || { city: 'Unknown', district: 'Unknown' };
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long' }) : 'Recently';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-5%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 100 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo_web.png" alt="CollabBD" className="logo-light" />
          </Link>
          <Link href="/feed" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#475569', transition: 'color 0.2s' }}>
            <ArrowLeft size={16} /> Back to Feed
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 28 }}>

          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 28, border: '1.5px solid rgba(255,255,255,0.85)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.08)', overflow: 'hidden'
              }}
            >
              {/* Cover gradient */}
              <div style={{ height: 100, background: 'linear-gradient(135deg, #6366f1, #06b6d4, #ec4899)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>

              <div style={{ padding: '0 28px 28px' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: -40, marginBottom: 16 }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32, fontWeight: 900, color: '#fff',
                    border: '4px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    overflow: 'hidden'
                  }}>
                    {user.avatar ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.[0]}
                  </div>
                  {user.isAvailableNow && (
                    <div style={{ position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: '#10b981', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
                  )}
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {user.name}
                </h1>
                <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 700, marginBottom: 12 }}>{user.title || 'CollabBD Member'}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                  <MapPin size={14} color="#94a3b8" /> {displayLocation.city}{displayLocation.district && `, ${displayLocation.district}`}
                  {user.isAvailableNow && <span style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: 12, fontWeight: 700 }}>● Available</span>}
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {displayBadges.map((b: string) => {
                    const cfg = BADGES[b];
                    return cfg ? (
                      <span key={b} style={{ padding: '5px 12px', borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700, border: `1px solid ${cfg.color}30` }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    ) : null;
                  })}
                </div>

                {/* CTA Buttons - Replaced Message/Hire with Profile controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button 
                    onClick={() => {
                      setEditName(user.name);
                      setEditBio(user.bio || '');
                      setAvatarFile(null);
                      setIsEditModalOpen(true);
                    }}
                    style={{ height: 44, borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>

                  {user.accountType === 'worker' && user.verificationStatus !== 'verified' && (
                    <button 
                      onClick={() => setIsVerifyModalOpen(true)}
                      style={{ height: 44, borderRadius: 14, border: '1.5px solid rgba(16,185,129,0.3)', cursor: 'pointer', background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <ShieldCheck size={16} /> 
                      {user.verificationStatus === 'pending' ? 'Verification Pending' : 'Verify Student ID'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '24px' }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>Performance</h3>
              {[
                { label: 'Rating', value: `${user.rating || 0} / 5.0`, icon: Star, color: '#f59e0b', fill: '#f59e0b' },
                { label: 'Completed Jobs', value: user.completedJobs || 0, icon: CheckCircle2, color: '#10b981' },
                { label: 'Avg Response', value: user.responseTime || '< 2 hours', icon: Clock, color: '#6366f1' },
                { label: 'Total Earned', value: `৳${user.totalEarnings || 0}`, icon: TrendingUp, color: '#ec4899' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(148,163,184,0.1)' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={18} color={s.color} strokeWidth={2.5} fill={s.icon === Star ? '#f59e0b' : 'none'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '24px' }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 18 }}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {displaySkills.map((skill: string, i: number) => {
                  const c = SKILL_COLORS[i % SKILL_COLORS.length];
                  return (
                    <span key={skill} style={{ padding: '6px 14px', borderRadius: 999, background: `${c}10`, border: `1px solid ${c}25`, color: c, fontSize: 13, fontWeight: 700 }}>
                      {skill}
                    </span>
                  );
                })}
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '24px' }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Info</h3>
              {[
                { label: 'Education', value: user.education || 'Self Taught', Icon: Award },
                { label: 'Languages', value: user.languages?.join(' · ') || 'Bangla, English', Icon: Globe },
                { label: 'Member since', value: joinedDate, Icon: Users },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 16 : 0 }}>
                  <item.Icon size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 14, color: '#334155', fontWeight: 700 }}>{item.value}</div>
                  </div>
                </div>
              ))}
              
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <Award size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Account Type</div>
                  <div style={{ fontSize: 14, color: '#334155', fontWeight: 700, textTransform: 'capitalize' }}>{user.accountType || 'Client'}</div>
                </div>
              </div>
              
              {user.accountType === 'worker' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <ShieldCheck size={16} color={user.verificationStatus === 'verified' ? '#10b981' : user.verificationStatus === 'pending' ? '#f59e0b' : '#ef4444'} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Verification</div>
                    <div style={{ fontSize: 14, color: user.verificationStatus === 'verified' ? '#10b981' : user.verificationStatus === 'pending' ? '#f59e0b' : '#ef4444', fontWeight: 700, textTransform: 'capitalize' }}>
                      {user.verificationStatus || 'Unverified'}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '32px' }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>About</h2>
              <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.75, fontWeight: 500 }}>{user.bio || 'No bio provided yet.'}</p>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <Star size={15} color="#f59e0b" fill="#f59e0b" />
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.rating || 0}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>({user.reviews.length} reviews)</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {user.reviews.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No reviews yet.</div>
                ) : user.reviews.map((review: any, i: number) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                    style={{ padding: '20px', borderRadius: 18, background: 'rgba(248,250,252,0.7)', border: '1px solid rgba(148,163,184,0.15)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800 }}>
                          {review.avatar}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{review.reviewer}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{new Date(review.date).toLocaleDateString('en-BD', { year: 'numeric', month: 'short' })}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} size={13} color={si < Math.floor(review.rating) ? '#f59e0b' : '#e2e8f0'} fill={si < Math.floor(review.rating) ? '#f59e0b' : '#e2e8f0'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, fontWeight: 500 }}>&quot;{review.text}&quot;</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Active Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '32px' }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20 }}>Active Posts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {user.recentPosts.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No active posts yet.</div>
                ) : user.recentPosts.map((post: any) => (
                  <div key={post._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 16, background: 'rgba(248,250,252,0.7)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>{post.title}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>৳{post.budget?.min?.toLocaleString()} – {post.budget?.max?.toLocaleString()} BDT</div>
                    </div>
                    <span style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: 12, fontWeight: 700 }}>Open</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }} style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Edit Profile</h2>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 15 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Bio</label>
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 15, resize: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Student ID Modal */}
      <AnimatePresence>
        {isVerifyModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }} style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} color="#10b981" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Verify Student ID</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
                Upload a clear photo of your valid university student ID card. Our admins will review it within 24 hours to verify your worker profile.
              </p>
              <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Student ID Photo</label>
                  <input type="file" accept="image/*" onChange={e => setStudentIdFile(e.target.files?.[0] || null)} required style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="button" onClick={() => setIsVerifyModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isSubmitting || !studentIdFile} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: (isSubmitting || !studentIdFile) ? 0.7 : 1 }}>
                    {isSubmitting ? 'Uploading...' : 'Submit Verification'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
