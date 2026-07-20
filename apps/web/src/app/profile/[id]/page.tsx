'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, MapPin, Star, CheckCircle2, Clock, Globe,
  Award, TrendingUp, Zap, ArrowLeft, Briefcase, Loader2, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { avatarUrl } from '../../../lib/avatar';
import { useAuthStore } from '../../../store/authStore';

const SKILL_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#06b6d4','#8b5cf6','#ef4444','#f97316'];

const BADGES: Record<string, { label: string; color: string; bg: string }> = {
  verified:      { label: 'Verified',       color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  top_rated:     { label: 'Top Rated',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  fast_responder:{ label: 'Fast Responder', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  student:       { label: 'Student',        color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'  },
  freelancer:    { label: 'Freelancer',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  expert:        { label: 'Expert',         color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Redirect to own profile page if viewing self
    if (authUser && authUser._id === id) { router.replace('/profile'); return; }
    api.get(`/users/${id}`)
      .then(res => setUser(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, authUser, router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', color: '#6366f1', fontWeight: 700 }}>
      <Loader2 size={24} className="animate-spin" style={{ marginRight: 10 }} /> Loading profile...
    </div>
  );

  if (notFound || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Profile not found</h1>
      <Link href="/feed" style={{ color: '#6366f1', fontWeight: 700 }}>← Back to Feed</Link>
    </div>
  );

  const loc = user.location || {};
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long' })
    : 'Recently';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-5%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo_web.png" alt="CollabBD" className="logo-light" />
          </Link>
          <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28 }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 28, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 32px rgba(99,102,241,0.08)', overflow: 'hidden' }}>
              <div style={{ height: 100, background: 'linear-gradient(135deg, #6366f1, #06b6d4, #ec4899)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>
              <div style={{ padding: '0 28px 28px' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginTop: -40, marginBottom: 16 }}>
                  <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff', border: '4px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden' }}>
                    {user.avatar ? <img src={avatarUrl(user.avatar)!} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.[0]}
                  </div>
                  {user.isAvailableNow && <div style={{ position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: '#10b981', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />}
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 4 }}>{user.name}</h1>
                <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 700, marginBottom: 10 }}>{user.title || 'CollabBD Member'}</p>

                {user.hourlyRate > 0 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                    ৳{user.hourlyRate}/hr
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                  <MapPin size={14} color="#94a3b8" /> {loc.city}{loc.district && `, ${loc.district}`}
                  {user.isAvailableNow && <span style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: '#059669', fontSize: 12, fontWeight: 700 }}>● Available</span>}
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {(user.badges || []).map((b: string) => {
                    const cfg = BADGES[b];
                    return cfg ? (
                      <span key={b} style={{ padding: '5px 12px', borderRadius: 999, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 700, border: `1px solid ${cfg.color}30` }}>{cfg.label}</span>
                    ) : null;
                  })}
                </div>

                {/* CTA Buttons */}
                {authUser ? (
                  <button onClick={async () => {
                    try {
                      await api.post('/messages/conversations', { recipientId: id });
                      router.push('/dashboard?tab=Messages');
                    } catch { alert('Failed to start conversation'); }
                  }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 44, borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}>
                    <MessageCircle size={16} /> Message
                  </button>
                ) : (
                  <Link href="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(99,102,241,0.25)', textDecoration: 'none' }}>
                    Login to Contact
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>Performance</h3>
              {[
                { label: 'Rating',         value: `${user.rating || 0} / 5.0`,          icon: Star,         color: '#f59e0b' },
                { label: 'Completed Jobs', value: user.completedJobs || 0,              icon: CheckCircle2, color: '#10b981' },
                { label: 'Member Since',   value: joinedDate,                           icon: Clock,        color: '#6366f1' },
                { label: 'Account Type',   value: user.accountType || 'Client',         icon: TrendingUp,   color: '#ec4899' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(148,163,184,0.1)' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={18} color={s.color} strokeWidth={2.5} fill={s.icon === Star ? '#f59e0b' : 'none'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'capitalize' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Skills */}
            {(user.skills?.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
                style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '24px' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 18 }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {user.skills.map((skill: string, i: number) => {
                    const c = SKILL_COLORS[i % SKILL_COLORS.length];
                    return <span key={skill} style={{ padding: '6px 14px', borderRadius: 999, background: `${c}10`, border: `1px solid ${c}25`, color: c, fontSize: 13, fontWeight: 700 }}>{skill}</span>;
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Bio */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.6 }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '32px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 14 }}>About</h2>
              <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.75, fontWeight: 500 }}>{user.bio || 'No bio provided yet.'}</p>
            </motion.div>

            {/* Qualifications */}
            {(user.qualifications?.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
                style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '32px' }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={18} color="#6366f1" /> Qualifications
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {user.qualifications.map((q: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 20px', borderRadius: 16, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Award size={18} color="#6366f1" />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{q.title}</div>
                        <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>{q.organization}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{q.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Portfolio */}
            {(user.portfolio?.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
                style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(99,102,241,0.06)', padding: '32px' }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={18} color="#ec4899" /> Portfolio Works
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {user.portfolio.map((p: any, i: number) => (
                    <a key={i} href={p.link} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px', borderRadius: 16, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)', textDecoration: 'none', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={18} color="#ec4899" />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>View Project →</div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Verification status */}
            {user.verificationStatus === 'verified' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 28px', background: 'rgba(16,185,129,0.06)', border: '1.5px solid rgba(16,185,129,0.2)', borderRadius: 20 }}>
                <ShieldCheck size={24} color="#10b981" />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>Verified Worker</div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Identity and student credentials have been verified by CollabBD.</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
