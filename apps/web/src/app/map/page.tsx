'use client';
import 'leaflet/dist/leaflet.css';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, MapPin, Search, Users, Star, Zap,
  Navigation, Filter, X, ChevronRight, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

const SKILL_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

// Dhaka district coords map for approximate user positions
const CITY_COORDS: Record<string, [number, number]> = {
  'Dhaka': [23.8103, 90.4125],
  'Chittagong': [22.3569, 91.7832],
  'Sylhet': [24.8949, 91.8687],
  'Rajshahi': [24.3745, 88.6042],
  'Khulna': [22.8456, 89.5403],
  'Barisal': [22.7010, 90.3535],
  'Rangpur': [25.7439, 89.2752],
  'Mymensingh': [24.7471, 90.4203],
};

// Leaflet map loaded dynamically to avoid SSR issues
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, Circle: any;

export default function MapPage() {
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [L, setL] = useState<any>(null);
  const [talent, setTalent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser) { router.push('/login'); return; }
    const fetchTalent = async () => {
      try {
        const params: Record<string, string> = { limit: '50' };
        if (showAvailableOnly) params.available = 'true';
        const res = await api.get('/users', { params });
        const users = (res.data.users || []).map((u: any, i: number) => {
          const base = CITY_COORDS[u.location?.city] || CITY_COORDS['Dhaka'];
          const lat = base[0] + (Math.random() - 0.5) * 0.04;
          const lng = base[1] + (Math.random() - 0.5) * 0.04;
          const dist = parseFloat((Math.random() * 8 + 0.5).toFixed(1));
          return { ...u, id: u._id, color: SKILL_COLORS[i % SKILL_COLORS.length], lat, lng, distance: dist };
        });
        setTalent(users);
      } catch (err) {
        console.error('Error fetching talent:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTalent();
  }, [authUser, router, showAvailableOnly]);

  const filtered = talent.filter(t => {
    if (search && !t.name?.toLowerCase().includes(search.toLowerCase()) &&
      !(t.skills || []).join(' ').toLowerCase().includes(search.toLowerCase()) &&
      !(t.title || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    (async () => {
      const leaflet = await import('leaflet');
      const rl = await import('react-leaflet');
      MapContainer = rl.MapContainer;
      TileLayer = rl.TileLayer;
      Marker = rl.Marker;
      Popup = rl.Popup;
      Circle = rl.Circle;
      setL(leaflet.default);
      setMapLoaded(true);
    })();
  }, []);

  const customIcon = (color: string, available: boolean) => {
    if (!L) return undefined;
    return new L.DivIcon({
      className: '',
      html: `<div style="
        width:44px; height:44px; border-radius:50%;
        background: linear-gradient(135deg, ${color}ee, ${color}99);
        border: 3px solid white;
        box-shadow: 0 4px 16px ${color}55, 0 0 0 ${available ? '6px' : '0'} ${color}22;
        display:flex; align-items:center; justify-content:center;
        font-size:16px; cursor:pointer; font-weight:900; color:white;
        font-family: 'Plus Jakarta Sans', sans-serif;
        transition: transform 0.2s;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${selected?.id === available ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'}
        </svg>
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f4ff', overflow: 'hidden' }}>
      {/* Navbar */}
      <header style={{ flexShrink: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 2px 16px rgba(99,102,241,0.06)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo_web.png" alt="CollabBD" style={{ height: 'auto', maxHeight: 120, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/feed" style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Feed</Link>
            <Link href="/rooms" style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Community</Link>
            <div style={{ padding: '4px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              {talent.filter(t => t.isAvailableNow).length} available nearby
            </div>
            {authUser ? (
              <Link href="/dashboard" style={{ padding: '8px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                Dashboard
              </Link>
            ) : (
              <Link href="/login" style={{ padding: '8px 18px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Map */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid rgba(99,102,241,0.1)', overflowY: 'auto', zIndex: 10 }}>
          
          {/* Sidebar Header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(148,163,184,0.12)', flexShrink: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 14 }}>
              <Navigation size={18} style={{ display: 'inline', marginRight: 8, color: '#6366f1', verticalAlign: 'middle' }} />
              Nearby Talent
            </h2>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or skill..."
                style={{ width: '100%', height: 42, paddingLeft: 36, paddingRight: 12, background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(148,163,184,0.3)', borderRadius: 12, fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", fontWeight: 500, transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'rgba(148,163,184,0.3)'}
              />
            </div>
            {/* Filter toggle */}
            <button
              onClick={() => setShowAvailableOnly(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: showAvailableOnly ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)', color: showAvailableOnly ? '#059669' : '#64748b', fontSize: 13, fontWeight: 700, transition: 'all 0.2s', borderTop: showAvailableOnly ? '1px solid rgba(16,185,129,0.25)' : '1px solid transparent', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: showAvailableOnly ? '#10b981' : '#94a3b8' }} />
              Available now only
            </button>
          </div>

          {/* Talent List */}
          <div style={{ flex: 1, padding: '12px' }}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, color: '#6366f1', gap: 12, fontWeight: 700 }}>
                <Loader2 size={20} className="animate-spin" /> Loading talent...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontWeight: 700, fontSize: 14 }}>No talent found.</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters.</p>
              </div>
            ) : filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => setSelected(selected?.id === t.id ? null : t)}
                style={{
                  padding: '16px', borderRadius: 18, marginBottom: 10, cursor: 'pointer',
                  background: selected?.id === t.id ? `${t.color}10` : 'rgba(255,255,255,0.7)',
                  border: selected?.id === t.id ? `2px solid ${t.color}40` : '1.5px solid rgba(148,163,184,0.15)',
                  transition: 'all 0.2s',
                }}
                whileHover={{ scale: 1.01 }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden' }}>
                      {t.avatar ? <img src={t.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : t.name?.[0]}
                    </div>
                    {t.isAvailableNow && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: '50%', background: '#10b981', border: '2px solid #fff' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.name}</div>
                      <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{t.distance}km</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>{t.title || t.location?.city || 'Talent'}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(t.skills || []).slice(0, 2).map((s: string) => (
                        <span key={s} style={{ padding: '2px 10px', borderRadius: 999, background: `${t.color}10`, color: t.color, fontSize: 11, fontWeight: 700, border: `1px solid ${t.color}20` }}>{s}</span>
                      ))}
                      {t.rating > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>
                        <Star size={10} fill="#f59e0b" color="#f59e0b" /> {t.rating}
                      </span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── MAP ── */}
        <div style={{ flex: 1, position: 'relative' }}>
          {mapLoaded && MapContainer ? (
            <MapContainer
              center={[23.8103, 90.4125]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors &copy; CARTO'
              />
              {/* 5km radius circle */}
              <Circle
                center={[23.8103, 90.4125]}
                radius={5000}
                pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.04, weight: 1.5, dashArray: '6 4' }}
              />
              {filtered.map(t => (
                <Marker
                  key={t.id}
                  position={[t.lat, t.lng]}
                  icon={customIcon(t.color, t.isAvailableNow)}
                  eventHandlers={{ click: () => setSelected(t) }}
                >
                  <Popup>
                    <div style={{ fontFamily: "'Inter', sans-serif", minWidth: 180 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{t.title || t.location?.city || 'Talent'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                        {t.rating > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontWeight: 700 }}><Star size={12} fill="#f59e0b" color="#f59e0b" /> {t.rating}</span>}
                        <span style={{ color: t.isAvailableNow ? '#059669' : '#94a3b8', fontWeight: 600 }}>
                          {t.isAvailableNow ? '● Available' : '○ Busy'}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#64748b', fontWeight: 600 }}>Loading map…</p>
            </div>
          )}

          {/* Selected talent info card overlay */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, width: 360,
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
                borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: `0 16px 48px ${selected.color}20, 0 4px 16px rgba(0,0,0,0.08)`,
                padding: '20px 24px',
              }}
            >
              <button
                onClick={() => setSelected(null)}
                style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: '50%', background: 'rgba(148,163,184,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} color="#64748b" />
              </button>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${selected.color}, ${selected.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                  {selected.avatar ? <img src={selected.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selected.name?.[0]}
                  {selected.isAvailableNow && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#10b981', border: '2px solid #fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{selected.title || selected.location?.city || 'Talent'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} color="#94a3b8" /> {selected.distance}km away</span>
                {selected.rating > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}><Star size={13} color="#f59e0b" fill="#f59e0b" /> {selected.rating}</span>}
                <span style={{ fontSize: 13, fontWeight: 700, color: selected.isAvailableNow ? '#059669' : '#94a3b8' }}>
                  {selected.isAvailableNow ? '● Available now' : '○ Busy'}
                </span>
              </div>
              {(selected.skills || []).length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  {(selected.skills || []).slice(0, 4).map((s: string) => (
                    <span key={s} style={{ padding: '3px 12px', borderRadius: 999, background: `${selected.color}10`, color: selected.color, fontSize: 12, fontWeight: 700 }}>{s}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href={`/profile`} style={{ flex: 1, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`, color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: `0 4px 12px ${selected.color}35` }}>
                  View Profile <ChevronRight size={16} />
                </Link>
                <button style={{ height: 42, padding: '0 18px', borderRadius: 12, border: `1.5px solid ${selected.color}30`, cursor: 'pointer', background: `${selected.color}10`, color: selected.color, fontSize: 14, fontWeight: 700 }}>
                  Hire
                </button>
              </div>
            </motion.div>
          )}

          {/* Map legend */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} /> Available now
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8' }} /> Busy
            </div>
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8', fontSize: 11 }}>
              {filtered.length} talent shown
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
