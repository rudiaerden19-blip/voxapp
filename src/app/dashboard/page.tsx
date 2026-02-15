'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useBusiness } from '@/lib/BusinessContext';
import { 
  Calendar, 
  Phone, 
  Clock,
  TrendingUp,
  Plus,
  Shield,
} from 'lucide-react';

interface Appointment {
  id: string;
  customer_name: string;
  start_time: string;
  status: string;
  services?: { name: string } | null;
}

interface Stats {
  appointmentsToday: number;
  conversationsToday: number;
  missedCalls: number;
  monthlyAppointments: number;
}

function DashboardContent() {
  const { t, language } = useLanguage();
  const { business, businessId, isAdminView, loading: businessLoading } = useBusiness();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    appointmentsToday: 0,
    conversationsToday: 0,
    missedCalls: 0,
    monthlyAppointments: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const loading = businessLoading || dataLoading;
  const businessName = business?.name || business?.email || '';

  useEffect(() => {
    if (businessId) {
      loadDashboardData();
    }
  }, [businessId]);

  const loadDashboardData = async () => {
    if (!businessId) {
      setDataLoading(false);
      return;
    }
    
    const supabase = createClient();

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
      setAppointments(appointmentsData as Appointment[]);
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

    setDataLoading(false);
  };

  const formatTime = (dateString: string) => {
    const locale = language === 'nl' ? 'nl-BE' : language === 'fr' ? 'fr-BE' : language === 'de' ? 'de-DE' : 'en-GB';
    return new Date(dateString).toLocaleTimeString(locale, { 
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
      case 'confirmed': return t('dashboard.status.confirmed');
      case 'scheduled': return t('dashboard.status.scheduled');
      case 'completed': return t('dashboard.status.completed');
      case 'cancelled': return t('dashboard.status.cancelled');
      case 'no_show': return t('dashboard.status.noShow');
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      {/* Admin View Banner */}
      {isAdminView && (
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <Shield size={24} color="white" />
          <div>
            <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>Admin Modus</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>
              Je bekijkt het dashboard van: <strong>{businessName}</strong>
            </p>
          </div>
          <a 
            href="/admin" 
            style={{ 
              marginLeft: 'auto', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: 8, 
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Terug naar Admin
          </a>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          {t('dashboard.welcomeBack')}{businessName ? `, ${businessName}!` : '!'}
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>
          {t('dashboard.overview')}
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 20,
        marginBottom: 32,
      }}>
        <StatCard icon={Calendar} label={t('dashboard.appointmentsToday')} value={stats.appointmentsToday.toString()} loading={loading} loadingText={t('dashboard.loading')} />
        <StatCard icon={Phone} label={t('dashboard.conversationsToday')} value={stats.conversationsToday.toString()} loading={loading} loadingText={t('dashboard.loading')} />
        <StatCard icon={Clock} label={t('dashboard.missedCalls')} value={stats.missedCalls.toString()} loading={loading} loadingText={t('dashboard.loading')} />
        <StatCard icon={TrendingUp} label={t('dashboard.thisMonth')} value={stats.monthlyAppointments.toString()} loading={loading} loadingText={t('dashboard.loading')} />
      </div>

      <div style={{
        background: '#16161f',
        borderRadius: 16,
        border: '1px solid #2a2a35',
        padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{t('dashboard.appointmentsToday')}</h2>
          <a href="/dashboard/appointments" style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#f97316', color: 'white',
            border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 500, textDecoration: 'none',
          }}>
            <Plus size={16} />
            {t('dashboard.newAppointment')}
          </a>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>{t('dashboard.loading')}</div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <Calendar size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>{t('dashboard.noAppointmentsToday')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.map((apt) => (
              <div key={apt.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#0a0a0f', borderRadius: 8,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316',
                }}>
                  <Clock size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontWeight: 500 }}>{apt.customer_name}</p>
                  <p style={{ color: '#6b7280', fontSize: 13 }}>{apt.services?.name || t('dashboard.appointment')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#f97316', fontWeight: 600 }}>{formatTime(apt.start_time)}</p>
                  <p style={{ color: getStatusColor(apt.status), fontSize: 12 }}>{getStatusLabel(apt.status)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, loading, loadingText }: { 
  icon: React.ComponentType<{ size?: number }>; label: string; value: string; loading?: boolean; loadingText?: string;
}) {
  return (
    <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, background: 'rgba(249, 115, 22, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316',
        }}>
          <Icon size={18} />
        </div>
      </div>
      <p style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{loading ? '-' : value}</p>
      <p style={{ color: '#6b7280', fontSize: 13 }}>{label}</p>
    </div>
  );
}

// Loading fallback
function DashboardLoading() {
  return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Laden...</div>
    </DashboardLayout>
  );
}

// Main export with Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
