'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Staff, WorkingHours } from '@/lib/database.types';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus,
  Pencil,
  Trash2,
  X,
  User,
  Mail,
  Phone,
  Check,
  Users,
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  working_hours: WorkingHours;
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
  monday: 'Maandag',
  tuesday: 'Dinsdag',
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag',
  saturday: 'Zaterdag',
  sunday: 'Zondag',
};

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  working_hours: defaultWorkingHours,
  is_active: true,
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Get business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      setLoading(false);
      return;
    }

    setBusinessId(business.id);

    // Get staff
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', business.id)
      .order('name', { ascending: true });

    if (staffError) {
      console.error('Error loading staff:', staffError);
    } else if (staffData) {
      setStaff(staffData);
    }

    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData(initialFormData);
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

  const closeModal = () => {
    setModalOpen(false);
    setEditingStaff(null);
    setFormData(initialFormData);
    setError('');
  };

  const updateWorkingHours = (day: string, field: 'start' | 'end' | 'working', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day],
          [field]: value,
        },
      },
    }));
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

    const staffData = {
      business_id: businessId,
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      working_hours: formData.working_hours,
      is_active: formData.is_active,
    };

    try {
      if (editingStaff) {
        // Update
        const { error: updateError } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', editingStaff.id);

        if (updateError) throw updateError;

        setStaff(staff.map(s => 
          s.id === editingStaff.id 
            ? { ...s, ...staffData, updated_at: new Date().toISOString() } 
            : s
        ));
      } else {
        // Create
        const { data, error: insertError } = await supabase
          .from('staff')
          .insert([staffData])
          .select()
          .single();

        if (insertError) throw insertError;
        if (data) {
          setStaff([...staff, data]);
        }
      }

      closeModal();
    } catch (err) {
      console.error('Error saving staff:', err);
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
        .from('staff')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setStaff(staff.filter(s => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting staff:', err);
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      alert('Kon medewerker niet verwijderen: ' + errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const getWorkingDays = (hours: WorkingHours | null) => {
    if (!hours) return '-';
    const workingDays = Object.entries(hours)
      .filter(([, val]) => val.working)
      .map(([day]) => dayLabels[day]?.substring(0, 2))
      .join(', ');
    return workingDays || 'Geen';
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
            Medewerkers
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>
            Beheer je teamleden en hun werkuren
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
          Nieuwe medewerker
        </button>
      </div>

      {/* Staff list */}
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
        ) : staff.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 60,
            color: '#6b7280',
          }}>
            <Users size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ marginBottom: 16 }}>Nog geen medewerkers toegevoegd</p>
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
              Voeg je eerste medewerker toe
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: 1,
            background: '#2a2a35',
          }}>
            {staff.map((member) => (
              <div
                key={member.id}
                style={{
                  background: '#16161f',
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(249, 115, 22, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f97316',
                    }}>
                      <User size={20} />
                    </div>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>
                        {member.name}
                      </p>
                      <span style={{
                        display: 'inline-flex',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        background: member.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                        color: member.is_active ? '#22c55e' : '#6b7280',
                      }}>
                        {member.is_active ? 'Actief' : 'Inactief'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openEditModal(member)}
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
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(member.id)}
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
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {member.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Mail size={14} />
                      {member.email}
                    </div>
                  )}
                  {member.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Phone size={14} />
                      {member.phone}
                    </div>
                  )}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a35' }}>
                    <span style={{ color: '#6b7280' }}>Werkdagen: </span>
                    <span style={{ color: '#9ca3af' }}>{getWorkingDays(member.working_hours)}</span>
                  </div>
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
            maxWidth: 600,
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
                {editingStaff ? 'Medewerker bewerken' : 'Nieuwe medewerker'}
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
                  placeholder="Volledige naam"
                />
              </div>

              {/* Email & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    placeholder="email@voorbeeld.be"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    placeholder="+32 ..."
                  />
                </div>
              </div>

              {/* Working hours */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>
                  Werkuren
                </label>
                <div style={{ 
                  background: '#0a0a0f', 
                  borderRadius: 8, 
                  border: '1px solid #2a2a35',
                  overflow: 'hidden',
                }}>
                  {Object.entries(dayLabels).map(([day, label]) => (
                    <div 
                      key={day}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderBottom: day !== 'sunday' ? '1px solid #2a2a35' : 'none',
                      }}
                    >
                      {/* Toggle */}
                      <div 
                        onClick={() => updateWorkingHours(day, 'working', !formData.working_hours[day].working)}
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: 10,
                          background: formData.working_hours[day].working ? '#f97316' : '#2a2a35',
                          position: 'relative',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: 3,
                          left: formData.working_hours[day].working ? 19 : 3,
                          transition: 'left 0.2s',
                        }} />
                      </div>

                      {/* Day name */}
                      <span style={{ 
                        width: 80, 
                        color: formData.working_hours[day].working ? 'white' : '#6b7280',
                        fontSize: 14,
                      }}>
                        {label}
                      </span>

                      {/* Time inputs */}
                      {formData.working_hours[day].working && (
                        <>
                          <input
                            type="time"
                            value={formData.working_hours[day].start}
                            onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              background: '#16161f',
                              border: '1px solid #2a2a35',
                              borderRadius: 4,
                              color: 'white',
                              fontSize: 13,
                              outline: 'none',
                            }}
                          />
                          <span style={{ color: '#6b7280' }}>-</span>
                          <input
                            type="time"
                            value={formData.working_hours[day].end}
                            onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                            style={{
                              padding: '6px 8px',
                              background: '#16161f',
                              border: '1px solid #2a2a35',
                              borderRadius: 4,
                              color: 'white',
                              fontSize: 13,
                              outline: 'none',
                            }}
                          />
                        </>
                      )}
                    </div>
                  ))}
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
                    Medewerker is actief
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
                      {editingStaff ? 'Opslaan' : 'Toevoegen'}
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
              Medewerker verwijderen?
            </h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>
              Weet je zeker dat je deze medewerker wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
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
