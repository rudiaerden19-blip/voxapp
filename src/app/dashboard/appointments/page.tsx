'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Calendar } from 'lucide-react';

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Afspraken</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Beheer je afspraken en agenda</p>
      </div>

      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 60, textAlign: 'center' }}>
        <Calendar size={48} style={{ color: '#6b7280', marginBottom: 16 }} />
        <p style={{ color: '#9ca3af' }}>Afspraken pagina komt binnenkort</p>
      </div>
    </DashboardLayout>
  );
}
