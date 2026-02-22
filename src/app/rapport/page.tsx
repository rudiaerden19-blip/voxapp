export default function RapportPage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#1a1a2e', color: '#eee', padding: 40, minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#16213e', padding: 40, borderRadius: 12 }}>
        <h1 style={{ color: '#f97316', marginBottom: 10 }}>VoxApp - Status Rapport</h1>
        <p style={{ color: '#888', fontSize: 14 }}>22 februari 2026</p>

        <h2 style={{ color: '#f97316', margin: '30px 0 15px', borderBottom: '2px solid #f97316', paddingBottom: 8 }}>Wat er gebouwd is</h2>
        
        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>1. Post-Call Webhook ✅</h3>
        <p><code style={{ background: '#0f0f23', padding: '2px 8px', borderRadius: 4 }}>/src/app/api/webhooks/elevenlabs/route.ts</code></p>
        <ul style={{ paddingLeft: 25 }}>
          <li>Ontvangt gesprekken van ElevenLabs na afloop</li>
          <li>Maakt automatisch orders aan voor horeca</li>
          <li>Logt alle gesprekken</li>
        </ul>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>2. Keuken Scherm ✅</h3>
        <p><code style={{ background: '#0f0f23', padding: '2px 8px', borderRadius: 4 }}>/src/app/dashboard/keuken/page.tsx</code></p>
        <ul style={{ paddingLeft: 25 }}>
          <li>Toont bestellingen realtime</li>
          <li>Auto-refresh elke 5 seconden</li>
          <li>Klaar-knop per bestelling</li>
        </ul>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>3. Module Toggles ✅</h3>
        <p>Sidebar met aan/uit sliders per module</p>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>4. Voice Preservation ✅</h3>
        <p>Stem-instellingen worden niet meer overschreven</p>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>5. Test Endpoint ✅</h3>
        <p><code style={{ background: '#0f0f23', padding: '2px 8px', borderRadius: 4 }}>https://voxapp.io/api/test/webhook</code></p>

        <h2 style={{ color: '#f97316', margin: '30px 0 15px', borderBottom: '2px solid #f97316', paddingBottom: 8 }}>NOG TE DOEN</h2>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>1. ElevenLabs Webhook ❌</h3>
        <ol style={{ paddingLeft: 25 }}>
          <li>Ga naar ElevenLabs → ElevenAgents → Settings</li>
          <li>Post-Call Webhook configureren</li>
          <li>URL: <code style={{ background: '#0f0f23', padding: '2px 8px', borderRadius: 4 }}>https://voxapp.io/api/webhooks/elevenlabs</code></li>
        </ol>

        <div style={{ background: '#fef3c7', color: '#000', padding: 15, borderRadius: 8, margin: '15px 0', wordBreak: 'break-all' }}>
          <strong>Webhook Secret:</strong><br/>
          wsec_c3ccdc7fbd8f39a8fca6cc27257d2e61f33f8756808e366076e60e4392dcb8a6
        </div>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>2. Business Type ❌</h3>
        <p>Frituur Nolim → Instellingen → Type wijzigen naar &quot;Frituur&quot;</p>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>3. Menu Invullen ❌</h3>
        <p>Dashboard → Menu → Producten toevoegen</p>

        <h3 style={{ color: '#fff', margin: '20px 0 10px' }}>4. Vlaamse Stem ❌</h3>
        <p>In ElevenLabs: selecteer Vlaamse stem</p>

        <h2 style={{ color: '#f97316', margin: '30px 0 15px', borderBottom: '2px solid #f97316', paddingBottom: 8 }}>Test Instructies</h2>
        <ol style={{ paddingLeft: 25 }}>
          <li>Ga naar: <code style={{ background: '#0f0f23', padding: '2px 8px', borderRadius: 4 }}>https://voxapp.io/api/test/webhook</code></li>
          <li>Check Dashboard → Keuken → test order moet verschijnen</li>
          <li>Als dat werkt: bel en test echte bestelling</li>
        </ol>

        <h2 style={{ color: '#f97316', margin: '30px 0 15px', borderBottom: '2px solid #f97316', paddingBottom: 8 }}>Belangrijke Bestanden</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #333', padding: 10, background: '#f97316', color: '#000', textAlign: 'left' }}>Bestand</th>
              <th style={{ border: '1px solid #333', padding: 10, background: '#f97316', color: '#000', textAlign: 'left' }}>Functie</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ border: '1px solid #333', padding: 10 }}>api/webhooks/elevenlabs/route.ts</td><td style={{ border: '1px solid #333', padding: 10 }}>Webhook ontvanger</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: 10 }}>api/elevenlabs/agent/route.ts</td><td style={{ border: '1px solid #333', padding: 10 }}>Agent configuratie</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: 10 }}>dashboard/keuken/page.tsx</td><td style={{ border: '1px solid #333', padding: 10 }}>Keuken scherm</td></tr>
            <tr><td style={{ border: '1px solid #333', padding: 10 }}>dashboard/producten/page.tsx</td><td style={{ border: '1px solid #333', padding: 10 }}>Menu beheer</td></tr>
          </tbody>
        </table>

        <p style={{ marginTop: 40, color: '#666', textAlign: 'center' }}>
          VoxApp © 2026 - github.com/rudiaerden19-blip/voxapp
        </p>
      </div>
    </div>
  );
}
