'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, Calendar, Users, Settings, LogOut, TrendingUp, MessageSquare, Menu, X, Briefcase, Globe, ChevronDown, Shield, Package, SlidersHorizontal } from 'lucide-react';
import { useLanguage, Language } from '@/lib/LanguageContext';

interface Business {
  id: string;
  name: string;
  type: string;
  email: string | null;
  subscription_status: string;
  trial_ends_at: string | null;
}

const navItems = [
  { href: '/dashboard', icon: TrendingUp, labelKey: 'dashboard.nav.dashboard' },
  { href: '/dashboard/appointments', icon: Calendar, labelKey: 'dashboard.nav.appointments' },
  { href: '/dashboard/services', icon: Briefcase, labelKey: 'dashboard.nav.services' },
  { href: '/dashboard/producten', icon: Package, labelKey: 'dashboard.nav.products' },
  { href: '/dashboard/opties', icon: SlidersHorizontal, labelKey: 'dashboard.nav.options' },
  { href: '/dashboard/staff', icon: Users, labelKey: 'dashboard.nav.staff' },
  { href: '/dashboard/conversations', icon: MessageSquare, labelKey: 'dashboard.nav.conversations' },
  { href: '/dashboard/ai-settings', icon: Phone, labelKey: 'dashboard.nav.reception' },
  { href: '/dashboard/settings', icon: Settings, labelKey: 'dashboard.nav.settings' },
];

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useLanguage();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    
    // Get admin_view from URL directly (more reliable than useSearchParams)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const adminViewId = urlParams?.get('admin_view') || searchParams.get('admin_view');
    
    // Check if admin is viewing a tenant dashboard (via URL parameter)
    if (adminViewId) {
      // Load tenant via API (bypasses RLS)
      try {
        const res = await fetch(`/api/business/${adminViewId}`);
        if (res.ok) {
          const businessData = await res.json();
          setBusiness(businessData as Business);
          setIsAdminView(true);
        }
      } catch (e) {
        console.error('Failed to load business:', e);
      }
      setLoading(false);
      return;
    }
    
    // Normal user auth flow
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) { router.push('/login'); return; }

    // Use API to bypass RLS (works for all tenants)
    if (user.email) {
      try {
        const res = await fetch(`/api/business/by-email?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const businessData = await res.json();
          setBusiness(businessData as Business);
        }
      } catch (e) {
        console.error('Failed to load business:', e);
      }
    }
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

  const currentLang = languages.find(l => l.code === language) || languages[0];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>{t('dashboard.loading')}</div>
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

        {isAdminView && (
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderRadius: 8, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="white" />
            <p style={{ color: 'white', fontWeight: 600, fontSize: 12, margin: 0 }}>Admin Modus</p>
          </div>
        )}
        <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 12, marginBottom: 24 }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{business?.name || business?.email || business?.type || 'Mijn Bedrijf'}</p>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
            {business?.subscription_status === 'trial' 
              ? `${t('dashboard.trialPeriod')}: ${getDaysRemaining()} ${t('dashboard.trialDaysRemaining')}` 
              : t('dashboard.activeSubscription')}
          </p>
        </div>

        {/* Language Selector */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
              background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8,
              color: 'white', fontSize: 13, cursor: 'pointer', width: '100%',
            }}
          >
            <Globe size={16} color="#f97316" />
            <span>{currentLang.flag} {currentLang.label}</span>
            <ChevronDown size={14} style={{ marginLeft: 'auto', transform: langDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {langDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#16161f', border: '1px solid #2a2a35', borderRadius: 8,
              overflow: 'hidden', zIndex: 100,
            }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setLangDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                    background: language === lang.code ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    border: 'none', color: language === lang.code ? '#f97316' : '#9ca3af',
                    fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
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
              <item.icon size={18} />{t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {isAdminView ? (
          <Link href="/admin" style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#8b5cf620',
            border: 'none', borderRadius: 8, color: '#8b5cf6', fontSize: 14, fontWeight: 600, width: '100%', textAlign: 'left', textDecoration: 'none',
          }}>
            <Shield size={18} />Terug naar Admin
          </Link>
        ) : (
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'transparent',
            border: 'none', borderRadius: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left',
          }}>
            <LogOut size={18} />{t('dashboard.nav.logout')}
          </button>
        )}
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

// Loading fallback for dashboard
function DashboardLoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#9ca3af' }}>Laden...</div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  );
}
