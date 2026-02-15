'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { Search, Ban, Check, Trash2, Eye, UserPlus, X, Settings, ExternalLink } from 'lucide-react';
import { MODULES, BUSINESS_TYPES, getBusinessType, ModuleId } from '@/lib/modules';

interface Tenant {
  id: string;
  user_id?: string;
  name: string;
  email?: string | null;
  type?: string;
  phone?: string | null;
  subscription_status?: string;
  blocked?: boolean;
  created_at: string;
  trial_ends_at?: string | null;
  enabled_modules?: ModuleId[];  // Custom modules per tenant
}

const ITEMS_PER_PAGE = 25;

// Alle beschikbare modules
const ALL_MODULES: ModuleId[] = Object.keys(MODULES) as ModuleId[];

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingModules, setEditingModules] = useState<ModuleId[]>([]);
  const [savingModules, setSavingModules] = useState(false);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTenants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [tenants, searchQuery, statusFilter]);

  const loadTenants = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    const tenantData = (data || []) as unknown as Tenant[];
    setTenants(tenantData);
    setFilteredTenants(tenantData);
    setLoading(false);
  };

  const toggleBlock = async (tenant: Tenant) => {
    const supabase = createClient();
    const newBlockedState = !tenant.blocked;
    
    await supabase
      .from('businesses')
      .update({ blocked: newBlockedState } as any)
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
    setSelectedTenant(prev => prev ? { ...prev, subscription_status: newStatus } : null);
  };

  // Open tenant detail and load their modules
  const openTenantDetail = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    // Load modules: either custom or default from business type
    const defaultModules = tenant.type ? getBusinessType(tenant.type).modules : [];
    setEditingModules(tenant.enabled_modules || defaultModules);
  };

  // Toggle module on/off
  const toggleModule = (moduleId: ModuleId) => {
    setEditingModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Save modules for tenant
  const saveModules = async () => {
    if (!selectedTenant) return;
    setSavingModules(true);
    
    const supabase = createClient();
    await supabase
      .from('businesses')
      .update({ enabled_modules: editingModules } as any)
      .eq('id', selectedTenant.id);
    
    setTenants(prev => prev.map(t => 
      t.id === selectedTenant.id ? { ...t, enabled_modules: editingModules } : t
    ));
    setSelectedTenant(prev => prev ? { ...prev, enabled_modules: editingModules } : null);
    setSavingModules(false);
  };

  // Reset to default modules for business type
  const resetToDefaultModules = () => {
    if (!selectedTenant?.type) return;
    const defaultModules = getBusinessType(selectedTenant.type).modules;
    setEditingModules(defaultModules);
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
          <>
          {/* Results count */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: 14 }}>
              {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''} gevonden
              {filteredTenants.length > ITEMS_PER_PAGE && ` • Pagina ${currentPage} van ${totalPages}`}
            </span>
          </div>
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
                {paginatedTenants.map((tenant) => {
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
                            onClick={() => openTenantDetail(tenant)}
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ padding: '16px', borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px', background: currentPage === 1 ? '#0a0a0f' : '#2a2a35',
                  border: 'none', borderRadius: 6, color: currentPage === 1 ? '#6b7280' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: 14,
                }}
              >
                Vorige
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      padding: '8px 14px',
                      background: currentPage === pageNum ? '#ef4444' : '#2a2a35',
                      border: 'none', borderRadius: 6,
                      color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: currentPage === pageNum ? 600 : 400,
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px', background: currentPage === totalPages ? '#0a0a0f' : '#2a2a35',
                  border: 'none', borderRadius: 6, color: currentPage === totalPages ? '#6b7280' : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: 14,
                }}
              >
                Volgende
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24, overflowY: 'auto' }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 32, maxWidth: 600, width: '100%', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {selectedTenant.type && (
                  <span style={{ fontSize: 32 }}>{getBusinessType(selectedTenant.type).icon}</span>
                )}
                <div>
                  <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>{selectedTenant.name}</h2>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>{selectedTenant.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTenant(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13 }}>Type</label>
                  <p style={{ color: 'white' }}>{selectedTenant.type ? getBusinessType(selectedTenant.type).name : 'Onbekend'}</p>
                </div>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13 }}>Telefoon</label>
                  <p style={{ color: 'white' }}>{selectedTenant.phone || 'Niet ingevuld'}</p>
                </div>
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

            {/* MODULES SECTIE */}
            <div style={{ background: '#0a0a0f', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Settings size={18} color="#f97316" />
                  <h3 style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>Modules</h3>
                </div>
                <button
                  onClick={resetToDefaultModules}
                  style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Reset naar standaard
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {ALL_MODULES.map(moduleId => {
                  const module = MODULES[moduleId];
                  const isEnabled = editingModules.includes(moduleId);
                  return (
                    <div
                      key={moduleId}
                      onClick={() => toggleModule(moduleId)}
                      style={{
                        padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                        background: isEnabled ? 'rgba(249, 115, 22, 0.15)' : '#16161f',
                        border: isEnabled ? '2px solid #f97316' : '1px solid #2a2a35',
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{module.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: isEnabled ? '#f97316' : '#9ca3af', fontWeight: isEnabled ? 600 : 400, fontSize: 13, margin: 0 }}>
                          {module.name}
                        </p>
                      </div>
                      <div style={{
                        width: 20, height: 20, borderRadius: 4,
                        background: isEnabled ? '#f97316' : 'transparent',
                        border: isEnabled ? 'none' : '2px solid #4b5563',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isEnabled && <Check size={14} color="white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={saveModules}
                disabled={savingModules}
                style={{
                  width: '100%', marginTop: 16, padding: '12px 16px', borderRadius: 8,
                  background: savingModules ? '#4b5563' : '#f97316', border: 'none',
                  color: 'white', fontWeight: 600, cursor: savingModules ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {savingModules ? 'Opslaan...' : <><Check size={16} /> Modules Opslaan</>}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href={`/dashboard?admin_view=${selectedTenant.id}`}
                target="_blank"
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none',
                  background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6',
                  fontWeight: 500, textDecoration: 'none', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <ExternalLink size={16} /> Bekijk Dashboard
              </a>
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
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
