'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { LogOut, Plus, Monitor, RotateCcw, Eye, Ban, Check, Trash2, Phone, Users, CreditCard, AlertTriangle, Shield, Lock, X, ExternalLink, Calendar, Euro, TrendingUp } from 'lucide-react';

// Admin credentials - alleen jij hebt toegang
const ADMIN_EMAIL = 'admin@voxapp.tech';
const ADMIN_PASSWORD = 'VoxAdmin2024!';

// Plan pricing for MRR calculation
const planPricing: Record<string, number> = {
  starter: 99,
  pro: 149,
  business: 249,
};

interface Tenant {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  type?: string;
  phone?: string;
  address?: string;
  subscription_status?: string;
  subscription_plan?: string;
  blocked?: boolean;
  created_at: string;
  trial_ends_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  elevenlabs_agent_id?: string;
}

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', email: '', phone: '', type: 'restaurant', plan: 'starter' });
  const [savingTenant, setSavingTenant] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', type: '' });
  const router = useRouter();

  useEffect(() => { 
    // Check if admin session exists
    const adminSession = localStorage.getItem('voxapp_admin_session');
    if (adminSession === 'true') {
      setIsAdmin(true);
      loadTenants();
    } else {
      setLoading(false);
    }
  }, []);

  const loadTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(data || []);
      }
    } catch (e) {
      console.error('Failed to load tenants:', e);
    }
    setLoading(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (adminEmail === ADMIN_EMAIL && adminPassword === ADMIN_PASSWORD) {
      localStorage.setItem('voxapp_admin_session', 'true');
      setIsAdmin(true);
      loadTenants();
    } else {
      setLoginError('Ongeldige admin credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('voxapp_admin_session');
    setIsAdmin(false);
    setAdminEmail('');
    setAdminPassword('');
  };

  const toggleBlock = async (tenant: Tenant) => {
    const newState = !tenant.blocked;
    const res = await fetch('/api/admin/tenants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tenant.id, blocked: newState }),
    });
    if (res.ok) {
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, blocked: newState } : t));
    }
  };

  const deleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Weet je zeker dat je "${tenant.name}" wilt verwijderen? Dit kan niet ongedaan gemaakt worden.`)) return;
    const res = await fetch(`/api/admin/tenants?id=${tenant.id}`, { method: 'DELETE' });
    if (res.ok) {
      setTenants(prev => prev.filter(t => t.id !== tenant.id));
      setSelectedTenant(null);
    }
  };

  // Create new tenant
  const createTenant = async () => {
    if (!newTenant.name.trim()) {
      alert('Bedrijfsnaam is verplicht');
      return;
    }
    setSavingTenant(true);
    
    const res = await fetch('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newTenant.name.trim(),
        email: newTenant.email.trim() || null,
        phone: newTenant.phone.trim() || null,
        type: newTenant.type,
        plan: newTenant.plan,
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      alert('Fout bij aanmaken: ' + (data.error || 'Onbekende fout'));
    } else {
      setTenants(prev => [data, ...prev]);
      setShowNewTenantModal(false);
      setNewTenant({ name: '', email: '', phone: '', type: 'restaurant', plan: 'starter' });
    }
    setSavingTenant(false);
  };

  // Update tenant details
  const updateTenantDetails = async () => {
    if (!selectedTenant) return;
    setSavingTenant(true);
    
    const res = await fetch('/api/admin/tenants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedTenant.id,
        name: editData.name.trim(),
        email: editData.email.trim() || null,
        phone: editData.phone.trim() || null,
        type: editData.type,
      }),
    });
    
    if (!res.ok) {
      const data = await res.json();
      alert('Fout bij opslaan: ' + (data.error || 'Onbekende fout'));
    } else {
      setTenants(prev => prev.map(t => t.id === selectedTenant.id ? { ...t, ...editData } : t));
      setSelectedTenant(prev => prev ? { ...prev, ...editData } : null);
      setEditMode(false);
    }
    setSavingTenant(false);
  };

  // Start edit mode
  const startEditMode = () => {
    if (selectedTenant) {
      setEditData({
        name: selectedTenant.name || '',
        email: selectedTenant.email || '',
        phone: selectedTenant.phone || '',
        type: selectedTenant.type || 'other',
      });
      setEditMode(true);
    }
  };

  // Calculate MRR (Monthly Recurring Revenue)
  const calculateMRR = () => {
    return tenants
      .filter(t => t.subscription_status === 'active' && !t.blocked)
      .reduce((sum, t) => sum + (planPricing[t.subscription_plan || 'starter'] || 0), 0);
  };

  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.subscription_status === 'active' && !t.blocked).length,
    blocked: tenants.filter(t => t.blocked).length,
    trial: tenants.filter(t => t.subscription_status === 'trial').length,
    mrr: calculateMRR(),
  };

  // Check if trial is expiring soon (within 2 days)
  const isTrialExpiringSoon = (trialEndsAt?: string) => {
    if (!trialEndsAt) return false;
    const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 2 && daysLeft >= 0;
  };

  // Get days left in trial
  const getTrialDaysLeft = (trialEndsAt?: string) => {
    if (!trialEndsAt) return null;
    const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  // Update tenant subscription
  const updateTenantPlan = async (tenant: Tenant, newPlan: string) => {
    const res = await fetch('/api/admin/tenants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tenant.id, subscription_plan: newPlan }),
    });
    if (res.ok) {
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, subscription_plan: newPlan } : t));
      setSelectedTenant(prev => prev ? { ...prev, subscription_plan: newPlan } : null);
    }
  };

  // Update tenant status
  const updateTenantStatus = async (tenant: Tenant, newStatus: string) => {
    const res = await fetch('/api/admin/tenants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tenant.id, subscription_status: newStatus }),
    });
    if (res.ok) {
      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, subscription_status: newStatus } : t));
      setSelectedTenant(prev => prev ? { ...prev, subscription_status: newStatus } : null);
    }
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

  // Admin Login Screen
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1729', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400, background: '#1e293b', borderRadius: 16, padding: 40, border: '1px solid #334155' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Shield size={32} color="white" />
            </div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: 0 }}>Admin Panel</h1>
            <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>Alleen voor eigenaar</p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: '#0f1729', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="admin@voxapp.tech"
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Wachtwoord</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', background: '#0f1729', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: 8, padding: 12, marginBottom: 16, color: '#ef4444', fontSize: 14 }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={{ width: '100%', padding: '14px 24px', background: '#ef4444', border: 'none', borderRadius: 8, color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Lock size={18} /> Inloggen als Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Laden...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1729', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: 0 }}>VoxApp Admin Panel</h1>
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Eigenaar Dashboard</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <LogOut size={16} /> Uitloggen
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Users size={16} style={{ color: '#9ca3af' }} />
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Totaal</p>
          </div>
          <p style={{ color: 'white', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.total}</p>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Check size={16} style={{ color: '#22c55e' }} />
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Actief</p>
          </div>
          <p style={{ color: '#22c55e', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.active}</p>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Calendar size={16} style={{ color: '#f97316' }} />
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Trial</p>
          </div>
          <p style={{ color: '#f97316', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.trial}</p>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ban size={16} style={{ color: '#ef4444' }} />
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Geblokkeerd</p>
          </div>
          <p style={{ color: '#ef4444', fontSize: 32, fontWeight: 700, margin: 0 }}>{stats.blocked}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 12, padding: 20, border: '1px solid #22c55e40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingUp size={16} style={{ color: '#22c55e' }} />
            <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>MRR</p>
          </div>
          <p style={{ color: '#22c55e', fontSize: 28, fontWeight: 700, margin: 0 }}>€{stats.mrr}</p>
        </div>
      </div>

      {/* Tenants Table */}
      <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: 0 }}>Alle Tenants</h2>
          <button 
            onClick={() => setShowNewTenantModal(true)}
            style={{ padding: '8px 16px', background: '#22c55e', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Nieuwe Tenant
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
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Aangemaakt</th>
                <th style={{ textAlign: 'right', padding: '14px 16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Geen tenants gevonden</td>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: `${status.bg}20`, color: status.bg, padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                            {status.label}
                          </span>
                          {tenant.subscription_status === 'trial' && tenant.trial_ends_at && (
                            <span style={{ 
                              fontSize: 11, 
                              color: isTrialExpiringSoon(tenant.trial_ends_at) ? '#ef4444' : '#6b7280',
                              fontWeight: isTrialExpiringSoon(tenant.trial_ends_at) ? 600 : 400,
                            }}>
                              {getTrialDaysLeft(tenant.trial_ends_at)}d
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13 }}>
                        {formatDate(tenant.created_at)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            style={{ padding: 8, background: '#3b82f620', border: 'none', borderRadius: 6, color: '#3b82f6', cursor: 'pointer' }}
                            title="Details bekijken"
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
        <div 
          onClick={() => setShowNewTenantModal(true)}
          style={{ background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>Nieuwe Tenant</p>
              <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Voeg nieuwe klant toe</p>
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

      {/* New Tenant Modal */}
      {showNewTenantModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 24,
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            border: '1px solid #334155',
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600, margin: 0 }}>Nieuwe Tenant</h2>
                <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Voeg een nieuwe klant toe</p>
              </div>
              <button
                onClick={() => setShowNewTenantModal(false)}
                style={{ padding: 8, background: '#0f172a', border: 'none', borderRadius: 8, color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Bedrijfsnaam *</label>
                  <input
                    type="text"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Bijv. Restaurant De Molen"
                    style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Email</label>
                    <input
                      type="email"
                      value={newTenant.email}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="info@bedrijf.be"
                      style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Telefoon</label>
                    <input
                      type="tel"
                      value={newTenant.phone}
                      onChange={(e) => setNewTenant(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+32 123 456 789"
                      style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Type bedrijf</label>
                  <select
                    value={newTenant.type}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, type: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="salon">Kapsalon</option>
                    <option value="garage">Garage</option>
                    <option value="takeaway">Frituur/Takeaway</option>
                    <option value="doctor">Dokter</option>
                    <option value="dentist">Tandarts</option>
                    <option value="physio">Kinesist</option>
                    <option value="other">Overig</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Abonnement</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['starter', 'pro', 'business'].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setNewTenant(prev => ({ ...prev, plan }))}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          background: newTenant.plan === plan ? '#f97316' : '#0f172a',
                          border: newTenant.plan === plan ? 'none' : '1px solid #334155',
                          borderRadius: 8,
                          color: 'white',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textTransform: 'capitalize',
                        }}
                      >
                        {plan} €{planPricing[plan]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>
                  De tenant krijgt automatisch een <strong style={{ color: '#f97316' }}>7-dagen trial</strong> periode.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={createTenant}
                  disabled={savingTenant || !newTenant.name.trim()}
                  style={{ 
                    flex: 1, 
                    padding: '14px 24px', 
                    background: '#22c55e', 
                    border: 'none', 
                    borderRadius: 8, 
                    color: 'white', 
                    fontSize: 14, 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    opacity: (savingTenant || !newTenant.name.trim()) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Plus size={18} />
                  {savingTenant ? 'Aanmaken...' : 'Tenant Aanmaken'}
                </button>
                <button
                  onClick={() => setShowNewTenantModal(false)}
                  style={{ padding: '14px 24px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#9ca3af', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 24,
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #334155',
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: '#1e293b',
            }}>
              <div>
                <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600, margin: 0 }}>{selectedTenant.name}</h2>
                <p style={{ color: '#6b7280', fontSize: 14, margin: 0, textTransform: 'capitalize' }}>{selectedTenant.type || 'Overig'}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!editMode && (
                  <button
                    onClick={startEditMode}
                    style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                  >
                    Bewerken
                  </button>
                )}
                <button
                  onClick={() => { setSelectedTenant(null); setEditMode(false); }}
                  style={{ padding: 8, background: '#0f172a', border: 'none', borderRadius: 8, color: '#9ca3af', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 24 }}>
              {/* Contact Info - Edit Mode */}
              {editMode ? (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Gegevens Bewerken</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Bedrijfsnaam *</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Email</label>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                          style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                        />
                      </div>
                      <div>
                        <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Telefoon</label>
                        <input
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                          style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ color: '#6b7280', fontSize: 12, marginBottom: 6, display: 'block' }}>Type bedrijf</label>
                      <select
                        value={editData.type}
                        onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value }))}
                        style={{ width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                      >
                        <option value="restaurant">Restaurant</option>
                        <option value="salon">Kapsalon</option>
                        <option value="garage">Garage</option>
                        <option value="takeaway">Frituur/Takeaway</option>
                        <option value="doctor">Dokter</option>
                        <option value="dentist">Tandarts</option>
                        <option value="physio">Kinesist</option>
                        <option value="other">Overig</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button
                        onClick={updateTenantDetails}
                        disabled={savingTenant}
                        style={{ flex: 1, padding: '12px 24px', background: '#22c55e', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: savingTenant ? 0.5 : 1 }}
                      >
                        {savingTenant ? 'Opslaan...' : 'Opslaan'}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#9ca3af', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Contact</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Email</p>
                      <p style={{ color: 'white', fontSize: 14, margin: 0 }}>{selectedTenant.email || '-'}</p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Telefoon</p>
                      <p style={{ color: 'white', fontSize: 14, margin: 0 }}>{selectedTenant.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Info */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Abonnement</h3>
                
                {/* Plan Selection */}
                <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Plan</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {['starter', 'pro', 'business'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => updateTenantPlan(selectedTenant, plan)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        background: selectedTenant.subscription_plan === plan ? '#f97316' : '#0f172a',
                        border: selectedTenant.subscription_plan === plan ? 'none' : '1px solid #334155',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {plan} €{planPricing[plan]}
                    </button>
                  ))}
                </div>

                {/* Status Selection */}
                <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Status</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {['trial', 'active', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateTenantStatus(selectedTenant, status)}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: selectedTenant.subscription_status === status 
                          ? status === 'active' ? '#22c55e' : status === 'trial' ? '#f97316' : '#6b7280'
                          : '#0f172a',
                        border: selectedTenant.subscription_status === status ? 'none' : '1px solid #334155',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Trial Info */}
                {selectedTenant.subscription_status === 'trial' && selectedTenant.trial_ends_at && (
                  <div style={{ 
                    background: isTrialExpiringSoon(selectedTenant.trial_ends_at) ? '#ef444420' : '#f9731620', 
                    border: `1px solid ${isTrialExpiringSoon(selectedTenant.trial_ends_at) ? '#ef4444' : '#f97316'}40`,
                    borderRadius: 8, 
                    padding: 12,
                    marginBottom: 16,
                  }}>
                    <p style={{ color: isTrialExpiringSoon(selectedTenant.trial_ends_at) ? '#ef4444' : '#f97316', fontSize: 14, margin: 0 }}>
                      Trial eindigt op {formatDate(selectedTenant.trial_ends_at)} ({getTrialDaysLeft(selectedTenant.trial_ends_at)} dagen)
                    </p>
                  </div>
                )}
              </div>

              {/* Stripe Info */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Betalingen</h3>
                {selectedTenant.stripe_customer_id ? (
                  <a
                    href={`https://dashboard.stripe.com/customers/${selectedTenant.stripe_customer_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontSize: 14,
                    }}
                  >
                    <CreditCard size={16} />
                    Bekijk in Stripe Dashboard
                    <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
                  </a>
                ) : (
                  <p style={{ color: '#6b7280', fontSize: 14 }}>Geen Stripe account gekoppeld</p>
                )}
              </div>

              {/* Technical Info */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Technisch</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Aangemaakt</p>
                    <p style={{ color: 'white', fontSize: 14, margin: 0 }}>{formatDate(selectedTenant.created_at)}</p>
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>ElevenLabs Agent</p>
                    <p style={{ color: selectedTenant.elevenlabs_agent_id ? '#22c55e' : '#6b7280', fontSize: 14, margin: 0 }}>
                      {selectedTenant.elevenlabs_agent_id ? 'Actief' : 'Niet geconfigureerd'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => { toggleBlock(selectedTenant); setSelectedTenant(prev => prev ? { ...prev, blocked: !prev.blocked } : null); }}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: selectedTenant.blocked ? '#22c55e' : '#ef4444',
                    border: 'none',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {selectedTenant.blocked ? <Check size={18} /> : <Ban size={18} />}
                  {selectedTenant.blocked ? 'Deblokkeren' : 'Blokkeren'}
                </button>
                <button
                  onClick={() => { deleteTenant(selectedTenant); setSelectedTenant(null); }}
                  style={{
                    padding: '14px 24px',
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    borderRadius: 8,
                    color: '#ef4444',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Trash2 size={18} />
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
