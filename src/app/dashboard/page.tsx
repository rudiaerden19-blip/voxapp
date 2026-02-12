'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { AppointmentWithService } from '@/lib/database.types';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Phone, 
  Clock,
  TrendingUp,
  Plus,
} from 'lucide-react';

interface Stats {
  appointmentsToday: number;
  conversationsToday: number;
  missedCalls: number;
  monthlyAppointments: number;
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([]);
  const [stats, setStats] = useState<Stats>({
    appointmentsToday: 0,
    conversationsToday: 0,
    missedCalls: 0,
    monthlyAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Get business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      setLoading(false);
      return;
    }

    const businessId = business.id;

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('*, services(name)')
      .eq('business_id', businessId)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .order('start_time', { ascending: true });

    if (appointmentsData) {
      setAppointments(appointmentsData as AppointmentWithService[]);
      setStats(prev => ({ ...prev, appointmentsToday: appointmentsData.length }));
    }

    // Get this month's stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const { count: monthlyCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('start_time', monthStart.toISOString());

    if (monthlyCount !== null) {
      setStats(prev => ({ ...prev, monthlyAppointments: monthlyCount }));
    }

    // Get today's conversations
    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', today.toISOString());

    if (conversationsCount !== null) {
      setStats(prev => ({ ...prev, conversationsToday: conversationsCount }));
    }

    setLoading(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('nl-BE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22c55e';
      case 'scheduled': return '#f97316';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Bevestigd';
      case 'scheduled': return 'Gepland';
      case 'completed': return 'Voltooid';
      case 'cancelled': return 'Geannuleerd';
      case 'no_show': return 'No-show';
      default: return status;
    }
  };

  return (
    <DashboardLayout>
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
          value={stats.appointmentsToday.toString()} 
          loading={loading}
        />
        <StatCard 
          icon={Phone} 
          label="Gesprekken vandaag" 
          value={stats.conversationsToday.toString()} 
          loading={loading}
        />
        <StatCard 
          icon={Clock} 
          label="Gemiste oproepen" 
          value={stats.missedCalls.toString()} 
          loading={loading}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Deze maand" 
          value={stats.monthlyAppointments.toString()} 
          loading={loading}
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
          <a 
            href="/dashboard/appointments"
            style={{
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
              textDecoration: 'none',
            }}
          >
            <Plus size={16} />
            Nieuwe afspraak
          </a>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            Laden...
          </div>
        ) : appointments.length === 0 ? (
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
                    color: getStatusColor(apt.status), 
                    fontSize: 12,
                  }}>
                    {getStatusLabel(apt.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  loading 
}: { 
  icon: React.ComponentType<{ size?: number }>; 
  label: string; 
  value: string;
  loading?: boolean;
}) {
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
      <p style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        {loading ? '-' : value}
      </p>
      <p style={{ color: '#6b7280', fontSize: 13 }}>{label}</p>
    </div>
  );
}
