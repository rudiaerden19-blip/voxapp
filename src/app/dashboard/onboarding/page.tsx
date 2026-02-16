'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { Building2, Briefcase, Users, Phone, ChevronRight, Check, Plus, X, Sparkles } from 'lucide-react';
import { BUSINESS_TYPES, CATEGORY_NAMES, getBusinessTypesByCategory, getBrancheTemplate } from '@/lib/modules';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
}

const steps: Step[] = [
  { id: 1, title: 'Bedrijf', icon: Building2 },
  { id: 2, title: 'Diensten', icon: Briefcase },
  { id: 3, title: 'Team', icon: Users },
  { id: 4, title: 'AI Setup', icon: Phone },
];

// Business types uit module systeem
const businessTypesByCategory = getBusinessTypesByCategory();

const voiceOptions = [
  { id: 'nl-BE-DenaNeural', name: 'Dena', accent: 'Belgisch', gender: 'Vrouw' },
  { id: 'nl-BE-ArnaudNeural', name: 'Arnaud', accent: 'Belgisch', gender: 'Man' },
  { id: 'nl-NL-ColetteNeural', name: 'Colette', accent: 'Nederlands', gender: 'Vrouw' },
  { id: 'nl-NL-MaartenNeural', name: 'Maarten', accent: 'Nederlands', gender: 'Man' },
];

