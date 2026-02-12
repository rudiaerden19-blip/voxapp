'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Instellingen</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Beheer je bedrijfsinstellingen</p>
      </div>

      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 60, textAlign: 'center' }}>
        <Settings size={48} style={{ color: '#6b7280', marginBottom: 16 }} />
        <p style={{ color: '#9ca3af' }}>Instellingen pagina komt binnenkort</p>
      </div>
    </DashboardLayout>
  );
}
