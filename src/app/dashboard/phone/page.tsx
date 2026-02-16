'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Phone, Plus, Search, Trash2, RefreshCw, CheckCircle, AlertCircle, Globe, PhoneCall, PhoneOutgoing, ArrowRight, Forward } from 'lucide-react';

interface PhoneNumber {
  id: string;
  phone_number: string;
  country: string;
  status: string;
  agent_id: string | null;
  monthly_cost: number;
  created_at: string;
}

interface AvailableNumber {
  phone_number: string;
  friendly_name: string;
  locality: string;
  region: string;
  country: string;
}

export default function PhonePage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('BE');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callNumber, setCallNumber] = useState('');
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: business } = await supabase
      .from('businesses')
      .select('id, elevenlabs_agent_id')
      .eq('user_id', user.id)
      .single();

    if (business) {
      const biz = business as { id: string; elevenlabs_agent_id?: string };
      setBusinessId(biz.id);
      setAgentId(biz.elevenlabs_agent_id || null);
      await loadPhoneNumbers(biz.id);
    }
    setLoading(false);
  };

  const loadPhoneNumbers = async (bizId: string) => {
    const response = await fetch(`/api/twilio/numbers?action=list&business_id=${bizId}`);
    if (response.ok) {
      const data = await response.json();
      setPhoneNumbers(data.numbers || []);
    }
  };

  const searchNumbers = async () => {
    setSearching(true);
    setError('');
    try {
      const response = await fetch(`/api/twilio/numbers?action=search&country=${selectedCountry}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.available || []);
      } else {
        const err = await response.json();
        setError(err.error || 'Kon geen nummers vinden');
      }
    } catch (err) {
      setError('Fout bij zoeken naar nummers');
    }
    setSearching(false);
  };

  const purchaseNumber = async (phoneNumber: string) => {
    if (!businessId) return;
    
    setPurchasing(phoneNumber);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/twilio/numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          phone_number: phoneNumber,
          agent_id: agentId,
        }),
      });

      if (response.ok) {
        setSuccess('Nummer succesvol gekocht en geconfigureerd!');
        setAvailableNumbers([]);
        await loadPhoneNumbers(businessId);
      } else {
        const err = await response.json();
        setError(err.error || 'Kon nummer niet kopen');
      }
    } catch (err) {
      setError('Fout bij kopen van nummer');
    }
    setPurchasing(null);
  };

  const deleteNumber = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit nummer wilt verwijderen? Dit kan niet ongedaan worden.')) {
      return;
    }

    try {
      const response = await fetch(`/api/twilio/numbers?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Nummer verwijderd');
        if (businessId) await loadPhoneNumbers(businessId);
      } else {
        const err = await response.json();
        setError(err.error || 'Kon nummer niet verwijderen');
      }
    } catch (err) {
      setError('Fout bij verwijderen');
    }
  };

  const initiateCall = async () => {
    if (!businessId || !callNumber) return;
    
    setCalling(true);
    setError('');

    try {
      const response = await fetch('/api/twilio/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          to_number: callNumber,
        }),
      });

      if (response.ok) {
        setSuccess('Oproep gestart!');
        setShowCallModal(false);
        setCallNumber('');
      } else {
        const err = await response.json();
        setError(err.error || 'Kon oproep niet starten');
      }
    } catch (err) {
      setError('Fout bij starten oproep');
    }
    setCalling(false);
  };

  const countries = [
    { code: 'BE', name: 'België', flag: '🇧🇪' },
    { code: 'NL', name: 'Nederland', flag: '🇳🇱' },
    { code: 'FR', name: 'Frankrijk', flag: '🇫🇷' },
    { code: 'DE', name: 'Duitsland', flag: '🇩🇪' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 32, color: '#9ca3af' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: 32, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Phone size={28} style={{ color: '#f97316' }} />
            Telefoon
          </h1>
          <p style={{ color: '#9ca3af' }}>
            Koppel je eigen nummer door naar de AI-receptionist, of koop een apart nummer (optioneel).
          </p>
        </div>

        {/* Aanbevolen: eigen nummer doorsturen */}
        <div style={{
          marginBottom: 24, padding: 20, borderRadius: 12, border: '1px solid rgba(249, 115, 22, 0.3)',
          background: 'rgba(249, 115, 22, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f97316', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Forward size={18} />
                Aanbevolen: eigen nummer doorsturen
              </h2>
              <p style={{ color: '#d1d5db', fontSize: 14, marginBottom: 12 }}>
                Laat klanten je bestaande nummer bellen. Stel bij je provider doorsturen in naar ons poolnummer – dan neemt de AI op onder jouw nummer.
              </p>
              <Link
                href="/dashboard/forwarding"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  color: '#f97316', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                }}
              >
                Doorsturen instellen
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
            <span style={{ color: '#22c55e' }}>{success}</span>
          </div>
        )}

        {/* Current Numbers */}
        <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>Jouw Nummers</h2>
            {phoneNumbers.length > 0 && (
              <button
                onClick={() => setShowCallModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px', background: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: 8,
                  color: '#f97316', fontSize: 14, cursor: 'pointer',
                }}
              >
                <PhoneOutgoing size={16} />
                Test Oproep
              </button>
            )}
          </div>

          {phoneNumbers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Phone size={48} style={{ color: '#4b5563', marginBottom: 16 }} />
              <p style={{ color: '#6b7280', marginBottom: 8 }}>Nog geen telefoonnummer</p>
              <p style={{ color: '#4b5563', fontSize: 14 }}>Koop een nummer hieronder om je AI bereikbaar te maken</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {phoneNumbers.map((num) => (
                <div key={num.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 16, background: '#0a0a0f', borderRadius: 8, border: '1px solid #2a2a35',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'rgba(34, 197, 94, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <PhoneCall size={24} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <p style={{ color: 'white', fontSize: 18, fontWeight: 600, fontFamily: 'monospace' }}>
                        {num.phone_number}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: 13 }}>
                        {num.country === 'BE' ? '🇧🇪 België' : 
                         num.country === 'NL' ? '🇳🇱 Nederland' :
                         num.country === 'FR' ? '🇫🇷 Frankrijk' :
                         num.country === 'DE' ? '🇩🇪 Duitsland' : num.country}
                        {' • '}
                        €{num.monthly_cost?.toFixed(2)}/maand
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20,
                      background: num.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: num.status === 'active' ? '#22c55e' : '#ef4444',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {num.status === 'active' ? 'Actief' : num.status}
                    </span>
                    <button
                      onClick={() => deleteNumber(num.id)}
                      style={{
                        padding: 8, background: 'transparent', border: 'none',
                        color: '#ef4444', cursor: 'pointer', borderRadius: 6,
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optioneel: nieuw nummer kopen (Twilio) */}
        <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Plus size={20} style={{ color: '#f97316' }} />
            Optioneel: nieuw nummer kopen
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Via Twilio kun je een apart nummer kopen voor je AI (niet verplicht als je doorsturen gebruikt).
          </p>

          {/* Country Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
              Land
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setSelectedCountry(country.code)}
                  style={{
                    padding: '12px 20px', borderRadius: 8,
                    background: selectedCountry === country.code ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
                    border: selectedCountry === country.code ? '2px solid #f97316' : '1px solid #2a2a35',
                    color: selectedCountry === country.code ? '#f97316' : '#9ca3af',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 14, fontWeight: selectedCountry === country.code ? 600 : 400,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{country.flag}</span>
                  {country.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={searchNumbers}
            disabled={searching}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px 24px',
              background: searching ? '#6b7280' : '#f97316',
              border: 'none', borderRadius: 8, color: 'white',
              fontSize: 16, fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer',
              marginBottom: 20,
            }}
          >
            {searching ? (
              <>
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Zoeken...
              </>
            ) : (
              <>
                <Search size={18} />
                Beschikbare Nummers Zoeken
              </>
            )}
          </button>

          {/* Available Numbers */}
          {availableNumbers.length > 0 && (
            <div>
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>
                {availableNumbers.length} nummers gevonden - kies een nummer:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableNumbers.map((num) => (
                  <div key={num.phone_number} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 16, background: '#0a0a0f', borderRadius: 8, border: '1px solid #2a2a35',
                  }}>
                    <div>
                      <p style={{ color: 'white', fontSize: 16, fontWeight: 600, fontFamily: 'monospace' }}>
                        {num.phone_number}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: 13 }}>
                        {num.locality || num.region || num.country}
                      </p>
                    </div>
                    <button
                      onClick={() => purchaseNumber(num.phone_number)}
                      disabled={purchasing !== null}
                      style={{
                        padding: '10px 20px', borderRadius: 8,
                        background: purchasing === num.phone_number ? '#6b7280' : '#22c55e',
                        border: 'none', color: 'white', fontSize: 14, fontWeight: 600,
                        cursor: purchasing !== null ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      {purchasing === num.phone_number ? (
                        <>
                          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Kopen...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Kopen
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!agentId && (
            <div style={{
              background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: 8, padding: 16, marginTop: 16,
            }}>
              <p style={{ color: '#f97316', fontSize: 14 }}>
                <strong>Let op:</strong> Je moet eerst je AI configureren voordat je een nummer kunt kopen.
                Ga naar <a href="/dashboard/ai-settings" style={{ color: '#f97316', textDecoration: 'underline' }}>AI Instellingen</a> om je AI agent te maken.
              </p>
            </div>
          )}
        </div>

        {/* Test Call Modal */}
        {showCallModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{ background: '#16161f', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%' }}>
              <h3 style={{ color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                Test Oproep Starten
              </h3>
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 20 }}>
                De AI belt dit nummer om te testen of alles werkt.
              </p>
              <input
                type="tel"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="+32 xxx xx xx xx"
                style={{
                  width: '100%', padding: '14px 16px', background: '#0a0a0f',
                  border: '1px solid #2a2a35', borderRadius: 8, color: 'white',
                  fontSize: 16, marginBottom: 20,
                }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowCallModal(false)}
                  style={{
                    flex: 1, padding: '12px 20px', background: 'transparent',
                    border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af',
                    fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Annuleren
                </button>
                <button
                  onClick={initiateCall}
                  disabled={!callNumber || calling}
                  style={{
                    flex: 1, padding: '12px 20px',
                    background: !callNumber || calling ? '#6b7280' : '#22c55e',
                    border: 'none', borderRadius: 8, color: 'white',
                    fontSize: 14, fontWeight: 600, cursor: !callNumber || calling ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {calling ? (
                    <>
                      <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Bellen...
                    </>
                  ) : (
                    <>
                      <PhoneOutgoing size={16} />
                      Bellen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}
