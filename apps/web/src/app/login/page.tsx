'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/stats/overview').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      router.push('/feed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f8ff', overflow: 'hidden', position: 'relative' }}>

      {/* ── Ambient Background Blobs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-15%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-slow" style={{ position: 'absolute', top: '35%', right: '35%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 65%)', filter: 'blur(80px)', animationDelay: '-6s' }} />
      </div>

      {/* ══ LEFT PANEL ══ */}
      <div style={{
        flex: '0 0 48%',
        background: 'linear-gradient(145deg, #090e2b 0%, #0d1436 50%, #060a1e 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 64px',
      }}>
        {/* Left panel ambient orbs */}
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 60%)', filter: 'blur(60px)' }} />

        {/* Decorative dots grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '36px 36px', zIndex: 1 }} />

        {/* Decorative glass card in background */}
        {stats?.latestTask && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            style={{
            position: 'absolute', bottom: 80, right: -40, zIndex: 1,
            width: 260, background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)', borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Task Filled</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stats.latestTask.minutesAgo} min ago</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              "{stats.latestTask.title}" — matched recently
            </div>
          </motion.div>
        )}

        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 72 }}
          >
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img src="/logo_web.png" alt="CollabBD" className="logo-light" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)',
              color: '#a5b4fc', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 32,
            }}>
              <ShieldCheck size={16} strokeWidth={2.5} style={{ marginRight: 4 }} /> Welcome back
            </div>

            <h1 style={{
              fontSize: 'clamp(40px, 4.5vw, 60px)',
              fontWeight: 900,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#fff',
              marginBottom: 28,
            }}>
              Your next big <br />
              <span style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                collab
              </span>{' '}
              is <br /> one login away.
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 400, fontWeight: 500 }}>
              Bangladesh&apos;s most trusted platform for local skills, verified talent & real results.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ display: 'flex', gap: 32, marginTop: 56 }}
          >
            {[
              { value: stats ? stats.activeUsers.toLocaleString() + '+' : '...', label: 'Active Users' },
              { value: stats ? Math.max(1, stats.cities).toLocaleString() : '...', label: 'Cities' },
              { value: stats ? stats.jobsDone.toLocaleString() + '+' : '...', label: 'Jobs Done' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glass Card */}
            <div style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderRadius: 32,
              border: '1.5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 24px 64px rgba(99,102,241,0.1), 0 4px 16px rgba(0,0,0,0.06)',
              padding: '52px 48px',
            }}>
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 10 }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" style={{ color: '#6366f1', fontWeight: 700 }}>Sign up →</Link>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: 14, padding: '14px 18px', marginBottom: 24,
                    color: '#ef4444', fontSize: 14, fontWeight: 600,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} strokeWidth={2.5} /> {error}
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8, letterSpacing: '0.3px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Mail size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      style={{
                        width: '100%', height: 54, paddingLeft: 48, paddingRight: 20,
                        background: 'rgba(255,255,255,0.8)',
                        border: '1.5px solid rgba(148,163,184,0.4)',
                        borderRadius: 14, fontSize: 15, fontWeight: 500, color: '#0f172a',
                        outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.4)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', letterSpacing: '0.3px' }}>Password</label>
                    <Link href="#" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>Forgot password?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                      <Lock size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{
                        width: '100%', height: 54, paddingLeft: 48, paddingRight: 52,
                        background: 'rgba(255,255,255,0.8)',
                        border: '1.5px solid rgba(148,163,184,0.4)',
                        borderRadius: 14, fontSize: 15, fontWeight: 500, color: '#0f172a',
                        outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.4)'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    height: 58, borderRadius: 16, border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                    color: '#fff', fontSize: 16, fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
                    transition: 'opacity 0.2s',
                    opacity: isLoading ? 0.7 : 1,
                    marginTop: 4,
                  }}
                >
                  {isLoading
                    ? <Loader2 size={22} className="animate-spin" />
                    : <>Log In <ArrowRight size={20} strokeWidth={3} /></>
                  }
                </motion.button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.25)' }} />
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>New to CollabBD?</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(148,163,184,0.25)' }} />
              </div>

              <Link
                href="/register"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  height: 52, borderRadius: 14,
                  background: 'rgba(99,102,241,0.08)',
                  border: '1.5px solid rgba(99,102,241,0.2)',
                  color: '#6366f1', fontSize: 15, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.14)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
              >
                Create a free account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
