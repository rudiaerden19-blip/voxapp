'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { Phone, Mic, Globe, Save, Check, Play, Volume2, Sparkles } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  type: string;
  elevenlabs_agent_id: string | null;
}

const voiceOptions = [
  { id: 'nl-NL-ColetteNeural', name: 'Colette', accent: 'Nederlands', gender: 'Vrouw' },
  { id: 'nl-NL-MaartenNeural', name: 'Maarten', accent: 'Nederlands', gender: 'Man' },
  { id: 'nl-BE-ArnaudNeural', name: 'Arnaud', accent: 'Belgisch', gender: 'Man' },
  { id: 'nl-BE-DenaNeural', name: 'Dena', accent: 'Belgisch', gender: 'Vrouw' },
  { id: 'fr-BE-CharlineNeural', name: 'Charline', accent: 'Frans (BE)', gender: 'Vrouw' },
  { id: 'fr-BE-GerardNeural', name: 'Gerard', accent: 'Frans (BE)', gender: 'Man' },
];

const brancheTemplates: Record<string, { greeting: string; capabilities: string; style: string }> = {
  kapper: {
    greeting: 'Goedendag, welkom bij {bedrijfsnaam}. Waarmee kan ik u helpen? Wilt u een afspraak maken?',
    capabilities: 'Ik kan afspraken inplannen voor knippen, kleuren, föhnen en andere behandelingen. Ik ken onze prijzen en beschikbaarheid.',
    style: 'Vriendelijk en vlot, zoals een echte kapsalon receptionist. Gebruik informele taal tenzij de klant formeel is.',
  },
  tandarts: {
    greeting: 'Goedendag, tandartspraktijk {bedrijfsnaam}. Waarmee kan ik u van dienst zijn?',
    capabilities: 'Ik plan afspraken voor controles, behandelingen en spoedgevallen. Bij acute pijn probeer ik dezelfde dag nog in te plannen.',
    style: 'Professioneel en geruststellend. Veel patiënten zijn nerveus, dus wees kalm en behulpzaam.',
  },
  restaurant: {
    greeting: 'Goedemiddag, restaurant {bedrijfsnaam}. Wilt u reserveren of heeft u een vraag?',
    capabilities: 'Ik neem reserveringen aan, geef info over ons menu en openingstijden. Ik kan dieetwensen noteren.',
    style: 'Gastvrij en enthousiast. Maak de beller enthousiast over een bezoek.',
  },
  garage: {
    greeting: 'Goedendag, garage {bedrijfsnaam}. Wat kan ik voor u betekenen?',
    capabilities: 'Ik plan afspraken voor onderhoud, APK, reparaties en bandenwissel. Ik kan een indicatie geven van prijzen.',
    style: 'Direct en zakelijk, maar vriendelijk. Automobilisten willen snel geholpen worden.',
  },
  schoonheid: {
    greeting: 'Hallo, welkom bij {bedrijfsnaam}. Waarmee kan ik u helpen vandaag?',
    capabilities: 'Ik plan behandelingen zoals gezichtsbehandelingen, manicure, pedicure en massages. Ik ken onze behandelingen en prijzen.',
    style: 'Warm en verzorgend. Klanten komen voor ontspanning, dus creëer een rustgevende sfeer.',
  },
  fysiotherapie: {
    greeting: 'Goedendag, fysiotherapiepraktijk {bedrijfsnaam}. Waarmee kan ik u helpen?',
    capabilities: 'Ik plan afspraken voor behandelingen en intake gesprekken. Ik kan vragen over verwijzingen beantwoorden.',
    style: 'Professioneel en empathisch. Patiënten hebben vaak pijn of beperkingen.',
  },
  huisarts: {
    greeting: 'Goedendag, huisartsenpraktijk {bedrijfsnaam}. Waarmee kan ik u van dienst zijn?',
    capabilities: 'Ik plan reguliere afspraken en triage spoedgevallen. Bij ernstige klachten verwijs ik door naar spoed.',
    style: 'Kalm en professioneel. Neem klachten serieus maar blijf rustig.',
  },
  other: {
    greeting: 'Goedendag, {bedrijfsnaam}. Waarmee kan ik u helpen?',
    capabilities: 'Ik beantwoord vragen over ons bedrijf en plan afspraken in. Ik kan bellers doorverbinden indien nodig.',
    style: 'Professioneel en vriendelijk. Pas je aan de toon van de beller aan.',
  },
};

