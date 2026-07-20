'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, MapPin, ArrowRight, ArrowLeft, CheckCircle2, Loader2, AlertCircle, Palette, Code2, PenLine, BookOpen, FlaskConical, Camera, Megaphone, Rocket, Music, Globe, MoreHorizontal, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../lib/api';

const CATEGORIES = [
  { key: 'design', label: 'Design', Icon: Palette, color: '#ec4899' },
  { key: 'development', label: 'Development', Icon: Code2, color: '#6366f1' },
  { key: 'writing', label: 'Writing', Icon: PenLine, color: '#8b5cf6' },
  { key: 'tutoring', label: 'Tutoring', Icon: BookOpen, color: '#06b6d4' },
  { key: 'research', label: 'Research', Icon: FlaskConical, color: '#10b981' },
  { key: 'photography', label: 'Photography', Icon: Camera, color: '#f59e0b' },
  { key: 'marketing', label: 'Marketing', Icon: Megaphone, color: '#ef4444' },
  { key: 'startup', label: 'Startup', Icon: Rocket, color: '#f97316' },
  { key: 'music', label: 'Music', Icon: Music, color: '#a855f7' },
  { key: 'language', label: 'Language', Icon: Globe, color: '#14b8a6' },
  { key: 'other', label: 'Other', Icon: MoreHorizontal, color: '#94a3b8' },
];

const CITIES = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur'];

const inputStyle = {
  width: '100%', height: 54, padding: '0 16px',
  background: 'rgba(255,255,255,0.8)',
  border: '1.5px solid rgba(148,163,184,0.35)',
  borderRadius: 14, fontSize: 15, fontWeight: 500, color: '#0f172a',
  outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const,
  fontFamily: "'Inter', sans-serif",
};

const labelStyle = {
  display: 'block' as const, fontSize: 13, fontWeight: 700,
  color: '#334155', marginBottom: 8, letterSpacing: '0.3px',
};

