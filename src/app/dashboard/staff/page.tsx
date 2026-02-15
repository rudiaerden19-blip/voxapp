'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useBusiness } from '@/lib/BusinessContext';
import { Plus, Pencil, Trash2, X, User, Mail, Phone, Check, Users, Info } from 'lucide-react';

interface WorkingHours {
  [key: string]: { start: string; end: string; working: boolean };
}

interface Staff {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  working_hours: WorkingHours | null;
  is_active: boolean;
}

const defaultWorkingHours: WorkingHours = {
  monday: { start: '09:00', end: '17:00', working: true },
  tuesday: { start: '09:00', end: '17:00', working: true },
  wednesday: { start: '09:00', end: '17:00', working: true },
  thursday: { start: '09:00', end: '17:00', working: true },
  friday: { start: '09:00', end: '17:00', working: true },
  saturday: { start: '09:00', end: '13:00', working: false },
  sunday: { start: '09:00', end: '13:00', working: false },
};

const dayLabels: Record<string, string> = {
  monday: 'Maandag', tuesday: 'Dinsdag', wednesday: 'Woensdag', thursday: 'Donderdag',
  friday: 'Vrijdag', saturday: 'Zaterdag', sunday: 'Zondag',
};

export default function StaffPage() {
  const { t, language } = useLanguage();
  const { businessId, loading: businessLoading } = useBusiness();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', working_hours: defaultWorkingHours, is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const loading = businessLoading || dataLoading;

  useEffect(() => { 
    if (businessId) loadStaff(); 
  }, [businessId]);

  const loadStaff = async () => {
    if (!businessId) return;
    
    const supabase = createClient();
    const { data: staffData } = await supabase.from('staff').select('*').eq('business_id', businessId).order('name');
    if (staffData) setStaff(staffData as Staff[]);
    setDataLoading(false);
  };

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', phone: '', working_hours: defaultWorkingHours, is_active: true });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: member.phone || '',
      working_hours: member.working_hours || defaultWorkingHours,
      is_active: member.is_active,
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingStaff(null); setError(''); };

  const updateWorkingHours = (day: string, field: 'start' | 'end' | 'working', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      working_hours: { ...prev.working_hours, [day]: { ...prev.working_hours[day], [field]: value } },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setError('Naam is verplicht'); return; }
    if (!businessId) { setError('Geen bedrijf gevonden'); return; }

    setSaving(true);
    setError('');
    const supabase = createClient();

    try {
      if (editingStaff) {
        const updateData = {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          working_hours: formData.working_hours,
          is_active: formData.is_active,
        };
        await supabase.from('staff').update(updateData).eq('id', editingStaff.id);
        setStaff(staff.map(s => s.id === editingStaff.id ? { ...s, ...updateData, id: s.id } as Staff : s));
      } else {
        const insertData = {
          business_id: businessId,
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          working_hours: formData.working_hours,
          is_active: formData.is_active,
        };
        const { data } = await supabase.from('staff').insert(insertData).select().single();
        if (data) setStaff([...staff, data as Staff]);
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
    await supabase.from('staff').delete().eq('id', id);
    setStaff(staff.filter(s => s.id !== id));
    setDeleteConfirm(null);
    setDeleting(false);
  };

  const getWorkingDays = (hours: WorkingHours | null) => {
    if (!hours) return '-';
    return Object.entries(hours).filter(([, v]) => v.working).map(([d]) => dayLabels[d]?.substring(0, 2)).join(', ') || 'Geen';
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('staff.title')}</h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>{t('staff.subtitle')}</p>
        </div>
        <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> {t('staff.addStaff')}
        </button>
      </div>

      {/* Info box */}
      <div style={{ 
        background: 'rgba(59, 130, 246, 0.1)', 
        border: '1px solid rgba(59, 130, 246, 0.3)', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <Info size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ color: '#3b82f6', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Waarom medewerkers toevoegen?</p>
          <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.5 }}>
            Wanneer je medewerkers toevoegt, kunnen klanten bij het maken van een afspraak kiezen bij welke medewerker ze willen boeken. 
            Perfect voor kapsalons, schoonheidssalons of praktijken waar klanten een voorkeur hebben voor een specifieke medewerker.
          </p>
        </div>
      </div>

      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>{t('dashboard.loading')}</div>
        ) : staff.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <Users size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ marginBottom: 16 }}>{t('staff.noStaff')}</p>
            <button onClick={openCreateModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={16} /> {t('staff.addFirstStaff')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1, background: '#2a2a35' }}>
            {staff.map((member) => (
              <div key={member.id} style={{ background: '#16161f', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}><User size={20} /></div>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>{member.name}</p>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: member.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)', color: member.is_active ? '#22c55e' : '#6b7280' }}>{member.is_active ? t('common.active') : t('common.inactive')}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEditModal(member)} style={{ background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6, padding: 8, color: '#f97316', cursor: 'pointer' }}><Pencil size={14} /></button>
                    <button onClick={() => setDeleteConfirm(member.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 6, padding: 8, color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {member.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Mail size={14} />{member.email}</div>}
                  {member.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Phone size={14} />{member.phone}</div>}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a35' }}>
                    <span style={{ color: '#6b7280' }}>Werkdagen: </span><span>{getWorkingDays(member.working_hours)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #2a2a35' }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{editingStaff ? 'Medewerker bewerken' : 'Nieuwe medewerker'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Naam *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="Volledige naam" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>E-mail</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="email@voorbeeld.be" />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Telefoon</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="+32 ..." />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>Werkuren</label>
                <div style={{ background: '#0a0a0f', borderRadius: 8, border: '1px solid #2a2a35', overflow: 'hidden' }}>
                  {Object.entries(dayLabels).map(([day, label]) => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: day !== 'sunday' ? '1px solid #2a2a35' : 'none' }}>
                      <div onClick={() => updateWorkingHours(day, 'working', !formData.working_hours[day].working)} style={{ width: 36, height: 20, borderRadius: 10, background: formData.working_hours[day].working ? '#f97316' : '#2a2a35', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: formData.working_hours[day].working ? 19 : 3, transition: 'left 0.2s' }} />
                      </div>
                      <span style={{ width: 80, color: formData.working_hours[day].working ? 'white' : '#6b7280', fontSize: 14 }}>{label}</span>
                      {formData.working_hours[day].working && (
                        <>
                          <input type="time" value={formData.working_hours[day].start} onChange={(e) => updateWorkingHours(day, 'start', e.target.value)} style={{ padding: '6px 8px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 4, color: 'white', fontSize: 13 }} />
                          <span style={{ color: '#6b7280' }}>-</span>
                          <input type="time" value={formData.working_hours[day].end} onChange={(e) => updateWorkingHours(day, 'end', e.target.value)} style={{ padding: '6px 8px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 4, color: 'white', fontSize: 13 }} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div onClick={() => setFormData({ ...formData, is_active: !formData.is_active })} style={{ width: 44, height: 24, borderRadius: 12, background: formData.is_active ? '#f97316' : '#2a2a35', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: formData.is_active ? 23 : 3, transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>Medewerker is actief</span>
                </label>
              </div>
              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, marginBottom: 20, color: '#ef4444', fontSize: 14 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px 20px', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Annuleren</button>
                <button type="submit" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: saving ? '#6b7280' : '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Opslaan...' : <><Check size={16} />{editingStaff ? 'Opslaan' : 'Toevoegen'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, maxWidth: 400, width: '100%' }}>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Medewerker verwijderen?</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>Weet je zeker dat je deze medewerker wilt verwijderen?</p>
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
