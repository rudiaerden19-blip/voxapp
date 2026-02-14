'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Save, Check, Shield, Mail, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    adminEmail: 'rudi.aerden@hotmail.com',
    notifyNewTenant: true,
    notifySubscription: true,
    notifyTrial: true,
    trialDays: 14,
    defaultPlan: 'starter',
  });

  const handleSave = async () => {
    // TODO: Save settings to database
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Admin Instellingen</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Configureer het admin panel</p>
      </div>

      {/* Admin Access */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} style={{ color: '#ef4444' }} /> Admin Toegang
        </h2>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Admin Email</label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
            style={{
              width: '100%', maxWidth: 400, padding: '12px 16px', background: '#0a0a0f',
              border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16,
            }}
          />
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
            Alleen dit email adres heeft toegang tot het admin panel.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={20} style={{ color: '#f97316' }} /> Notificaties
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.notifyNewTenant}
              onChange={(e) => setSettings({ ...settings, notifyNewTenant: e.target.checked })}
              style={{ accentColor: '#f97316', width: 18, height: 18 }}
            />
            <span style={{ color: 'white' }}>Email bij nieuwe tenant registratie</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.notifySubscription}
              onChange={(e) => setSettings({ ...settings, notifySubscription: e.target.checked })}
              style={{ accentColor: '#f97316', width: 18, height: 18 }}
            />
            <span style={{ color: 'white' }}>Email bij nieuwe abonnement</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.notifyTrial}
              onChange={(e) => setSettings({ ...settings, notifyTrial: e.target.checked })}
              style={{ accentColor: '#f97316', width: 18, height: 18 }}
            />
            <span style={{ color: 'white' }}>Email wanneer trial afloopt (3 dagen voor)</span>
          </label>
        </div>
      </div>

      {/* Default Settings */}
      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
        <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mail size={20} style={{ color: '#3b82f6' }} /> Standaard Instellingen
        </h2>
        
        <div style={{ display: 'grid', gap: 20, maxWidth: 400 }}>
          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Trial Periode (dagen)</label>
            <input
              type="number"
              value={settings.trialDays}
              onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) })}
              style={{
                width: '100%', padding: '12px 16px', background: '#0a0a0f',
                border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16,
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Standaard Plan</label>
            <select
              value={settings.defaultPlan}
              onChange={(e) => setSettings({ ...settings, defaultPlan: e.target.value })}
              style={{
                width: '100%', padding: '12px 16px', background: '#0a0a0f',
                border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, cursor: 'pointer',
              }}
            >
              <option value="starter">Starter (€99/maand)</option>
              <option value="professional">Professional (€199/maand)</option>
              <option value="business">Business (€399/maand)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {saved && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 8, padding: 12, marginBottom: 20, color: '#22c55e', fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={16} /> Instellingen opgeslagen!
        </div>
      )}

      <button
        onClick={handleSave}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px 32px', background: '#ef4444', border: 'none', borderRadius: 8,
          color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Save size={18} /> Opslaan
      </button>
    </AdminLayout>
  );
}
