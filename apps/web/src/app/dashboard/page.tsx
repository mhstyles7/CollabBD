'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, LayoutDashboard, Briefcase, MessageCircle, Bell,
  Settings, Star, TrendingUp, CheckCircle2, Clock, Users,
  Zap, ChevronRight, Eye, Plus, MapPin, LogOut, ArrowUpRight, FileText,
  Send, Lock, User, X, Check, AlertCircle, Shield
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { io, Socket } from 'socket.io-client';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  in_progress: { label: 'In Progress', color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  completed: { label: 'Completed', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  pending: { label: 'Pending', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  accepted: { label: 'Accepted', color: '#059669', bg: 'rgba(16,185,129,0.1)' },
};

const BASE_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: Briefcase, label: 'My Posts', href: '/dashboard/posts', active: false },
  { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages', active: false },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', active: false },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', active: false },
];

const CAT_COLORS: Record<string, string> = {
  development: '#6366f1', design: '#ec4899', research: '#10b981',
  writing: '#8b5cf6', tutoring: '#06b6d4', marketing: '#ef4444',
};

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [dmInput, setDmInput] = useState('');
  const [isSendingDm, setIsSendingDm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Admin states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);

  const navItems = user?.role === 'admin' 
    ? [...BASE_NAV_ITEMS, { icon: Shield, label: 'Admin', href: '/dashboard/admin', active: false }] 
    : BASE_NAV_ITEMS;
  const [socket, setSocket] = useState<Socket | null>(null);
  // Settings state
  const [settingsTab, setSettingsTab] = useState<'password'|'account'>('password');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [postsRes, appsRes, notifsRes, convsRes] = await Promise.allSettled([
          api.get('/posts/user/my'),
          api.get('/applications/received'),
          api.get('/notifications'),
          api.get('/messages/conversations'),
        ]);

        if (postsRes.status === 'fulfilled') setMyPosts(postsRes.value.data || []);
        if (appsRes.status === 'fulfilled') setRecentApplications(appsRes.value.data || []);
        if (notifsRes.status === 'fulfilled') setNotifications(notifsRes.value.data?.notifications || []);
        if (convsRes.status === 'fulfilled') {
          setConversations(convsRes.value.data || []);
          if (user.role === 'admin') {
            const [usersRes, statsRes] = await Promise.allSettled([
              api.get('/admin/users?status=pending'),
              api.get('/admin/stats')
            ]);
            if (usersRes.status === 'fulfilled') setAdminUsers(usersRes.value.data.users);
            if (statsRes.status === 'fulfilled') setAdminStats(statsRes.value.data);
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Socket Connection for Notifications
    const token = localStorage.getItem('collab_bd_token');
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, { auth: { token } });

    newSocket.on('connect', () => {
      console.log('Dashboard connected to socket');
    });

    newSocket.on('new_application', (app) => {
      setNotifications(prev => [{
        id: app._id || Date.now(),
        icon: 'proposal',
        text: `New proposal received from ${app.applicant?.name || 'someone'} for your post.`,
        time: 'Just now',
        unread: true,
      }, ...prev]);
      // Also optimistic update the recent apps list
      setRecentApplications(prev => [app, ...prev]);
    });

    newSocket.on('dm_received', (msg: any) => {
      setConvMessages(prev => [...prev, msg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, router]);

  const openConversation = async (conv: any) => {
    setActiveConv(conv);
    socket?.emit('join_conversation', conv._id);
    const res = await api.get(`/messages/conversations/${conv._id}/messages`);
    setConvMessages(res.data);
    // refresh convs to reset unread
    const convsRes = await api.get('/messages/conversations').catch(() => ({ data: [] }));
    setConversations(convsRes.data || []);
  };

  const sendDm = async () => {
    if (!dmInput.trim() || !activeConv || isSendingDm) return;
    setIsSendingDm(true);
    const text = dmInput.trim();
    setDmInput('');
    try {
      socket?.emit('send_dm', { conversationId: activeConv._id, content: text });
      const res = await api.post(`/messages/conversations/${activeConv._id}/messages`, { content: text });
      setConvMessages(prev => [...prev, res.data]);
    } catch { setDmInput(text); }
    finally { setIsSendingDm(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/me/password', { oldPassword, newPassword });
      setSettingsMsg('Password changed successfully!');
      setOldPassword(''); setNewPassword('');
    } catch (err: any) {
      setSettingsMsg(err.response?.data?.message || 'Failed to change password');
    }
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (isLoading || !user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', color: '#6366f1', fontWeight: 700 }}>Loading dashboard...</div>;
  }

  const activePostsCount = myPosts.filter(p => p.status === 'open').length;
  const stats = [
    { label: 'Active Posts', value: activePostsCount, icon: Briefcase, color: '#6366f1', change: 'Current' },
    { label: 'Proposals Received', value: recentApplications.length, icon: Users, color: '#ec4899', change: 'Total' },
    { label: 'Jobs Completed', value: user.completedJobs || 0, icon: CheckCircle2, color: '#10b981', change: 'All time' },
    { label: 'Avg Rating', value: `${user.rating || 0}`, icon: Star, color: '#f59e0b', change: 'User Rating' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="orb-float-slow" style={{ position: 'absolute', top: '-5%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-float-medium" style={{ position: 'absolute', bottom: '0', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 260, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
        background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(99,102,241,0.1)', display: 'flex', flexDirection: 'column',
        padding: '28px 16px', zIndex: 40,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, padding: '0 8px' }}>
          <img src="/logo_web.png" alt="CollabBD" style={{ height: 'auto', maxHeight: 120, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
        </Link>

        {/* User mini-card */}
        <div style={{ padding: '16px', borderRadius: 18, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.04))', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user.name[0]}
              </div>
              {user.isAvailableNow && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#10b981', border: '2px solid #fff' }} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{user.title}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <motion.button
                key={item.label}
                whileHover={{ x: 3 }}
                onClick={() => setActiveNav(item.label)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14, marginBottom: 4, border: 'none', cursor: 'pointer',
                  background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))' : 'transparent',
                  color: isActive ? '#6366f1' : '#64748b',
                  fontSize: 15, fontWeight: isActive ? 800 : 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
              >
                <item.icon size={18} strokeWidth={2.5} />
                {item.label}
                {item.label === 'Notifications' && notifications.filter(n => !n.isRead).length > 0 && (
                  <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
                {item.label === 'Admin' && adminUsers.length > 0 && (
                  <span style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {adminUsers.length}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <button onClick={() => { logout(); router.push('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", width: '100%', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
        >
          <LogOut size={17} /> Logout
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px 36px', position: 'relative', zIndex: 1 }}>
        {activeNav === 'Dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 4 }}>
              Good to see you, {user.name.split(' ')[0]}
            </h1>
            <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>Here's what's happening with your CollabBD account.</p>
          </div>
          <Link href="/post/new" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 24px', borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 6px 20px rgba(99,102,241,0.28)' }}>
            <Plus size={18} strokeWidth={3} /> Post a Need
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 22, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '24px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${stat.color}12`, filter: 'blur(20px)' }} />
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `1px solid ${stat.color}20` }}>
                <stat.icon size={22} color={stat.color} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 12, color: stat.color, fontWeight: 700 }}>{stat.change}</div>
            </motion.div>
          ))}
        </div>

        {/* My Posts + Notifications */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, marginBottom: 24 }}>

          {/* My Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Active Posts</h2>
              <Link href="/feed" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4 }}>View All <ArrowUpRight size={14} /></Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myPosts.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No active posts yet.</div>
              ) : myPosts.slice(0, 5).map((post) => {
                const sc = STATUS_CONFIG[post.status] || STATUS_CONFIG.open;
                const cc = CAT_COLORS[post.category] || '#6366f1';
                return (
                  <div key={post._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderRadius: 16, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)', transition: 'border-color 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = `${cc}30`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.12)'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} color="#94a3b8" /> {post.applicationsCount || 0} proposals</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} color="#94a3b8" /> {post.views || 0} views</span>
                        <span>৳{post.budget?.min?.toLocaleString()} – {post.budget?.max?.toLocaleString()}</span>
                      </div>
                    </div>
                    <span style={{ marginLeft: 16, padding: '5px 14px', borderRadius: 999, background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', border: `1px solid ${sc.color}25` }}>
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</h2>
              {notifications.filter(n => n.unread).length > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 800 }}>
                  {notifications.filter(n => n.unread).length} new
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No new notifications.</div>
              ) : notifications.slice(0, 5).map((n) => (
                <div key={n.id} style={{ display: 'flex', gap: 12, padding: '14px', borderRadius: 14, background: n.unread ? 'rgba(99,102,241,0.05)' : 'rgba(248,250,252,0.8)', border: n.unread ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(148,163,184,0.1)' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {n.icon === 'proposal' ? <FileText size={18} color="#6366f1" /> : <Bell size={18} color="#6366f1" />}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, color: '#334155', fontWeight: n.unread ? 700 : 500, lineHeight: 1.5, marginBottom: 4 }}>{n.text}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '28px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Proposals Received</h2>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Showing last 3</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {recentApplications.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>No proposals received yet.</div>
            ) : recentApplications.slice(0, 3).map((app, i) => {
              const sc = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
              return (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  style={{ padding: '18px', borderRadius: 18, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)' }}
                >
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.post?.title || 'Unknown Post'}</div>
                  <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 12 }}>from <strong>{app.applicant?.name || 'Unknown User'}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>৳{app.budget?.toLocaleString() || app.post?.budget?.min?.toLocaleString() || 0}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{timeAgo(app.createdAt)}</span>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 800, border: `1px solid ${sc.color}20` }}>{sc.label}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        </motion.div>
        )}

        {activeNav === 'My Posts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '36px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 24 }}>My Posts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {myPosts.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>You haven't created any posts yet.</div>
              ) : myPosts.map((post) => {
                const sc = STATUS_CONFIG[post.status] || STATUS_CONFIG.open;
                return (
                  <div key={post._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: 16, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8 }}>{post.title}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {post.applicationsCount || 0} proposals</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={14} /> {post.views || 0} views</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ padding: '6px 16px', borderRadius: 999, background: sc.bg, color: sc.color, fontSize: 12, fontWeight: 800, border: `1px solid ${sc.color}25` }}>{sc.label}</span>
                      <Link href={`/post/${post._id}`} style={{ padding: '8px 16px', borderRadius: 12, background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700 }}>Manage</Link>
                    </div>
                  </div>
                );
              })}
            </div>
        </motion.div>
        )}

        {activeNav === 'Messages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: 'calc(100vh - 180px)', display: 'flex', overflow: 'hidden' }}>
            {/* Conversations List */}
            <div style={{ width: 320, borderRight: '1px solid rgba(148,163,184,0.2)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Messages</h2>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No conversations yet.</div>
                ) : conversations.map(conv => {
                  const otherUser = conv.participants.find((p: any) => p._id !== user._id) || conv.participants[0];
                  const isActive = activeConv?._id === conv._id;
                  const unreadCount = conv.unreadCount?.[user._id] || 0;
                  return (
                    <div key={conv._id} onClick={() => openConversation(conv)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent', borderBottom: '1px solid rgba(148,163,184,0.1)', transition: 'background 0.2s' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, overflow: 'hidden' }}>
                        {otherUser?.avatar ? <img src={otherUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: '#fff', fontWeight: 800 }}>{otherUser?.name?.[0]}</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: isActive ? 800 : 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherUser?.name}</div>
                          {unreadCount > 0 && <div style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 900, padding: '2px 6px', borderRadius: 10 }}>{unreadCount}</div>}
                        </div>
                        <div style={{ fontSize: 13, color: unreadCount > 0 ? '#0f172a' : '#64748b', fontWeight: unreadCount > 0 ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage || 'Started a conversation'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Active Chat */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
              {!activeConv ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <MessageCircle size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                  <p style={{ fontSize: 15, fontWeight: 600 }}>Select a conversation to start messaging</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid rgba(148,163,184,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                      {activeConv.participants.find((p: any) => p._id !== user._id)?.name || 'User'}
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {convMessages.map((msg: any, i: number) => {
                      const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                      return (
                        <div key={msg._id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                          <div style={{ padding: '12px 16px', borderRadius: 18, borderBottomRightRadius: isMe ? 4 : 18, borderBottomLeftRadius: isMe ? 18 : 4, background: isMe ? '#6366f1' : '#fff', color: isMe ? '#fff' : '#334155', fontSize: 15, lineHeight: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            {msg.content}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: 20, background: '#fff', borderTop: '1px solid rgba(148,163,184,0.2)' }}>
                    <div style={{ display: 'flex', gap: 12, background: '#f1f5f9', padding: '8px 12px', borderRadius: 24, border: '1px solid #e2e8f0' }}>
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={dmInput}
                        onChange={e => setDmInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendDm()}
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#0f172a', padding: '0 8px' }}
                      />
                      <button onClick={sendDm} disabled={isSendingDm || !dmInput.trim()} style={{ width: 40, height: 40, borderRadius: '50%', background: '#6366f1', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: (!dmInput.trim() || isSendingDm) ? 0.5 : 1 }}>
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {activeNav === 'Notifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</h2>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>You have no notifications.</div>
              ) : notifications.map((n) => (
                <div key={n._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px', borderRadius: 16, background: !n.isRead ? 'rgba(99,102,241,0.05)' : 'rgba(248,250,252,0.8)', border: !n.isRead ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(148,163,184,0.12)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: !n.isRead ? 'rgba(99,102,241,0.1)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={20} color={!n.isRead ? '#6366f1' : '#94a3b8'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>{n.title}</div>
                    <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, marginBottom: 8 }}>{n.body}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeNav === 'Settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '36px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 24 }}>Account Settings</h2>
            
            <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 32 }}>
              <button onClick={() => setSettingsTab('password')} style={{ padding: '8px 16px', borderRadius: 12, background: settingsTab === 'password' ? '#f1f5f9' : 'transparent', color: settingsTab === 'password' ? '#0f172a' : '#64748b', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Security & Password</button>
              <button onClick={() => setSettingsTab('account')} style={{ padding: '8px 16px', borderRadius: 12, background: settingsTab === 'account' ? '#f1f5f9' : 'transparent', color: settingsTab === 'account' ? '#0f172a' : '#64748b', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Danger Zone</button>
            </div>

            {settingsTab === 'password' && (
              <form onSubmit={changePassword} style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {settingsMsg && (
                  <div style={{ padding: 12, borderRadius: 12, background: settingsMsg.includes('success') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: settingsMsg.includes('success') ? '#059669' : '#ef4444', fontSize: 14, fontWeight: 600 }}>
                    {settingsMsg}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Current Password</label>
                  <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 15 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 8 }}>New Password</label>
                  <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 15 }} />
                </div>
                <button type="submit" style={{ padding: '14px', borderRadius: 14, border: 'none', background: '#6366f1', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 8 }}>Update Password</button>
              </form>
            )}

            {settingsTab === 'account' && (
              <div>
                <div style={{ padding: '24px', borderRadius: 16, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>Delete Account</h3>
                    <p style={{ fontSize: 14, color: '#64748b' }}>Permanently remove your account and all associated data.</p>
                  </div>
                  <button onClick={() => alert('Please contact admin to delete your account')} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Delete Account</button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeNav === 'Admin' && user?.role === 'admin' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Admin Control Panel</h2>
            </div>

            {/* Quick Stats */}
            {adminStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
                <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Total Users</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#6366f1' }}>{adminStats.users.total}</div>
                </div>
                <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Total Posts</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981' }}>{adminStats.posts.total}</div>
                </div>
                <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.1)' }}>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Applications</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#ec4899' }}>{adminStats.applications}</div>
                </div>
              </div>
            )}

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pending Verifications ({adminUsers.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {adminUsers.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 15, background: 'rgba(248,250,252,0.8)', borderRadius: 16 }}>No pending verifications.</div>
              ) : adminUsers.map((u) => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: 16, background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(148,163,184,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18 }}>
                      {u.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{u.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 12 }}>
                        <span>{u.email}</span>
                        <span>•</span>
                        <span>{u.university || 'No university listed'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={u.studentIdUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Eye size={14} /> View ID
                    </a>
                    <button 
                      onClick={async () => {
                        try {
                          await api.patch(`/admin/users/${u._id}/verify`, { status: 'verified' });
                          setAdminUsers(prev => prev.filter(x => x._id !== u._id));
                          alert('User verified successfully!');
                        } catch (err) { alert('Failed to verify'); }
                      }}
                      style={{ padding: '8px 16px', borderRadius: 12, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          await api.patch(`/admin/users/${u._id}/verify`, { status: 'unverified' });
                          setAdminUsers(prev => prev.filter(x => x._id !== u._id));
                          alert('User rejected.');
                        } catch (err) { alert('Failed to reject'); }
                      }}
                      style={{ padding: '8px 16px', borderRadius: 12, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
