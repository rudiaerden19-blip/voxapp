'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { Phone, Mic, Globe, Save, Check, Play, Volume2, Sparkles, MapPin, Clock, Euro, HelpCircle, Plus, Trash2 } from 'lucide-react';

interface Business {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  opening_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
  voice_id: string | null;
  welcome_message: string | null;
  agent_id: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

// ElevenLabs voices will be loaded dynamically
interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels: {
    accent?: string;
    gender?: string;
    description?: string;
  };
}

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
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const [config, setConfig] = useState({
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Default ElevenLabs voice (Sarah)
    language: 'nl-BE',
    greeting: '',
    capabilities: '',
    style: '',
    fallback_action: 'voicemail',
    transfer_number: '',
    // Bedrijfsgegevens
    address_street: '',
    address_number: '',
    address_postal: '',
    address_city: '',
    phone_display: '',
    email: '',
    website: '',
    // Openingsuren
    opening_hours: {
      maandag: { open: '09:00', close: '18:00', closed: false },
      dinsdag: { open: '09:00', close: '18:00', closed: false },
      woensdag: { open: '09:00', close: '18:00', closed: false },
      donderdag: { open: '09:00', close: '18:00', closed: false },
      vrijdag: { open: '09:00', close: '18:00', closed: false },
      zaterdag: { open: '09:00', close: '17:00', closed: false },
      zondag: { open: '', close: '', closed: true },
    } as Record<string, { open: string; close: string; closed: boolean }>,
    // Prijslijst
    services_prices: [] as Array<{ name: string; price: string; duration: string }>,
    // FAQ's
    faqs: [] as Array<{ question: string; answer: string }>,
  });

  useEffect(() => { loadSettings(); loadVoices(); }, []);

  const loadVoices = async () => {
    try {
      const res = await fetch('/api/elevenlabs/voices');
      if (res.ok) {
        const data = await res.json();
        setVoices(data);
      }
    } catch (e) {
      console.error('Failed to load voices:', e);
    }
  };

  const loadSettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: businessData } = await supabase
      .from('businesses')
      .select('id, user_id, name, type, description, phone, email, website, street, city, postal_code, country, opening_hours, voice_id, welcome_message, agent_id, subscription_status, subscription_plan, trial_ends_at, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    if (businessData) {
      const biz = businessData as unknown as Business;
      setBusiness(biz);
      
      // Load saved data from database
      const template = brancheTemplates[biz.type] || brancheTemplates.other;
      
      // Map English day names from DB to Dutch day names in UI
      const dayMapping: Record<string, string> = {
        monday: 'maandag',
        tuesday: 'dinsdag',
        wednesday: 'woensdag',
        thursday: 'donderdag',
        friday: 'vrijdag',
        saturday: 'zaterdag',
        sunday: 'zondag',
      };
      
      // Convert opening_hours from DB format (English) to UI format (Dutch)
      let openingHours = config.opening_hours;
      if (biz.opening_hours) {
        openingHours = {};
        for (const [engDay, dutchDay] of Object.entries(dayMapping)) {
          const dbHours = biz.opening_hours[engDay];
          if (dbHours) {
            openingHours[dutchDay] = {
              open: dbHours.open || '09:00',
              close: dbHours.close || '18:00',
              closed: dbHours.closed ?? false,
            };
          }
        }
      }
      
      setConfig(prev => ({
        ...prev,
        // Load saved voice or default
        voice_id: biz.voice_id || 'nl-BE-DenaNeural',
        // Load greeting from DB or use template
        greeting: biz.welcome_message || template.greeting.replace('{bedrijfsnaam}', biz.name),
        capabilities: template.capabilities,
        style: template.style,
        // Load contact info
        phone_display: biz.phone || '',
        email: biz.email || '',
        website: biz.website || '',
        // Load address
        address_street: biz.street || '',
        address_postal: biz.postal_code || '',
        address_city: biz.city || '',
        // Load opening hours
        opening_hours: openingHours,
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

    try {
      const supabase = createClient();
      
      // Map Dutch day names back to English for database
      const dayMapping: Record<string, string> = {
        maandag: 'monday',
        dinsdag: 'tuesday',
        woensdag: 'wednesday',
        donderdag: 'thursday',
        vrijdag: 'friday',
        zaterdag: 'saturday',
        zondag: 'sunday',
      };
      
      // Convert opening_hours from UI format (Dutch) to DB format (English)
      const dbOpeningHours: Record<string, { open: string; close: string; closed: boolean }> = {};
      for (const [dutchDay, engDay] of Object.entries(dayMapping)) {
        const uiHours = config.opening_hours[dutchDay];
        if (uiHours) {
          dbOpeningHours[engDay] = {
            open: uiHours.open,
            close: uiHours.close,
            closed: uiHours.closed,
          };
        }
      }
      
      // Update business in database
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          // Contact info
          phone: config.phone_display || null,
          email: config.email || null,
          website: config.website || null,
          // Address
          street: config.address_street || null,
          postal_code: config.address_postal || null,
          city: config.address_city || null,
          // AI settings
          voice_id: config.voice_id,
          welcome_message: config.greeting,
          // Opening hours
          opening_hours: dbOpeningHours,
        })
        .eq('id', business.id);
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  const playVoiceSample = async (voiceId: string) => {
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    setPlayingVoice(voiceId);
    
    try {
      const res = await fetch('/api/elevenlabs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_id: voiceId,
          text: 'Goedendag, welkom bij ons bedrijf. Waarmee kan ik u helpen vandaag?',
        }),
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        setAudioElement(audio);
        audio.onended = () => setPlayingVoice(null);
        audio.onerror = () => setPlayingVoice(null);
        audio.play();
      } else {
        setPlayingVoice(null);
      }
    } catch (e) {
      console.error('Failed to play voice sample:', e);
      setPlayingVoice(null);
    }
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
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('aiSettings.title')}</h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>{t('aiSettings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Voice Selection */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mic size={20} style={{ color: '#f97316' }} /> Stem kiezen
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {voices.length === 0 ? (
              <p style={{ color: '#6b7280' }}>Stemmen laden...</p>
            ) : voices.map(voice => (
              <div
                key={voice.voice_id}
                onClick={() => setConfig({ ...config, voice_id: voice.voice_id })}
                style={{
                  padding: 16, borderRadius: 12, cursor: 'pointer',
                  background: config.voice_id === voice.voice_id ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
                  border: config.voice_id === voice.voice_id ? '2px solid #f97316' : '1px solid #2a2a35',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600, marginBottom: 4 }}>{voice.name}</p>
                    <p style={{ color: '#6b7280', fontSize: 12 }}>
                      {voice.labels.gender === 'female' ? 'Vrouw' : voice.labels.gender === 'male' ? 'Man' : ''} 
                      {voice.labels.accent ? ` • ${voice.labels.accent}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); playVoiceSample(voice.voice_id); }}
                    style={{
                      background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6,
                      padding: 8, color: '#f97316', cursor: 'pointer',
                    }}
                  >
                    {playingVoice === voice.voice_id ? <Volume2 size={16} /> : <Play size={16} />}
                  </button>
                </div>
                {config.voice_id === voice.voice_id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f97316', fontSize: 12 }}>
                    <Check size={14} /> Geselecteerd
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Receptie Gedrag */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={20} style={{ color: '#f97316' }} /> Receptie Gedrag
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
              placeholder="Hoe begroet de receptie de beller?"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Capaciteiten</label>
            <textarea
              value={config.capabilities}
              onChange={(e) => setConfig({ ...config, capabilities: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }}
              placeholder="Wat kan de receptie allemaal doen?"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Gespreksstijl</label>
            <textarea
              value={config.style}
              onChange={(e) => setConfig({ ...config, style: e.target.value })}
              rows={2}
              style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }}
              placeholder="Hoe moet de receptie communiceren?"
            />
          </div>
        </div>

        {/* Bedrijfsgegevens */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={20} style={{ color: '#f97316' }} /> Bedrijfsgegevens
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Deze info gebruikt de receptie om vragen te beantwoorden zoals &quot;Waar zijn jullie gevestigd?&quot;
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Straatnaam</label>
              <input
                type="text"
                value={config.address_street}
                onChange={(e) => setConfig({ ...config, address_street: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="Kerkstraat"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Huisnummer</label>
              <input
                type="text"
                value={config.address_number}
                onChange={(e) => setConfig({ ...config, address_number: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="15"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Postcode</label>
              <input
                type="text"
                value={config.address_postal}
                onChange={(e) => setConfig({ ...config, address_postal: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="2000"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Stad</label>
              <input
                type="text"
                value={config.address_city}
                onChange={(e) => setConfig({ ...config, address_city: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="Antwerpen"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Telefoonnummer (weergave)</label>
              <input
                type="tel"
                value={config.phone_display}
                onChange={(e) => setConfig({ ...config, phone_display: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="03 123 45 67"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="info@uwbedrijf.be"
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Website</label>
              <input
                type="url"
                value={config.website}
                onChange={(e) => setConfig({ ...config, website: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="www.uwbedrijf.be"
              />
            </div>
          </div>
        </div>

        {/* Openingsuren */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={20} style={{ color: '#f97316' }} /> Openingsuren
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(config.opening_hours).map(([day, hours]) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ color: 'white', fontWeight: 500, width: 100, textTransform: 'capitalize' }}>{day}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => setConfig({
                      ...config,
                      opening_hours: { ...config.opening_hours, [day]: { ...hours, closed: e.target.checked } }
                    })}
                    style={{ accentColor: '#f97316' }}
                  />
                  Gesloten
                </label>
                {!hours.closed && (
                  <>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => setConfig({
                        ...config,
                        opening_hours: { ...config.opening_hours, [day]: { ...hours, open: e.target.value } }
                      })}
                      style={{ padding: '8px 12px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    />
                    <span style={{ color: '#6b7280' }}>tot</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => setConfig({
                        ...config,
                        opening_hours: { ...config.opening_hours, [day]: { ...hours, close: e.target.value } }
                      })}
                      style={{ padding: '8px 12px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prijslijst */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Euro size={20} style={{ color: '#f97316' }} /> Prijslijst
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Voeg diensten toe zodat de receptie prijzen kan noemen.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {config.services_prices.map((service, index) => (
              <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => {
                    const newServices = [...config.services_prices];
                    newServices[index].name = e.target.value;
                    setConfig({ ...config, services_prices: newServices });
                  }}
                  style={{ flex: 2, minWidth: 150, padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                  placeholder="Dienst naam"
                />
                <input
                  type="text"
                  value={service.price}
                  onChange={(e) => {
                    const newServices = [...config.services_prices];
                    newServices[index].price = e.target.value;
                    setConfig({ ...config, services_prices: newServices });
                  }}
                  style={{ width: 100, padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                  placeholder="€25"
                />
                <input
                  type="text"
                  value={service.duration}
                  onChange={(e) => {
                    const newServices = [...config.services_prices];
                    newServices[index].duration = e.target.value;
                    setConfig({ ...config, services_prices: newServices });
                  }}
                  style={{ width: 100, padding: '10px 14px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                  placeholder="30 min"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newServices = config.services_prices.filter((_, i) => i !== index);
                    setConfig({ ...config, services_prices: newServices });
                  }}
                  style={{ padding: 8, background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setConfig({ ...config, services_prices: [...config.services_prices, { name: '', price: '', duration: '' }] })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(249, 115, 22, 0.15)', border: '1px dashed #f97316', borderRadius: 8, color: '#f97316', fontSize: 14, cursor: 'pointer' }}
          >
            <Plus size={16} /> Dienst toevoegen
          </button>
        </div>

        {/* FAQ's */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <HelpCircle size={20} style={{ color: '#f97316' }} /> Veelgestelde Vragen (FAQ)
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Voeg vragen en antwoorden toe die de receptie kan gebruiken.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
            {config.faqs.map((faq, index) => (
              <div key={index} style={{ background: '#0a0a0f', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12, marginBottom: 12 }}>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...config.faqs];
                      newFaqs[index].question = e.target.value;
                      setConfig({ ...config, faqs: newFaqs });
                    }}
                    style={{ flex: 1, padding: '10px 14px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    placeholder="Vraag, bijv: Moet ik parkeren betalen?"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFaqs = config.faqs.filter((_, i) => i !== index);
                      setConfig({ ...config, faqs: newFaqs });
                    }}
                    style={{ padding: 8, background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const newFaqs = [...config.faqs];
                    newFaqs[index].answer = e.target.value;
                    setConfig({ ...config, faqs: newFaqs });
                  }}
                  rows={2}
                  style={{ width: '100%', padding: '10px 14px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14, resize: 'vertical' }}
                  placeholder="Antwoord, bijv: Nee, wij hebben gratis parking achter het gebouw."
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setConfig({ ...config, faqs: [...config.faqs, { question: '', answer: '' }] })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(249, 115, 22, 0.15)', border: '1px dashed #f97316', borderRadius: 8, color: '#f97316', fontSize: 14, cursor: 'pointer' }}
          >
            <Plus size={16} /> Vraag toevoegen
          </button>
        </div>

        {/* Fallback Settings */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Phone size={20} style={{ color: '#f97316' }} /> Fallback instellingen
          </h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Als de receptie niet kan helpen:</label>
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
            background: business?.agent_id ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
            border: business?.agent_id ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(249, 115, 22, 0.3)',
          }}>
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: business?.agent_id ? '#22c55e' : '#f97316',
            }} />
            <span style={{ color: business?.agent_id ? '#22c55e' : '#f97316', fontWeight: 500 }}>
              {business?.agent_id ? 'Receptie is actief' : 'Receptie nog niet geconfigureerd'}
            </span>
          </div>
          {!business?.agent_id && (
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>
              Sla je instellingen op om de receptie te activeren. Je ontvangt daarna een telefoonnummer.
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
