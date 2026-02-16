'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/lib/LanguageContext';
import { useBusiness } from '@/lib/BusinessContext';
import { Phone, Mic, Globe, Save, Check, Play, Volume2, Sparkles, MapPin, Clock, Euro, HelpCircle, Plus, Trash2, Upload, FileText, X } from 'lucide-react';
import { getBusinessType, getAIContext, getTerminology, hasModule, getBrancheTemplate, getFAQTemplate } from '@/lib/modules';

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
  fallback_action: string | null;
  transfer_number: string | null;
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
  labels: Record<string, string>;
  preview_url?: string;
}

// Fallback voor oude code (brancheTemplates wordt nog gebruikt als backup)
const brancheTemplates: Record<string, { greeting: string; capabilities: string; style: string }> = {
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

// Voice card component
interface VoiceCardProps {
  voice: ElevenLabsVoice;
  selectedVoiceId: string;
  onSelect: (voiceId: string) => void;
  playVoiceSample: (voiceId: string) => void;
  playingVoice: string | null;
}

function VoiceCard({ voice, selectedVoiceId, onSelect, playVoiceSample, playingVoice }: VoiceCardProps) {
  // Build description from labels
  const labelParts: string[] = [];
  if (voice.labels.gender) labelParts.push(voice.labels.gender === 'female' ? 'Vrouw' : voice.labels.gender === 'male' ? 'Man' : voice.labels.gender);
  if (voice.labels.accent) labelParts.push(voice.labels.accent);
  if (voice.labels.age) labelParts.push(voice.labels.age);
  if (voice.labels.use_case) labelParts.push(voice.labels.use_case);
  
  return (
    <div
      onClick={() => onSelect(voice.voice_id)}
      style={{
        padding: 14, borderRadius: 12, cursor: 'pointer',
        background: selectedVoiceId === voice.voice_id ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
        border: selectedVoiceId === voice.voice_id ? '2px solid #f97316' : '1px solid #2a2a35',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
        <div>
          <p style={{ color: 'white', fontWeight: 600, marginBottom: 2, fontSize: 14 }}>{voice.name}</p>
          <p style={{ color: '#6b7280', fontSize: 11 }}>
            {labelParts.join(' • ') || 'Premium stem'}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); playVoiceSample(voice.voice_id); }}
          style={{
            background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6,
            padding: 6, color: '#f97316', cursor: 'pointer',
          }}
        >
          {playingVoice === voice.voice_id ? <Volume2 size={14} /> : <Play size={14} />}
        </button>
      </div>
      {selectedVoiceId === voice.voice_id && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f97316', fontSize: 11 }}>
          <Check size={12} /> Geselecteerd
        </div>
      )}
    </div>
  );
}

