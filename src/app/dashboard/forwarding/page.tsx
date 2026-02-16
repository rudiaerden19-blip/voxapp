'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useBusiness } from '@/lib/BusinessContext';
import { Phone, Plus, Trash2, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

interface ForwardingNumber {
  id: string;
  phone_number: string;
  forwarding_type: string;
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
  pool_numbers?: {
    phone_number: string;
    country: string;
  };
}

interface PoolNumber {
  id: string;
  phone_number: string;
  country: string;
}

export default function ForwardingPage() {
  const { businessId } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [forwardingNumbers, setForwardingNumbers] = useState<ForwardingNumber[]>([]);
  const [poolNumbers, setPoolNumbers] = useState<PoolNumber[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [forwardingType, setForwardingType] = useState('no_answer');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (businessId) {
      fetchForwardingNumbers();
    }
  }, [businessId]);

  const fetchForwardingNumbers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/forwarding?business_id=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setForwardingNumbers(data.forwarding_numbers || []);
        setPoolNumbers(data.pool_numbers || []);
      }
    } catch (e) {
      console.error('Error fetching forwarding numbers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNumber = async () => {
    if (!newNumber.trim()) {
      setError('Vul een telefoonnummer in');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/forwarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          phone_number: newNumber,
          forwarding_type: forwardingType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Nummer toegevoegd!');
        setInstructions(data.instructions || '');
        setNewNumber('');
        fetchForwardingNumbers();
      } else {
        setError(data.error || 'Kon nummer niet toevoegen');
      }
    } catch (e) {
      setError('Er ging iets mis');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNumber = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze doorschakeling wilt verwijderen?')) {
      return;
    }

    try {
      const res = await fetch(`/api/forwarding?id=${id}&business_id=${businessId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Doorschakeling verwijderd');
        fetchForwardingNumbers();
      } else {
        const data = await res.json();
        setError(data.error || 'Kon doorschakeling niet verwijderen');
      }
    } catch (e) {
      setError('Er ging iets mis');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Gekopieerd naar klembord!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const getForwardingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      all: 'Alle oproepen',
      no_answer: 'Bij geen antwoord',
      busy: 'Bij bezet',
      unavailable: 'Bij onbereikbaar',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
          Laden...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>Doorschakeling</h1>
            <p style={{ color: '#6b7280', marginTop: 4 }}>
              Schakelt uw bestaande telefoonnummer door naar de AI
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setInstructions('');
              setError('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Nummer Toevoegen
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* Info Box */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Hoe werkt het?</h3>
          <ol style={{ margin: 0, paddingLeft: 20, color: '#374151', lineHeight: 1.8 }}>
            <li>Voeg uw bestaande telefoonnummer toe (uw zaak of mobiel)</li>
            <li>Wij geven u een code om de doorschakeling te activeren</li>
            <li>Bel de code op uw telefoon - klaar in 30 seconden</li>
            <li>Oproepen naar uw nummer worden nu beantwoord door de AI</li>
          </ol>
        </div>

        {/* Forwarding Numbers List */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            fontWeight: 600,
          }}>
            Uw Doorschakelingen
          </div>

          {forwardingNumbers.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
              <Phone size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <p>Nog geen doorschakelingen ingesteld</p>
              <p style={{ fontSize: 14 }}>Voeg uw telefoonnummer toe om te beginnen</p>
            </div>
          ) : (
            <div>
              {forwardingNumbers.map((fn) => (
                <div
                  key={fn.id}
                  style={{
                    padding: 20,
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={18} color="#f97316" />
                      {fn.phone_number}
                      {fn.verified_at && (
                        <CheckCircle size={16} color="#22c55e" />
                      )}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
                      {getForwardingTypeLabel(fn.forwarding_type)}
                      {fn.pool_numbers && (
                        <span> → {fn.pool_numbers.phone_number}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNumber(fn.id)}
                    style={{
                      background: '#fef2f2',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Trash2 size={16} />
                    Verwijderen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Number Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto',
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                Nummer Toevoegen
              </h2>

              {!instructions ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                      Uw telefoonnummer
                    </label>
                    <input
                      type="tel"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      placeholder="+32 xxx xx xx xx"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16,
                      }}
                    />
                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      Uw bestaande zaak- of mobiel nummer
                    </p>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                      Type doorschakeling
                    </label>
                    <select
                      value={forwardingType}
                      onChange={(e) => setForwardingType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 16,
                        background: 'white',
                      }}
                    >
                      <option value="no_answer">Bij geen antwoord (aanbevolen)</option>
                      <option value="all">Alle oproepen</option>
                      <option value="busy">Bij bezet</option>
                      <option value="unavailable">Bij onbereikbaar</option>
                    </select>
                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      "Bij geen antwoord" laat u zelf opnemen, AI neemt over als u niet opneemt
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => setShowAddModal(false)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={handleAddNumber}
                      disabled={saving}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: '#f97316',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer',
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? 'Bezig...' : 'Toevoegen'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <CheckCircle size={20} color="#22c55e" />
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>Nummer toegevoegd!</span>
                    </div>
                    <p style={{ color: '#374151', margin: 0 }}>
                      Volg de onderstaande instructies om doorschakeling te activeren.
                    </p>
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 20,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}>
                    {instructions}
                  </div>

                  <button
                    onClick={() => copyToClipboard(instructions)}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Copy size={16} />
                    Kopieer Instructies
                  </button>

                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setInstructions('');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      background: '#f97316',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sluiten
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
