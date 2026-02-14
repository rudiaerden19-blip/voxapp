'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { Search, Ban, Check, Trash2, Eye, UserPlus, X } from 'lucide-react';

interface Tenant {
  id: string;
  user_id: string;
  name: string;
  email: string;
  type: string;
  phone: string;
  subscription_status: string;
  blocked: boolean;
  created_at: string;
  trial_ends_at: string | null;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  useEffect(() => { loadTenants(); }, []);

  useEffect(() => {
    let filtered = tenants;
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'blocked') {
        filtered = filtered.filter(t => t.blocked);
      } else {
        filtered = filtered.filter(t => t.subscription_status === statusFilter && !t.blocked);
      }
    }
    
    setFilteredTenants(filtered);
  }, [tenants, searchQuery, statusFilter]);

  const loadTenants = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setTenants(data as Tenant[]);
      setFilteredTenants(data as Tenant[]);
    }
    setLoading(false);
  };

  const toggleBlock = async (tenant: Tenant) => {
    const supabase = createClient();
    const newBlockedState = !tenant.blocked;
    
    await supabase
      .from('businesses')
      .update({ blocked: newBlockedState })
      .eq('id', tenant.id);
    
    setTenants(prev => prev.map(t => 
      t.id === tenant.id ? { ...t, blocked: newBlockedState } : t
    ));
  };

  const deleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Weet je zeker dat je "${tenant.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }
    
    const supabase = createClient();
    await supabase.from('businesses').delete().eq('id', tenant.id);
    setTenants(prev => prev.filter(t => t.id !== tenant.id));
  };

  const updateSubscription = async (tenant: Tenant, newStatus: string) => {
    const supabase = createClient();
    await supabase
      .from('businesses')
      .update({ subscription_status: newStatus })
      .eq('id', tenant.id);
    
    setTenants(prev => prev.map(t => 
      t.id === tenant.id ? { ...t, subscription_status: newStatus } : t
    ));
    setSelectedTenant(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (tenant: Tenant) => {
    if (tenant.blocked) {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Geblokkeerd' };
    }
    switch (tenant.subscription_status) {
      case 'active': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Actief' };
      case 'trial': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', label: 'Trial' };
      case 'cancelled': return { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', label: 'Geannuleerd' };
      default: return { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', label: tenant.subscription_status };
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Alle Tenants</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Beheer alle geregistreerde bedrijven</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek op naam of email..."
            style={{
              width: '100%', padding: '12px 12px 12px 40px', background: '#16161f', border: '1px solid #2a2a35',
              borderRadius: 8, color: 'white', fontSize: 14,
            }}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px', background: '#16161f', border: '1px solid #2a2a35',
            borderRadius: 8, color: 'white', fontSize: 14, cursor: 'pointer',
          }}
        >
          <option value="all">Alle statussen</option>
          <option value="active">Actief</option>
          <option value="trial">Trial</option>
          <option value="blocked">Geblokkeerd</option>
          <option value="cancelled">Geannuleerd</option>
        </select>
      </div>

      {/* Tenants Table */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
        ) : filteredTenants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Geen tenants gevonden</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0a0a0f' }}>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Bedrijf</th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Aangemaakt</th>
                  <th style={{ textAlign: 'right', padding: '16px', color: '#9ca3af', fontSize: 13, fontWeight: 500 }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => {
                  const status = getStatusBadge(tenant);
                  return (
                    <tr key={tenant.id} style={{ borderTop: '1px solid #2a2a35' }}>
                      <td style={{ padding: '16px' }}>
                        <p style={{ color: 'white', fontWeight: 500 }}>{tenant.name}</p>
                        <p style={{ color: '#6b7280', fontSize: 13 }}>{tenant.email || 'Geen email'}</p>
                      </td>
                      <td style={{ padding: '16px', color: '#9ca3af', textTransform: 'capitalize' }}>{tenant.type}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          background: status.bg, color: status.color,
                          padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#9ca3af' }}>{formatDate(tenant.created_at)}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            style={{
                              padding: 8, background: 'rgba(59, 130, 246, 0.15)', border: 'none',
                              borderRadius: 6, color: '#3b82f6', cursor: 'pointer',
                            }}
                            title="Bekijken/Bewerken"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => toggleBlock(tenant)}
                            style={{
                              padding: 8,
                              background: tenant.blocked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                              border: 'none', borderRadius: 6,
                              color: tenant.blocked ? '#22c55e' : '#f97316',
                              cursor: 'pointer',
                            }}
                            title={tenant.blocked ? 'Deblokkeren' : 'Blokkeren'}
                          >
                            {tenant.blocked ? <Check size={16} /> : <Ban size={16} />}
                          </button>
                          <button
                            onClick={() => deleteTenant(tenant)}
                            style={{
                              padding: 8, background: 'rgba(239, 68, 68, 0.15)', border: 'none',
                              borderRadius: 6, color: '#ef4444', cursor: 'pointer',
                            }}
                            title="Verwijderen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 32, maxWidth: 500, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
              <div>
                <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>{selectedTenant.name}</h2>
                <p style={{ color: '#6b7280', fontSize: 14 }}>{selectedTenant.email}</p>
              </div>
              <button onClick={() => setSelectedTenant(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ color: '#9ca3af', fontSize: 13 }}>Type</label>
                <p style={{ color: 'white', textTransform: 'capitalize' }}>{selectedTenant.type}</p>
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: 13 }}>Telefoon</label>
                <p style={{ color: 'white' }}>{selectedTenant.phone || 'Niet ingevuld'}</p>
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: 13 }}>Aangemaakt</label>
                <p style={{ color: 'white' }}>{formatDate(selectedTenant.created_at)}</p>
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Abonnement Status</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['trial', 'active', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => updateSubscription(selectedTenant, status)}
                      style={{
                        padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        background: selectedTenant.subscription_status === status ? '#f97316' : '#0a0a0f',
                        color: selectedTenant.subscription_status === status ? 'white' : '#9ca3af',
                        textTransform: 'capitalize',
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => toggleBlock(selectedTenant)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selectedTenant.blocked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: selectedTenant.blocked ? '#22c55e' : '#ef4444',
                  fontWeight: 500,
                }}
              >
                {selectedTenant.blocked ? 'Deblokkeren' : 'Blokkeren'}
              </button>
              <button
                onClick={() => setSelectedTenant(null)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: '#2a2a35', color: 'white', fontWeight: 500,
                }}
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
