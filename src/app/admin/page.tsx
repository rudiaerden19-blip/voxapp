'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Monitor, RotateCcw, Eye, Ban, Check, Trash2, Phone, Users, CreditCard, AlertTriangle } from 'lucide-react';

const ADMIN_EMAIL = 'rudi.aerden@hotmail.com';

interface Tenant {
  id: string;
  name: string;
  email?: string;
  type?: string;
  phone?: string;
  subscription_status?: string;
  subscription_plan?: string;
  blocked?: boolean;
  created_at: string;
  trial_ends_at?: string;
  // Modules
  has_kassa?: boolean;
  has_app?: boolean;
  has_website?: boolean;
  // Stats
  total_calls?: number;
  total_appointments?: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [adminName, setAdminName] = useState('');
  const router = useRouter();

  useEffect(() => { checkAdminAndLoad(); }, []);

  const checkAdminAndLoad = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      router.push('/dashboard');
      return;
    }

    setAdminName(user.email.split('@')[0]);
    setIsAdmin(true);

    // Load tenants
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    setTenants((data || []) as unknown as Tenant[]);
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleBlock = async (tenant: Tenant) => {
    const supabase = createClient();
    const newState = !tenant.blocked;
    await supabase.from('businesses').update({ blocked: newState } as any).eq('id', tenant.id);
    setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, blocked: newState } : t));
  };

  const deleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Weet je zeker dat je "${tenant.name}" wilt verwijderen?`)) return;
    const supabase = createClient();
    await supabase.from('businesses').delete().eq('id', tenant.id);
    setTenants(prev => prev.filter(t => t.id !== tenant.id));
  };

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.subscription_status === 'active' && !t.blocked).length,
    blocked: tenants.filter(t => t.blocked).length,
    trial: tenants.filter(t => t.subscription_status === 'trial').length,
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'professional': return { bg: '#8b5cf6', label: 'PRO' };
      case 'business': return { bg: '#f97316', label: 'BUSINESS' };
      default: return { bg: '#22c55e', label: 'STARTER' };
    }
  };

  const getStatusBadge = (tenant: Tenant) => {
    if (tenant.blocked) return { bg: '#ef4444', label: 'Blocked' };
    switch (tenant.subscription_status) {
      case 'active': return { bg: '#22c55e', label: 'Actief' };
      case 'trial': return { bg: '#f97316', label: 'Trial' };
      default: return { bg: '#6b7280', label: 'Inactief' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Laden...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ef4444' }}>Geen toegang</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1729', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="white" />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: 0 }}>VoxApp Admin Panel</h1>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Welkom, {adminName}!</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => router.push('/dashboard')}
            style={{ padding: '10px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 14 }}
          >
            Dashboard
          </button>
          <button 
            onClick={handleLogout}
            style={{ padding: '10px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <LogOut size={16} /> Uitloggen
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Total Tenants</p>
          <p style={{ color: 'white', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Actief</p>
          <p style={{ color: '#22c55e', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.active}</p>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Geblokkeerd</p>
          <p style={{ color: '#ef4444', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.blocked}</p>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Trial</p>
          <p style={{ color: '#f97316', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.trial}</p>
        </div>
      </div>

      {/* Tenants Table */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: 0 }}>Alle Tenants</h2>
          <button style={{ padding: '8px 16px', background: '#22c55e', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Nieuwe Onboard Tenant
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f1729' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Bedrijf</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Contact</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Plan</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Stats</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Aangemaakt</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Module</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Geen tenants gevonden</td>
                </tr>
              ) : (
                tenants.map((tenant) => {
                  const plan = getPlanBadge(tenant.subscription_plan);
                  const status = getStatusBadge(tenant);
                  return (
                    <tr key={tenant.id} style={{ borderTop: '1px solid #334155' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>{tenant.name}</p>
                        <p style={{ color: '#6b7280', fontSize: 12, margin: 0, textTransform: 'capitalize' }}>{tenant.type || 'Overig'}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ color: 'white', fontSize: 14, margin: 0 }}>{tenant.email || '-'}</p>
                        <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{tenant.phone || '-'}</p>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: plan.bg, color: 'white', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                          {plan.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: `${status.bg}20`, color: status.bg, padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={14} style={{ color: '#6b7280' }} />
                            <span style={{ color: 'white', fontSize: 13 }}>{tenant.total_calls || 0}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Users size={14} style={{ color: '#6b7280' }} />
                            <span style={{ color: 'white', fontSize: 13 }}>{tenant.total_appointments || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13 }}>
                        {formatDate(tenant.created_at)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span style={{ background: '#3b82f6', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Receptie</span>
                          {tenant.has_kassa && <span style={{ background: '#8b5cf6', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Kassa</span>}
                          {tenant.has_app && <span style={{ background: '#ec4899', color: 'white', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>App</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => router.push(`/admin/tenant/${tenant.id}`)}
                            style={{ padding: 8, background: '#3b82f620', border: 'none', borderRadius: 6, color: '#3b82f6', cursor: 'pointer' }}
                            title="Bekijken"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => toggleBlock(tenant)}
                            style={{ padding: 8, background: tenant.blocked ? '#22c55e20' : '#f9731620', border: 'none', borderRadius: 6, color: tenant.blocked ? '#22c55e' : '#f97316', cursor: 'pointer' }}
                            title={tenant.blocked ? 'Deblokkeren' : 'Blokkeren'}
                          >
                            {tenant.blocked ? <Check size={16} /> : <Ban size={16} />}
                          </button>
                          <button
                            onClick={() => deleteTenant(tenant)}
                            style={{ padding: 8, background: '#ef444420', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}
                            title="Verwijderen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>Nieuwe Tenant</p>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Voeg een nieuwe klant toe</p>
            </div>
          </div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>Demo Kassa</p>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Simuleer kassascherm</p>
            </div>
          </div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f9731620', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={20} style={{ color: '#f97316' }} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>Reset App</p>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Herinitialiseer instellingen</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
