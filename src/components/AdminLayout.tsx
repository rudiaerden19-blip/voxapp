'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, CreditCard, Settings, LogOut, BarChart3, Menu, X, Shield, Ban, UserPlus, BookOpen } from 'lucide-react';

// ADMIN EMAIL - Alleen deze email heeft toegang tot admin panel
const ADMIN_EMAIL = 'rudi.aerden@hotmail.com';

const navItems = [
  { href: '/admin', icon: BarChart3, label: 'Overzicht' },
  { href: '/admin/tenants', icon: Users, label: 'Alle Tenants' },
  { href: '/admin/kennisbank', icon: BookOpen, label: 'Kennisbank' },
  { href: '/admin/subscriptions', icon: CreditCard, label: 'Abonnementen' },
  { href: '/admin/settings', icon: Settings, label: 'Instellingen' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Check of de gebruiker admin is
    if (user.email !== ADMIN_EMAIL) {
      router.push('/dashboard');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>Laden...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Shield size={48} style={{ color: '#ef4444', marginBottom: 16 }} />
          <h1 style={{ color: 'white', fontSize: 24, marginBottom: 8 }}>Geen Toegang</h1>
          <p style={{ color: '#9ca3af' }}>Je hebt geen toegang tot het admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex' }}>
      <aside style={{
        width: 260, background: '#16161f', borderRight: '1px solid #2a2a35', padding: 24,
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease',
      }} className="sidebar-desktop">
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>
              <span style={{ color: '#ef4444' }}>Admin</span>
              <span style={{ color: 'white' }}>Panel</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }} className="sidebar-close-btn">
            <X size={24} />
          </button>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} style={{ color: '#ef4444' }} />
            <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 14 }}>Super Admin</p>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Volledige toegang</p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: isActive(item.href) ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              border: 'none', borderRadius: 8, color: isActive(item.href) ? '#ef4444' : '#9ca3af',
              fontSize: 14, fontWeight: isActive(item.href) ? 600 : 400, cursor: 'pointer',
              width: '100%', textAlign: 'left', marginBottom: 4, textDecoration: 'none',
            }}>
              <item.icon size={18} />{item.label}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #2a2a35', paddingTop: 16, marginTop: 16 }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent',
            border: 'none', borderRadius: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left', textDecoration: 'none', marginBottom: 4,
          }}>
            <Users size={18} />Naar Klant Dashboard
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent',
            border: 'none', borderRadius: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left',
          }}>
            <LogOut size={18} />Uitloggen
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh' }} className="main-content">
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#16161f', borderBottom: '1px solid #2a2a35', position: 'sticky', top: 0, zIndex: 40 }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Menu size={24} /></button>
          <span style={{ fontSize: 20, fontWeight: 700 }}><span style={{ color: '#ef4444' }}>Admin</span><span style={{ color: 'white' }}>Panel</span></span>
          <div style={{ width: 24 }} />
        </div>
        <div style={{ padding: 32 }}>{children}</div>
      </main>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}

      <style jsx global>{`
        @media (min-width: 1024px) { .sidebar-desktop { transform: translateX(0) !important; } .sidebar-close-btn { display: none !important; } .mobile-header { display: none !important; } .main-content { margin-left: 260px !important; } }
        @media (max-width: 1023px) { .main-content { margin-left: 0 !important; } .mobile-header { display: flex !important; } }
      `}</style>
    </div>
  );
}
