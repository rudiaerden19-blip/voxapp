'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Pencil, Trash2, X, Clock, Euro, Briefcase, Check } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', duration_minutes: 30, price: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businessData } = await supabase.from('businesses').select('*').eq('user_id', user.id).single();
    if (!businessData) { setLoading(false); return; }

    const bizId = (businessData as { id: string }).id;
    setBusinessId(bizId);

    const { data: servicesData } = await supabase.from('services').select('*').eq('business_id', bizId).order('name');
    if (servicesData) setServices(servicesData as Service[]);
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', duration_minutes: 30, price: '', is_active: true });
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

  const closeModal = () => { setModalOpen(false); setEditingService(null); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Naam is verplicht'); return; }
    if (!businessId) { setError('Geen bedrijf gevonden'); return; }

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
        await supabase.from('services').update(serviceData).eq('id', editingService.id);
        setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } as Service : s));
      } else {
        const { data } = await supabase.from('services').insert([serviceData]).select().single();
        if (data) setServices([...services, data as Service]);
      }
      closeModal();
    } catch (err) {
      setError('Er ging iets mis bij het opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('services').delete().eq('id', id);
    setServices(services.filter(s => s.id !== id));
    setDeleteConfirm(null);
    setDeleting(false);
  };

  const formatPrice = (price: number | null) => price === null ? '-' : new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(price);
  const formatDuration = (min: number) => min < 60 ? `${min} min` : `${Math.floor(min/60)}u${min%60 > 0 ? ` ${min%60}min` : ''}`;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Diensten</h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Beheer de diensten die je aanbiedt</p>
        </div>
        <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> Nieuwe dienst
        </button>
      </div>

      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <Briefcase size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ marginBottom: 16 }}>Nog geen diensten toegevoegd</p>
            <button onClick={openCreateModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={16} /> Voeg je eerste dienst toe
            </button>
          </div>
        ) : (
          <div>
            {services.map((service) => (
              <div key={service.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #2a2a35' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontWeight: 500, marginBottom: 4 }}>{service.name}</p>
                  {service.description && <p style={{ color: '#6b7280', fontSize: 13 }}>{service.description.substring(0, 60)}{service.description.length > 60 ? '...' : ''}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}><Clock size={14} style={{ marginRight: 4 }} />{formatDuration(service.duration_minutes)}</span>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>{formatPrice(service.price)}</span>
                  <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: service.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)', color: service.is_active ? '#22c55e' : '#6b7280' }}>{service.is_active ? 'Actief' : 'Inactief'}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEditModal(service)} style={{ background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6, padding: 8, color: '#f97316', cursor: 'pointer' }}><Pencil size={16} /></button>
                    <button onClick={() => setDeleteConfirm(service.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 6, padding: 8, color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #2a2a35' }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{editingService ? 'Dienst bewerken' : 'Nieuwe dienst'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Naam *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="bijv. Knippen" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Beschrijving</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }} placeholder="Korte beschrijving..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Duur (minuten)</label>
                  <input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })} min="5" step="5" style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Prijs (EUR)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} min="0" step="0.01" style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="0.00" />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div onClick={() => setFormData({ ...formData, is_active: !formData.is_active })} style={{ width: 44, height: 24, borderRadius: 12, background: formData.is_active ? '#f97316' : '#2a2a35', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: formData.is_active ? 23 : 3, transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>Dienst is actief</span>
                </label>
              </div>
              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, marginBottom: 20, color: '#ef4444', fontSize: 14 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px 20px', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Annuleren</button>
                <button type="submit" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: saving ? '#6b7280' : '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Opslaan...' : <><Check size={16} />{editingService ? 'Opslaan' : 'Toevoegen'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, maxWidth: 400, width: '100%' }}>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Dienst verwijderen?</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>Weet je zeker dat je deze dienst wilt verwijderen?</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '12px 20px', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Annuleren</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} style={{ flex: 1, padding: '12px 20px', background: deleting ? '#6b7280' : '#ef4444', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer' }}>{deleting ? 'Verwijderen...' : 'Verwijderen'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
