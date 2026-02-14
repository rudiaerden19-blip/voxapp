'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { CreditCard, TrendingUp, Users, Calendar } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  email?: string;
  subscription_status?: string;
  subscription_plan?: string;
  created_at: string;
  trial_ends_at?: string | null;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalTrial: 0,
    totalCancelled: 0,
    mrr: 0,
  });

  useEffect(() => { loadSubscriptions(); }, []);

  const loadSubscriptions = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    const businesses = (data || []) as Subscription[];
    
    if (businesses.length > 0) {
      setSubscriptions(businesses);
      
      const active = businesses.filter(s => s.subscription_status === 'active');
      const trial = businesses.filter(s => s.subscription_status === 'trial');
      const cancelled = businesses.filter(s => s.subscription_status === 'cancelled');
      
      // Calculate MRR based on plans
      let mrr = 0;
      active.forEach(s => {
        switch (s.subscription_plan || 'starter') {
          case 'starter': mrr += 99; break;
          case 'professional': mrr += 199; break;
          case 'business': mrr += 399; break;
          default: mrr += 99;
        }
      });
      
      setStats({
        totalActive: active.length,
        totalTrial: trial.length,
        totalCancelled: cancelled.length,
        mrr,
      });
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTrialDaysRemaining = (trialEnds: string | null) => {
    if (!trialEnds) return 0;
    const diff = Math.ceil((new Date(trialEnds).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'starter': return '€99/maand';
      case 'professional': return '€199/maand';
      case 'business': return '€399/maand';
      default: return '€99/maand';
    }
  };

  const statCards = [
    { label: 'Actieve Abonnementen', value: stats.totalActive, icon: CreditCard, color: '#22c55e' },
    { label: 'In Trial', value: stats.totalTrial, icon: Users, color: '#f97316' },
    { label: 'Geannuleerd', value: stats.totalCancelled, icon: Calendar, color: '#6b7280' },
    { label: 'MRR (Maandelijkse Omzet)', value: `€${stats.mrr}`, icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Abonnementen</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Overzicht van alle abonnementen en omzet</p>
      </div>

      {/* Stats */}
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

      {/* Subscriptions Table */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a35' }}>
          <h2 style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Alle Abonnementen</h2>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
        ) : subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Geen abonnementen gevonden</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0a0a0f' }}>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Bedrijf</th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Plan</th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Trial</th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Gestart</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderTop: '1px solid #2a2a35' }}>
                    <td style={{ padding: '16px' }}>
                      <p style={{ color: 'white', fontWeight: 500 }}>{sub.name}</p>
                      <p style={{ color: '#6b7280', fontSize: 13 }}>{sub.email}</p>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <p style={{ color: 'white', textTransform: 'capitalize' }}>{sub.subscription_plan || 'Starter'}</p>
                      <p style={{ color: '#6b7280', fontSize: 13 }}>{getPlanPrice(sub.subscription_plan)}</p>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: sub.subscription_status === 'active' ? 'rgba(34, 197, 94, 0.15)' :
                                   sub.subscription_status === 'trial' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                        color: sub.subscription_status === 'active' ? '#22c55e' :
                               sub.subscription_status === 'trial' ? '#f97316' : '#6b7280',
                        padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
                      }}>
                        {sub.subscription_status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af' }}>
                      {sub.subscription_status === 'trial' && sub.trial_ends_at ? (
                        <span style={{ color: getTrialDaysRemaining(sub.trial_ends_at) <= 3 ? '#ef4444' : '#f97316' }}>
                          {getTrialDaysRemaining(sub.trial_ends_at)} dagen over
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#9ca3af' }}>{formatDate(sub.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
