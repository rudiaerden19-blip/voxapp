'use client';

import { useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Phone, Calendar, Users, Settings, LogOut, TrendingUp, MessageSquare, Menu, X, Briefcase, Globe, ChevronDown, Shield, Package, Wrench, CreditCard, Home, Car, FileText, ShoppingBag, UtensilsCrossed, CalendarCheck, Scissors } from 'lucide-react';
import { useLanguage, Language } from '@/lib/LanguageContext';
import { useBusiness } from '@/lib/BusinessContext';
import { getBusinessType, hasModule, ModuleId } from '@/lib/modules';
import { createClient } from '@/lib/supabase';

// Icon mapping voor modules
const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Calendar, UtensilsCrossed, ShoppingBag, CalendarCheck, Scissors, Users, Wrench, CreditCard, Home, Car, FileText,
};

// Module-specifieke nav items
const moduleNavItems: Record<ModuleId, { href: string; icon: React.ComponentType<{ size?: number }>; label: string }> = {
  appointments: { href: '/dashboard/appointments', icon: Calendar, label: 'Afspraken' },
  menu: { href: '/dashboard/producten', icon: Package, label: 'Menu' },
  products: { href: '/dashboard/producten', icon: Package, label: 'Producten' },
  orders: { href: '/dashboard/orders', icon: ShoppingBag, label: 'Bestellingen' },
  kitchen: { href: '/dashboard/kitchen', icon: UtensilsCrossed, label: 'Keuken' },
  delivery_slots: { href: '/dashboard/delivery-slots', icon: Calendar, label: 'Levertijden' },
  reservations: { href: '/dashboard/reservations', icon: CalendarCheck, label: 'Reserveringen' },
  services: { href: '/dashboard/services', icon: Briefcase, label: 'Diensten' },
  staff: { href: '/dashboard/staff', icon: Users, label: 'Team' },
  workorders: { href: '/dashboard/workorders', icon: Wrench, label: 'Werkorders' },
  members: { href: '/dashboard/members', icon: CreditCard, label: 'Leden' },
  properties: { href: '/dashboard/properties', icon: Home, label: 'Panden' },
  patients: { href: '/dashboard/patients', icon: FileText, label: 'Dossiers' },
  vehicles: { href: '/dashboard/vehicles', icon: Car, label: 'Voertuigen' },
};

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { t, language, setLanguage } = useLanguage();
  const { business, isAdminView, loading, getHref, clearAdminView } = useBusiness();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear admin view on logout
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('vox_admin_view');
    }
    router.push('/login');
  };

  const handleBackToAdmin = () => {
    clearAdminView();
    router.push('/admin');
  };

  const getDaysRemaining = () => {
    if (!business?.trial_ends_at) return 0;
    const diff = Math.ceil((new Date(business.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

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
          <Link href={getHref('/dashboard')} style={{ textDecoration: 'none' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {business?.type && <span style={{ fontSize: 18 }}>{getBusinessType(business.type).icon}</span>}
            <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>{business?.name || business?.email || 'Mijn Bedrijf'}</p>
          </div>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
            {business?.type && <span style={{ color: '#9ca3af' }}>{getBusinessType(business.type).name} • </span>}
            {business?.subscription_status === 'trial' 
              ? `${getDaysRemaining()} dagen trial` 
              : 'Actief'}
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
          {/* Dashboard - altijd bovenaan */}
          <Link href={getHref('/dashboard')} onClick={() => setSidebarOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: pathname === '/dashboard' ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
            border: 'none', borderRadius: 8, color: pathname === '/dashboard' ? '#f97316' : '#9ca3af',
            fontSize: 14, fontWeight: pathname === '/dashboard' ? 600 : 400, cursor: 'pointer',
            width: '100%', textAlign: 'left', marginBottom: 4, textDecoration: 'none',
          }}>
            <TrendingUp size={18} />{t('dashboard.nav.dashboard')}
          </Link>

          {/* Module-specifieke items gebaseerd op business type of custom modules */}
          {business?.type && (
            <>
              {Object.entries(moduleNavItems).map(([moduleId, item]) => {
                // Check custom enabled_modules first, then fall back to default
                const moduleEnabled = business.enabled_modules 
                  ? business.enabled_modules.includes(moduleId as ModuleId)
                  : hasModule(business.type, moduleId as ModuleId);
                if (!moduleEnabled) return null;
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={getHref(item.href)} onClick={() => setSidebarOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    background: active ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    border: 'none', borderRadius: 8, color: active ? '#f97316' : '#9ca3af',
                    fontSize: 14, fontWeight: active ? 600 : 400, cursor: 'pointer',
                    width: '100%', textAlign: 'left', marginBottom: 4, textDecoration: 'none',
                  }}>
                    <item.icon size={18} />{item.label}
                  </Link>
                );
              })}
            </>
          )}

          {/* Separator */}
          <div style={{ height: 1, background: '#2a2a35', margin: '12px 0' }} />

          {/* Gesprekken */}
          <Link href={getHref('/dashboard/conversations')} onClick={() => setSidebarOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: pathname.startsWith('/dashboard/conversations') ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
            border: 'none', borderRadius: 8, color: pathname.startsWith('/dashboard/conversations') ? '#f97316' : '#9ca3af',
            fontSize: 14, fontWeight: pathname.startsWith('/dashboard/conversations') ? 600 : 400, cursor: 'pointer',
            width: '100%', textAlign: 'left', marginBottom: 4, textDecoration: 'none',
          }}>
            <MessageSquare size={18} />{t('dashboard.nav.conversations')}
          </Link>

          {/* AI Receptie */}
          <Link href={getHref('/dashboard/ai-settings')} onClick={() => setSidebarOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: pathname.startsWith('/dashboard/ai-settings') ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
            border: 'none', borderRadius: 8, color: pathname.startsWith('/dashboard/ai-settings') ? '#f97316' : '#9ca3af',
            fontSize: 14, fontWeight: pathname.startsWith('/dashboard/ai-settings') ? 600 : 400, cursor: 'pointer',
            width: '100%', textAlign: 'left', marginBottom: 4, textDecoration: 'none',
          }}>
            <Phone size={18} />{t('dashboard.nav.reception')}
          </Link>

          {/* Instellingen */}
          <Link href={getHref('/dashboard/settings')} onClick={() => setSidebarOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: pathname.startsWith('/dashboard/settings') ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
            border: 'none', borderRadius: 8, color: pathname.startsWith('/dashboard/settings') ? '#f97316' : '#9ca3af',
            fontSize: 14, fontWeight: pathname.startsWith('/dashboard/settings') ? 600 : 400, cursor: 'pointer',
            width: '100%', textAlign: 'left', marginBottom: 4, textDecoration: 'none',
          }}>
            <Settings size={18} />{t('dashboard.nav.settings')}
          </Link>
        </nav>

        {isAdminView ? (
          <button onClick={handleBackToAdmin} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#8b5cf620',
            border: 'none', borderRadius: 8, color: '#8b5cf6', fontSize: 14, fontWeight: 600, width: '100%', textAlign: 'left', cursor: 'pointer',
          }}>
            <Shield size={18} />Terug naar Admin
          </button>
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
          <Link href={getHref('/dashboard')} style={{ textDecoration: 'none' }}><span style={{ fontSize: 20, fontWeight: 700 }}><span style={{ color: '#f97316' }}>Vox</span><span style={{ color: 'white' }}>App</span></span></Link>
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
