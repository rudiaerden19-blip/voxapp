'use client';

import { useState } from 'react';
import {
  Phone,
  Calendar,
  MessageSquare,
  Clock,
  Users,
  BarChart3,
  Settings,
  Check,
  ArrowRight,
  Menu,
  X,
  Mic,
  Bell,
  Shield,
  Globe,
  Headphones,
  ChevronRight,
  Zap,
  FileText,
} from 'lucide-react';

/* ============================================
   NAVIGATION
============================================ */
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="nav">
        <div className="container nav-container">
          <a href="/" className="nav-logo">
            <span>Vox</span>App
          </a>

          <div className="nav-links">
            <a href="#features">Functies</a>
            <a href="#how-it-works">Hoe het werkt</a>
            <a href="#pricing">Prijzen</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="nav-cta">
            <a href="/login">Inloggen</a>
            <a href="/register" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
              Gratis proberen <ArrowRight size={16} />
            </a>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <a href="#features" onClick={() => setMobileOpen(false)}>Functies</a>
        <a href="#how-it-works" onClick={() => setMobileOpen(false)}>Hoe het werkt</a>
        <a href="#pricing" onClick={() => setMobileOpen(false)}>Prijzen</a>
        <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
        <a href="/login" onClick={() => setMobileOpen(false)}>Inloggen</a>
        <div style={{ paddingTop: 24 }}>
          <a href="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Gratis proberen <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </>
  );
}

