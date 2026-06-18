import Link from 'next/link';
import { ArrowLeft, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', padding: 24, textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', filter: 'blur(40px)', borderRadius: '50%' }} />
      
      <Ghost size={80} color="#6366f1" style={{ marginBottom: 24, zIndex: 1 }} />
      <h1 style={{ fontSize: 48, fontWeight: 900, color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: 16, zIndex: 1 }}>404 - Lost in Space</h1>
      <p style={{ fontSize: 18, color: '#64748b', maxWidth: 460, lineHeight: 1.6, marginBottom: 32, zIndex: 1 }}>
        We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
      </p>
      
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 32px', borderRadius: 999, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 8px 24px rgba(99,102,241,0.3)', zIndex: 1, textDecoration: 'none' }}>
        <ArrowLeft size={18} /> Go Back Home
      </Link>
    </div>
  );
}
