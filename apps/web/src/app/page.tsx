'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  Search,
  ArrowRight,
  Star,
  Briefcase,
  CheckCircle2,
  Globe,
  Clock,
  Palette,
  Code2,
  PenTool,
  BookOpen,
  FlaskConical,
  Camera,
  Megaphone,
  Rocket,
  Languages,
  MoreHorizontal,
  MessageCircle,
  Heart,
  Menu,
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

/* ─── animation helpers ─── */
const fade = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

const categories = [
  { name: 'Design', Icon: Palette, color: '#EC4899', gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' },
  { name: 'Development', Icon: Code2, color: '#3B82F6', gradient: 'linear-gradient(135deg, #eff6ff, #dbeafe)' },
  { name: 'Writing', Icon: PenTool, color: '#8B5CF6', gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' },
  { name: 'Tutoring', Icon: BookOpen, color: '#06B6D4', gradient: 'linear-gradient(135deg, #ecfeff, #cffafe)' },
  { name: 'Research', Icon: FlaskConical, color: '#10B981', gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' },
  { name: 'Photography', Icon: Camera, color: '#F59E0B', gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
  { name: 'Marketing', Icon: Megaphone, color: '#EF4444', gradient: 'linear-gradient(135deg, #fef2f2, #fee2e2)' },
  { name: 'Startup', Icon: Rocket, color: '#6366F1', gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
];

export default function LandingPage() {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteStats, setSiteStats] = useState<any>(null);
  useEffect(() => {
    api.get('/stats/overview').catch(() => null).then(res => res && setSiteStats(res.data));
    
    // Force scroll to top on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f4ff] text-[#1e293b] overflow-x-hidden relative">
      
      {/* ════════════════════════════════════════════
          GLOBAL BACKGROUND ORBS
      ════════════════════════════════════════════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute orb-float-slow"
          style={{
            top: '-10%', left: '-5%', width: '40vw', height: '40vw',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
            filter: 'blur(80px)', borderRadius: '50%'
          }} 
        />
        <div 
          className="absolute orb-float-medium"
          style={{
            top: '20%', right: '-10%', width: '35vw', height: '35vw',
            background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 60%)',
            filter: 'blur(80px)', borderRadius: '50%'
          }} 
        />
        <div 
          className="absolute orb-float-slow"
          style={{
            bottom: '-10%', left: '20%', width: '50vw', height: '50vw',
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)',
            filter: 'blur(100px)', borderRadius: '50%'
          }} 
        />
      </div>

      {/* ════════════════════════════════════════════
          NAVBAR (Premium Floating Glass Pill)
      ════════════════════════════════════════════ */}
      <div style={{ position: 'sticky', top: 20, zIndex: 50, padding: '0 20px', transition: 'all 0.3s ease' }}>
        <header
          className="premium-glass-nav"
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 76,
            borderRadius: 24,
            position: 'relative',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo_web.png" alt="CollabBD" className="logo-light" />
          </Link>

          {/* Nav links Desktop */}
          <nav className="nav-links-desktop">
            {user ? (
              <>
                <Link href="/feed" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}><Search size={16} /> Browse Needs</Link>
                <Link href="/rooms" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}><Users size={16} /> Community</Link>
                <Link href="/map" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}><MapPin size={16} /> Map View</Link>
                <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 44, padding: '0 24px', fontSize: 14 }}>Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}><Search size={16} /> Browse Needs</Link>
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}><Users size={16} /> Community</Link>
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}><MapPin size={16} /> Map View</Link>
                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 600, color: '#475569', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')} onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}><LogIn size={16} /> Log in</Link>
                <Link href="/register" className="btn-primary" style={{ height: 44, padding: '0 24px', fontSize: 14 }}>Get Started</Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu toggle */}
          <button className="nav-mobile-menu" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 12, padding: 8, cursor: 'pointer', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div style={{ 
            position: 'absolute', top: 96, left: 20, right: 20, 
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', 
            padding: '24px', borderRadius: 24, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)', 
            border: '1px solid rgba(255,255,255,0.8)', 
            display: 'flex', flexDirection: 'column', gap: 16, zIndex: 49,
            maxWidth: 1100, margin: '0 auto'
          }}>
             {user ? (
              <>
                <Link href="/feed" style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Browse Needs</Link>
                <Link href="/rooms" style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Community</Link>
                <Link href="/map" style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Map View</Link>
                <Link href="/dashboard" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Dashboard</Link>
              </>
            ) : (
              <>
                <Link href="/login" style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Browse Needs</Link>
                <Link href="/login" style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Community</Link>
                <Link href="/login" style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Map View</Link>
                <Link href="/login" style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Log in</Link>
                <Link href="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '60px 0 140px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            custom={0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.05)',
              color: '#6366f1',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: 40,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Zap size={16} className="text-amber-500" fill="currentColor" /> Bangladesh's Talent Network
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fade}
            initial="hidden"
            animate="show"
            custom={1}
            style={{
              fontSize: 'clamp(44px, 6.5vw, 88px)',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              marginBottom: 28,
              maxWidth: 960,
              textShadow: '0 4px 24px rgba(255,255,255,0.5)',
            }}
          >
            Bangladesh&apos;s{' '}
            <span className="gradient-text">Talent Network.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fade}
            initial="hidden"
            animate="show"
            custom={2}
            style={{
              fontSize: 'clamp(18px, 1.5vw, 22px)',
              color: '#475569',
              lineHeight: 1.7,
              maxWidth: 680,
              marginBottom: 56,
              fontWeight: 500,
            }}
          >
            Stop scrolling Facebook groups. Find trusted, verified students,
            freelancers &amp; experts in your exact city — and hire them in
            minutes, not days.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fade}
            initial="hidden"
            animate="show"
            custom={3}
            style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link href="/feed" className="btn-primary">
              I need someone <Search size={18} strokeWidth={2.5} />
            </Link>
            <Link href="/register" className="btn-secondary">
              I want to work <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS BAR (Glassmorphic)
      ════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1000,
          margin: '-60px auto 0',
          padding: '0 32px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          className="glass-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            borderRadius: 28,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'Active Users', value: siteStats ? siteStats.activeUsers.toLocaleString() + '+' : '...', icon: Users, color: '#6366f1' },
            { label: 'Completed Jobs', value: siteStats ? siteStats.jobsDone.toLocaleString() + '+' : '...', icon: CheckCircle2, color: '#10b981' },
            { label: 'Cities Covered', value: siteStats ? Math.max(1, siteStats.cities).toLocaleString() : '...', icon: Globe, color: '#06b6d4' },
            { label: 'Avg Response', value: '< 5m', icon: Clock, color: '#f59e0b' },
          ].map((s, i) => (
            <div
              key={i}
              className={i < 3 ? 'stat-divider' : ''}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 24px',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 16, background: `${s.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
              }}>
                <s.icon size={24} color={s.color} strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {s.value}
              </span>
              <span style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          VALUE PROPS (Glass Cards)
      ════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '160px 32px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <h2
            style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.03em',
              color: '#0f172a',
              marginBottom: 20,
            }}
          >
            Why Collab<span className="gradient-text">BD</span> Wins
          </h2>
          <p style={{ fontSize: 19, color: '#475569', maxWidth: 600, margin: '0 auto', fontWeight: 500 }}>
            We&apos;re solving the real problems people face every day when
            looking for skilled, trustworthy help in Bangladesh.
          </p>
        </motion.div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              title: 'Verified Trust',
              desc: 'Every user is verified through university email or ID. No more fake profiles or wasted time.',
              icon: ShieldCheck,
              accent: '#6366f1',
              gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)'
            },
            {
              title: 'Hyper-Local Map',
              desc: "Find talent within 3km of you. See exactly who's available nearby on an interactive map.",
              icon: MapPin,
              accent: '#06b6d4',
              gradient: 'linear-gradient(135deg, #ecfeff, #cffafe)'
            },
            {
              title: 'Emergency Tasks',
              desc: 'Need a CV tonight? Post an emergency task and get instant notifications from available people.',
              icon: Zap,
              accent: '#f59e0b',
              badge: 'HOT',
              gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)'
            },
            {
              title: 'Budget Match',
              desc: 'Set your budget range in BDT. Only see providers who match your price point — no surprises.',
              icon: Briefcase,
              accent: '#10b981',
              gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
            },
            {
              title: 'Skill Reputation',
              desc: 'Star ratings, completed job counts, and verified badges build real, visible trust over time.',
              icon: Star,
              accent: '#8b5cf6',
              gradient: 'linear-gradient(135deg, #f5f3ff, #ede9fe)'
            },
            {
              title: 'Community Rooms',
              desc: 'Join rooms like "AI Bangladesh", "IELTS Prep", or "Startup Dhaka" and chat in real time.',
              icon: Users,
              accent: '#ec4899',
              gradient: 'linear-gradient(135deg, #fce7f3, #fbcfe8)'
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              custom={i * 0.15}
              className="glass-card"
              style={{
                position: 'relative',
                padding: '40px 32px',
                cursor: 'default',
                overflow: 'hidden'
              }}
            >
              {/* Background Glow inside card */}
              <div 
                style={{
                  position: 'absolute', top: '-20px', right: '-20px', width: 120, height: 120,
                  background: `radial-gradient(circle, ${f.accent}20 0%, transparent 70%)`,
                  borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none'
                }}
              />

              {f.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#dc2626',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    boxShadow: '0 2px 8px rgba(220,38,38,0.2)'
                  }}
                >
                  {f.badge}
                </span>
              )}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: f.gradient,
                  border: `1px solid ${f.accent}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                  boxShadow: `0 8px 16px ${f.accent}15`,
                }}
              >
                <f.icon size={28} color={f.accent} strokeWidth={2.5} />
              </div>
              <h3
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#0f172a',
                  marginBottom: 12,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: '#475569', fontWeight: 500 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          padding: '140px 0',
          zIndex: 2,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(40px)', zIndex: -1, borderTop: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)' }} />
        
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 32px',
          }}
        >
          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={0}
            style={{ textAlign: 'center', marginBottom: 80 }}
          >
            <h2
              style={{
                fontSize: 'clamp(36px, 4.5vw, 56px)',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.03em',
                color: '#0f172a',
                marginBottom: 20,
              }}
            >
              How It Works
            </h2>
            <p style={{ fontSize: 19, color: '#475569', maxWidth: 540, margin: '0 auto', fontWeight: 500 }}>
              Three simple steps to find the perfect person for your need.
            </p>
          </motion.div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
          >
            {/* Connecting Line */}
            <div style={{ position: 'absolute', top: 60, left: '15%', right: '15%', height: 2, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)', zIndex: 0 }} />

            {[
              {
                step: '1',
                title: 'Post Your Need',
                desc: 'Describe what you need, set your budget, location and deadline. Mark it as emergency if urgent.',
                color: '#6366f1',
                gradient: 'linear-gradient(135deg, #eef2ff, #e0e7ff)'
              },
              {
                step: '2',
                title: 'Get Proposals',
                desc: 'Verified nearby talent sees your post and sends proposals with price, timeline and portfolio.',
                color: '#06b6d4',
                gradient: 'linear-gradient(135deg, #ecfeff, #cffafe)'
              },
              {
                step: '3',
                title: 'Collaborate',
                desc: 'Accept the best proposal, work together, and leave a rating when the job is complete.',
                color: '#10b981',
                gradient: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.2}
                style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
              >
                <div style={{ 
                  width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.8)',
                  border: `4px solid ${s.color}`, margin: '0 auto 32px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 32px ${s.color}25`,
                  backdropFilter: 'blur(10px)'
                }}>
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: `linear-gradient(135deg, ${s.color}, #334155)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {s.step}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    color: '#0f172a',
                    marginBottom: 16,
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: '#475569', maxWidth: 340, margin: '0 auto', fontWeight: 500 }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CATEGORIES
      ════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '160px 32px', position: 'relative', zIndex: 2 }}>
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <h2
            style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.03em',
              color: '#0f172a',
              marginBottom: 20,
            }}
          >
            Explore Categories
          </h2>
          <p style={{ fontSize: 19, color: '#475569', fontWeight: 500 }}>
            Whatever you need — someone nearby can help.
          </p>
        </motion.div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {categories.map((c, i) => (
            <motion.div
              key={i}
              variants={fade}
              initial="hidden"
              whileInView="show"
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true }}
              custom={i * 0.1}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 20, background: c.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                boxShadow: `0 8px 24px ${c.color}20`
              }}>
                <c.Icon size={32} color={c.color} strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#1e293b',
                }}
              >
                {c.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA BANNER (Glassmorphic)
      ════════════════════════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(40px, 8vw, 80px) 24px clamp(80px, 12vw, 160px)', position: 'relative', zIndex: 2 }}>
        <motion.div
          variants={scaleUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          custom={0}
          className="glass-card"
          style={{
            position: 'relative',
            borderRadius: 'clamp(24px, 5vw, 40px)',
            overflow: 'hidden',
            padding: 'clamp(40px, 8vw, 100px) clamp(24px, 5vw, 60px)',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.7)',
            border: '2px solid rgba(255,255,255,0.9)',
            boxShadow: '0 24px 64px rgba(99,102,241,0.15)',
          }}
        >
          {/* Internal Glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 4.5vw, 56px)',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.02em',
                color: '#0f172a',
                marginBottom: 24,
                lineHeight: 1.1,
              }}
            >
              Ready to find your next collaborator?
            </h2>
            <p
              style={{
                fontSize: 20,
                color: '#475569',
                marginBottom: 48,
                maxWidth: 600,
                margin: '0 auto 48px',
                fontWeight: 500,
              }}
            >
              Join thousands of students and professionals across Bangladesh.
            </p>
            <Link
              href="/register"
              className="btn-primary"
              style={{ height: 60, padding: '0 48px', fontSize: 18, borderRadius: 20 }}
            >
              Create Free Account <ArrowRight size={20} strokeWidth={3} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.1)', padding: '72px 32px 40px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
            {/* Brand */}
            <div>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <img src="/logo_web.png" alt="CollabBD" className="logo-light" />
              </Link>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, fontWeight: 500, maxWidth: 320, marginBottom: 24 }}>
                Bangladesh's most trusted hyper-local talent network. Find verified students, freelancers & experts in your city.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Made in Bangladesh'].map(badge => (
                  <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#6366f1', fontSize: 12, fontWeight: 700 }}>
                    <ShieldCheck size={12} strokeWidth={2.5} />{badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>Platform</h4>
              {[
                { label: 'Browse Needs', href: '/feed' },
                { label: 'Community Rooms', href: '/rooms' },
                { label: 'Map View', href: '/map' },
                { label: 'Post a Need', href: '/post/new' },
                { label: 'Dashboard', href: '/dashboard' },
              ].map(link => (
                <Link key={link.label} href={link.href} style={{ display: 'block', fontSize: 15, color: '#475569', fontWeight: 600, marginBottom: 12, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >{link.label}</Link>
              ))}
            </div>

            {/* Account */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>Account</h4>
              {[
                { label: 'Create Account', href: '/register' },
                { label: 'Log In', href: '/login' },
                { label: 'My Profile', href: '/profile' },
              ].map(link => (
                <Link key={link.label} href={link.href} style={{ display: 'block', fontSize: 15, color: '#475569', fontWeight: 600, marginBottom: 12, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >{link.label}</Link>
              ))}
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>Company</h4>
              {['About Us', 'Privacy Policy', 'Terms of Service', 'Help Center', 'Contact'].map(t => (
                <Link key={t} href="#" style={{ display: 'block', fontSize: 15, color: '#475569', fontWeight: 600, marginBottom: 12, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                >{t}</Link>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ paddingTop: 32, borderTop: '1px solid rgba(148,163,184,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
              &copy; {new Date().getFullYear()} CollabBD. All rights reserved.
            </span>
            <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Built with <Heart size={13} fill="#ef4444" color="#ef4444" /> for Bangladesh
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
