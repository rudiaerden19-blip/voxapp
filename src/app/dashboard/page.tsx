'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Phone, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Plus,
  Clock,
  TrendingUp,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  type: string;
  phone: string;
  subscription_status: string;
  trial_ends_at: string;
}

interface Appointment {
  id: string;
  customer_name: string;
  start_time: string;
  status: string;
  services?: { name: string };
}

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get business data
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (businessData) {
      setBusiness(businessData as Business);

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*, services(name)')
        .eq('business_id', (businessData as Business).id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString())
        .order('start_time', { ascending: true });

      if (appointmentsData) {
        setAppointments(appointmentsData);
      }
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('nl-BE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getDaysRemaining = () => {
    if (!business?.trial_ends_at) return 0;
    const end = new Date(business.trial_ends_at);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#9ca3af' }}>Laden...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: '#16161f',
        borderRight: '1px solid #2a2a35',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: sidebarOpen ? 0 : -260,
        bottom: 0,
        zIndex: 50,
        transition: 'left 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>
            <span style={{ color: '#f97316' }}>Vox</span>
            <span style={{ color: 'white' }}>App</span>
          </span>
          <button 
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'none' }}
            className="md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Business name */}
        <div style={{
          background: '#0a0a0f',
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
        }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{business?.name}</p>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
            {business?.subscription_status === 'trial' 
              ? `Proefperiode: ${getDaysRemaining()} dagen over`
              : 'Actief abonnement'
            }
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <NavItem icon={TrendingUp} label="Dashboard" active />
          <NavItem icon={Calendar} label="Afspraken" />
          <NavItem icon={MessageSquare} label="Gesprekken" />
          <NavItem icon={Users} label="Medewerkers" />
          <NavItem icon={Phone} label="AI Receptionist" />
          <NavItem icon={Settings} label="Instellingen" />
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            color: '#9ca3af',
            fontSize: 14,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <LogOut size={18} />
          Uitloggen
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 260, padding: 32 }}>
        {/* Mobile header */}
        <div style={{ 
          display: 'none', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 24,
        }} className="md:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <Menu size={24} />
          </button>
          <span style={{ fontSize: 20, fontWeight: 700 }}>
            <span style={{ color: '#f97316' }}>Vox</span>
            <span style={{ color: 'white' }}>App</span>
          </span>
          <div style={{ width: 24 }} />
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Welkom terug!
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>
            Hier is een overzicht van je bedrijf vandaag.
          </p>
        </div>

        {/* Stats cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 20,
          marginBottom: 32,
        }}>
          <StatCard 
            icon={Calendar} 
            label="Afspraken vandaag" 
            value={appointments.length.toString()} 
          />
          <StatCard 
            icon={Phone} 
            label="Gesprekken vandaag" 
            value="0" 
          />
          <StatCard 
            icon={Clock} 
            label="Gemiste oproepen" 
            value="0" 
          />
          <StatCard 
            icon={TrendingUp} 
            label="Deze maand" 
            value="0" 
          />
        </div>

        {/* Today's appointments */}
        <div style={{
          background: '#16161f',
          borderRadius: 16,
          border: '1px solid #2a2a35',
          padding: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
              Afspraken vandaag
            </h2>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              <Plus size={16} />
              Nieuwe afspraak
            </button>
          </div>

          {appointments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: 40,
              color: '#6b7280',
            }}>
              <Calendar size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>Geen afspraken voor vandaag</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {appointments.map((apt) => (
                <div 
                  key={apt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    background: '#0a0a0f',
                    borderRadius: 8,
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: 'rgba(249, 115, 22, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f97316',
                  }}>
                    <Clock size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontWeight: 500 }}>{apt.customer_name}</p>
                    <p style={{ color: '#6b7280', fontSize: 13 }}>
                      {apt.services?.name || 'Afspraak'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#f97316', fontWeight: 600 }}>
                      {formatTime(apt.start_time)}
                    </p>
                    <p style={{ 
                      color: apt.status === 'confirmed' ? '#22c55e' : '#9ca3af', 
                      fontSize: 12,
                      textTransform: 'capitalize',
                    }}>
                      {apt.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <button style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      background: active ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
      border: 'none',
      borderRadius: 8,
      color: active ? '#f97316' : '#9ca3af',
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      marginBottom: 4,
    }}>
      <Icon size={18} />
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{
      background: '#16161f',
      borderRadius: 12,
      border: '1px solid #2a2a35',
      padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: 'rgba(249, 115, 22, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f97316',
        }}>
          <Icon size={18} />
        </div>
      </div>
      <p style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</p>
      <p style={{ color: '#6b7280', fontSize: 13 }}>{label}</p>
    </div>
  );
}
