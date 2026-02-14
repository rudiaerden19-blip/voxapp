'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { MessageSquare, Phone, Clock, X, FileText, Calendar } from 'lucide-react';

interface Conversation {
  id: string;
  caller_phone: string | null;
  transcript: string | null;
  summary: string | null;
  action_taken: string | null;
  duration_seconds: number | null;
  created_at: string;
  appointment_id: string | null;
}

export default function ConversationsPage() {
  const { t, language } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => { loadConversations(); }, []);

  const loadConversations = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: business } = await supabase.from('businesses').select('*').eq('user_id', user.id).single();
    if (!business) { setLoading(false); return; }

    const bizId = (business as { id: string }).id;

    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('business_id', bizId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setConversations(data as Conversation[]);
    setLoading(false);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  };

  const getActionColor = (action: string | null) => {
    if (!action) return '#6b7280';
    if (action.toLowerCase().includes('afspraak') || action.toLowerCase().includes('geboekt')) return '#22c55e';
    if (action.toLowerCase().includes('doorverbonden')) return '#3b82f6';
    if (action.toLowerCase().includes('voicemail')) return '#f97316';
    return '#9ca3af';
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('conversations.title')}</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>{t('conversations.subtitle')}</p>
      </div>

      <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>{t('dashboard.loading')}</div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
            <MessageSquare size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ marginBottom: 8 }}>{t('conversations.noConversations')}</p>
            <p style={{ fontSize: 14 }}>{t('conversations.noConversationsHint')}</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 180px 100px', gap: 16, padding: '16px 24px', borderBottom: '1px solid #2a2a35', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
              <div>Beller</div>
              <div>Datum</div>
              <div>Duur</div>
              <div>Actie</div>
              <div></div>
            </div>

            {/* Rows */}
            {conversations.map(conv => (
              <div
                key={conv.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 140px 100px 180px 100px',
                  gap: 16, padding: '16px 24px', borderBottom: '1px solid #2a2a35',
                  alignItems: 'center', cursor: 'pointer',
                }}
                onClick={() => setSelectedConversation(conv)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 500 }}>{conv.caller_phone || 'Onbekend nummer'}</p>
                    {conv.summary && <p style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{conv.summary.substring(0, 50)}{conv.summary.length > 50 ? '...' : ''}</p>}
                  </div>
                </div>

                <div style={{ color: '#9ca3af', fontSize: 14 }}>
                  <div>{formatDate(conv.created_at)}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{formatTime(conv.created_at)}</div>
                </div>

                <div style={{ color: '#9ca3af', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} />
                  {formatDuration(conv.duration_seconds)}
                </div>

                <div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: `${getActionColor(conv.action_taken)}20`,
                    color: getActionColor(conv.action_taken),
                  }}>
                    {conv.action_taken || 'Geen actie'}
                  </span>
                </div>

                <div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedConversation(conv); }}
                    style={{ background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6, padding: '8px 12px', color: '#f97316', fontSize: 13, cursor: 'pointer' }}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedConversation && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #2a2a35' }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Gespreksdetails</h2>
              <button onClick={() => setSelectedConversation(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Meta info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 16 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Beller</div>
                  <div style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={16} style={{ color: '#f97316' }} />
                    {selectedConversation.caller_phone || 'Onbekend'}
                  </div>
                </div>
                <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 16 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Datum & tijd</div>
                  <div style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} style={{ color: '#f97316' }} />
                    {formatDate(selectedConversation.created_at)} {formatTime(selectedConversation.created_at)}
                  </div>
                </div>
                <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 16 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Duur</div>
                  <div style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} style={{ color: '#f97316' }} />
                    {formatDuration(selectedConversation.duration_seconds)}
                  </div>
                </div>
              </div>

              {/* Action taken */}
              {selectedConversation.action_taken && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Actie ondernomen</div>
                  <div style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: `${getActionColor(selectedConversation.action_taken)}15`,
                    border: `1px solid ${getActionColor(selectedConversation.action_taken)}30`,
                    color: getActionColor(selectedConversation.action_taken),
                  }}>
                    {selectedConversation.action_taken}
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedConversation.summary && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Samenvatting</div>
                  <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 16, color: '#9ca3af', lineHeight: 1.6 }}>
                    {selectedConversation.summary}
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div>
                <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={14} /> Transcript
                </div>
                <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 16, color: '#9ca3af', lineHeight: 1.8, maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                  {selectedConversation.transcript || 'Geen transcript beschikbaar'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