export default function OnboardingPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Step 1: Business
  const [businessData, setBusinessData] = useState({
    name: '',
    type: '',
    phone: '',
    email: '',
    address: '',
  });

  // Step 2: Services
  const [services, setServices] = useState<{ name: string; duration: number; price: string }[]>([]);
  const [newService, setNewService] = useState({ name: '', duration: 30, price: '' });

  // Step 3: Staff
  const [staffMembers, setStaffMembers] = useState<{ name: string; email: string }[]>([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '' });

  // Step 4: AI
  const [aiConfig, setAiConfig] = useState({
    voice_id: 'nl-BE-DenaNeural',
    greeting: '',
  });

  useEffect(() => { loadExistingData(); }, []);

  const loadExistingData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (business) {
      const biz = business as { id: string; name: string; type: string; phone: string | null; email: string | null; address: string | null };
      setBusinessId(biz.id);
      setBusinessData({
        name: biz.name || '',
        type: biz.type || '',
        phone: biz.phone || '',
        email: biz.email || '',
        address: biz.address || '',
      });

      // Generate default greeting
      setAiConfig(prev => ({
        ...prev,
        greeting: `Goedendag, welkom bij ${biz.name}. Waarmee kan ik u helpen?`,
      }));
    }
    setLoading(false);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      await saveBusinessData();
    } else if (currentStep === 2) {
      await saveServices();
    } else if (currentStep === 3) {
      await saveStaff();
    } else if (currentStep === 4) {
      await finishOnboarding();
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const saveBusinessData = async () => {
    if (!businessId) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('businesses').update({
      name: businessData.name,
      type: businessData.type,
      phone: businessData.phone || null,
      email: businessData.email || null,
      address: businessData.address || null,
    }).eq('id', businessId);
    setSaving(false);
  };

  const saveServices = async () => {
    if (!businessId || services.length === 0) return;
    setSaving(true);
    const supabase = createClient();
    
    for (const service of services) {
      await supabase.from('services').insert({
        business_id: businessId,
        name: service.name,
        duration_minutes: service.duration,
        price: service.price ? parseFloat(service.price) : null,
        is_active: true,
      });
    }
    setSaving(false);
  };

  const saveStaff = async () => {
    if (!businessId || staffMembers.length === 0) return;
    setSaving(true);
    const supabase = createClient();
    
    for (const staff of staffMembers) {
      await supabase.from('staff').insert({
        business_id: businessId,
        name: staff.name,
        email: staff.email || null,
        is_active: true,
      });
    }
    setSaving(false);
  };

  const finishOnboarding = async () => {
    setSaving(true);
    
    try {
      if (businessId) {
        // Create/update AI agent with ElevenLabs
        const response = await fetch('/api/elevenlabs/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: businessId,
            voiceId: aiConfig.voice_id,
            greeting: aiConfig.greeting,
          }),
        });

        if (!response.ok) {
          console.error('Failed to create AI agent:', await response.text());
          // Continue anyway - they can configure AI later
        }

        // Save AI settings to the database
        const supabase = createClient();
        await supabase.from('businesses').update({
          voice_id: aiConfig.voice_id,
          welcome_message: aiConfig.greeting,
        } as any).eq('id', businessId);
      }
    } catch (error) {
      console.error('Error during finishOnboarding:', error);
      // Continue anyway - don't block the user
    }
    
    router.push('/dashboard');
  };

  const addService = () => {
    if (!newService.name.trim()) return;
    setServices([...services, { ...newService }]);
    setNewService({ name: '', duration: 30, price: '' });
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addStaff = () => {
    if (!newStaff.name.trim()) return;
    setStaffMembers([...staffMembers, { ...newStaff }]);
    setNewStaff({ name: '', email: '' });
  };

  const removeStaff = (index: number) => {
    setStaffMembers(staffMembers.filter((_, i) => i !== index));
  };

  const canProceed = () => {
    if (currentStep === 1) return businessData.name && businessData.type;
    return true; // Other steps are optional
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>Laden...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '40px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: '#f97316' }}>Vox</span><span style={{ color: 'white' }}>App</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Laten we je AI receptionist instellen</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: currentStep >= step.id ? '#f97316' : '#2a2a35',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: currentStep >= step.id ? 'white' : '#6b7280',
                fontWeight: 600, fontSize: 14,
              }}>
                {currentStep > step.id ? <Check size={18} /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  width: 40, height: 2,
                  background: currentStep > step.id ? '#f97316' : '#2a2a35',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 32 }}>
          {/* Step 1: Business */}
          {currentStep === 1 && (
            <div>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Over je bedrijf</h2>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>Dit helpt ons de AI perfect af te stemmen</p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Bedrijfsnaam *</label>
                <input
                  type="text"
                  value={businessData.name}
                  onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                  placeholder="Jouw Bedrijf"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>Type bedrijf *</label>
                <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                  {Object.entries(businessTypesByCategory).map(([category, types]) => (
                    <div key={category} style={{ marginBottom: 16 }}>
                      <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
                        {CATEGORY_NAMES[category] || category}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                        {types.map(type => (
                          <div
                            key={type.id}
                            onClick={() => setBusinessData({ ...businessData, type: type.id })}
                            style={{
                              padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                              background: businessData.type === type.id ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
                              border: businessData.type === type.id ? '2px solid #f97316' : '1px solid #2a2a35',
                              display: 'flex', alignItems: 'center', gap: 10,
                            }}
                          >
                            <span style={{ fontSize: 18 }}>{type.icon}</span>
                            <span style={{ color: businessData.type === type.id ? '#f97316' : '#9ca3af', fontWeight: businessData.type === type.id ? 600 : 400, fontSize: 13 }}>
                              {type.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Telefoonnummer</label>
                <input
                  type="tel"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16 }}
                  placeholder="+32 ..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Je diensten</h2>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>Welke diensten bied je aan? (optioneel, je kunt dit later aanpassen)</p>

              {services.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {services.map((service, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0a0a0f', borderRadius: 8, marginBottom: 8 }}>
                      <div>
                        <span style={{ color: 'white', fontWeight: 500 }}>{service.name}</span>
                        <span style={{ color: '#6b7280', marginLeft: 12, fontSize: 14 }}>{service.duration} min</span>
                        {service.price && <span style={{ color: '#f97316', marginLeft: 12, fontSize: 14 }}>€{service.price}</span>}
                      </div>
                      <button onClick={() => removeService(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 12, marginBottom: 12 }}>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    style={{ padding: '10px 12px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    placeholder="Dienst naam"
                  />
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 30 })}
                    style={{ padding: '10px 12px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    placeholder="Min"
                  />
                  <input
                    type="text"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    style={{ padding: '10px 12px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    placeholder="€"
                  />
                </div>
                <button
                  onClick={addService}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6, padding: '10px 16px', color: '#f97316', fontSize: 14, cursor: 'pointer' }}
                >
                  <Plus size={16} /> Toevoegen
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Staff */}
          {currentStep === 3 && (
            <div>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Je team</h2>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>Wie werkt er bij je? (optioneel)</p>

              {staffMembers.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {staffMembers.map((staff, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0a0a0f', borderRadius: 8, marginBottom: 8 }}>
                      <div>
                        <span style={{ color: 'white', fontWeight: 500 }}>{staff.name}</span>
                        {staff.email && <span style={{ color: '#6b7280', marginLeft: 12, fontSize: 14 }}>{staff.email}</span>}
                      </div>
                      <button onClick={() => removeStaff(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: '#0a0a0f', borderRadius: 8, padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    style={{ padding: '10px 12px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    placeholder="Naam"
                  />
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    style={{ padding: '10px 12px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 6, color: 'white', fontSize: 14 }}
                    placeholder="E-mail (optioneel)"
                  />
                </div>
                <button
                  onClick={addStaff}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(249, 115, 22, 0.15)', border: 'none', borderRadius: 6, padding: '10px 16px', color: '#f97316', fontSize: 14, cursor: 'pointer' }}
                >
                  <Plus size={16} /> Toevoegen
                </button>
              </div>
            </div>
          )}

          {/* Step 4: AI Setup */}
          {currentStep === 4 && (
            <div>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>AI Receptionist</h2>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>Kies een stem en begroeting</p>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>Stem</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {voiceOptions.map(voice => (
                    <div
                      key={voice.id}
                      onClick={() => setAiConfig({ ...aiConfig, voice_id: voice.id })}
                      style={{
                        padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
                        background: aiConfig.voice_id === voice.id ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
                        border: aiConfig.voice_id === voice.id ? '2px solid #f97316' : '1px solid #2a2a35',
                      }}
                    >
                      <p style={{ color: aiConfig.voice_id === voice.id ? '#f97316' : 'white', fontWeight: 600, marginBottom: 4 }}>{voice.name}</p>
                      <p style={{ color: '#6b7280', fontSize: 12 }}>{voice.gender} • {voice.accent}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Begroeting</label>
                <textarea
                  value={aiConfig.greeting}
                  onChange={(e) => setAiConfig({ ...aiConfig, greeting: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 16, resize: 'vertical' }}
                />
              </div>

              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Sparkles size={24} style={{ color: '#22c55e' }} />
                <div>
                  <p style={{ color: '#22c55e', fontWeight: 600 }}>Klaar om te starten!</p>
                  <p style={{ color: '#9ca3af', fontSize: 14 }}>Je AI receptionist wordt direct na activatie geconfigureerd.</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #2a2a35' }}>
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer' }}
              >
                Vorige
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', background: canProceed() && !saving ? '#f97316' : '#6b7280',
                border: 'none', borderRadius: 8, color: 'white', fontSize: 14, fontWeight: 600,
                cursor: canProceed() && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Bezig...' : currentStep === 4 ? 'Afronden' : 'Volgende'}
              {!saving && currentStep < 4 && <ChevronRight size={18} />}
              {!saving && currentStep === 4 && <Check size={18} />}
            </button>
          </div>

          {/* Skip option */}
          {currentStep > 1 && currentStep < 4 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Overslaan, ik doe dit later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
