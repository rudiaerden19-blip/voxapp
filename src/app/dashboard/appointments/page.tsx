'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useBusiness } from '@/lib/BusinessContext';
import { Plus, ChevronLeft, ChevronRight, X, Clock, User, Check, Trash2, Settings, Calendar } from 'lucide-react';

// Business types that use medical/professional appointment form
const ZORG_TYPES = ['dokter', 'ziekenhuis', 'tandarts', 'opticien', 'dierenkliniek', 'advocaat', 'boekhouder', 'loodgieter'];

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

type ViewMode = 'day' | 'week' | 'month';

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const { business, businessId, businessType, loading: businessLoading } = useBusiness();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  
  // Configurable settings
  const [slotsPerHour, setSlotsPerHour] = useState(4);
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(18);

  // Determine if this is a zorg type from context
  const isZorgType = ZORG_TYPES.includes(businessType);
  const loading = businessLoading || dataLoading;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_firstname: '',
    customer_lastname: '',
    customer_birthdate: '',
    customer_phone: '',
    customer_email: '',
    start_time: '09:00',
    service_id: '',
    staff_id: '',
    status: 'scheduled',
    notes: '',
    reason: '',
  });

  // Load services and staff when businessId becomes available
  useEffect(() => {
    if (businessId) {
      loadServicesAndStaff();
    }
  }, [businessId]);

  // Load appointments when date/view changes
  useEffect(() => { 
    if (businessId) loadAppointments(); 
  }, [currentDate, businessId, viewMode]);

  const loadServicesAndStaff = async () => {
    if (!businessId) return;
    
    try {
      setDataLoading(true);
      
      // Load services and staff via admin APIs (parallel)
      const [servicesRes, staffRes] = await Promise.all([
        fetch(`/api/admin/services?business_id=${businessId}`),
        fetch(`/api/admin/staff?business_id=${businessId}`),
      ]);

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        if (Array.isArray(servicesData)) setServices(servicesData);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        if (Array.isArray(staffData)) setStaff(staffData);
      }
    } catch (err) {
      console.error('Failed to load services/staff:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!businessId) return;

    let rangeStart: Date, rangeEnd: Date;
    
    if (viewMode === 'day') {
      rangeStart = new Date(currentDate);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(currentDate);
      rangeEnd.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
      rangeStart = new Date(currentDate);
      rangeStart.setDate(diff);
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeStart.getDate() + 6);
      rangeEnd.setHours(23, 59, 59, 999);
    } else {
      rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    }

    try {
      const res = await fetch(`/api/admin/appointments?business_id=${businessId}&start_date=${rangeStart.toISOString()}&end_date=${rangeEnd.toISOString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAppointments(data as Appointment[]);
      }
    } catch (e) {
      console.error('Failed to load appointments:', e);
    }
  };

  const getHours = () => {
    const hours = [];
    for (let h = startHour; h < endHour; h++) {
      hours.push(h);
    }
    return hours;
  };

  const getWeekDays = () => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(currentDate);
    monday.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDay; i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  const getAppointmentsForSlot = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === date.toDateString() && aptDate.getHours() === hour;
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const openCreateModal = (date: Date, time?: string) => {
    setEditingAppointment(null);
    setSelectedDate(date);
    setSelectedTime(time || '09:00');
    setFormData({
      customer_name: '', customer_firstname: '', customer_lastname: '', customer_birthdate: '',
      customer_phone: '', customer_email: '',
      start_time: time || '09:00', service_id: '', staff_id: '', status: 'scheduled', notes: '', reason: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingAppointment(apt);
    setSelectedDate(new Date(apt.start_time));
    
    // Parse name for zorg types (firstname lastname)
    const nameParts = apt.customer_name.split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';
    
    // Parse notes for zorg types (extract birthdate and reason)
    let birthdate = '';
    let reason = '';
    let otherNotes = apt.notes || '';
    
    if (apt.notes && isZorgType) {
      const lines = apt.notes.split('\n');
      const birthdateLine = lines.find(l => l.startsWith('Geboortedatum:'));
      const reasonLine = lines.find(l => l.startsWith('Reden:'));
      if (birthdateLine) birthdate = birthdateLine.replace('Geboortedatum:', '').trim();
      if (reasonLine) reason = reasonLine.replace('Reden:', '').trim();
      otherNotes = lines.filter(l => !l.startsWith('Geboortedatum:') && !l.startsWith('Reden:')).join('\n').trim();
    }
    
    setFormData({
      customer_name: apt.customer_name,
      customer_firstname: firstname,
      customer_lastname: lastname,
      customer_birthdate: birthdate,
      customer_phone: apt.customer_phone || '',
      customer_email: apt.customer_email || '',
      start_time: new Date(apt.start_time).toTimeString().slice(0, 5),
      service_id: apt.service_id || '',
      staff_id: apt.staff_id || '',
      status: apt.status,
      notes: otherNotes,
      reason: reason,
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingAppointment(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on business type
    if (isZorgType) {
      if (!formData.customer_firstname.trim() || !formData.customer_lastname.trim()) {
        setError('Voor- en achternaam zijn verplicht');
        return;
      }
    } else {
      if (!formData.customer_name.trim()) { setError('Klantnaam is verplicht'); return; }
    }
    if (!businessId || !selectedDate) return;

    setSaving(true);
    setError('');

    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = formData.start_time.split(':');
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const duration = formData.service_id 
      ? services.find(s => s.id === formData.service_id)?.duration_minutes || 30 
      : 30;
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    // Combine firstname + lastname for zorg types
    const customerName = isZorgType 
      ? `${formData.customer_firstname.trim()} ${formData.customer_lastname.trim()}`
      : formData.customer_name.trim();

    try {
      const appointmentData = {
        id: editingAppointment?.id,
        business_id: businessId,
        customer_name: customerName,
        customer_phone: formData.customer_phone.trim() || null,
        customer_email: formData.customer_email.trim() || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        service_id: isZorgType ? null : (formData.service_id || null),
        staff_id: formData.staff_id || null,
        status: formData.status,
        notes: isZorgType 
          ? [
              formData.customer_birthdate ? `Geboortedatum: ${formData.customer_birthdate}` : '',
              formData.reason ? `Reden: ${formData.reason}` : '',
              formData.notes ? formData.notes.trim() : ''
            ].filter(Boolean).join('\n') || null
          : formData.notes.trim() || null,
      };

      const res = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Opslaan mislukt');
      }

      await loadAppointments();
      closeModal();
      setSuccess(editingAppointment ? 'Afspraak bijgewerkt' : 'Afspraak aangemaakt');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAppointment || !businessId) return;
    if (!confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) return;
    
    setSaving(true);
    
    try {
      const res = await fetch(`/api/admin/appointments?id=${editingAppointment.id}&business_id=${businessId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Verwijderen mislukt');
      
      await loadAppointments();
      closeModal();
      setSuccess('Afspraak verwijderd');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Kon afspraak niet verwijderen');
    } finally {
      setSaving(false);
    }
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  const fullDayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const getHeaderTitle = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekDays = getWeekDays();
      return `${weekDays[0].getDate()} - ${weekDays[6].getDate()} ${monthNames[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`;
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  // Day View Component
  const DayView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', borderTop: '1px solid #2a2a35' }}>
      {getHours().map(hour => {
        const slotAppointments = getAppointmentsForSlot(currentDate, hour);
        const slotsAvailable = slotsPerHour - slotAppointments.length;
        
        return (
          <div key={hour} style={{ display: 'contents' }}>
            {/* Time column */}
            <div style={{ padding: '12px 8px', borderBottom: '1px solid #2a2a35', borderRight: '1px solid #2a2a35', color: '#6b7280', fontSize: 13, textAlign: 'right' }}>
              {hour.toString().padStart(2, '0')}:00
            </div>
            {/* Appointments column */}
            <div 
              onClick={() => slotsAvailable > 0 && openCreateModal(currentDate, `${hour.toString().padStart(2, '0')}:00`)}
              style={{ 
                minHeight: 60, 
                padding: 8, 
                borderBottom: '1px solid #2a2a35',
                background: slotsAvailable > 0 ? 'transparent' : 'rgba(239, 68, 68, 0.05)',
                cursor: slotsAvailable > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              {slotAppointments.map(apt => (
                <div
                  key={apt.id}
                  onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                  style={{
                    flex: `0 0 calc(${100 / slotsPerHour}% - 8px)`,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: statusOptions.find(s => s.value === apt.status)?.color || '#6b7280',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{apt.customer_name}</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>{formatTime(apt.start_time)}</div>
                </div>
              ))}
              {slotsAvailable > 0 && slotAppointments.length > 0 && (
                <div style={{ flex: `0 0 calc(${100 / slotsPerHour}% - 8px)`, padding: '8px 12px', borderRadius: 8, border: '2px dashed #3f3f4e', color: '#6b7280', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} style={{ marginRight: 4 }} /> Vrij
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Week View Component
  const WeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div style={{ overflowX: 'auto' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', borderBottom: '1px solid #2a2a35' }}>
          <div style={{ padding: 12, borderRight: '1px solid #2a2a35' }} />
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              onClick={() => { setCurrentDate(day); setViewMode('day'); }}
              style={{ 
                padding: 12, 
                textAlign: 'center', 
                borderRight: '1px solid #2a2a35',
                background: isToday(day) ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ color: '#6b7280', fontSize: 12 }}>{dayNames[i]}</div>
              <div style={{ 
                color: isToday(day) ? '#f97316' : 'white', 
                fontSize: 18, 
                fontWeight: isToday(day) ? 700 : 500 
              }}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Hour rows */}
        {getHours().map(hour => (
          <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)' }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #2a2a35', borderRight: '1px solid #2a2a35', color: '#6b7280', fontSize: 12, textAlign: 'right' }}>
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map((day, i) => {
              const slotAppointments = getAppointmentsForSlot(day, hour);
              const slotsAvailable = slotsPerHour - slotAppointments.length;
              
              return (
                <div 
                  key={i}
                  onClick={() => slotsAvailable > 0 && openCreateModal(day, `${hour.toString().padStart(2, '0')}:00`)}
                  style={{ 
                    minHeight: 50, 
                    padding: 4, 
                    borderBottom: '1px solid #2a2a35',
                    borderRight: '1px solid #2a2a35',
                    background: slotsAvailable <= 0 ? 'rgba(239, 68, 68, 0.05)' : (isToday(day) ? 'rgba(249, 115, 22, 0.05)' : 'transparent'),
                    cursor: slotsAvailable > 0 ? 'pointer' : 'not-allowed',
                  }}
                >
                  {slotAppointments.slice(0, 2).map(apt => (
                    <div
                      key={apt.id}
                      onClick={(e) => { e.stopPropagation(); openEditModal(apt); }}
                      style={{
                        padding: '4px 6px',
                        borderRadius: 4,
                        marginBottom: 2,
                        background: statusOptions.find(s => s.value === apt.status)?.color || '#6b7280',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 10,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {apt.customer_name}
                    </div>
                  ))}
                  {slotAppointments.length > 2 && (
                    <div style={{ fontSize: 10, color: '#6b7280', paddingLeft: 4 }}>+{slotAppointments.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Month View Component
  const MonthView = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #2a2a35' }}>
        {dayNames.map(day => (
          <div key={day} style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>
            {day}
          </div>
        ))}
      </div>
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
              onClick={() => { setCurrentDate(date); setViewMode('day'); }}
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
    </>
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('appointments.title')}</h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>{t('appointments.pageSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setSettingsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1f1f2e', color: '#9ca3af', border: '1px solid #3f3f4e', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }}>
            <Settings size={18} /> Instellingen
          </button>
          <button onClick={() => openCreateModal(currentDate)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={18} /> {t('dashboard.newAppointment')}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#22c55e', fontSize: 14 }}>
          ✓ {success}
        </div>
      )}
      {error && !modalOpen && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#ef4444', fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === mode ? '#f97316' : '#1f1f2e',
              color: viewMode === mode ? 'white' : '#9ca3af',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {mode === 'day' ? 'Dag' : mode === 'week' ? 'Week' : 'Maand'}
          </button>
        ))}
        <button
          onClick={goToToday}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #3f3f4e',
            background: 'transparent',
            color: '#f97316',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Vandaag
        </button>
      </div>

      {/* Calendar */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', overflow: 'hidden' }}>
        {/* Calendar header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #2a2a35' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 8, padding: 10, color: '#f97316', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
            {getHeaderTitle()}
          </h2>
          <button onClick={() => navigate(1)} style={{ background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 8, padding: 10, color: '#f97316', cursor: 'pointer' }}>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>{t('dashboard.loading')}</div>
        ) : (
          <>
            {viewMode === 'day' && <DayView />}
            {viewMode === 'week' && <WeekView />}
            {viewMode === 'month' && <MonthView />}
          </>
        )}
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', width: '100%', maxWidth: 400, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Kalender Instellingen</h2>
              <button onClick={() => setSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Afspraken per uur (max)</label>
              <select 
                value={slotsPerHour} 
                onChange={(e) => setSlotsPerHour(parseInt(e.target.value))}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                  <option key={n} value={n}>{n} afspraken</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Start uur</label>
                <select 
                  value={startHour} 
                  onChange={(e) => setStartHour(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(h => (
                    <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Eind uur</label>
                <select 
                  value={endHour} 
                  onChange={(e) => setEndHour(parseInt(e.target.value))}
                  style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => setSettingsOpen(false)}
              style={{ width: '100%', padding: '12px 20px', background: '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Opslaan
            </button>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
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
              {isZorgType ? (
                <>
                  {/* ZORG/PROFESSIONAL FORM */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}><User size={14} style={{ marginRight: 6 }} />Voornaam *</label>
                      <input type="text" value={formData.customer_firstname} onChange={(e) => setFormData({ ...formData, customer_firstname: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="Jan" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Achternaam *</label>
                      <input type="text" value={formData.customer_lastname} onChange={(e) => setFormData({ ...formData, customer_lastname: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} placeholder="Janssen" required />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}><Calendar size={14} style={{ marginRight: 6 }} />Geboortedatum</label>
                    <input type="date" value={formData.customer_birthdate} onChange={(e) => setFormData({ ...formData, customer_birthdate: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} />
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

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Met wie wil je een afspraak? *</label>
                    <select value={formData.staff_id} onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} required>
                      <option value="">Selecteer...</option>
                      {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Reden van afspraak *</label>
                    <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={2} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }} placeholder="Beschrijf kort de reden..." required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}><Calendar size={14} style={{ marginRight: 6 }} />Datum</label>
                      <input type="text" readOnly value={selectedDate?.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'long' }) || ''} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}><Clock size={14} style={{ marginRight: 6 }} />Tijd</label>
                      <input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* STANDARD FORM (restaurants, salons, etc.) */}
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
                </>
              )}

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
