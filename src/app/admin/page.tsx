'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { Users, CreditCard, Phone, TrendingUp, AlertCircle } from 'lucide-react';

interface Stats {
  totalTenants: number;
  activeTenants: number;
  blockedTenants: number;
  trialTenants: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

interface Business {
  id: string;
  name: string;
  email: string;
  type: string;
  subscription_status: string;
  created_at: string;
  blocked?: boolean;
}

interface RecentTenant {
  id: string;
  name: string;
  email: string;
  type: string;
  subscription_status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTenants: 0,
    activeTenants: 0,
    blockedTenants: 0,
    trialTenants: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const supabase = createClient();
    
    // Haal alle businesses op
    const { data } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
    const businesses = (data || []) as Business[];
    
    if (businesses.length > 0) {
      const active = businesses.filter(b => b.subscription_status === 'active' && !b.blocked);
      const blocked = businesses.filter(b => b.blocked === true);
      const trial = businesses.filter(b => b.subscription_status === 'trial');
      
      setStats({
        totalTenants: businesses.length,
        activeTenants: active.length,
        blockedTenants: blocked.length,
        trialTenants: trial.length,
        totalRevenue: active.length * 99, // Simpele berekening
        activeSubscriptions: active.length,
      });
      
      // Recent tenants (laatste 5)
      const recent = businesses.slice(0, 5).map(b => ({
        id: b.id,
        name: b.name,
        email: b.email || 'Geen email',
        type: b.type,
        subscription_status: b.subscription_status,
        created_at: b.created_at,
      }));
      setRecentTenants(recent);
    }
    
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' };
      case 'trial': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' };
      case 'blocked': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      default: return { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' };
    }
  };

  const statCards = [
    { label: 'Totaal Tenants', value: stats.totalTenants, icon: Users, color: '#3b82f6' },
    { label: 'Actieve Tenants', value: stats.activeTenants, icon: TrendingUp, color: '#22c55e' },
    { label: 'Trial Periode', value: stats.trialTenants, icon: Phone, color: '#f97316' },
    { label: 'Geblokkeerd', value: stats.blockedTenants, icon: AlertCircle, color: '#ef4444' },
    { label: 'Maandelijkse Omzet', value: `€${stats.totalRevenue}`, icon: CreditCard, color: '#8b5cf6' },
    { label: 'Actieve Abonnementen', value: stats.activeSubscriptions, icon: CreditCard, color: '#06b6d4' },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Admin Dashboard</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Beheer alle tenants en abonnementen</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            {statCards.map((stat, i) => (
              <div key={i} style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>{stat.label}</span>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <p style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Tenants */}
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24 }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Recente Tenants</h2>
            
            {recentTenants.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Nog geen tenants</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a35' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Bedrijf</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Aangemaakt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTenants.map((tenant) => {
                      const statusStyle = getStatusColor(tenant.subscription_status);
                      return (
                        <tr key={tenant.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                          <td style={{ padding: '16px' }}>
                            <p style={{ color: 'white', fontWeight: 500 }}>{tenant.name}</p>
                            <p style={{ color: '#6b7280', fontSize: 13 }}>{tenant.email}</p>
                          </td>
                          <td style={{ padding: '16px', color: '#9ca3af', textTransform: 'capitalize' }}>{tenant.type}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              background: statusStyle.bg, 
                              color: statusStyle.color, 
                              padding: '4px 12px', 
                              borderRadius: 20, 
                              fontSize: 13,
                              fontWeight: 500,
                              textTransform: 'capitalize',
                            }}>
                              {tenant.subscription_status}
                            </span>
                          </td>
                          <td style={{ padding: '16px', color: '#9ca3af' }}>{formatDate(tenant.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