export default function AISettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const [config, setConfig] = useState({
    voice_id: 'nl-BE-DenaNeural',
    language: 'nl-BE',
    greeting: '',
    capabilities: '',
    style: '',
    fallback_action: 'voicemail',
    transfer_number: '',
  });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
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
      
      // Load template based on business type
      const template = brancheTemplates[biz.type] || brancheTemplates.other;
      setConfig(prev => ({
        ...prev,
        greeting: template.greeting.replace('{bedrijfsnaam}', biz.name),
        capabilities: template.capabilities,
        style: template.style,
      }));
    }
    setLoading(false);
  };

  const applyTemplate = () => {
    if (!business) return;
    const template = brancheTemplates[business.type] || brancheTemplates.other;
    setConfig(prev => ({
      ...prev,
      greeting: template.greeting.replace('{bedrijfsnaam}', business.name),
      capabilities: template.capabilities,
      style: template.style,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    setSaving(true);
    setError('');
    setSaved(false);

    // TODO: Save to database and configure Vapi/ElevenLabs
    // For now, just simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  };

  const playVoiceSample = (voiceId: string) => {
    setPlayingVoice(voiceId);
    // TODO: Play actual voice sample
    setTimeout(() => setPlayingVoice(null), 2000);
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
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>AI Receptionist</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>Configureer je AI telefoniste</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Voice Selection */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mic size={20} style={{ color: '#f97316' }} /> Stem kiezen
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {voiceOptions.map(voice => (
              <div
                key={voice.id}
                onClick={() => setConfig({ ...config, voice_id: voice.id })}
                style={{
                  padding: 16, borderRadius: 12, cursor: 'pointer',
                  background: config.voice_id === voice.id ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
                  border: config.voice_id === voice.id ? '2px solid #f97316' : '1px solid #2a2a35',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>{voice.name}</p>
                    <p style={{ color: '#6b7280', fontSize: 12 }}>{voice.gender} • {voice.accent}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); playVoiceSample(voice.id); }}
                    style={{
                      background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6,
                      padding: 8, color: '#f97316', cursor: 'pointer',
                    }}
                  >
                    {playingVoice === voice.id ? <Volume2 size={16} /> : <Play size={16} />}
                  </button>
                </div>
                {config.voice_id === voice.id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f97316', fontSize: 12 }}>
                    <Check size={14} /> Geselecteerd
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Behavior */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} style={{ color: '#f97316' }} /> AI Gedrag
            </h2>
            <button
              type="button"
              onClick={applyTemplate}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6,
                padding: '8px 12px', color: '#f97316', fontSize: 13, cursor: 'pointer',
              }}
            >
              <Sparkles size={14} /> Herstel template
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Begroeting</label>
            <textarea
              value={config.greeting}
              onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
              rows={2}
              style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }}
              placeholder="Hoe begroet de AI de beller?"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Capaciteiten</label>
            <textarea
              value={config.capabilities}
              onChange={(e) => setConfig({ ...config, capabilities: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }}
              placeholder="Wat kan de AI allemaal doen?"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Gespreksstijl</label>
            <textarea
              value={config.style}
              onChange={(e) => setConfig({ ...config, style: e.target.value })}
              rows={2}
              style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }}
              placeholder="Hoe moet de AI communiceren?"
            />
          </div>
        </div>

        {/* Fallback Settings */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Phone size={20} style={{ color: '#f97316' }} /> Fallback instellingen
          </h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Als de AI niet kan helpen:</label>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { value: 'voicemail', label: 'Voicemail inspreken' },
                { value: 'transfer', label: 'Doorverbinden' },
                { value: 'callback', label: 'Terugbelverzoek' },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => setConfig({ ...config, fallback_action: option.value })}
                  style={{
                    padding: '12px 20px', borderRadius: 8, cursor: 'pointer',
                    background: config.fallback_action === option.value ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
                    border: config.fallback_action === option.value ? '2px solid #f97316' : '1px solid #2a2a35',
                    color: config.fallback_action === option.value ? '#f97316' : '#9ca3af',
                    fontWeight: config.fallback_action === option.value ? 600 : 400,
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          {config.fallback_action === 'transfer' && (
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Doorverbinden naar nummer:</label>
              <input
                type="tel"
                value={config.transfer_number}
                onChange={(e) => setConfig({ ...config, transfer_number: e.target.value })}
                style={{ width: '100%', maxWidth: 300, padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="+32 ..."
              />
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Status</h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 8,
            background: business?.elevenlabs_agent_id ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            border: business?.elevenlabs_agent_id ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(249, 115, 22, 0.3)',
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: business?.elevenlabs_agent_id ? '#22c55e' : '#f97316',
            }} />
            <span style={{ color: business?.elevenlabs_agent_id ? '#22c55e' : '#f97316', fontWeight: 500 }}>
              {business?.elevenlabs_agent_id ? 'AI Receptionist is actief' : 'AI Receptionist nog niet geconfigureerd'}
            </span>
          </div>
          {!business?.elevenlabs_agent_id && (
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>
              Sla je instellingen op om de AI receptionist te activeren. Je ontvangt daarna een telefoonnummer.
            </p>
          )}
        </div>

        {/* Error/Success */}
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
          {saving ? 'Opslaan...' : <><Save size={18} /> Opslaan & Activeren</>}
        </button>
      </form>
    </DashboardLayout>
  );
}
