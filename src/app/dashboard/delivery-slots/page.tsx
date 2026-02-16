'use client';

import { useState, useEffect } from 'react';
import { Clock, Save, Plus, Trash2, Check } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ModuleGuard from '@/components/ModuleGuard';
import { useBusiness } from '@/lib/BusinessContext';

interface DeliveryConfig {
  enabled: boolean;
  slot_duration: number; // minutes: 15, 30, 45, 60
  max_orders_per_slot: number;
  delivery_hours: {
    [day: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  preparation_time: number; // minutes needed to prepare
  delivery_radius_km?: number;
  minimum_order?: number;
  delivery_fee?: number;
}

const defaultConfig: DeliveryConfig = {
  enabled: true,
  slot_duration: 30,
  max_orders_per_slot: 3,
  preparation_time: 20,
  delivery_hours: {
    monday: { enabled: true, start: '11:00', end: '22:00' },
    tuesday: { enabled: true, start: '11:00', end: '22:00' },
    wednesday: { enabled: true, start: '11:00', end: '22:00' },
    thursday: { enabled: true, start: '11:00', end: '22:00' },
    friday: { enabled: true, start: '11:00', end: '23:00' },
    saturday: { enabled: true, start: '11:00', end: '23:00' },
    sunday: { enabled: true, start: '12:00', end: '22:00' },
  },
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

export default function DeliverySlotsPage() {
  const { businessId, loading: businessLoading } = useBusiness();
  const [config, setConfig] = useState<DeliveryConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (businessId) {
      loadConfig();
    }
  }, [businessId]);

  const loadConfig = async () => {
    if (!businessId) return;
    
    try {
      const res = await fetch(`/api/business/${businessId}/delivery-config`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.delivery_config) {
          setConfig({ ...defaultConfig, ...data.delivery_config });
        }
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!businessId) return;
    
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/business/${businessId}/delivery-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_config: config }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Opslaan mislukt');
      }
    } catch (e) {
      setError('Er ging iets mis');
    }
    setSaving(false);
  };

  const updateDayHours = (day: string, field: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      delivery_hours: {
        ...prev.delivery_hours,
        [day]: {
          ...prev.delivery_hours[day],
          [field]: value,
        },
      },
    }));
  };

  if (businessLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <ModuleGuard requiredModule="delivery_slots">
      <DashboardLayout>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Clock size={32} style={{ color: '#f97316' }} />
              Levertijden & Slots
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Configureer bezorgslots en capaciteit. De AI ziet deze instellingen en plant bestellingen automatisch.
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: saved ? '#22c55e' : '#f97316',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saving ? 'Opslaan...' : saved ? 'Opgeslagen!' : 'Opslaan'}
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 24, color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: 24 }}>
          {/* Slot Configuration */}
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24 }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Slot Instellingen
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              {/* Slot Duration */}
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  Slot duur
                </label>
                <select
                  value={config.slot_duration}
                  onChange={e => setConfig({ ...config, slot_duration: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                  }}
                >
                  <option value={15}>15 minuten</option>
                  <option value={30}>30 minuten</option>
                  <option value={45}>45 minuten</option>
                  <option value={60}>60 minuten</option>
                </select>
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Bijv: slots van 18:00-18:30, 18:30-19:00, etc.
                </p>
              </div>

              {/* Max Orders Per Slot */}
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  Max bestellingen per slot
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={config.max_orders_per_slot}
                  onChange={e => setConfig({ ...config, max_orders_per_slot: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                  }}
                />
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Hoeveel bestellingen per tijdslot
                </p>
              </div>

              {/* Preparation Time */}
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  Bereidingstijd (min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={config.preparation_time}
                  onChange={e => setConfig({ ...config, preparation_time: parseInt(e.target.value) || 15 })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                  }}
                />
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>
                  Minimale tijd vooruit boeken
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Hours */}
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24 }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Bezorguren per dag
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
              De AI zal alleen bestellingen aannemen binnen deze uren.
            </p>

            <div style={{ background: '#0a0a0f', borderRadius: 8, border: '1px solid #2a2a35' }}>
              {Object.entries(dayLabels).map(([day, label], index) => (
                <div
                  key={day}
                  style={{
                    padding: '14px 16px',
                    borderBottom: index < 6 ? '1px solid #2a2a35' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Toggle */}
                  <div
                    onClick={() => updateDayHours(day, 'enabled', !config.delivery_hours[day]?.enabled)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: config.delivery_hours[day]?.enabled ? '#22c55e' : '#2a2a35',
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: 3,
                        left: config.delivery_hours[day]?.enabled ? 23 : 3,
                        transition: 'left 0.2s',
                      }}
                    />
                  </div>

                  {/* Day Label */}
                  <span style={{
                    width: 100,
                    color: config.delivery_hours[day]?.enabled ? 'white' : '#6b7280',
                    fontWeight: 500,
                  }}>
                    {label}
                  </span>

                  {/* Time Inputs */}
                  {config.delivery_hours[day]?.enabled ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="time"
                        value={config.delivery_hours[day]?.start || '11:00'}
                        onChange={e => updateDayHours(day, 'start', e.target.value)}
                        style={{
                          padding: '8px 12px',
                          background: '#16161f',
                          border: '1px solid #2a2a35',
                          borderRadius: 6,
                          color: 'white',
                          fontSize: 14,
                        }}
                      />
                      <span style={{ color: '#6b7280' }}>tot</span>
                      <input
                        type="time"
                        value={config.delivery_hours[day]?.end || '22:00'}
                        onChange={e => updateDayHours(day, 'end', e.target.value)}
                        style={{
                          padding: '8px 12px',
                          background: '#16161f',
                          border: '1px solid #2a2a35',
                          borderRadius: 6,
                          color: 'white',
                          fontSize: 14,
                        }}
                      />
                    </div>
                  ) : (
                    <span style={{ color: '#ef4444', fontSize: 13 }}>Geen levering</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: '#f97316', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              💡 Hoe werkt het?
            </h3>
            <ul style={{ color: '#fbbf24', fontSize: 14, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
              <li>De AI ziet automatisch welke slots beschikbaar zijn</li>
              <li>Als een slot vol zit, biedt de AI het volgende beschikbare slot aan</li>
              <li>Klanten kunnen kiezen: "zo snel mogelijk" of een specifieke tijd</li>
              <li>De bereidingstijd bepaalt hoever vooruit minimaal geboekt moet worden</li>
              <li>Buiten bezorguren kan de AI geen leveringen inplannen</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    </ModuleGuard>
  );
}
