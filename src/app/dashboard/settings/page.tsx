'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient, Json } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { Save, Building2, Clock, Phone, Mail, MapPin, Check, CreditCard, ExternalLink, Plus, X } from 'lucide-react';

interface Shift {
  open: string;
  close: string;
}

interface DaySchedule {
  closed: boolean;
  shifts: Shift[];
}

interface OpeningHours {
  [key: string]: DaySchedule;
}

interface Business {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  opening_hours: OpeningHours | null;
  subscription_status: string;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
}

const defaultOpeningHours: OpeningHours = {
  monday: { closed: false, shifts: [{ open: '09:00', close: '17:00' }] },
  tuesday: { closed: false, shifts: [{ open: '09:00', close: '17:00' }] },
  wednesday: { closed: false, shifts: [{ open: '09:00', close: '17:00' }] },
  thursday: { closed: false, shifts: [{ open: '09:00', close: '17:00' }] },
  friday: { closed: false, shifts: [{ open: '09:00', close: '17:00' }] },
  saturday: { closed: true, shifts: [{ open: '10:00', close: '14:00' }] },
  sunday: { closed: true, shifts: [{ open: '10:00', close: '14:00' }] },
};

// Convert old format to new format
const migrateOpeningHours = (hours: any): OpeningHours => {
  const result: OpeningHours = {};
  for (const day of Object.keys(defaultOpeningHours)) {
    if (hours[day]) {
      // Check if it's already new format (has shifts array)
      if (hours[day].shifts && Array.isArray(hours[day].shifts)) {
        result[day] = hours[day];
      } else {
        // Old format - convert
        result[day] = {
          closed: hours[day].closed ?? false,
          shifts: [{ open: hours[day].open || '09:00', close: hours[day].close || '17:00' }],
        };
      }
    } else {
      result[day] = defaultOpeningHours[day];
    }
  }
  return result;
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

function SettingsContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    phone: '',
    email: '',
    address: '',
    opening_hours: defaultOpeningHours,
  });

  // Check for success/canceled from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => { loadBusiness(); }, []);

  const loadBusiness = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (businessData) {
      const biz = businessData as Business;
      setBusiness(biz);
      setFormData({
        name: biz.name || '',
        type: biz.type || 'other',
        phone: biz.phone || '',
        email: biz.email || '',
        address: biz.address || '',
        opening_hours: biz.opening_hours ? migrateOpeningHours(biz.opening_hours) : defaultOpeningHours,
      });
    }
    setLoading(false);
  };

  const toggleDayClosed = (day: string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: { 
        ...prev.opening_hours, 
        [day]: { ...prev.opening_hours[day], closed: !prev.opening_hours[day].closed } 
      },
    }));
  };

  const updateShift = (day: string, shiftIndex: number, field: 'open' | 'close', value: string) => {
    setFormData(prev => {
      const newShifts = [...prev.opening_hours[day].shifts];
      newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
      return {
        ...prev,
        opening_hours: { 
          ...prev.opening_hours, 
          [day]: { ...prev.opening_hours[day], shifts: newShifts } 
        },
      };
    });
  };

  const addShift = (day: string) => {
    setFormData(prev => {
      const currentShifts = prev.opening_hours[day].shifts;
      const lastShift = currentShifts[currentShifts.length - 1];
      // Default new shift starts 2 hours after last shift ends
      const newShift = { open: '17:00', close: '22:00' };
      return {
        ...prev,
        opening_hours: { 
          ...prev.opening_hours, 
          [day]: { ...prev.opening_hours[day], shifts: [...currentShifts, newShift] } 
        },
      };
    });
  };

  const removeShift = (day: string, shiftIndex: number) => {
    setFormData(prev => {
      const newShifts = prev.opening_hours[day].shifts.filter((_, i) => i !== shiftIndex);
      // Always keep at least one shift
      if (newShifts.length === 0) return prev;
      return {
        ...prev,
        opening_hours: { 
          ...prev.opening_hours, 
          [day]: { ...prev.opening_hours[day], shifts: newShifts } 
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/business/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: business.id,
          name: formData.name.trim(),
          type: formData.type,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          opening_hours: formData.opening_hours,
        }),
      });

      if (!res.ok) {
        setError('Er ging iets mis bij het opslaan');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      setError('Er ging iets mis bij het opslaan');
    }
    setSaving(false);
  };

  const handleStartSubscription = async () => {
    if (!business) return;
    setCheckoutLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          email: formData.email || business.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch (err) {
      setError('Er ging iets mis bij het starten van de checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!business?.stripe_customer_id) return;
    setPortalLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: business.stripe_customer_id,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch (err) {
      setError('Er ging iets mis bij het openen van het portaal');
    } finally {
      setPortalLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!business) return { label: 'Onbekend', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
    
    switch (business.subscription_status) {
      case 'active':
        return { label: 'Actief', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
      case 'trial':
        return { label: 'Proefperiode', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
      case 'past_due':
        return { label: 'Betaling mislukt', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'canceled':
        return { label: 'Geannuleerd', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { label: 'Geen abonnement', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const getDaysRemaining = () => {
    if (!business?.trial_ends_at) return 0;
    const diff = Math.ceil((new Date(business.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>{t('dashboard.loading')}</div>
      </DashboardLayout>
    );
  }

  const status = getSubscriptionStatus();

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('settings.title')}</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>{t('settings.subtitle')}</p>
      </div>

      {/* Subscription Section */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CreditCard size={20} style={{ color: '#f97316' }} /> Abonnement
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: status.bg, color: status.color,
              }}>
                {status.label}
              </span>
              {business?.subscription_status === 'trial' && (
                <span style={{ color: '#6b7280', fontSize: 14 }}>
                  Nog {getDaysRemaining()} dagen
                </span>
              )}
            </div>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>
              {business?.subscription_status === 'active' 
                ? 'Je abonnement is actief. €99/maand.' 
                : business?.subscription_status === 'trial'
                ? 'Je proefperiode loopt. Upgrade om door te gaan na de trial.'
                : 'Start een abonnement om VoxApp te gebruiken.'}
            </p>
          </div>

          <div>
            {business?.stripe_customer_id ? (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', background: 'transparent',
                  border: '1px solid #2a2a35', borderRadius: 8,
                  color: '#9ca3af', fontSize: 14, fontWeight: 500,
                  cursor: portalLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {portalLoading ? 'Laden...' : <><ExternalLink size={16} /> Beheer abonnement</>}
              </button>
            ) : (
              <button
                onClick={handleStartSubscription}
                disabled={checkoutLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', background: checkoutLoading ? '#6b7280' : '#f97316',
                  border: 'none', borderRadius: 8,
                  color: 'white', fontSize: 14, fontWeight: 600,
                  cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {checkoutLoading ? 'Laden...' : 'Start abonnement - €99/maand'}
              </button>
            )}
          </div>
        </div>

        {/* Pricing info */}
        <div style={{ marginTop: 20, padding: 16, background: '#0a0a0f', borderRadius: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Prijs</p>
              <p style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>€99/maand</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Inclusief</p>
              <p style={{ color: 'white', fontSize: 14 }}>300 minuten • SMS • 24/7 AI</p>
            </div>
            <div>
              <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Extra minuten</p>
              <p style={{ color: 'white', fontSize: 14 }}>€0.40/min</p>
            </div>
          </div>
        </div>
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
                padding: '14px 16px',
                borderBottom: index < 6 ? '1px solid #2a2a35' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div
                    onClick={() => toggleDayClosed(day)}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                      {formData.opening_hours[day].shifts.map((shift, shiftIndex) => (
                        <div key={shiftIndex} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="time"
                            value={shift.open}
                            onChange={(e) => updateShift(day, shiftIndex, 'open', e.target.value)}
                            style={{ padding: '6px 10px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                          />
                          <span style={{ color: '#6b7280' }}>tot</span>
                          <input
                            type="time"
                            value={shift.close}
                            onChange={(e) => updateShift(day, shiftIndex, 'close', e.target.value)}
                            style={{ padding: '6px 10px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                          />
                          {formData.opening_hours[day].shifts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeShift(day, shiftIndex)}
                              style={{ 
                                background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: 4, 
                                padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
                              }}
                            >
                              <X size={14} style={{ color: '#ef4444' }} />
                            </button>
                          )}
                          {shiftIndex === formData.opening_hours[day].shifts.length - 1 && formData.opening_hours[day].shifts.length < 3 && (
                            <button
                              type="button"
                              onClick={() => addShift(day)}
                              style={{ 
                                background: 'rgba(249, 115, 22, 0.1)', border: 'none', borderRadius: 4, 
                                padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                marginLeft: 4,
                              }}
                              title="Shift toevoegen"
                            >
                              <Plus size={14} style={{ color: '#f97316' }} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      </DashboardLayout>
    }>
      <SettingsContent />
    </Suspense>
  );
}