/* ============================================
   HERO SECTION
============================================ */
function HeroSection() {
  return (
    <section className="section-dark" style={{ paddingTop: 140, paddingBottom: 80 }}>
      <div className="container">
        {/* Trust bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', marginBottom: 60 }}>
          {[
            'AI RECEPTIONIST',
            'INGEBOUWDE AGENDA',
            'VOICE CLONING',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={18} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px' }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 60, alignItems: 'center' }}>
          {/* Text content */}
          <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, marginBottom: 24, lineHeight: 1.1 }}>
              De AI-receptionist die{' '}
              <span style={{ color: '#f97316' }}>afspraken boekt.</span>
            </h1>

            <p style={{ fontSize: 18, color: '#9ca3af', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
              Mis nooit meer een oproep. VoxApp neemt de telefoon op, boekt afspraken 
              in uw agenda, en beantwoordt vragen. 24/7. Met uw eigen stem.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
              <a href="/register" className="btn-primary">
                Start gratis proefperiode <ArrowRight size={18} />
              </a>
              <a href="#demo" className="btn-secondary">
                Bekijk demo
              </a>
            </div>

            {/* Mini trust */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32, fontSize: 14, color: '#6b7280' }}>
              <span>✓ Geen contract</span>
              <span>✓ Eerste maand gratis</span>
              <span>✓ Setup in 10 minuten</span>
            </div>
          </div>
        </div>

        {/* Dashboard preview */}
        <div style={{ marginTop: 80 }}>
          <div style={{ 
            background: '#16161f', 
            border: '1px solid #2a2a35', 
            borderRadius: 20, 
            padding: 32,
            maxWidth: 900,
            margin: '0 auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: 14 }}>Welkom terug</p>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>Kapsalon Belle</h3>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                KB
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { icon: Phone, label: 'Vandaag', value: '24', sub: 'oproepen' },
                { icon: Calendar, label: 'Geboekt', value: '18', sub: 'afspraken' },
                { icon: Clock, label: 'Gespaard', value: '2.4u', sub: 'per dag' },
              ].map((stat) => (
                <div key={stat.label} style={{ background: '#1e1e28', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <stat.icon size={16} style={{ color: '#f97316' }} />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{stat.label}</span>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</p>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Recent calls */}
            <div>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Recente gesprekken</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Marie Van den Berg', action: 'Afspraak geboekt - Knippen & Kleuren', time: '2 min' },
                  { name: 'Peter Janssen', action: 'Vraag beantwoord - Openingsuren', time: '8 min' },
                  { name: 'Lisa de Groot', action: 'Afspraak verzet naar morgen 14:00', time: '15 min' },
                ].map((call, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#1e1e28', borderRadius: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={18} style={{ color: '#22c55e' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{call.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>{call.action}</p>
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{call.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   STATS SECTION
============================================ */
function StatsSection() {
  const stats = [
    { value: '6.6M+', label: 'Potentiële klanten' },
    { value: '24/7', label: 'Beschikbaarheid' },
    { value: '10 min', label: 'Setup tijd' },
    { value: '3', label: 'Talen ondersteund' },
  ];

  return (
    <section style={{ padding: '60px 0', background: '#12121a', borderTop: '1px solid #2a2a35', borderBottom: '1px solid #2a2a35' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, textAlign: 'center' }}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURES SECTION
============================================ */
function FeaturesSection() {
  const features = [
    {
      icon: Phone,
      title: 'Beantwoord oproepen',
      desc: 'Professionele begroeting met uw bedrijfsnaam. De AI klinkt natuurlijk en vriendelijk.',
    },
    {
      icon: Calendar,
      title: 'Boek afspraken',
      desc: 'Direct in uw ingebouwde agenda. Geen externe tools of sync-problemen.',
    },
    {
      icon: MessageSquare,
      title: 'Beantwoord vragen',
      desc: 'Openingsuren, prijzen, diensten - alles automatisch beantwoord.',
    },
    {
      icon: Bell,
      title: 'Stuur herinneringen',
      desc: 'Automatische SMS-herinneringen dag voor de afspraak. Minder no-shows.',
    },
    {
      icon: Mic,
      title: 'Voice cloning',
      desc: 'Kloon uw eigen stem in 5 minuten. De AI klinkt precies als u.',
    },
    {
      icon: Globe,
      title: '3 talen',
      desc: 'Nederlands, Frans en Duits. Automatische taalherkenning.',
    },
    {
      icon: BarChart3,
      title: 'Rapporten',
      desc: 'Inzicht in oproepen, afspraken en trends. Data-gedreven beslissingen.',
    },
    {
      icon: FileText,
      title: 'Transcripties',
      desc: 'Elk gesprek wordt automatisch uitgeschreven en samengevat.',
    },
    {
      icon: Shield,
      title: 'GDPR compliant',
      desc: 'Alle data versleuteld op Europese servers. 100% privacy-proof.',
    },
  ];

  return (
    <section id="features" className="section section-light">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="section-label">FUNCTIES</p>
          <h2 className="section-title" style={{ color: '#1a1a2e' }}>
            Alles wat u nodig heeft
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Eén platform voor AI-telefonie, agendabeheer en klantcommunicatie.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map((feature) => (
            <div key={feature.title} className="card-light">
              <div className="icon-box">
                <feature.icon size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1a1a2e' }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   AGENDA SECTION (USP)
============================================ */
function AgendaSection() {
  return (
    <section className="section section-dark">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 64, alignItems: 'center' }}>
          <div style={{ maxWidth: 600 }}>
            <p className="section-label">UNIEK BIJ VOXAPP</p>
            <h2 className="section-title">
              Ingebouwde agenda.{' '}
              <span style={{ color: '#f97316' }}>Geen externe tools.</span>
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 32 }}>
              Dit is wat ons onderscheidt. Uw AI receptionist boekt afspraken direct in de 
              VoxApp agenda. Geen Google Calendar, geen Outlook, geen sync-problemen. 
              Eén platform voor alles.
            </p>

            <ul className="feature-list">
              {[
                'Dag, week en maand weergave',
                'Per medewerker met werkuren',
                'Diensten met duur & prijs',
                'Automatische SMS herinneringen',
                'Online booking pagina voor klanten',
                'Wachtlijst beheer',
              ].map((item) => (
                <li key={item}>
                  <Check size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 32 }}>
              <a href="/register" className="btn-primary">
                Probeer de agenda gratis <ArrowRight size={18} />
              </a>
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
    { num: '03', icon: Mic, title: 'Stem kiezen of klonen', desc: 'Kies een standaard stem of kloon uw eigen stem in 5 minuten.' },
    { num: '04', icon: Phone, title: 'Telefoonnummer koppelen', desc: 'Krijg een nieuw nummer of koppel uw bestaande via doorschakeling.' },
  ];

  return (
    <section id="how-it-works" className="section section-dark" style={{ background: '#12121a' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="section-label">HOE HET WERKT</p>
          <h2 className="section-title">
            Live in <span style={{ color: '#f97316' }}>10 minuten</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Onze stap-voor-stap wizard begeleidt u door de setup. Geen IT-team nodig.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {steps.map((step) => (
            <div key={step.num} className="card" style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: 24, right: 24, fontSize: 48, fontWeight: 700, color: '#2a2a35' }}>{step.num}</span>
              <div className="icon-box">
                <step.icon size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <a href="/register" className="btn-primary">
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
      icon: Zap,
      price: '99',
      desc: 'Perfect voor zelfstandigen en kleine praktijken.',
      minutes: '300',
      extra: '0,40',
      features: [
        'AI receptionist 24/7',
        'Ingebouwde agenda',
        '1 medewerker',
        'SMS bevestigingen',
        'Gesprekstranscripties',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      icon: Zap,
      price: '149',
      desc: 'Voor groeiende teams met meerdere medewerkers.',
      minutes: '750',
      extra: '0,35',
      features: [
        'Alles van Starter, plus:',
        '5 medewerkers',
        'Voice cloning',
        'Uitgaande herinneringen',
        'Online booking pagina',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Business',
      icon: Zap,
      price: '249',
      desc: 'Voor grotere bedrijven met hoge volumes.',
      minutes: '1500',
      extra: '0,30',
      features: [
        'Alles van Pro, plus:',
        'Onbeperkt medewerkers',
        'Meerdere locaties',
        'API toegang',
        'Custom integraties',
        'Dedicated account manager',
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="section section-dark">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="section-label">PRIJZEN</p>
          <h2 className="section-title">
            Simpele, <span style={{ color: '#f97316' }}>transparante prijzen</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Alles inbegrepen. Geen verrassingen.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <span className="pricing-badge">Populair</span>}
              
              <div className="pricing-name">
                <plan.icon size={18} style={{ color: '#f97316' }} />
                {plan.name}
              </div>
              <p className="pricing-desc">{plan.desc}</p>

              <div className="pricing-price">
                <span style={{ fontSize: 20, color: '#6b7280' }}>€</span>
                <span className="pricing-amount">{plan.price}</span>
                <span className="pricing-period">/maand</span>
              </div>

              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                {plan.minutes} minuten incl. • €{plan.extra}/extra min
              </p>

              <ul className="pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>

              <a 
                href="/register" 
                className={plan.popular ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
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
    {
      q: 'Hoe snel kan ik starten?',
      a: 'Binnen 10 minuten. Onze setup wizard begeleidt u stap voor stap. U hoeft alleen bedrijfsgegevens, diensten en werkuren in te vullen.',
    },
    {
      q: 'Kan ik mijn bestaande telefoonnummer behouden?',
      a: 'Ja! U kunt uw bestaande nummer doorschakelen naar uw VoxApp AI-nummer. Zo verandert er niets voor uw klanten.',
    },
    {
      q: 'Hoe werkt de voice cloning?',
      a: 'U leest 5 minuten een tekst in via onze app. Onze AI analyseert uw stem en creëert een digitale kopie die precies zo klinkt als u.',
    },
    {
      q: 'Wat als de AI een vraag niet kan beantwoorden?',
      a: 'De AI is getraind om vragen door te verbinden naar u of een voicemail achter te laten. U bepaalt zelf in de instellingen hoe dit werkt.',
    },
    {
      q: 'Welke talen worden ondersteund?',
      a: 'Nederlands, Frans en Duits. De AI herkent automatisch in welke taal de beller spreekt en schakelt over.',
    },
    {
      q: 'Is er een contract of opzegtermijn?',
      a: 'Nee. U kunt maandelijks opzeggen, zonder opgaaf van reden. De eerste maand is volledig gratis.',
    },
  ];

  return (
    <section id="faq" className="section section-dark" style={{ background: '#12121a' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="section-label">FAQ</p>
          <h2 className="section-title">
            Veelgestelde <span style={{ color: '#f97316' }}>vragen</span>
          </h2>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <div 
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronRight 
                  size={20} 
                  style={{ 
                    color: '#f97316',
                    transform: openIndex === i ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} 
                />
              </div>
              {openIndex === i && (
                <div className="faq-answer">{faq.a}</div>
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
    <section className="section section-dark">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="section-title">
          Klaar om nooit meer een{' '}
          <span style={{ color: '#f97316' }}>oproep te missen?</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto 40px' }}>
          Start vandaag nog met VoxApp. Eerste maand gratis, geen contract, setup in 10 minuten.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <a href="/register" className="btn-primary">
            Start gratis proefperiode <ArrowRight size={18} />
          </a>
          <a href="/contact" className="btn-secondary">
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
    <footer style={{ background: '#0a0a0f', borderTop: '1px solid #2a2a35', padding: '80px 0 40px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <a href="/" className="nav-logo" style={{ marginBottom: 16, display: 'inline-flex' }}>
              <span>Vox</span>App
            </a>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginTop: 16 }}>
              De AI-receptionist voor elke KMO. Mis nooit meer een oproep.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 20 }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Functies</a>
              <a href="#pricing" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Prijzen</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Integraties</a>
            </div>
          </div>

          {/* Bedrijf */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 20 }}>Bedrijf</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Over ons</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Blog</a>
              <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Contact</a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: 20 }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Help Center</a>
              <a href="#faq" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>FAQ</a>
              <a href="#" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>Status</a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #2a2a35', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
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
      <StatsSection />
      <FeaturesSection />
      <AgendaSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
