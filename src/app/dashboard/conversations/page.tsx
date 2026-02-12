'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { MessageSquare } from 'lucide-react';

export default function ConversationsPage() {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Gesprekken</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Bekijk alle AI gesprekken met klanten</p>
      </div>

      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 60, textAlign: 'center' }}>
        <MessageSquare size={48} style={{ color: '#6b7280', marginBottom: 16 }} />
        <p style={{ color: '#9ca3af' }}>Gesprekken pagina komt binnenkort</p>
      </div>
    </DashboardLayout>
  );
}