export default function AISettingsPage() {
  const { t, language } = useLanguage();
  const { business: contextBusiness, businessId, businessType, loading: businessLoading } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Menu items state
  const [menuItems, setMenuItems] = useState<Array<{ id: string; category: string; name: string; price: number; description?: string }>>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuUploading, setMenuUploading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [menuSuccess, setMenuSuccess] = useState<string | null>(null);
  
  // New product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', description: '' });
  const [productSaving, setProductSaving] = useState(false);
  
  // Option groups state
  const [optionGroups, setOptionGroups] = useState<Array<{ id: string; name: string; required: boolean; multiple: boolean; options: Array<{ name: string; price: number }> }>>([]);
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [newOptionGroup, setNewOptionGroup] = useState({ name: '', required: false, multiple: true, options: [{ name: '', price: 0 }] });

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

  useEffect(() => { loadVoices(); }, []);
  useEffect(() => { if (contextBusiness && businessId) loadSettings(); }, [contextBusiness, businessId]);

  const loadVoices = async () => {
    setVoicesLoading(true);
    setVoicesError(null);
    
    try {
      const res = await fetch('/api/elevenlabs/voices');
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setVoices(data);
      } else if (data.error) {
        console.error('Voices API error:', data.error);
        setVoicesError(data.error);
        setVoices([]);
      } else {
        console.error('Invalid voices response:', data);
        setVoicesError('Geen stemmen gevonden');
        setVoices([]);
      }
    } catch (e) {
      console.error('Failed to load voices:', e);
      setVoicesError('Kon stemmen niet laden');
      setVoices([]);
    } finally {
      setVoicesLoading(false);
    }
  };

  const loadMenuItemsForBusiness = async (businessId: string) => {
    setMenuLoading(true);
    try {
      // Gebruik admin API (bypass RLS)
      const res = await fetch(`/api/admin/products?business_id=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setMenuItems((data || []).map((item: { id: string; name: string; price: number; category?: string }) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category || 'Producten',
        })));
      }
    } catch (e) {
      console.error('Failed to load menu items:', e);
    } finally {
      setMenuLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!business?.id) return;
    await loadMenuItemsForBusiness(business.id);
  };

  // Load menu items when business is loaded
  useEffect(() => {
    if (business?.id) {
      loadMenuItems();
    }
  }, [business?.id]);

  const handleMenuUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business?.id) return;

    setMenuUploading(true);
    setMenuError(null);
    setMenuSuccess(null);

    try {
      const text = await file.text();
      let items: Array<{ category: string; name: string; price: number; description?: string }> = [];

      // Parse CSV or JSON
      if (file.name.endsWith('.json')) {
        items = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(';').map(v => v.trim());
          const item: { category: string; name: string; price: number; description?: string } = {
            category: '',
            name: '',
            price: 0,
          };
          
          headers.forEach((header, idx) => {
            if (header === 'categorie' || header === 'category') item.category = values[idx] || '';
            if (header === 'naam' || header === 'name' || header === 'product') item.name = values[idx] || '';
            if (header === 'prijs' || header === 'price') {
              const priceStr = values[idx]?.replace('€', '').replace(',', '.').trim();
              item.price = parseFloat(priceStr) || 0;
            }
            if (header === 'beschrijving' || header === 'description') item.description = values[idx] || '';
          });
          
          if (item.name && item.price > 0) {
            items.push(item);
          }
        }
      }

      if (items.length === 0) {
        throw new Error('Geen geldige producten gevonden in bestand');
      }

      // Upload to Supabase
      const supabase = createClient();
      
      // Delete existing items for this business
      await supabase.from('menu_items').delete().eq('business_id', business.id);
      
      // Insert new items
      const { error } = await supabase.from('menu_items').insert(
        items.map(item => ({
          business_id: business.id,
          category: item.category,
          name: item.name,
          price: item.price,
          description: item.description || null,
          is_available: true,
        }))
      );

      if (error) throw error;

      setMenuSuccess(`${items.length} producten succesvol geïmporteerd!`);
      loadMenuItems();
      
      // Clear success message after 5 seconds
      setTimeout(() => setMenuSuccess(null), 5000);
    } catch (err) {
      setMenuError(err instanceof Error ? err.message : 'Upload mislukt');
    } finally {
      setMenuUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    if (!business?.id) return;
    try {
      // Gebruik admin API (bypass RLS)
      await fetch(`/api/admin/products?id=${itemId}&business_id=${business.id}`, {
        method: 'DELETE',
      });
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    } catch (e) {
      console.error('Failed to delete menu item:', e);
    }
  };

  const saveNewProduct = async () => {
    if (!business?.id || !newProduct.name || !newProduct.price) return;
    
    setProductSaving(true);
    setMenuError(null);
    try {
      const priceNum = parseFloat(newProduct.price.replace(',', '.'));
      
      // Gebruik admin API (bypass RLS)
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          category: 'Producten',
          name: newProduct.name.charAt(0).toUpperCase() + newProduct.name.slice(1),
          price: priceNum,
          is_available: true,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Opslaan mislukt');
      }
      
      const data = await res.json();
      
      setMenuItems([...menuItems, { 
        id: data.id,
        name: data.name,
        price: data.price,
        category: data.category || 'Producten',
      }]);
      setNewProduct({ name: '', price: '', category: '', description: '' });
      setMenuSuccess('Product toegevoegd!');
      setTimeout(() => setMenuSuccess(null), 3000);
    } catch (e) {
      console.error('Failed to save product:', e);
      setMenuError(e instanceof Error ? e.message : 'Kon product niet opslaan');
    } finally {
      setProductSaving(false);
    }
  };

  const saveOptionGroup = async () => {
    if (!business?.id || !newOptionGroup.name) return;
    
    // For now, store option groups in localStorage (can be moved to Supabase later)
    const newGroup = {
      id: Date.now().toString(),
      ...newOptionGroup,
      options: newOptionGroup.options.filter(o => o.name.trim()),
    };
    
    setOptionGroups([...optionGroups, newGroup]);
    setNewOptionGroup({ name: '', required: false, multiple: true, options: [{ name: '', price: 0 }] });
    setShowOptionForm(false);
  };

  const deleteOptionGroup = (groupId: string) => {
    setOptionGroups(optionGroups.filter(g => g.id !== groupId));
  };

  const loadSettings = async () => {
    // Use business from context (handles admin_view automatically)
    if (!businessId || !contextBusiness) return;
    
    const biz = contextBusiness as unknown as Business;
    setBusiness(biz);
    
    // Laad producten nu business bekend is
    loadMenuItemsForBusiness(biz.id);

    // Load saved data from database
      const template = getBrancheTemplate(biz.type, biz.name);
      
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
      
      // Get FAQ template for this business type
      const faqTemplate = getFAQTemplate(biz.type);
      
      setConfig(prev => ({
        ...prev,
        // Load saved voice or default
        voice_id: biz.voice_id || 'pFZP5JQG7iQjIQuC4Bku', // Default: Lily (ElevenLabs multilingual)
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
        // Always load FAQ template for business type
        faqs: faqTemplate,
        // Load fallback settings
        fallback_action: biz.fallback_action || 'voicemail',
        transfer_number: biz.transfer_number || '',
      }));
    setLoading(false);
  };

  const applyTemplate = () => {
    if (!business) return;
    // Gebruik nieuwe dynamische template generator
    const template = getBrancheTemplate(business.type, business.name);
    setConfig(prev => ({
      ...prev,
      greeting: template.greeting,
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
      
      // Update business via API (bypasses RLS)
      const res = await fetch('/api/business/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: business.id,
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
          // Fallback settings
          fallback_action: config.fallback_action,
          transfer_number: config.transfer_number || null,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Opslaan mislukt');
      }
      
      // Update ElevenLabs agent with ALL business data including fallback settings
      const agentRes = await fetch('/api/elevenlabs/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          ai_context: `${config.capabilities}\n\n${config.style}`,
          faqs: config.faqs.filter(f => f.question && f.answer),
          fallback_action: config.fallback_action,
          transfer_number: config.transfer_number,
        }),
      });
      
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        // Update local business state with new agent_id if created
        if (agentData.agent_id) {
          setBusiness({ ...business, agent_id: agentData.agent_id });
        }
        setSaved(true);
      } else {
        const agentError = await agentRes.json().catch(() => ({ error: 'ElevenLabs fout' }));
        throw new Error(agentError.error || 'AI agent aanmaken mislukt');
      }
      
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  const playVoiceSample = (voiceId: string) => {
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    const voice = voices.find(v => v.voice_id === voiceId);
    
    setPlayingVoice(voiceId);
    
    // Use preview_url if available, otherwise generate via our API
    const audioUrl = voice?.preview_url || `/api/elevenlabs/preview?voice_id=${voiceId}`;
    
    const audio = new Audio(audioUrl);
    setAudioElement(audio);
    audio.onended = () => setPlayingVoice(null);
    audio.onerror = () => {
      console.error('Failed to play audio');
      setPlayingVoice(null);
    };
    audio.play().catch(() => setPlayingVoice(null));
  };

  if (loading || businessLoading) {
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
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            16 ElevenLabs stemmen in 4 talen - klik op play om te beluisteren
          </p>

          {voicesLoading ? (
            <p style={{ color: '#6b7280' }}>Stemmen laden...</p>
          ) : voicesError ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 16 }}>
              <p style={{ color: '#ef4444', marginBottom: 8 }}>{voicesError}</p>
              <button
                type="button"
                onClick={loadVoices}
                style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}
              >
                Opnieuw proberen
              </button>
            </div>
          ) : voices.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Geen stemmen beschikbaar</p>
          ) : (
            <>
              {/* Eigen stem optie */}
              <div style={{ marginBottom: 24, padding: 16, background: '#1a1a24', borderRadius: 12, border: '1px solid #2a2a35' }}>
                <h3 style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🎙️ Eigen Stem</h3>
                <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>
                  Wil je je eigen stem gebruiken? Neem contact op om je stem te laten klonen.
                </p>
                <a
                  href="mailto:support@voxapp.be?subject=Eigen stem klonen"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, fontWeight: 500, textDecoration: 'none', cursor: 'pointer' }}
                >
                  📧 Contacteer ons
                </a>
              </div>

              {/* Nederlands/Vlaams */}
              {voices.filter(v => v.labels.language === 'NL').length > 0 && (
                <>
                  <h3 style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🇧🇪 Nederlands / Vlaams</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {voices.filter(v => v.labels.language === 'NL').map(voice => (
                      <VoiceCard key={voice.voice_id} voice={voice} selectedVoiceId={config.voice_id} onSelect={(id) => setConfig({ ...config, voice_id: id })} playVoiceSample={playVoiceSample} playingVoice={playingVoice} />
                    ))}
                  </div>
                </>
              )}

              {/* Frans */}
              {voices.filter(v => v.labels.language === 'FR').length > 0 && (
                <>
                  <h3 style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🇫🇷 Frans</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {voices.filter(v => v.labels.language === 'FR').map(voice => (
                      <VoiceCard key={voice.voice_id} voice={voice} selectedVoiceId={config.voice_id} onSelect={(id) => setConfig({ ...config, voice_id: id })} playVoiceSample={playVoiceSample} playingVoice={playingVoice} />
                    ))}
                  </div>
                </>
              )}

              {/* Duits */}
              {voices.filter(v => v.labels.language === 'DE').length > 0 && (
                <>
                  <h3 style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🇩🇪 Duits</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {voices.filter(v => v.labels.language === 'DE').map(voice => (
                      <VoiceCard key={voice.voice_id} voice={voice} selectedVoiceId={config.voice_id} onSelect={(id) => setConfig({ ...config, voice_id: id })} playVoiceSample={playVoiceSample} playingVoice={playingVoice} />
                    ))}
                  </div>
                </>
              )}

              {/* Engels */}
              {voices.filter(v => v.labels.language === 'EN').length > 0 && (
                <>
                  <h3 style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🇬🇧 Engels</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {voices.filter(v => v.labels.language === 'EN').map(voice => (
                      <VoiceCard key={voice.voice_id} voice={voice} selectedVoiceId={config.voice_id} onSelect={(id) => setConfig({ ...config, voice_id: id })} playVoiceSample={playVoiceSample} playingVoice={playingVoice} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
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
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Straat + huisnummer</label>
              <input
                type="text"
                value={config.address_street}
                onChange={(e) => setConfig({ ...config, address_street: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                placeholder="Kerkstraat 15"
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

        {/* Productenlijst - only for businesses with menu module */}
        {hasModule(businessType, 'menu') && (
          <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Euro size={20} style={{ color: '#f97316' }} /> Productenlijst
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
              Voeg je producten toe. De AI receptionist kent deze prijzen.
            </p>

            {menuError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, marginBottom: 16, color: '#ef4444', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <X size={16} /> {menuError}
              </div>
            )}

            {menuSuccess && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 8, padding: 12, marginBottom: 16, color: '#22c55e', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={16} /> {menuSuccess}
              </div>
            )}

            {/* Inline add form */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Product naam"
                style={{ flex: 1, minWidth: 150, padding: '12px 14px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
              <div style={{ position: 'relative', width: 100 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>€</span>
                <input
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '12px 14px 12px 28px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 14 }}
                />
              </div>
              <button
                type="button"
                onClick={saveNewProduct}
                disabled={productSaving || !newProduct.name || !newProduct.price}
                style={{ padding: '12px 20px', background: (productSaving || !newProduct.name || !newProduct.price) ? '#4b5563' : '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, cursor: (productSaving || !newProduct.name || !newProduct.price) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} /> {productSaving ? '...' : 'Toevoegen'}
              </button>
            </div>

            {/* Product list */}
            {menuLoading ? (
              <p style={{ color: '#6b7280' }}>Laden...</p>
            ) : menuItems.length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nog geen producten. Voeg hierboven je eerste product toe.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {menuItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0a0a0f', borderRadius: 8 }}>
                    <span style={{ color: 'white', fontSize: 14 }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: '#f97316', fontSize: 14, fontWeight: 600 }}>€{item.price.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        style={{ padding: 6, background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>
                  {menuItems.length} product{menuItems.length !== 1 ? 'en' : ''}
                </p>
              </div>
            )}
          </div>
        )}

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
