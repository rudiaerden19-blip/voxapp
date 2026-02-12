'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Service } from '@/lib/database.types';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus,
  Pencil,
  Trash2,
  X,
  Clock,
  Euro,
  Briefcase,
  Check,
} from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  duration_minutes: number;
  price: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  duration_minutes: 30,
  price: '',
  is_active: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
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

    const currentBusinessId = business.id;
    setBusinessId(currentBusinessId);

    // Get services
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', currentBusinessId)
      .order('name', { ascending: true });

    if (servicesError) {
      console.error('Error loading services:', servicesError);
    } else if (servicesData) {
      setServices(servicesData);
    }

    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData(initialFormData);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price?.toString() || '',
      is_active: service.is_active,
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingService(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Naam is verplicht');
      return;
    }

    if (!businessId) {
      setError('Geen bedrijf gevonden');
      return;
    }

    setSaving(true);
    setError('');

    const supabase = createClient();

    const serviceData = {
      business_id: businessId,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      duration_minutes: formData.duration_minutes,
      price: formData.price ? parseFloat(formData.price) : null,
      is_active: formData.is_active,
    };

    try {
      if (editingService) {
        // Update
        const { error: updateError } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (updateError) throw updateError;

        setServices(services.map(s => 
          s.id === editingService.id 
            ? { ...s, ...serviceData, updated_at: new Date().toISOString() } 
            : s
        ));
      } else {
        // Create
        const { data, error: insertError } = await supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single();

        if (insertError) throw insertError;
        if (data) {
          setServices([...services, data]);
        }
      }

      closeModal();
    } catch (err) {
      console.error('Error saving service:', err);
      const errorMessage = err instanceof Error ? err.message : 'Er ging iets mis bij het opslaan';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const supabase = createClient();

    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setServices(services.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      alert('Kon dienst niet verwijderen: ' + errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}u ${mins}min` : `${hours}u`;
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 32,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Diensten
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>
            Beheer de diensten die je aanbiedt
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          Nieuwe dienst
        </button>
      </div>

      {/* Services list */}
      <div style={{
        background: '#16161f',
        borderRadius: 16,
        border: '1px solid #2a2a35',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            Laden...
          </div>
        ) : services.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 60,
            color: '#6b7280',
          }}>
            <Briefcase size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ marginBottom: 16 }}>Nog geen diensten toegevoegd</p>
            <button
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              Voeg je eerste dienst toe
            </button>
          </div>
        ) : (
          <div>
            {/* Table header - desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 100px 80px 100px',
              gap: 16,
              padding: '16px 24px',
              background: '#0a0a0f',
              borderBottom: '1px solid #2a2a35',
              fontSize: 12,
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }} className="services-header">
              <div>Naam</div>
              <div>Duur</div>
              <div>Prijs</div>
              <div>Status</div>
              <div style={{ textAlign: 'right' }}>Acties</div>
            </div>

            {/* Table rows */}
            {services.map((service) => (
              <div
                key={service.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 100px 80px 100px',
                  gap: 16,
                  padding: '16px 24px',
                  borderBottom: '1px solid #2a2a35',
                  alignItems: 'center',
                }}
                className="services-row"
              >
                <div>
                  <p style={{ color: 'white', fontWeight: 500, marginBottom: 4 }}>
                    {service.name}
                  </p>
                  {service.description && (
                    <p style={{ color: '#6b7280', fontSize: 13 }}>
                      {service.description.length > 60 
                        ? service.description.substring(0, 60) + '...' 
                        : service.description
                      }
                    </p>
                  )}
                </div>
                <div style={{ color: '#9ca3af', fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} />
                    {formatDuration(service.duration_minutes)}
                  </div>
                </div>
                <div style={{ color: '#9ca3af', fontSize: 14 }}>
                  {formatPrice(service.price)}
                </div>
                <div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                    background: service.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                    color: service.is_active ? '#22c55e' : '#6b7280',
                  }}>
                    {service.is_active ? 'Actief' : 'Inactief'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => openEditModal(service)}
                    style={{
                      background: 'rgba(249, 115, 22, 0.15)',
                      border: 'none',
                      borderRadius: 6,
                      padding: 8,
                      color: '#f97316',
                      cursor: 'pointer',
                    }}
                    title="Bewerken"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(service.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: 'none',
                      borderRadius: 6,
                      padding: 8,
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                    title="Verwijderen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 24,
        }}>
          <div style={{
            background: '#16161f',
            borderRadius: 16,
            border: '1px solid #2a2a35',
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #2a2a35',
            }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
                {editingService ? 'Dienst bewerken' : 'Nieuwe dienst'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  Naam *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                    outline: 'none',
                  }}
                  placeholder="bijv. Knippen"
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  Beschrijving
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                  placeholder="Korte beschrijving van de dienst..."
                />
              </div>

              {/* Duration & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                    Duur (minuten)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ 
                      position: 'absolute', 
                      left: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                    }} />
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                      min="5"
                      step="5"
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 40px',
                        background: '#0a0a0f',
                        border: '1px solid #2a2a35',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 16,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                    Prijs (EUR)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Euro size={16} style={{ 
                      position: 'absolute', 
                      left: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6b7280',
                    }} />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 40px',
                        background: '#0a0a0f',
                        border: '1px solid #2a2a35',
                        borderRadius: 8,
                        color: 'white',
                        fontSize: 16,
                        outline: 'none',
                      }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Active toggle */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  cursor: 'pointer',
                }}>
                  <div 
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: formData.is_active ? '#f97316' : '#2a2a35',
                      position: 'relative',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: 3,
                      left: formData.is_active ? 23 : 3,
                      transition: 'left 0.2s',
                    }} />
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>
                    Dienst is actief en boekbaar
                  </span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  color: '#ef4444',
                  fontSize: 14,
                }}>
                  {error}
                </div>
              )}

              {/* Submit buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: 'transparent',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: '#9ca3af',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    background: saving ? '#6b7280' : '#f97316',
                    border: 'none',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Opslaan...' : (
                    <>
                      <Check size={16} />
                      {editingService ? 'Opslaan' : 'Toevoegen'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 24,
        }}>
          <div style={{
            background: '#16161f',
            borderRadius: 16,
            border: '1px solid #2a2a35',
            padding: 24,
            maxWidth: 400,
            width: '100%',
          }}>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              Dienst verwijderen?
            </h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>
              Weet je zeker dat je deze dienst wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'transparent',
                  border: '1px solid #2a2a35',
                  borderRadius: 8,
                  color: '#9ca3af',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Annuleren
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: deleting ? '#6b7280' : '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Verwijderen...' : 'Verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