export default function PostNewPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple auth guard
  if (typeof window !== 'undefined' && !useAuthStore.getState().isLoading && !user) {
    router.push('/login');
    return null;
  }

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    budgetMin: '', budgetMax: '', isNegotiable: true,
    deadline: '', isEmergency: false, isRemote: false,
    city: 'Dhaka', skills: '',
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!form.title.trim() || !form.description.trim() || !form.category) {
        setError('Please fill in title, description and select a category.');
        return;
      }
    } else if (step === 2) {
      if (!form.budgetMin || !form.budgetMax) {
        setError('Please provide a budget range.');
        return;
      }
    }
    setStep(s => (s + 1) as 1 | 2 | 3);
  };

  const handleSubmit = async () => {
    if (!form.city) { setError('Please specify a location.'); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        budget: {
          min: Number(form.budgetMin) || 0,
          max: Number(form.budgetMax) || 0,
          currency: 'BDT',
          isNegotiable: form.isNegotiable,
        },
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        isEmergency: form.isEmergency,
        isRemote: form.isRemote,
        location: {
          type: 'Point',
          coordinates: [90.4125, 23.8103], // Default coords
          address: form.city,
          city: form.city,
          district: form.city,
        },
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      };

      await api.post('/posts', payload);
      setDone(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      console.error('Post creation error:', err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accent = CATEGORIES.find(c => c.key === form.category)?.color || '#6366f1';

  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 12px 40px rgba(16,185,129,0.2)' }}>
            <CheckCircle2 size={52} color="#059669" strokeWidth={2} />
          </motion.div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 12 }}>Post Published!</h2>
          <p style={{ fontSize: 17, color: '#64748b', fontWeight: 500 }}>Redirecting you to the feed…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '0', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo_web.png" alt="CollabBD" className="logo-light" />
          </Link>
          <Link href="/feed" style={{ fontSize: 14, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={15} /> Back to Feed
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 10 }}>
            Post a <span style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Need</span>
          </h1>
          <p style={{ fontSize: 17, color: '#64748b', fontWeight: 500 }}>Describe what you need and get proposals from verified nearby talent.</p>
        </motion.div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 5, borderRadius: 999, background: s <= step ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(148,163,184,0.2)', transition: 'background 0.4s', boxShadow: s <= step ? '0 2px 8px rgba(99,102,241,0.3)' : 'none' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36 }}>
          {['What do you need?', 'Budget & Timeline', 'Location & Details'].map((label, i) => (
            <span key={i} style={{ fontSize: 13, fontWeight: i + 1 === step ? 800 : 600, color: i + 1 === step ? '#6366f1' : '#94a3b8', transition: 'color 0.3s' }}>{label}</span>
          ))}
        </div>

        {/* Glass Card */}
        <div style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', borderRadius: 32, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 16px 48px rgba(99,102,241,0.08)', padding: '40px 44px' }}>
          <AnimatePresence mode="wait">
            {/* ── STEP 1: What & Category ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Post Title *</label>
                  <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder="e.g. Need a logo designer for my startup"
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={5}
                    placeholder="Describe what you need in detail. The more specific, the better proposals you'll get."
                    style={{ ...inputStyle, height: 'auto', padding: '14px 16px', resize: 'vertical' as const, lineHeight: 1.6 }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Category *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {CATEGORIES.map(cat => {
                      const active = form.category === cat.key;
                      return (
                        <motion.button
                          key={cat.key}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => set('category', cat.key)}
                          style={{
                            padding: '12px 8px', borderRadius: 14, cursor: 'pointer',
                            background: active ? `${cat.color}15` : 'rgba(248,250,252,0.8)',
                            border: active ? `2px solid ${cat.color}50` : '1.5px solid rgba(148,163,184,0.2)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            transition: 'all 0.2s',
                          }}
                        >
                          <cat.Icon size={20} color={active ? cat.color : '#94a3b8'} strokeWidth={2.5} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: active ? cat.color : '#64748b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cat.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Budget & Timeline ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Budget Range (BDT) *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[
                      { key: 'budgetMin', placeholder: 'Min (e.g. 2000)' },
                      { key: 'budgetMax', placeholder: 'Max (e.g. 10000)' },
                    ].map(f => (
                      <div key={f.key} style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#94a3b8', fontWeight: 700 }}>৳</span>
                        <input type="number" style={{ ...inputStyle, paddingLeft: 32 }}
                          value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.35)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </div>
                    ))}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isNegotiable} onChange={e => set('isNegotiable', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#6366f1' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Budget is negotiable</span>
                  </label>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Skills Required</label>
                  <input style={inputStyle} value={form.skills} onChange={e => set('skills', e.target.value)}
                    placeholder="e.g. Figma, React, Photography (comma separated)"
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Deadline (Optional)</label>
                  <input type="date" style={inputStyle} value={form.deadline} onChange={e => set('deadline', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.35)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Emergency toggle */}
                <div
                  onClick={() => set('isEmergency', !form.isEmergency)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 22px', borderRadius: 18, cursor: 'pointer',
                    background: form.isEmergency ? 'rgba(239,68,68,0.06)' : 'rgba(248,250,252,0.8)',
                    border: form.isEmergency ? '1.5px solid rgba(239,68,68,0.3)' : '1.5px solid rgba(148,163,184,0.2)',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: form.isEmergency ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <Zap size={20} color={form.isEmergency ? '#ef4444' : '#94a3b8'} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: form.isEmergency ? '#ef4444' : '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mark as Emergency</div>
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Get instant notifications sent to available talent nearby</div>
                    </div>
                  </div>
                  <div style={{ width: 48, height: 28, borderRadius: 999, background: form.isEmergency ? '#ef4444' : 'rgba(148,163,184,0.3)', position: 'relative', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: 3, left: form.isEmergency ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.3s' }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Location & Review ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>City *</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.city} onChange={e => set('city', e.target.value)}>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Remote toggle */}
                <div
                  onClick={() => set('isRemote', !form.isRemote)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 22px', borderRadius: 18, cursor: 'pointer', marginBottom: 32,
                    background: form.isRemote ? 'rgba(16,185,129,0.06)' : 'rgba(248,250,252,0.8)',
                    border: form.isRemote ? '1.5px solid rgba(16,185,129,0.3)' : '1.5px solid rgba(148,163,184,0.2)',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: form.isRemote ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={20} color={form.isRemote ? '#10b981' : '#94a3b8'} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: form.isRemote ? '#059669' : '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Remote / Online Work</div>
                      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>This task can be done online — no physical presence needed</div>
                    </div>
                  </div>
                  <div style={{ width: 48, height: 28, borderRadius: 999, background: form.isRemote ? '#10b981' : 'rgba(148,163,184,0.3)', position: 'relative', transition: 'background 0.3s' }}>
                    <div style={{ position: 'absolute', top: 3, left: form.isRemote ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.3s' }} />
                  </div>
                </div>

                {/* Summary preview */}
                <div style={{ padding: '24px', borderRadius: 20, background: 'rgba(99,102,241,0.04)', border: '1.5px solid rgba(99,102,241,0.15)', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 16 }}>Post Preview</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                    {[
                      { label: 'Title', value: form.title || '—' },
                      { label: 'Category', value: CATEGORIES.find(c => c.key === form.category)?.label || '—' },
                      { label: 'Budget', value: form.budgetMin && form.budgetMax ? `৳${form.budgetMin} – ৳${form.budgetMax}` : '—' },
                      { label: 'City', value: form.city },
                      { label: 'Type', value: [form.isEmergency && 'Emergency', form.isRemote && 'Remote'].filter(Boolean).join(' · ') || 'Standard' },
                      { label: 'Skills', value: form.skills || '—' },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 14, color: '#334155', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, color: '#ef4444', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={18} /> {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
            {step > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
                style={{ height: 54, padding: '0 28px', borderRadius: 16, border: '1.5px solid rgba(99,102,241,0.25)', cursor: 'pointer', background: 'rgba(99,102,241,0.06)', color: '#6366f1', fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <ArrowLeft size={18} /> Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={step < 3 ? handleNext : handleSubmit}
              disabled={isSubmitting}
              style={{
                flex: 1, height: 54, borderRadius: 16, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? <Loader2 size={22} className="animate-spin" /> :
                step < 3 ? <>Continue <ArrowRight size={18} strokeWidth={3} /></> : <>Publish Post <CheckCircle2 size={18} strokeWidth={2.5} /></>
              }
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
