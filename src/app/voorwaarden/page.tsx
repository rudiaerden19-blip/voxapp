'use client';

import { ArrowLeft } from 'lucide-react';

export default function VoorwaardenPage() {
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
          Algemene <span style={{ color: '#f97316' }}>Voorwaarden</span>
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 48 }}>Laatst bijgewerkt: februari 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>1. Definities</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              <strong style={{ color: 'white' }}>VoxApp:</strong> De dienst aangeboden door Vysion Horeca, gevestigd in België.<br />
              <strong style={{ color: 'white' }}>Klant:</strong> De natuurlijke of rechtspersoon die gebruik maakt van de diensten van VoxApp.<br />
              <strong style={{ color: 'white' }}>Diensten:</strong> De slimme receptionist en gerelateerde functionaliteiten aangeboden door VoxApp.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>2. Toepasselijkheid</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Deze algemene voorwaarden zijn van toepassing op alle overeenkomsten tussen VoxApp en de Klant. 
              Door gebruik te maken van onze diensten, gaat u akkoord met deze voorwaarden.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>3. Dienstverlening</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              VoxApp biedt een slimme telefonische receptionist die telefoongesprekken beantwoordt, afspraken inboekt 
              en veelgestelde vragen beantwoordt namens de Klant. Wij streven naar een uptime van 99.9%.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>4. Abonnementen en Prijzen</h2>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li><strong style={{ color: 'white' }}>Starter:</strong> €99/maand - 300 minuten inbegrepen</li>
              <li><strong style={{ color: 'white' }}>Pro:</strong> €149/maand - 750 minuten inbegrepen</li>
              <li><strong style={{ color: 'white' }}>Business:</strong> €249/maand - 1500 minuten inbegrepen</li>
            </ul>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, marginTop: 16 }}>
              De eerste 7 dagen zijn gratis. Daarna wordt het abonnement maandelijks gefactureerd. 
              Extra minuten worden aan het einde van de maand in rekening gebracht.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>5. Betaling</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Betaling geschiedt via automatische incasso of creditcard via onze betalingspartner Stripe. 
              Facturen worden maandelijks verstuurd. Bij niet-tijdige betaling behouden wij ons het recht voor 
              de dienstverlening op te schorten.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>6. Opzegging</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              U kunt uw abonnement op elk moment opzeggen via uw dashboard. De opzegging gaat in aan het einde 
              van de lopende facturatieperiode. Er is geen opzegtermijn en geen contractuele binding.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>7. Aansprakelijkheid</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              VoxApp is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst. 
              Onze totale aansprakelijkheid is beperkt tot het bedrag dat de Klant in de afgelopen 
              12 maanden aan VoxApp heeft betaald.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>8. Intellectueel Eigendom</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Alle intellectuele eigendomsrechten op de software, technologie en content van VoxApp 
              blijven eigendom van Vysion Horeca. De Klant krijgt een beperkt gebruiksrecht voor de duur van het abonnement.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>9. Wijzigingen</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              VoxApp behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen worden minimaal 
              30 dagen van tevoren aangekondigd via e-mail of via het dashboard.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>10. Toepasselijk Recht</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Op deze voorwaarden is Belgisch recht van toepassing. Geschillen worden voorgelegd aan 
              de bevoegde rechtbank in België.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>11. Contact</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              Voor vragen over deze voorwaarden kunt u contact opnemen via:<br /><br />
              <strong style={{ color: 'white' }}>E-mail:</strong> info@vysionhoreca.com<br />
              <strong style={{ color: 'white' }}>Website:</strong> voxapp.tech
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
