'use client';

import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div style={{ background: '#0a0710', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        background: 'rgba(10, 7, 16, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 24px',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            color: '#9ca3af', 
            textDecoration: 'none',
            fontSize: 14,
          }}>
            <ArrowLeft size={18} />
            Terug naar home
          </a>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          Privacy<span style={{ color: '#f97316' }}>beleid</span>
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 48 }}>Laatst bijgewerkt: februari 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>1. Inleiding</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              VoxApp, onderdeel van Vysion Horeca, respecteert uw privacy en zet zich in voor de bescherming van uw persoonsgegevens. 
              Dit privacybeleid legt uit hoe wij uw gegevens verzamelen, gebruiken en beschermen wanneer u onze diensten gebruikt.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>2. Welke gegevens verzamelen wij?</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: 16 }}>Wij verzamelen de volgende gegevens:</p>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li>Bedrijfsgegevens (naam, adres, telefoonnummer, e-mail)</li>
              <li>Accountgegevens (naam, e-mailadres, wachtwoord)</li>
              <li>Gespreksgegevens (transcripties van telefoongesprekken)</li>
              <li>Afspraakgegevens (datum, tijd, klantinformatie)</li>
              <li>Betalingsgegevens (via onze betalingspartner Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>3. Waarvoor gebruiken wij uw gegevens?</h2>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li>Het leveren en verbeteren van onze diensten</li>
              <li>Het verwerken van telefoongesprekken en afspraken</li>
              <li>Het versturen van SMS-bevestigingen naar uw klanten</li>
              <li>Facturatie en betalingsverwerking</li>
              <li>Klantenondersteuning</li>
              <li>Het naleven van wettelijke verplichtingen</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>4. Gegevensbeveiliging</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen ongeoorloofde toegang, 
              verlies of misbruik. Alle gegevens worden versleuteld opgeslagen en onze servers bevinden zich binnen de Europese Unie.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>5. Bewaartermijn</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Wij bewaren uw gegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld. 
              Gespreksopnames worden maximaal 90 dagen bewaard, tenzij u anders verzoekt.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>6. Uw rechten</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: 16 }}>Onder de GDPR heeft u de volgende rechten:</p>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li>Recht op inzage in uw gegevens</li>
              <li>Recht op rectificatie van onjuiste gegevens</li>
              <li>Recht op verwijdering van uw gegevens</li>
              <li>Recht op beperking van de verwerking</li>
              <li>Recht op overdraagbaarheid van gegevens</li>
              <li>Recht om bezwaar te maken tegen verwerking</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>7. Cookies</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Wij gebruiken cookies om onze website te laten functioneren en om uw ervaring te verbeteren. 
              U kunt uw cookievoorkeuren aanpassen via de cookiebanner op onze website.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>8. Contact</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Voor vragen over dit privacybeleid of om uw rechten uit te oefenen, kunt u contact opnemen via:<br /><br />
              <strong style={{ color: 'white' }}>E-mail:</strong> info@vysionhoreca.com<br />
              <strong style={{ color: 'white' }}>Website:</strong> voxapp.tech
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
