'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, Zap, AlertCircle, MapPin, Globe, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<'client' | 'worker'>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState('');
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    api.get('/stats/overview').then(res => setStats(res.data)).catch(console.error);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, password, accountType });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendSuccess('');
    setIsLoading(true);
    try {
      await api.post('/auth/verify-email', { email, otp });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setResendSuccess('');
    try {
      await api.post('/auth/resend-otp', { email });
      setResendSuccess('A new OTP has been sent to your email!');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="auth-layout" style={{ background: '#f8f5ff', position: 'relative' }}>

      {/* ── Ambient Background Blobs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-slow" style={{ position: 'absolute', top: '40%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', filter: 'blur(80px)', animationDelay: '-6s' }} />
      </div>

      {/* ══ LEFT PANEL ══ */}
      <div className="auth-left-panel" style={{ background: 'linear-gradient(145deg, #1e0a3c 0%, #120827 40%, #0a0518 100%)' }}>
        {/* Left panel orbs */}
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 60%)', filter: 'blur(60px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 60%)', filter: 'blur(60px)' }} />

        {/* Decorative grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '36px 36px', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 40 }}
          >
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img src="/logo_web.png" alt="CollabBD" className="logo-dark" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 999,
              background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)',
              color: '#c4b5fd', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.6px', textTransform: 'uppercase',
              marginBottom: 32,
            }}>
              <Zap size={14} strokeWidth={2.5} style={{ marginRight: 4 }} /> Bangladesh&apos;s #1 Talent Platform
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
              Start your <br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                career journey
              </span>
              <br /> right here.
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 420, marginBottom: 56, fontWeight: 500 }}>
              Join {stats ? stats.activeUsers.toLocaleString() : '...'} verified students & professionals across {stats ? Math.max(1, stats.cities).toLocaleString() : '...'} cities of Bangladesh.
            </p>
          </motion.div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            {[
              { icon: <CheckCircle2 size={18} color="#4ade80" strokeWidth={2.5} />, text: 'University-verified profiles' },
              { icon: <MapPin size={18} color="#60a5fa" strokeWidth={2.5} />, text: 'Find talent within 3km' },
              { icon: <Zap size={18} color="#facc15" strokeWidth={2.5} />, text: 'Emergency tasks filled in < 5 min' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="auth-right-panel">
        <div style={{ width: '100%', maxWidth: 480 }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step 1: Role Selection */}
                <div style={{
                  background: 'rgba(255,255,255,0.62)',
                  backdropFilter: 'blur(32px)',
                  WebkitBackdropFilter: 'blur(32px)',
                  borderRadius: 32,
                  border: '1.5px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 24px 64px rgba(139,92,246,0.12), 0 4px 16px rgba(0,0,0,0.06)',
                  padding: '52px 48px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                }}>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 8 }}>
                      How do you want to use CollabBD?
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 15 }}>
                      We'll tailor your experience based on your needs.
                    </p>
                  </div>

                  <button
                    onClick={() => setAccountType('client')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: '24px',
                      borderRadius: 20, border: accountType === 'client' ? '2px solid #8b5cf6' : '2px solid transparent',
                      background: accountType === 'client' ? 'rgba(139,92,246,0.05)' : '#f8fafc',
                      transition: 'all 0.2s', textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={24} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>I want to Hire</div>
                      <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>Find trusted students and freelancers for your tasks.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setAccountType('worker')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: '24px',
                      borderRadius: 20, border: accountType === 'worker' ? '2px solid #8b5cf6' : '2px solid transparent',
                      background: accountType === 'worker' ? 'rgba(139,92,246,0.05)' : '#f8fafc',
                      transition: 'all 0.2s', textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Zap size={24} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>I want to Work</div>
                      <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>Find nearby tasks and earn money. Requires Student ID.</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary"
                    style={{ width: '100%', height: 52, fontSize: 16, marginTop: 12 }}
                  >
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Glass Card */}
                <div style={{
                  background: 'rgba(255,255,255,0.62)',
                  backdropFilter: 'blur(32px)',
                  WebkitBackdropFilter: 'blur(32px)',
                  borderRadius: 32,
                  border: '1.5px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 24px 64px rgba(139,92,246,0.12), 0 4px 16px rgba(0,0,0,0.06)',
                  padding: '52px 48px',
                }}>
                  <div style={{ marginBottom: 40 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Step 1 of 2</p>
                    <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 10 }}>
                      Create Account
                    </h2>
                    <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>
                      Already have one?{' '}
                      <Link href="/login" style={{ color: '#8b5cf6', fontWeight: 700 }}>Log in →</Link>
                    </p>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '14px 18px', marginBottom: 24, color: '#ef4444', fontSize: 14, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={16} strokeWidth={2.5} /> {error}
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                    {[
                      { label: 'Full Name', icon: User, type: 'text', value: name, setter: setName, placeholder: 'e.g. Mehedi Hasan' },
                      { label: 'Email Address', icon: Mail, type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
                    ].map((field) => (
                      <div key={field.label}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8, letterSpacing: '0.3px' }}>
                          {field.label}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <field.icon size={18} strokeWidth={2.5} />
                          </div>
                          <input
                            type={field.type}
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            required
                            placeholder={field.placeholder}
                            style={{
                              width: '100%', height: 54, paddingLeft: 48, paddingRight: 20,
                              background: 'rgba(255,255,255,0.8)',
                              border: '1.5px solid rgba(148,163,184,0.4)',
                              borderRadius: 14, fontSize: 15, fontWeight: 500, color: '#0f172a',
                              outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                              fontFamily: "'Inter', sans-serif",
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.12)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(148,163,184,0.4)'; e.target.style.boxShadow = 'none'; }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Password field */}
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                          <Lock size={18} strokeWidth={2.5} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder="Min. 6 characters"
                          style={{
                            width: '100%', height: 54, paddingLeft: 48, paddingRight: 52,
                            background: 'rgba(255,255,255,0.8)',
                            border: '1.5px solid rgba(148,163,184,0.4)',
                            borderRadius: 14, fontSize: 15, fontWeight: 500, color: '#0f172a',
                            outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                            fontFamily: "'Inter', sans-serif",
                          }}
                          onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.12)'; }}
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
                      whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(139,92,246,0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        height: 58, borderRadius: 16, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        color: '#fff', fontSize: 16, fontWeight: 800,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
                        transition: 'opacity 0.2s',
                        opacity: isLoading ? 0.7 : 1,
                        marginTop: 4,
                      }}
                    >
                      {isLoading ? <Loader2 size={22} className="animate-spin" /> : <>Continue <ArrowRight size={20} strokeWidth={3} /></>}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.62)',
                  backdropFilter: 'blur(32px)',
                  WebkitBackdropFilter: 'blur(32px)',
                  borderRadius: 32,
                  border: '1.5px solid rgba(255,255,255,0.85)',
                  boxShadow: '0 24px 64px rgba(16,185,129,0.1), 0 4px 16px rgba(0,0,0,0.06)',
                  padding: '52px 48px',
                  textAlign: 'center',
                }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 24px rgba(16,185,129,0.2)' }}>
                    <CheckCircle2 size={40} color="#059669" strokeWidth={2.5} />
                  </motion.div>

                  <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Step 2 of 2</p>
                  <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 12 }}>
                    Verify your email
                  </h2>
                  <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, fontWeight: 500, marginBottom: 36 }}>
                    We&apos;ve sent a 6-digit code to<br />
                    <strong style={{ color: '#0f172a', fontWeight: 700 }}>{email}</strong>
                  </p>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '14px 18px', marginBottom: 24, color: '#ef4444', fontSize: 14, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={16} strokeWidth={2.5} /> {error}
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      placeholder="000000"
                      style={{
                        width: '100%', height: 100, textAlign: 'center',
                        fontSize: 36, fontWeight: 900, letterSpacing: '0.6em',
                        background: 'rgba(255,255,255,0.8)',
                        border: '2px solid rgba(16,185,129,0.3)',
                        borderRadius: 18, color: '#0f172a',
                        outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.12)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(16,185,129,0.3)'; e.target.style.boxShadow = 'none'; }}
                    />

                    <motion.button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      whileHover={{ scale: otp.length === 6 ? 1.02 : 1 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        height: 58, borderRadius: 16, border: 'none',
                        cursor: isLoading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                        background: otp.length === 6
                          ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                          : 'rgba(148,163,184,0.3)',
                        color: otp.length === 6 ? '#fff' : '#94a3b8',
                        fontSize: 16, fontWeight: 800,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: otp.length === 6 ? '0 8px 24px rgba(16,185,129,0.3)' : 'none',
                        transition: 'all 0.3s',
                      }}
                    >
                      {isLoading ? <Loader2 size={22} className="animate-spin" /> : 'Verify & Finish'}
                    </motion.button>

                    {resendSuccess && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: '12px 18px', color: '#059669', fontSize: 14, fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle2 size={16} strokeWidth={2.5} /> {resendSuccess}
                        </div>
                      </motion.div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                      <button type="button" onClick={handleResendOtp}
                        disabled={resendCooldown > 0}
                        style={{
                          background: 'none', border: 'none', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                          fontSize: 14, fontWeight: 700, color: resendCooldown > 0 ? '#cbd5e1' : '#8b5cf6',
                          transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                        }}
                      >
                        <RefreshCw size={14} strokeWidth={2.5} />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>

                      <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setResendSuccess(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#94a3b8', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#64748b')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        ← Back to registration
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
