'use client';

import { useState } from 'react';
import {
  Phone,
  Calendar,
  MessageSquare,
  Clock,
  Users,
  Settings,
  Check,
  ArrowRight,
  Menu,
  X,
  Mic,
  Bell,
  Send,
  Headphones,
  ChevronRight,
  PhoneCall,
  CalendarCheck,
  UserCheck,
  FileText,
  Heart,
  RefreshCw,
} from 'lucide-react';

/* ============================================
   NAVIGATION
============================================ */
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(15, 10, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 700, color: 'white', textDecoration: 'none' }}>
              <span style={{ color: '#f97316' }}>Vox</span>App
            </a>

            <div style={{ display: 'none', alignItems: 'center', gap: 32 }} className="desktop-nav">
              <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>Functies</a>
              <a href="#how-it-works" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>Hoe het werkt</a>
              <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>Prijzen</a>
            </div>

            <div style={{ display: 'none', alignItems: 'center', gap: 16 }} className="desktop-nav">
              <a href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>Inloggen</a>
              <a href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f97316',
                color: 'white',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Gratis proberen
              </a>
            </div>

            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'flex', padding: 8, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{
          position: 'fixed',
          top: 72,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0f0a14',
          zIndex: 99,
          padding: 24,
        }}>
          <a href="#features" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Functies</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Hoe het werkt</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Prijzen</a>
          <div style={{ marginTop: 24 }}>
            <a href="/register" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#f97316',
              color: 'white',
              padding: '14px 24px',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              Gratis proberen <ArrowRight size={18} />
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}

