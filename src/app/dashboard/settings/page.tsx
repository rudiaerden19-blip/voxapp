'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, Building2, Clock, Phone, Mail, MapPin, Check } from 'lucide-react';

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

interface Business {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  opening_hours: OpeningHours | null;
}

const defaultOpeningHours: OpeningHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '14:00', closed: true },
  sunday: { open: '10:00', close: '14:00', closed: true },
};

const dayLabels: Record<string, string> = {
  monday: 'Maandag', tuesday: 'Dinsdag', wednesday: 'Woensdag', thursday: 'Donderdag',
  friday: 'Vrijdag', saturday: 'Zaterdag', sunday: 'Zondag',
};

const businessTypes = [
  { value: 'kapper', label: 'Kapsalon' },
  { value: 'tandarts', label: 'Tandartspraktijk' },
  { value: 'restaurant', label: 'Restaurant / Horeca' },
  { value: 'garage', label: 'Garage / Autoservice' },
  { value: 'schoonheid', label: 'Schoonheidssalon' },
  { value: 'fysiotherapie', label: 'Fysiotherapie' },
  { value: 'huisarts', label: 'Huisartsenpraktijk' },
  { value: 'other', label: 'Anders' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    phone: '',
    email: '',
    address: '',
    opening_hours: defaultOpeningHours,
  });

  useEffect(() => { loadBusiness(); }, []);

  const loadBusiness = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (business) {
      const biz = business as Business;
      setBusinessId(biz.id);
      setFormData({
        name: biz.name || '',
        type: biz.type || 'other',
        phone: biz.phone || '',
        email: biz.email || '',
        address: biz.address || '',
        opening_hours: biz.opening_hours || defaultOpeningHours,
      });
    }
    setLoading(false);
  };

  const updateOpeningHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: { ...prev.opening_hours, [day]: { ...prev.opening_hours[day], [field]: value } },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setSaving(true);
    setError('');
    setSaved(false);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name: formData.name.trim(),
        type: formData.type,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        opening_hours: formData.opening_hours,
      })
      .eq('id', businessId);

    if (updateError) {
      setError('Er ging iets mis bij het opslaan');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Instellingen</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Beheer je bedrijfsgegevens en openingstijden</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Bedrijfsgegevens */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={20} style={{ color: '#f97316' }} /> Bedrijfsgegevens
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Bedrijfsnaam *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="Jouw Bedrijf"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Type bedrijf</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
              >
                {businessTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                <Phone size={14} style={{ marginRight: 6 }} />Telefoonnummer
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="+32 ..."
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                <Mail size={14} style={{ marginRight: 6 }} />E-mailadres
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="info@jouwbedrijf.be"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                <MapPin size={14} style={{ marginRight: 6 }} />Adres
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="Straatnaam 123, 1000 Stad"
              />
            </div>
          </div>
        </div>

        {/* Openingstijden */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={20} style={{ color: '#f97316' }} /> Openingstijden
          </h2>

          <div style={{ background: '#0a0a0f', borderRadius: 8, border: '1px solid #2a2a35', overflow: 'hidden' }}>
            {Object.entries(dayLabels).map(([day, label], index) => (
              <div key={day} style={{ 
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                borderBottom: index < 6 ? '1px solid #2a2a35' : 'none',
              }}>
                <div
                  onClick={() => updateOpeningHours(day, 'closed', !formData.opening_hours[day].closed)}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: formData.opening_hours[day].closed ? '#2a2a35' : '#22c55e',
                    position: 'relative', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3,
                    left: formData.opening_hours[day].closed ? 3 : 21,
                    transition: 'left 0.2s',
                  }} />
                </div>

                <span style={{ 
                  width: 90, color: formData.opening_hours[day].closed ? '#6b7280' : 'white', 
                  fontSize: 14, fontWeight: 500,
                }}>
                  {label}
                </span>

                {formData.opening_hours[day].closed ? (
                  <span style={{ color: '#ef4444', fontSize: 14 }}>Gesloten</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="time"
                      value={formData.opening_hours[day].open}
                      onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                      style={{ padding: '6px 10px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    />
                    <span style={{ color: '#6b7280' }}>tot</span>
                    <input
                      type="time"
                      value={formData.opening_hours[day].close}
                      onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                      style={{ padding: '6px 10px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, marginBottom: 20, color: '#ef4444', fontSize: 14 }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 8, padding: 12, marginBottom: 20, color: '#22c55e', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={16} /> Instellingen opgeslagen!
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', maxWidth: 300, padding: '14px 24px',
            background: saving ? '#6b7280' : '#f97316',
            border: 'none', borderRadius: 8, color: 'white',
            fontSize: 16, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Opslaan...' : <><Save size={18} /> Opslaan</>}
        </button>
      </form>
    </DashboardLayout>
  );
}
