'use client';

import { ArrowLeft, Globe, Users, Code, Building2, Sparkles, CheckCircle } from 'lucide-react';

export default function OverOnsPage() {
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
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
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

      {/* Hero Section */}
      <section style={{ 
        padding: '100px 24px 80px', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.08) 0%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ 
            color: '#f97316', 
            fontSize: 14, 
            fontWeight: 600, 
            textTransform: 'uppercase', 
            letterSpacing: 2,
            marginBottom: 16 
          }}>
            Internationale Tech Groep
          </p>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, marginBottom: 24, lineHeight: 1.1 }}>
            Over <span style={{ color: '#f97316' }}>Vysion</span>
          </h1>
          <p style={{ 
            fontSize: 20, 
            color: '#9ca3af', 
            maxWidth: 700, 
            margin: '0 auto',
            lineHeight: 1.7 
          }}>
            Vysion is een internationale technologie groep die wereldwijd innovatieve software 
            oplossingen ontwikkelt voor bedrijven van elke omvang. VoxApp is een van onze 
            toonaangevende producten.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '140px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ 
          maxWidth: 1100, 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 40,
          textAlign: 'center'
        }}>
          <div>
            <p style={{ fontSize: 48, fontWeight: 700, color: '#f97316', marginBottom: 8 }}>2013</p>
            <p style={{ color: '#9ca3af', fontSize: 16 }}>Opgericht</p>
          </div>
          <div>
            <p style={{ fontSize: 48, fontWeight: 700, color: '#f97316', marginBottom: 8 }}>500K+</p>
            <p style={{ color: '#9ca3af', fontSize: 16 }}>Tevreden klanten</p>
          </div>
          <div>
            <p style={{ fontSize: 48, fontWeight: 700, color: '#f97316', marginBottom: 8 }}>20+</p>
            <p style={{ color: '#9ca3af', fontSize: 16 }}>Talen ondersteund</p>
          </div>
          <div>
            <p style={{ fontSize: 48, fontWeight: 700, color: '#f97316', marginBottom: 8 }}>24/7</p>
            <p style={{ color: '#9ca3af', fontSize: 16 }}>Wereldwijde support</p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section style={{ padding: '160px 24px', background: 'rgba(249, 115, 22, 0.03)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 60,
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20, color: '#f97316' }}>Vysion Group</h2>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: 20 }}>
                In 2013 richtte Rudi Aerden Vysion op met een duidelijke visie: technologie 
                toegankelijk maken voor elk bedrijf, ongeacht grootte of budget. Wat begon als 
                een klein softwarebedrijf in België is ondertussen uitgegroeid tot een bedrijf 
                dat maatwerk software ontwikkelt voor KMO&apos;s, zelfstandigen en overheden.
              </p>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: 20 }}>
                &ldquo;Ons doel is simpel: bedrijven helpen groeien door slimme technologie. 
                Met VoxApp brengen we die visie naar de telefoonlijn van elk bedrijf.&rdquo;
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                <a href="https://voxapp.tech" style={{ color: '#f97316', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>voxapp.tech</a>
                <a href="https://www.vysionhoreca.com" style={{ color: '#f97316', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>vysionhoreca.com</a>
                <a href="https://www.vysionapps.io" style={{ color: '#f97316', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>vysionapps.io</a>
              </div>
            </div>
            <div style={{ 
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src="/vysion-office.png" 
                alt="Vysion Office" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  minHeight: 380
                }} 
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding: '40px 24px 24px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Vysion HQ</p>
                <p style={{ fontSize: 14, opacity: 0.9 }}>
                  Siberiëstraat 24, 3900 Pelt, België
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section style={{ padding: '160px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
              Wat wij <span style={{ color: '#f97316' }}>doen</span>
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
              Vysion ontwikkelt innovatieve software oplossingen die bedrijven helpen 
              efficiënter te werken en sneller te groeien.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 32
            }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                background: 'rgba(249, 115, 22, 0.15)', 
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Sparkles size={28} color="#f97316" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>VoxApp</h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.7 }}>
                Onze slimme telefoniste voor KMO&apos;s. Beantwoordt oproepen 24/7, boekt afspraken 
                automatisch en verhoogt uw klanttevredenheid. Beschikbaar in Nederlands, Frans en Engels.
              </p>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 32
            }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                background: 'rgba(249, 115, 22, 0.15)', 
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Code size={28} color="#f97316" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Maatwerk Software</h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.7 }}>
                Heeft u een uniek idee of specifieke bedrijfsbehoeften? Ons team ontwikkelt 
                software volledig op maat, afgestemd op uw wensen en workflow.
              </p>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: 32
            }}>
              <div style={{ 
                width: 56, 
                height: 56, 
                background: 'rgba(249, 115, 22, 0.15)', 
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Globe size={28} color="#f97316" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Internationale Projecten</h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.7 }}>
                Met ondersteuning voor meer dan 20 talen en klanten wereldwijd, zijn wij uw 
                partner voor internationale software projecten en uitbreidingen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Software CTA */}
      <section style={{ 
        padding: '160px 24px', 
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.02) 100%)',
        borderTop: '1px solid rgba(249, 115, 22, 0.2)',
        borderBottom: '1px solid rgba(249, 115, 22, 0.2)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
            Software volledig <span style={{ color: '#f97316' }}>op maat</span>?
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: 700, margin: '0 auto 32px' }}>
            Heeft u een specifiek idee of behoefte die niet door standaard software wordt opgelost? 
            Ons ervaren team van ontwikkelaars bouwt software volledig op maat van uw bedrijf. 
            Van mobiele apps tot complexe bedrijfssystemen — wij maken het mogelijk.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 40,
            maxWidth: 700,
            margin: '0 auto 40px'
          }}>
            {[
              'Web applicaties',
              'Mobiele apps',
              'API integraties',
              'Bedrijfssoftware',
              'E-commerce platforms',
              'Automatisering'
            ].map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10,
                color: '#9ca3af',
                fontSize: 15
              }}>
                <CheckCircle size={18} color="#f97316" />
                {item}
              </div>
            ))}
          </div>

          <a 
            href="mailto:info@vysionhoreca.com?subject=Maatwerk%20Software%20Aanvraag"
            style={{ 
              display: 'inline-block',
              background: '#f97316',
              color: 'white',
              padding: '16px 32px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            Vraag een gratis gesprek aan
          </a>
        </div>
      </section>

      {/* Global Presence */}
      <section style={{ padding: '160px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>
            Wereldwijd <span style={{ color: '#f97316' }}>actief</span>
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 18, lineHeight: 1.7, marginBottom: 40 }}>
            Vanuit ons hoofdkantoor in België bedienen wij klanten over de hele wereld. 
            Onze software draait in meer dan 20 talen en wordt dagelijks gebruikt door 
            honderdduizenden gebruikers.
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 20
          }}>
            {['België', 'Nederland', 'Frankrijk', 'Duitsland', 'Spanje', 'Italië', 'UK', 'USA'].map((country, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '16px 12px',
                fontSize: 14,
                color: '#9ca3af'
              }}>
                {country}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ 
        padding: '140px 24px', 
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
            Neem <span style={{ color: '#f97316' }}>contact</span> op
          </h2>
          <p style={{ color: '#9ca3af', marginBottom: 32 }}>
            Heeft u vragen of wilt u meer weten over onze diensten?
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <p style={{ color: '#9ca3af' }}>
              <strong style={{ color: 'white' }}>E-mail:</strong>{' '}
              <a href="mailto:info@vysionhoreca.com" style={{ color: '#f97316', textDecoration: 'none' }}>
                info@vysionhoreca.com
              </a>
            </p>
            <p style={{ color: '#9ca3af' }}>
              <strong style={{ color: 'white' }}>Websites:</strong>{' '}
              <a href="https://voxapp.tech" style={{ color: '#f97316', textDecoration: 'none' }}>
                voxapp.tech
              </a>
              {' | '}
              <a href="https://www.vysionhoreca.com" style={{ color: '#f97316', textDecoration: 'none' }}>
                vysionhoreca.com
              </a>
              {' | '}
              <a href="https://www.vysionapps.io" style={{ color: '#f97316', textDecoration: 'none' }}>
                vysionapps.io
              </a>
            </p>
            <p style={{ color: '#9ca3af' }}>
              <strong style={{ color: 'white' }}>Adres:</strong>{' '}
              Siberiëstraat 24, 3900 Pelt, België
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '24px', 
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', fontSize: 13 }}>
          © 2026 Vysion. Alle rechten voorbehouden.
        </p>
      </footer>
    </div>
  );
}
