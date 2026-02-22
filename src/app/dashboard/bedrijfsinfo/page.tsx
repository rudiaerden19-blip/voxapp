'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, Clock, Euro, MapPin, Phone, Mail, Globe, Wrench, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface BusinessInfo {
  id?: string;
  business_id: string;
  // Contact
  address: string;
  phone: string;
  email: string;
  website: string;
  // Openingstijden
  opening_hours: {
    maandag: string;
    dinsdag: string;
    woensdag: string;
    donderdag: string;
    vrijdag: string;
    zaterdag: string;
    zondag: string;
  };
  // Prijzen (vrije tekst per regel)
  price_list: string;
  // Services
  services: string;
  // Extra info
  extra_info: string;
}

const DEFAULT_HOURS = {
  maandag: '08:00 - 18:00',
  dinsdag: '08:00 - 18:00',
  woensdag: '08:00 - 18:00',
  donderdag: '08:00 - 18:00',
  vrijdag: '08:00 - 18:00',
  zaterdag: 'Gesloten',
  zondag: 'Gesloten',
};

export default function BedrijfsInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string>('');
  
  const [info, setInfo] = useState<BusinessInfo>({
    business_id: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    opening_hours: DEFAULT_HOURS,
    price_list: '',
    services: '',
    extra_info: '',
  });

  useEffect(() => {
    loadBusinessInfo();
  }, []);

  async function loadBusinessInfo() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, type, address, phone, email, opening_hours')
      .eq('user_id', user.id)
      .single();

    if (business) {
      setBusinessId(business.id);
      setBusinessType(business.type || '');
      
      // Load existing info from business_info table
      const { data: existingInfo } = await supabase
        .from('business_info' as never)
        .select('*')
        .eq('business_id', business.id)
        .single();

      if (existingInfo && typeof existingInfo === 'object') {
        const infoData = existingInfo as BusinessInfo;
        setInfo({
          ...infoData,
          opening_hours: infoData.opening_hours || DEFAULT_HOURS,
        });
      } else {
        // Use business data as fallback
        const hours = typeof business.opening_hours === 'object' && business.opening_hours 
          ? business.opening_hours as typeof DEFAULT_HOURS
          : DEFAULT_HOURS;
        setInfo(prev => ({
          ...prev,
          business_id: business.id,
          address: business.address || '',
          phone: business.phone || '',
          email: business.email || '',
          website: '',
          opening_hours: hours,
        }));
      }
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!businessId) return;
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    
    const dataToSave = {
      ...info,
      business_id: businessId,
      updated_at: new Date().toISOString(),
    };

    // Upsert to business_info table
    const { error } = await supabase
      .from('business_info' as never)
      .upsert(dataToSave as never, { onConflict: 'business_id' });

    if (error) {
      console.error('Save error:', error);
      alert('Fout bij opslaan: ' + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function updateHours(day: string, value: string) {
    setInfo(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: value,
      },
    }));
  }

  const pricePlaceholder = businessType === 'garage' 
    ? `APK keuring: €45
Grote beurt: €189
Kleine beurt: €99
Airco service: €79
Banden wisselen: €40
Diagnose: €35
Uurtarief: €65`
    : businessType === 'kapsalon'
    ? `Knippen dames: €35
Knippen heren: €22
Knippen kinderen: €18
Verven: €55
Highlights: €75`
    : businessType === 'frituur'
    ? `Grote friet: €3.50
Kleine friet: €2.50
Frikandel: €2.00
Bicky Burger: €4.50`
    : `Dienst 1: €...
Dienst 2: €...
Dienst 3: €...`;

  const servicesPlaceholder = businessType === 'garage'
    ? `✓ Leenauto beschikbaar
✓ Haal- en brengservice
✓ Gratis prijsofferte
✓ Garantie: 12 maanden
✓ Alle merken welkom`
    : businessType === 'kapsalon'
    ? `✓ Zonder afspraak welkom
✓ Gratis koffie/thee
✓ Producten te koop
✓ Bruidskapsel op afspraak`
    : businessType === 'frituur'
    ? `✓ Levering aan huis
✓ Online bestellen
✓ Verse producten
✓ Glutenvrije opties`
    : `✓ Service 1
✓ Service 2
✓ Service 3`;

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0 }}>Bedrijfsinformatie</h1>
          <p style={{ color: '#6b7280', fontSize: 15, marginTop: 8 }}>
            Deze informatie gebruikt de AI receptionist om vragen te beantwoorden
          </p>
        </div>

        {/* Contact Info */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #334155' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={20} style={{ color: '#f97316' }} /> Contact & Locatie
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />Adres
              </label>
              <input
                type="text"
                value={info.address}
                onChange={(e) => setInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Straat 123, 1234 AB Stad"
                style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>
                <Phone size={14} style={{ display: 'inline', marginRight: 6 }} />Telefoon
              </label>
              <input
                type="text"
                value={info.phone}
                onChange={(e) => setInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+32 11 12 34 56"
                style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>
                <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />Email
              </label>
              <input
                type="email"
                value={info.email}
                onChange={(e) => setInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@uwbedrijf.be"
                style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>
                <Globe size={14} style={{ display: 'inline', marginRight: 6 }} />Website
              </label>
              <input
                type="text"
                value={info.website}
                onChange={(e) => setInfo(prev => ({ ...prev, website: e.target.value }))}
                placeholder="www.uwbedrijf.be"
                style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        {/* Openingstijden */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #334155' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={20} style={{ color: '#f97316' }} /> Openingstijden
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {Object.entries(info.opening_hours).map(([day, hours]) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#9ca3af', fontSize: 14, width: 90, textTransform: 'capitalize' }}>{day}</span>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => updateHours(day, e.target.value)}
                  placeholder="08:00 - 18:00"
                  style={{ flex: 1, padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prijzen */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #334155' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Euro size={20} style={{ color: '#f97316' }} /> Prijslijst
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>Eén dienst/prijs per regel</p>
          
          <textarea
            value={info.price_list}
            onChange={(e) => setInfo(prev => ({ ...prev, price_list: e.target.value }))}
            placeholder={pricePlaceholder}
            rows={8}
            style={{ width: '100%', padding: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Services */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #334155' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wrench size={20} style={{ color: '#f97316' }} /> Services & Extra's
          </h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>Wat biedt u aan? (leenauto, garantie, etc.)</p>
          
          <textarea
            value={info.services}
            onChange={(e) => setInfo(prev => ({ ...prev, services: e.target.value }))}
            placeholder={servicesPlaceholder}
            rows={5}
            style={{ width: '100%', padding: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Extra info */}
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #334155' }}>
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Extra informatie</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 16px' }}>Andere belangrijke info voor de AI (specialisaties, parkeren, etc.)</p>
          
          <textarea
            value={info.extra_info}
            onChange={(e) => setInfo(prev => ({ ...prev, extra_info: e.target.value }))}
            placeholder="Bijv: Gespecialiseerd in Volkswagen en Audi. Gratis parkeren voor de deur. Koffie in de wachtruimte."
            rows={4}
            style={{ width: '100%', padding: '14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: saved ? '#22c55e' : '#f97316',
            border: 'none',
            borderRadius: 12,
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {saved ? (
            <><Check size={20} /> Opgeslagen!</>
          ) : saving ? (
            'Opslaan...'
          ) : (
            <><Save size={20} /> Opslaan</>
          )}
        </button>

        <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
          De AI receptionist gebruikt deze informatie automatisch bij het beantwoorden van vragen.
        </p>
      </div>
    </DashboardLayout>
  );
}