/* ============================================
   HERO SECTION - Intavia Style
============================================ */
function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(180deg, #0f0a14 0%, #1a1025 100%)',
      paddingTop: 120,
      paddingBottom: 80,
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <Phone size={16} style={{ color: '#f97316' }} />
          <span style={{ color: '#9ca3af', fontSize: 14 }}>Slimme Receptionist voor Groeiende Bedrijven</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60, alignItems: 'center' }}>
          {/* Left content */}
          <div style={{ maxWidth: 600 }}>
            <h1 style={{ 
              fontSize: 'clamp(36px, 5vw, 52px)', 
              fontWeight: 700, 
              lineHeight: 1.15, 
              color: 'white',
              marginBottom: 24,
            }}>
              Mis nooit een oproep.<br />
              Boek meer afspraken.<br />
              <span style={{ color: '#f97316' }}>Bespaar tijd.</span>
            </h1>

            <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.7, marginBottom: 32 }}>
              VoxApp beheert uw oproepen, boekt afspraken en beantwoordt vragen — zodat u kunt focussen op uw werk.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
              <a href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f97316',
                color: 'white',
                padding: '16px 28px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                <Calendar size={18} />
                Start gratis proefperiode
              </a>
              <a href="#demo" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: 'white',
                padding: '16px 28px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <PhoneCall size={18} />
                Bel Demo Receptionist
              </a>
            </div>
          </div>
        </div>

        {/* Hero Image with Floating Elements */}
        <div style={{ position: 'relative', marginTop: 40 }}>
          <div style={{ 
            position: 'relative',
            maxWidth: 900,
            margin: '0 auto',
          }}>
            {/* Main Image */}
            <div style={{
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
              maxWidth: 600,
              margin: '0 auto',
            }}>
              <img 
                src="/hero-receptionist.png"
                alt="Professionele receptionist"
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>

            {/* Floating Chat Bubble - Top Right */}
            <div style={{
              position: 'absolute',
              top: 40,
              right: -20,
              background: 'white',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              maxWidth: 280,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>VoxApp Receptionist</span>
              </div>
              <p style={{ fontSize: 14, color: '#1a1a2e', margin: 0 }}>
                &quot;Goedemiddag, Kapsalon Belle. Waarmee kan ik u helpen?&quot;
              </p>
            </div>

            {/* Action Badges - Right Side */}
            <div style={{ position: 'absolute', top: 160, right: -30, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Check, text: 'Receptionist Beantwoordt', color: '#22c55e' },
                { icon: CalendarCheck, text: 'Afspraak Ingepland', color: '#f97316' },
                { icon: Send, text: 'Bevestiging Verstuurd', color: '#3b82f6' },
              ].map((badge, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'white',
                  borderRadius: 8,
                  padding: '10px 16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}>
                  <badge.icon size={16} style={{ color: badge.color }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>{badge.text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURE SECTION 1 - Inbound Calls
============================================ */
function InboundSection() {
  return (
    <section id="features" style={{ background: '#ffffff', padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Inkomende Oproepen
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              Lever de snelle, persoonlijke antwoorden die klanten verwachten.
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              Elke oproep wordt snel en natuurlijk beantwoord. Klanten krijgen direct antwoord, 
              makkelijke boekingen, en een vriendelijke ervaring die past bij uw merk.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <a href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f97316',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                <Calendar size={16} />
                Start gratis
              </a>
              <a href="#demo" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: '#1a1a2e',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #e5e7eb',
              }}>
                <PhoneCall size={16} />
                Bel Demo Receptionist
              </a>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: MessageSquare, text: 'Beantwoord klantvragen' },
                { icon: Calendar, text: 'Beheer afspraakwijzigingen' },
                { icon: PhoneCall, text: 'Route prioriteitsoproepen' },
                { icon: Users, text: 'Vang nieuwe leads' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <item.icon size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: 15, color: '#1a1a2e' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <img 
                src="/garage.png"
                alt="Garage werkplaats"
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURE SECTION 2 - Outbound Calls
============================================ */
function OutboundSection() {
  return (
    <section style={{ background: '#fafafa', padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Professional Calendar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'white',
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}>
              {/* Calendar header */}
              <div style={{ background: '#f97316', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>Februari 2026</p>
                  <p style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Week Overzicht</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>Dag</button>
                  <button style={{ background: 'white', border: 'none', color: '#f97316', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Week</button>
                </div>
              </div>

              {/* Days header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
                {['Ma 10', 'Di 11', 'Wo 12', 'Do 13', 'Vr 14'].map((day, i) => (
                  <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 4 ? '1px solid #e5e7eb' : 'none' }}>
                    <span style={{ fontSize: 12, color: i === 1 ? '#f97316' : '#6b7280', fontWeight: i === 1 ? 600 : 400 }}>{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar body */}
              <div style={{ padding: 16 }}>
                {/* Time slots */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* 09:00 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', width: 40 }}>09:00</span>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      <div style={{ background: '#fef3c7', borderLeft: '3px solid #f59e0b', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>Knippen</p>
                        <p style={{ fontSize: 10, color: '#a16207' }}>Marie V.</p>
                      </div>
                      <div></div>
                      <div style={{ background: '#dbeafe', borderLeft: '3px solid #3b82f6', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#1e40af' }}>Consult</p>
                        <p style={{ fontSize: 10, color: '#1d4ed8' }}>Peter J.</p>
                      </div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>

                  {/* 10:00 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', width: 40 }}>10:00</span>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      <div></div>
                      <div style={{ background: '#ffedd5', borderLeft: '3px solid #f97316', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#9a3412' }}>Kleuren</p>
                        <p style={{ fontSize: 10, color: '#c2410c' }}>Lisa G.</p>
                      </div>
                      <div></div>
                      <div style={{ background: '#dcfce7', borderLeft: '3px solid #22c55e', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>Knippen</p>
                        <p style={{ fontSize: 10, color: '#15803d' }}>Jan P.</p>
                      </div>
                      <div style={{ background: '#fef3c7', borderLeft: '3px solid #f59e0b', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>Baard</p>
                        <p style={{ fontSize: 10, color: '#a16207' }}>Tom H.</p>
                      </div>
                    </div>
                  </div>

                  {/* 11:00 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', width: 40 }}>11:00</span>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      <div style={{ background: '#dcfce7', borderLeft: '3px solid #22c55e', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>Föhnen</p>
                        <p style={{ fontSize: 10, color: '#15803d' }}>Emma S.</p>
                      </div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div style={{ background: '#dbeafe', borderLeft: '3px solid #3b82f6', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#1e40af' }}>Knippen</p>
                        <p style={{ fontSize: 10, color: '#1d4ed8' }}>Anna K.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New booking indicator */}
                <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>Nieuwe boeking via VoxApp</p>
                    <p style={{ fontSize: 11, color: '#15803d' }}>Sarah M. - Knippen & Kleuren - Di 11 feb, 14:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Uitgaande Oproepen
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              Verhoog boekingen en houd uw agenda vol.
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              Uitgaande oproepen vullen uw agenda. Klanten ontvangen herinneringen, 
              follow-ups en herboeking-verzoeken — allemaal natuurlijk en in lijn met uw merk.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <a href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f97316',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                <Calendar size={16} />
                Start gratis
              </a>
              <a href="#demo" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: '#1a1a2e',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #e5e7eb',
              }}>
                <PhoneCall size={16} />
                Bel Demo Receptionist
              </a>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: Users, text: 'Doordachte lead follow-ups' },
                { icon: Calendar, text: 'Terugkerende afspraken plannen' },
                { icon: Heart, text: 'Nazorg check-ins' },
                { icon: Bell, text: 'Vriendelijke herboeking-herinneringen' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <item.icon size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: 15, color: '#1a1a2e' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURE SECTION 3 - Automation
============================================ */
function AutomationSection() {
  return (
    <section style={{ background: '#ffffff', padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Geautomatiseerde Taken
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              Laat administratie stilletjes op de achtergrond draaien.
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              Routine boekingen, wijzigingen en follow-ups draaien automatisch — 
              zodat uw team gefocust kan blijven op wat echt belangrijk is.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <a href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#f97316',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                <Calendar size={16} />
                Start gratis
              </a>
              <a href="#demo" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: '#1a1a2e',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #e5e7eb',
              }}>
                <PhoneCall size={16} />
                Bel Demo Receptionist
              </a>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: Send, text: 'Verstuur boekingslinks automatisch' },
                { icon: RefreshCw, text: 'Beheer afspraakwijzigingen' },
                { icon: PhoneCall, text: 'Route prioriteitsoproepen' },
                { icon: UserCheck, text: 'Vang en koester nieuwe leads' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <item.icon size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: 15, color: '#1a1a2e' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=700&fit=crop"
                alt="Beauty salon professional"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   HOW IT WORKS
============================================ */
function HowItWorksSection() {
  const steps = [
    { num: '01', icon: Users, title: 'Account aanmaken', desc: 'Registreer in 2 minuten. Kies uw sector en vul bedrijfsgegevens in.' },
    { num: '02', icon: Settings, title: 'Diensten & medewerkers', desc: 'Voeg diensten toe met prijzen. Configureer werkuren per medewerker.' },
    { num: '03', icon: Mic, title: 'Stem kiezen', desc: 'Kies een standaard stem of kloon uw eigen stem in 5 minuten.' },
    { num: '04', icon: Phone, title: 'Ga live', desc: 'Koppel uw nummer en uw receptionist is actief. Klaar!' },
  ];

  return (
    <section id="how-it-works" style={{ background: '#0f0a14', padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            HOE HET WERKT
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            Live in <span style={{ color: '#f97316' }}>10 minuten</span>
          </h2>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 500, margin: '0 auto' }}>
            Geen technische kennis nodig. Onze wizard begeleidt u door elke stap.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {steps.map((step) => (
            <div key={step.num} style={{
              background: '#1a1025',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 32,
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', top: 24, right: 24, fontSize: 48, fontWeight: 700, color: 'rgba(255,255,255,0.05)' }}>{step.num}</span>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'rgba(249, 115, 22, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <step.icon size={24} style={{ color: '#f97316' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a href="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#f97316',
            color: 'white',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Start nu - eerste maand gratis <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PRICING SECTION
============================================ */
function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '99',
      desc: 'Perfect voor zelfstandigen.',
      minutes: '300',
      extra: '0,40',
      features: ['Receptionist 24/7', 'Ingebouwde agenda', '1 medewerker', 'SMS bevestigingen', 'Gesprekstranscripties', 'Email support'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '149',
      desc: 'Voor groeiende teams.',
      minutes: '750',
      extra: '0,35',
      features: ['Alles van Starter, plus:', '5 medewerkers', 'Voice cloning', 'Uitgaande herinneringen', 'Online booking pagina', 'Priority support'],
      popular: true,
    },
    {
      name: 'Business',
      price: '249',
      desc: 'Voor grotere bedrijven.',
      minutes: '1500',
      extra: '0,30',
      features: ['Alles van Pro, plus:', 'Onbeperkt medewerkers', 'Meerdere locaties', 'API toegang', 'Custom integraties', 'Account manager'],
      popular: false,
    },
  ];

  return (
    <section id="pricing" style={{ background: '#0f0a14', padding: '100px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            PRIJZEN
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            Simpele, <span style={{ color: '#f97316' }}>transparante prijzen</span>
          </h2>
          <p style={{ fontSize: 18, color: '#9ca3af' }}>
            Alles inbegrepen. Geen verrassingen.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: '#1a1025',
              border: plan.popular ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '40px 32px',
              position: 'relative',
            }}>
              {plan.popular && (
                <span style={{
                  position: 'absolute',
                  top: -12,
                  right: 24,
                  background: '#f97316',
                  color: 'white',
                  padding: '4px 16px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}>Populair</span>
              )}

              <h3 style={{ fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 8 }}>{plan.name}</h3>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>{plan.desc}</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 18, color: '#9ca3af' }}>€</span>
                <span style={{ fontSize: 48, fontWeight: 700, color: '#f97316' }}>{plan.price}</span>
                <span style={{ fontSize: 16, color: '#9ca3af' }}>/maand</span>
              </div>

              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                {plan.minutes} min incl. • €{plan.extra}/extra min
              </p>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', fontSize: 14, color: '#d1d5db' }}>
                    <Check size={16} style={{ color: '#f97316' }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <a href="/register" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: plan.popular ? '#f97316' : 'transparent',
                color: 'white',
                padding: '14px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
              }}>
                Kies {plan.name}
              </a>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 12 }}>
                Maandelijks opzegbaar
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FAQ SECTION
============================================ */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'Hoe snel kan ik starten?', a: 'Binnen 10 minuten. Onze setup wizard begeleidt u stap voor stap.' },
    { q: 'Kan ik mijn bestaande nummer behouden?', a: 'Ja! U kunt uw bestaande nummer doorschakelen naar VoxApp.' },
    { q: 'Hoe werkt de voice cloning?', a: 'U leest 5 minuten een tekst in. VoxApp klinkt daarna precies als u.' },
    { q: 'Welke talen worden ondersteund?', a: 'Nederlands, Frans en Duits. Automatische taalherkenning.' },
    { q: 'Is er een contract?', a: 'Nee. Maandelijks opzegbaar, eerste maand gratis.' },
  ];

  return (
    <section style={{ background: '#1a1025', padding: '100px 0' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'white' }}>
            Veelgestelde <span style={{ color: '#f97316' }}>vragen</span>
          </h2>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 600, color: 'white' }}>{faq.q}</span>
                <ChevronRight size={20} style={{ color: '#f97316', transform: openIndex === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
              {openIndex === i && (
                <p style={{ paddingBottom: 24, color: '#9ca3af', lineHeight: 1.7 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CTA SECTION
============================================ */
function CTASection() {
  return (
    <section style={{ background: '#0f0a14', padding: '100px 0' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 20 }}>
          Klaar om nooit meer een <span style={{ color: '#f97316' }}>oproep te missen?</span>
        </h2>
        <p style={{ fontSize: 18, color: '#9ca3af', marginBottom: 40 }}>
          Start vandaag nog. Eerste maand gratis, geen contract.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <a href="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#f97316',
            color: 'white',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Start gratis proefperiode <ArrowRight size={18} />
          </a>
          <a href="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            color: 'white',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <Headphones size={18} />
            Praat met ons team
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER
============================================ */
function Footer() {
  return (
    <footer style={{ background: '#0a0710', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '60px 0 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 700, color: 'white', textDecoration: 'none', marginBottom: 16 }}>
              <span style={{ color: '#f97316' }}>Vox</span>App
            </a>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginTop: 16 }}>
              De slimme receptionist voor elke KMO.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: 16 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Functies</a>
              <a href="#pricing" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Prijzen</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: 16 }}>Bedrijf</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Over ons</a>
              <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Contact</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: 16 }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Help Center</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>FAQ</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#6b7280' }}>© 2026 VoxApp. Alle rechten voorbehouden.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>Privacy</a>
            <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>Voorwaarden</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================
   MAIN PAGE
============================================ */
export default function Home() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      <InboundSection />
      <OutboundSection />
      <AutomationSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
