'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Phone, Calendar, Users, Settings, LogOut, TrendingUp, MessageSquare, Menu, X, Briefcase } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  type: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

const navItems = [
  { href: '/dashboard', icon: TrendingUp, label: 'Dashboard' },
  { href: '/dashboard/appointments', icon: Calendar, label: 'Afspraken' },
  { href: '/dashboard/services', icon: Briefcase, label: 'Diensten' },
  { href: '/dashboard/staff', icon: Users, label: 'Medewerkers' },
  { href: '/dashboard/conversations', icon: MessageSquare, label: 'Gesprekken' },
  { href: '/dashboard/ai-settings', icon: Phone, label: 'Receptie' },
  { href: '/dashboard/settings', icon: Settings, label: 'Instellingen' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) { router.push('/login'); return; }

    const { data: businessData } = await supabase.from('businesses').select('*').eq('user_id', user.id).single();
    if (businessData) setBusiness(businessData as Business);
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getDaysRemaining = () => {
    if (!business?.trial_ends_at) return 0;
    const diff = Math.ceil((new Date(business.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>Laden...</div>
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
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}><span style={{ color: '#f97316' }}>Vox</span><span style={{ color: 'white' }}>App</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }} className="sidebar-close-btn"><X size={24} /></button>
        </div>

        <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 12, marginBottom: 24 }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{business?.name}</p>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
            {business?.subscription_status === 'trial' ? `Proefperiode: ${getDaysRemaining()} dagen over` : 'Actief abonnement'}
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: isActive(item.href) ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
              border: 'none', borderRadius: 8, color: isActive(item.href) ? '#f97316' : '#9ca3af',
              fontSize: 14, fontWeight: isActive(item.href) ? 600 : 400, cursor: 'pointer',
              width: '100%', textAlign: 'left', marginBottom: 4, textDecoration: 'none',
            }}>
              <item.icon size={18} />{item.label}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent',
          border: 'none', borderRadius: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left',
        }}>
          <LogOut size={18} />Uitloggen
        </button>
      </aside>

      <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh' }} className="main-content">
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#16161f', borderBottom: '1px solid #2a2a35', position: 'sticky', top: 0, zIndex: 40 }} className="mobile-header">
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Menu size={24} /></button>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}><span style={{ fontSize: 20, fontWeight: 700 }}><span style={{ color: '#f97316' }}>Vox</span><span style={{ color: 'white' }}>App</span></span></Link>
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
