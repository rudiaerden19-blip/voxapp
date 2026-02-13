'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, ChevronLeft, ChevronRight, X, Clock, User, Check, Trash2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
}

interface Staff {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  service_id: string | null;
  staff_id: string | null;
}

const statusOptions = [
  { value: 'scheduled', label: 'Gepland', color: '#f97316' },
  { value: 'confirmed', label: 'Bevestigd', color: '#22c55e' },
  { value: 'completed', label: 'Voltooid', color: '#6b7280' },
  { value: 'cancelled', label: 'Geannuleerd', color: '#ef4444' },
  { value: 'no_show', label: 'No-show', color: '#ef4444' },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    start_time: '09:00',
    service_id: '',
    staff_id: '',
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (businessId) loadAppointments(); }, [currentDate, businessId]);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: business } = await supabase.from('businesses').select('*').eq('user_id', user.id).single();
    if (!business) { setLoading(false); return; }

    const bizId = (business as { id: string }).id;
    setBusinessId(bizId);

    const [servicesRes, staffRes] = await Promise.all([
      supabase.from('services').select('id, name, duration_minutes').eq('business_id', bizId).eq('is_active', true),
      supabase.from('staff').select('id, name').eq('business_id', bizId).eq('is_active', true),
    ]);

    if (servicesRes.data) setServices(servicesRes.data as Service[]);
    if (staffRes.data) setStaff(staffRes.data as Staff[]);
    setLoading(false);
  };

  const loadAppointments = async () => {
    if (!businessId) return;
    const supabase = createClient();

    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString())
      .order('start_time');

    if (data) setAppointments(data as Appointment[]);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before first day of month
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    for (let i = 0; i < startDay; i++) days.push(null);

    // Add all days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const openCreateModal = (date?: Date) => {
    setEditingAppointment(null);
    setSelectedDate(date || new Date());
    setFormData({
      customer_name: '', customer_phone: '', customer_email: '',
      start_time: '09:00', service_id: '', staff_id: '', status: 'scheduled', notes: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setSelectedDate(new Date(apt.start_time));
    setFormData({
      customer_name: apt.customer_name,
      customer_phone: apt.customer_phone || '',
      customer_email: apt.customer_email || '',
      start_time: new Date(apt.start_time).toTimeString().slice(0, 5),
      service_id: apt.service_id || '',
      staff_id: apt.staff_id || '',
      status: apt.status,
      notes: apt.notes || '',
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingAppointment(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) { setError('Klantnaam is verplicht'); return; }
    if (!businessId || !selectedDate) return;

    setSaving(true);
    setError('');
    const supabase = createClient();

    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = formData.start_time.split(':');
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const duration = formData.service_id 
      ? services.find(s => s.id === formData.service_id)?.duration_minutes || 30 
      : 30;
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    try {
      if (editingAppointment) {
        const updateData = {
          customer_name: formData.customer_name.trim(),
          customer_phone: formData.customer_phone.trim() || null,
          customer_email: formData.customer_email.trim() || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          service_id: formData.service_id || null,
          staff_id: formData.staff_id || null,
          status: formData.status,
          notes: formData.notes.trim() || null,
        };
        await supabase.from('appointments').update(updateData).eq('id', editingAppointment.id);
      } else {
        const insertData = {
          business_id: businessId,
          customer_name: formData.customer_name.trim(),
          customer_phone: formData.customer_phone.trim() || null,
          customer_email: formData.customer_email.trim() || null,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          service_id: formData.service_id || null,
          staff_id: formData.staff_id || null,
          status: formData.status,
          notes: formData.notes.trim() || null,
        };
        await supabase.from('appointments').insert(insertData);
      }
      await loadAppointments();
      closeModal();
    } catch (err) {
      setError('Er ging iets mis bij het opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAppointment) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('appointments').delete().eq('id', editingAppointment.id);
    await loadAppointments();
    closeModal();
    setSaving(false);
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Afspraken</h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Beheer je agenda en afspraken</p>
        </div>
        <button onClick={() => openCreateModal()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={18} /> Nieuwe afspraak
        </button>
      </div>

      {/* Calendar */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', overflow: 'hidden' }}>
        {/* Calendar header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #2a2a35' }}>
          <button onClick={prevMonth} style={{ background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 8, padding: 10, color: '#f97316', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} style={{ background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 8, padding: 10, color: '#f97316', cursor: 'pointer' }}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day names */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #2a2a35' }}>
          {dayNames.map(day => (
            <div key={day} style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} style={{ minHeight: 100, background: '#0a0a0f', borderRight: '1px solid #2a2a35', borderBottom: '1px solid #2a2a35' }} />;
              }

              const dayAppointments = getAppointmentsForDate(date);
              const today = isToday(date);

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => openCreateModal(date)}
                  style={{
                    minHeight: 100, padding: 8, cursor: 'pointer',
                    background: today ? 'rgba(249, 115, 22, 0.1)' : '#0a0a0f',
                    borderRight: '1px solid #2a2a35', borderBottom: '1px solid #2a2a35',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: today ? '#f97316' : 'transparent',
                    color: today ? 'white' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: today ? 600 : 400, marginBottom: 4,
                  }}>
                    {date.getDate()}
                  </div>
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                      style={{
                        fontSize: 11, padding: '3px 6px', borderRadius: 4, marginBottom: 2,
                        background: statusOptions.find(s => s.value === apt.status)?.color || '#6b7280',
                        color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {formatTime(apt.start_time)} {apt.customer_name}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div style={{ fontSize: 10, color: '#6b7280', paddingLeft: 6 }}>
                      +{dayAppointments.length - 3} meer
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #2a2a35' }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
                {editingAppointment ? 'Afspraak bewerken' : 'Nieuwe afspraak'}
                {selectedDate && <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: 8 }}>
                  - {selectedDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}><User size={14} style={{ marginRight: 6 }} />Klantnaam *</label>
                <input type="text" value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="Jan Janssen" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Telefoon</label>
                  <input type="tel" value={formData.customer_phone} onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="+32 ..." />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>E-mail</label>
                  <input type="email" value={formData.customer_email} onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="jan@email.be" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}><Clock size={14} style={{ marginRight: 6 }} />Tijd</label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}>
                    {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Dienst</label>
                  <select value={formData.service_id} onChange={(e) => setFormData({ ...formData, service_id: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}>
                    <option value="">Geen dienst</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Medewerker</label>
                  <select value={formData.staff_id} onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}>
                    <option value="">Geen medewerker</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Notities</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }} placeholder="Extra opmerkingen..." />
              </div>

              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, marginBottom: 20, color: '#ef4444', fontSize: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 12 }}>
                {editingAppointment && (
                  <button type="button" onClick={handleDelete} disabled={saving} style={{ padding: '12px 20px', background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 8, color: '#ef4444', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Trash2 size={16} /> Verwijderen
                  </button>
                )}
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px 20px', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Annuleren</button>
                <button type="submit" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: saving ? '#6b7280' : '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Opslaan...' : <><Check size={16} /> Opslaan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
