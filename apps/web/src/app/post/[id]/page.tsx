'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Briefcase, Users, Star,
  CheckCircle2, Zap, Globe, Shield, Send, Loader2,
  DollarSign, Eye, MessageCircle, ShieldCheck, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';

const CAT_COLOR: Record<string, string> = {
  development: '#6366f1', design: '#ec4899', writing: '#8b5cf6',
  tutoring: '#06b6d4', research: '#10b981', photography: '#f59e0b',
  marketing: '#ef4444', startup: '#6366f1',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposal, setProposal] = useState('');
  const [budget, setBudget] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/${params.id}`);
        setPost(res.data);
        // Check if user already applied
        const myApps = await api.get('/applications/my').catch(() => ({ data: [] }));
        const alreadyApplied = myApps.data.some((a: any) =>
          (a.post?._id || a.post) === params.id
        );
        setHasApplied(alreadyApplied);
        // If owner, fetch applications
        if (res.data.postedBy?._id === user._id || String(res.data.postedBy) === user._id) {
          const appsRes = await api.get(`/applications/post/${params.id}`).catch(() => ({ data: [] }));
          setApplications(appsRes.data);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [params.id, user, router]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    if (!proposal.trim()) { setApplyError('Please write a proposal'); return; }
    setIsApplying(true);
    try {
      await api.post(`/applications/${params.id}`, { proposal, budget: parseFloat(budget) || post?.budget?.min });
      setApplySuccess('Application submitted successfully!');
      setHasApplied(true);
      setTimeout(() => { setShowApplyModal(false); setApplySuccess(''); }, 2000);
    } catch (err: any) {
      setApplyError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const handleMessage = async (recipientId: string) => {
    try {
      await api.post('/messages/conversations', { recipientId });
      alert('Conversation started! Head to the Messages tab in your Dashboard to chat.');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to start conversation');
    }
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff' }}>
      <Loader2 size={36} color="#6366f1" className="animate-spin" />
    </div>
  );

  if (!post) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', gap: 16 }}>
      <AlertCircle size={48} color="#ef4444" />
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Post not found</h2>
      <Link href="/feed" style={{ color: '#6366f1', fontWeight: 700 }}>← Back to Feed</Link>
    </div>
  );

  const accent = CAT_COLOR[post.category] || '#6366f1';
  const isOwner = post.postedBy?._id === user?._id || String(post.postedBy?._id) === user?._id;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', position: 'relative' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${accent}15 0%, transparent 65%)`, filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <Link href="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', fontWeight: 700, fontSize: 14, marginBottom: 28, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <ArrowLeft size={16} /> Back to Feed
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Post card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 28, border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {/* Accent bar */}
              <div style={{ height: 5, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
              <div style={{ padding: '36px' }}>
                {/* Badges row */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                  <span style={{ padding: '4px 14px', borderRadius: 999, background: `${accent}15`, color: accent, fontSize: 12, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'capitalize' }}>{post.category}</span>
                  {post.isEmergency && <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 14px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 800 }}><Zap size={12} /> Urgent</span>}
                  {post.isRemote && <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: 12, fontWeight: 800 }}><Globe size={12} /> Remote OK</span>}
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={14} /> {post.views || 0} views</span>
                </div>

                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.3, marginBottom: 16 }}>{post.title}</h1>

                <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#64748b', fontWeight: 600, marginBottom: 28, flexWrap: 'wrap' }}>
                  {post.location?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={15} color="#94a3b8" />{post.location.city}</span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={15} color="#94a3b8" />{timeAgo(post.createdAt)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={15} color="#94a3b8" />{post.applicationsCount || 0} proposals</span>
                </div>

                <div style={{ fontSize: 16, color: '#334155', lineHeight: 1.8, fontWeight: 500, marginBottom: 28 }}>{post.description}</div>

                {/* Skills needed */}
                {post.skills?.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#475569', marginBottom: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>SKILLS REQUIRED</h3>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {post.skills.map((s: string) => (
                        <span key={s} style={{ padding: '6px 16px', borderRadius: 999, background: `${accent}10`, color: accent, fontSize: 13, fontWeight: 700, border: `1px solid ${accent}20` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget */}
                <div style={{ padding: '20px 24px', borderRadius: 18, background: `${accent}08`, border: `1px solid ${accent}20`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={20} color={accent} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Budget Range</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      ৳{post.budget?.min?.toLocaleString()} – ৳{post.budget?.max?.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Applications list (owner only) */}
            {isOwner && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 28, border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', padding: '32px' }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 20 }}>Proposals Received ({applications.length})</h2>
                {applications.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>No proposals yet. Your post is live!</div>
                ) : applications.map((app: any) => (
                  <div key={app._id} style={{ display: 'flex', gap: 16, padding: '20px', borderRadius: 18, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)', marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 20, flexShrink: 0 }}>
                      {app.applicant?.name?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{app.applicant?.name}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: accent }}>৳{app.budget?.toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{app.proposal}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, display: 'flex', gap: 12 }}>
                        <span>{timeAgo(app.createdAt)}</span>
                        {app.applicant?.rating > 0 && <span>⭐ {app.applicant.rating.toFixed(1)}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleMessage(app.applicant._id)} style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: 'rgba(99,102,241,0.1)', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.color = '#6366f1'; }}
                      title="Message applicant"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Posted by card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', padding: '28px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#475569', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>POSTED BY</h3>
              <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 22, flexShrink: 0 }}>
                  {post.postedBy?.avatar ? <img src={post.postedBy.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="avatar" /> : post.postedBy?.name?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{post.postedBy?.name}</div>
                  {post.postedBy?.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#f59e0b', fontWeight: 700 }}><Star size={13} fill="#f59e0b" />{post.postedBy.rating.toFixed(1)}</div>
                  )}
                  {post.postedBy?.location?.city && <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{post.postedBy.location.city}</div>}
                </div>
              </div>
              {post.postedBy?.bio && <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{post.postedBy.bio}</p>}
              {!isOwner && (
                <button onClick={() => handleMessage(post.postedBy._id)} style={{ width: '100%', padding: '12px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: 'transparent', color: '#475569', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                >
                  <MessageCircle size={16} /> Message Owner
                </button>
              )}
            </motion.div>

            {/* Apply CTA */}
            {!isOwner && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ background: `linear-gradient(135deg, ${accent}f0, ${accent}cc)`, borderRadius: 24, padding: '28px', boxShadow: `0 12px 32px ${accent}40` }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Interested?</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 20, lineHeight: 1.6 }}>Send your proposal and stand out from the crowd.</p>
                {hasApplied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, fontSize: 15 }}>
                    <CheckCircle2 size={20} /> Application Sent!
                  </div>
                ) : (
                  <button onClick={() => setShowApplyModal(true)} style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: '#fff', color: accent, fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 16px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Send size={18} /> Apply Now
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#fff', borderRadius: 28, padding: 40, maxWidth: 520, width: '100%', boxShadow: '0 32px 64px rgba(0,0,0,0.15)' }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>Send Proposal</h2>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>For: <strong>{post.title}</strong></p>
              {applySuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32 }}>
                  <CheckCircle2 size={48} color="#10b981" />
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>Applied Successfully!</div>
                </div>
              ) : (
                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {applyError && <div style={{ padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 14, fontWeight: 600 }}>{applyError}</div>}
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Your Proposal *</label>
                    <textarea rows={5} required value={proposal} onChange={e => setProposal(e.target.value)} placeholder="Describe why you're the best fit, your approach, and timeline..." style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #e2e8f0', fontSize: 15, fontFamily: "'Plus Jakarta Sans', sans-serif", resize: 'vertical', outline: 'none' }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Your Budget (৳)</label>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder={`e.g. ${post.budget?.min}`} style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: '1.5px solid #e2e8f0', fontSize: 15, outline: 'none' }} onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="button" onClick={() => setShowApplyModal(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={isApplying} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {isApplying ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Submit Proposal</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
