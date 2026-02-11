'use client';

import { useState, useRef } from 'react';
import { Phone, ChevronLeft, ChevronRight, Menu, X, CheckCircle2, MessageSquare, CalendarCheck, ShieldCheck, Users, ArrowRight, Star } from 'lucide-react';

/* ───────── DATA ───────── */

const features = [
  {
    label: 'Inkomende Oproepen',
    title: 'Geef elke beller het antwoord dat ze verdienen.',
    desc: 'Elke oproep wordt snel en natuurlijk beantwoord. Klanten krijgen direct antwoord, makkelijke afspraakwijzigingen en een vriendelijke ervaring die past bij uw merk.',
    points: ['Beantwoord klantvragen', 'Beheer afspraakwijzigingen', 'Routeer prioriteitsoproepen', 'Vang nieuwe leads op'],
    img: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&h=600&fit=crop',
    overlay: { greeting: 'Welkom bij Kapsalon Sarah, hoe kan ik u helpen?', badges: ['Afspraak Bijgewerkt', 'Bevestiging Verstuurd', 'Team Verwittigd'] },
  },
  {
    label: 'Uitgaande Oproepen',
    title: 'Verhoog boekingen en houd uw agenda vol.',
    desc: 'Uitgaande oproepen vullen uw agenda. Klanten ontvangen herinneringen, follow-ups en herboeking-suggesties — allemaal op een natuurlijke, professionele manier.',
    points: ['Afspraakherinneringen', 'No-show opvolging', 'Herboekingssuggesties', 'Terugkerende afspraken'],
    img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
    overlay: { greeting: 'Goeiedag, dit is een herinnering voor uw afspraak morgen om 14u.', badges: ['Herinnering Verstuurd', 'Bevestiging Ontvangen'] },
  },
  {
    label: 'Geautomatiseerde Taken',
    title: 'Laat admin stil op de achtergrond draaien.',
    desc: 'Routinematige boekingen, wijzigingen en follow-ups lopen automatisch, zodat uw team zich kan focussen op wat echt telt.',
    points: ['Verstuur boekingslinks automatisch', 'Verwerk afspraakwijzigingen', 'Routeer prioriteitsoproepen', 'Vang en volg nieuwe leads op'],
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop',
    overlay: { greeting: 'Uw afspraak is bevestigd en ingepland.', badges: ['Boeking Bijgewerkt', 'Kalender Gesynchroniseerd'] },
  },
];

const reviews = [
  {
    name: 'Sarah De Vos',
    role: 'Eigenaar, Kapsalon Sarah — Antwerpen',
    text: '"Sinds VoxApp mis ik geen enkele oproep meer. Klanten krijgen direct antwoord, ook als ik bezig ben met knippen. Ik bespaar minstens 10 uur per week en mijn klanten zijn tevredener dan ooit."',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    name: 'Marc Peeters',
    role: 'Eigenaar, Frituur De Smissen — Gent',
    text: '"Tijdens de drukke uren kon ik nooit opnemen. Nu neemt VoxApp op met mijn eigen stem en de bestellingen komen recht in mijn kassa. Mijn omzet is met 20% gestegen."',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    name: 'Dr. Anneleen Jacobs',
    role: 'Huisarts, Praktijk Jacobs — Leuven',
    text: '"Mijn patiënten krijgen nu 24/7 antwoord. Urgente oproepen worden doorverbonden, de rest wordt netjes ingepland. Mijn secretaresse kan zich eindelijk focussen op de patiënten in de praktijk."',
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
  },
  {
    name: 'Tom Willems',
    role: 'Zaakvoerder, Garage Willems — Hasselt',
    text: '"Ik sta de hele dag onder auto\'s. Vroeger miste ik de helft van mijn oproepen. Nu vangt VoxApp alles op en ik krijg een samenvatting na elke call. Simpel en effectief."',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  },
  {
    name: 'Nadia El Amrani',
    role: 'Eigenaar, Beauty Studio Nadia — Brussel',
    text: '"Mijn klanten denken dat ze met mij praten. De voice cloning is ongelooflijk. Ik heb 30% meer boekingen sinds ik VoxApp gebruik en geen enkele gemiste oproep meer."',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  },
];

const pricing = [
  { name: 'Starter', desc: 'Voor zelfstandigen die oproepen willen stroomlijnen.', price: 99, mins: 300, overage: '€0,40', features: ['Gepersonaliseerde AI Receptionist', 'Gesprekken Dashboard', 'Slimme Doorverbinding', 'Ingebouwde Agenda'] },
  { name: 'Pro', desc: 'Voor groeiende teams met meer belvolume.', price: 149, mins: 750, overage: '€0,35', features: ['Alles van Starter', 'Voice Cloning', 'Online Booking Pagina', 'SMS Herinneringen', 'Meerdere Medewerkers'], popular: true },
  { name: 'Business', desc: 'Voor bedrijven die alles willen automatiseren.', price: 249, mins: 1500, overage: '€0,30', features: ['Alles van Pro', 'Meerdere Nummers', 'CRM Integratie', 'Prioriteit Support', 'API Toegang'] },
];

/* ───────── COMPONENT ───────── */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const reviewRef = useRef<HTMLDivElement>(null);

  const scrollReviews = (dir: 'left' | 'right') => {
    if (!reviewRef.current) return;
    const scrollAmount = 340;
    reviewRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const f = features[activeFeature];

  return (
    <div className="min-h-screen">

      {/* ━━━ NAV ━━━ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-white tracking-tight">
            <span className="text-white/60">Vox</span>App
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Hoe het werkt</a>
            <a href="#reviews" className="text-sm text-white/50 hover:text-white transition-colors">Reviews</a>
            <a href="#prijzen" className="text-sm text-white/50 hover:text-white transition-colors">Prijzen</a>
            <a href="#start" className="bg-white text-[#1a1a2e] text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/90 transition-colors">
              Gratis Demo
            </a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#1a1a2e] border-t border-white/10 px-6 py-5 space-y-4">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-white/70 text-lg">Hoe het werkt</a>
            <a href="#reviews" onClick={() => setMenuOpen(false)} className="block text-white/70 text-lg">Reviews</a>
            <a href="#prijzen" onClick={() => setMenuOpen(false)} className="block text-white/70 text-lg">Prijzen</a>
            <a href="#start" onClick={() => setMenuOpen(false)} className="block bg-white text-[#1a1a2e] text-center font-semibold py-3 rounded-full text-lg">Gratis Demo</a>
          </div>
        )}
      </nav>

      {/* ━━━ SECTION 1: HERO ━━━ */}
      <section className="bg-[#1a1a2e] text-white pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
                <span className="text-xs text-white/50">⚡ AI Receptionist voor Groeiende Ondernemingen</span>
              </div>
              <h1 className="text-4xl md:text-[3.2rem] font-bold leading-[1.15] mb-6 tracking-tight">
                Mis nooit een oproep.<br />
                Win meer werk.<br />
                Minder administratie.
              </h1>
              <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-lg">
                Uw AI receptionist beheert oproepen, vangt leads en regelt afspraken — zodat u zich kunt focussen op uw zaak.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#start" className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1a2e] font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 transition-colors">
                  <CalendarCheck size={18} />
                  Gratis Demo Aanvragen
                </a>
                <a href="#features" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-7 py-3.5 rounded-full hover:bg-white/5 transition-colors">
                  <Phone size={18} />
                  Bel Demo Receptionist
                </a>
              </div>
            </div>

            {/* Right - Image with overlays */}
            <div className="relative hidden md:block">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=600&h=500&fit=crop"
                  alt="Onderneemster aan de telefoon"
                  className="w-full h-[420px] object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/60 to-transparent rounded-2xl" />
              </div>
              {/* Chat bubble top-left */}
              <div className="absolute top-6 -left-4 bg-[#2d2d4e] rounded-2xl px-4 py-3 shadow-xl max-w-[220px] animate-fadeUp">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-green-400 text-xs font-medium">AI Receptionist</span>
                </div>
                <p className="text-white/80 text-sm leading-snug">Welkom bij Kapsalon Sarah, hoe kan ik u helpen?</p>
              </div>
              {/* Badges top-right */}
              <div className="absolute top-8 -right-2 space-y-2 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
                <div className="bg-[#2d2d4e] rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-white/80 text-xs font-medium">Afspraak Ingepland</span>
                </div>
                <div className="bg-[#2d2d4e] rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                  <MessageSquare size={14} className="text-blue-400" />
                  <span className="text-white/80 text-xs font-medium">Bevestiging Verstuurd</span>
                </div>
                <div className="bg-[#2d2d4e] rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span className="text-white/80 text-xs font-medium">Samenvatting Klaar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="max-w-6xl mx-auto px-6 mt-16">
          <div className="border-t border-white/10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <CalendarCheck size={18} />, text: '30 Dagen Gratis' },
              { icon: <Phone size={18} />, text: '24/7 Bereikbaar' },
              { icon: <ShieldCheck size={18} />, text: 'Slim Doorverbinden' },
              { icon: <Users size={18} />, text: 'Software Integraties' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-white/30">{item.icon}</span>
                <span className="text-white/50 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 2 & 3: FEATURES (Tabs) ━━━ */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-14 justify-center md:justify-start">
            {features.map((feat, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeFeature === i
                    ? 'bg-[#1a1a2e] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {feat.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div>
              <p className="text-[#1a1a2e]/40 text-sm font-semibold uppercase tracking-wider mb-3">{f.label}</p>
              <h2 className="text-3xl md:text-[2.5rem] font-bold leading-tight mb-5 text-[#1a1a2e]">
                {f.title}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                {f.desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a href="#start" className="inline-flex items-center justify-center gap-2 bg-[#1a1a2e] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#2a2a4e] transition-colors">
                  <CalendarCheck size={16} />
                  Gratis Demo
                </a>
                <a href="#" className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-medium px-6 py-3 rounded-full text-sm hover:bg-gray-50 transition-colors">
                  <Phone size={16} />
                  Bel Receptionist
                </a>
              </div>
              <div className="space-y-4">
                {f.points.map((point, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                    <CheckCircle2 size={16} className="text-gray-300 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative">
              <img
                src={f.img}
                alt={f.label}
                className="w-full h-[350px] md:h-[420px] object-cover rounded-2xl"
              />
              {/* Chat overlay */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-5 py-4 shadow-xl">
                <p className="text-[#1a1a2e] text-sm mb-3">{f.overlay.greeting}</p>
                <div className="flex flex-wrap gap-2">
                  {f.overlay.badges.map((badge, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 bg-[#1a1a2e]/5 text-[#1a1a2e]/70 text-xs font-medium px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 4: REVIEWS ━━━ */}
      <section id="reviews" className="py-20 md:py-28 bg-[#1a1a2e] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-white/30 text-sm font-semibold uppercase tracking-wider mb-3">Wat klanten zeggen</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Vertrouwd door ondernemers in heel België.</h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollReviews('left')} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollReviews('right')} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Slider */}
          <div ref={reviewRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
            {reviews.map((review, i) => (
              <div key={i} className="min-w-[320px] md:min-w-[400px] bg-white/5 border border-white/10 rounded-2xl p-6 snap-start flex-shrink-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">{review.text}</p>
                <div className="flex items-center gap-3">
                  <img src={review.img} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-white text-sm font-semibold">{review.name}</p>
                    <p className="text-white/40 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile arrows */}
          <div className="flex md:hidden items-center justify-center gap-3 mt-6">
            <button onClick={() => scrollReviews('left')} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollReviews('right')} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ━━━ SECTION 5: PRICING ━━━ */}
      <section id="prijzen" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a2e] mb-3">Prijzen & Pakketten</h2>
            <p className="text-gray-500">Eenvoudige prijzen op basis van belvolume. Alle plannen bevatten dezelfde krachtige features.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricing.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-7 ${plan.popular ? 'bg-[#1a1a2e] text-white ring-2 ring-[#1a1a2e]' : 'border border-gray-200 text-[#1a1a2e]'}`}>
                {plan.popular && (
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Aanbevolen Plan</p>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className={`text-sm mb-5 ${plan.popular ? 'text-white/50' : 'text-gray-400'}`}>{plan.desc}</p>
                
                <p className="mb-1">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? 'text-white/50' : 'text-gray-400'}`}> / maand</span>
                </p>
                <div className={`text-sm mb-6 space-y-1 ${plan.popular ? 'text-white/50' : 'text-gray-400'}`}>
                  <p><strong className={plan.popular ? 'text-white' : 'text-[#1a1a2e]'}>{plan.mins}</strong> minuten per maand</p>
                  <p>{plan.overage}/min daarna</p>
                </div>

                <a href="#start" className={`block text-center py-3.5 rounded-full font-semibold text-sm mb-6 transition-colors ${
                  plan.popular ? 'bg-white text-[#1a1a2e] hover:bg-white/90' : 'border border-gray-200 hover:bg-gray-50'
                }`}>
                  Start Gratis Proefperiode
                </a>

                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${plan.popular ? 'text-white/30' : 'text-gray-300'}`}>Features</p>
                <ul className="space-y-2.5">
                  {plan.features.map((feat, j) => (
                    <li key={j} className={`text-sm flex items-center gap-2.5 ${plan.popular ? 'text-white/70' : 'text-gray-500'}`}>
                      <CheckCircle2 size={14} className={plan.popular ? 'text-white/30' : 'text-gray-300'} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section id="start" className="py-20 md:py-28 bg-[#1a1a2e] text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Klaar om te starten?</h2>
          <p className="text-white/50 mb-8">Start uw 30-dagen gratis proefperiode. Geen creditcard nodig. We helpen u het perfecte plan te vinden.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#" className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1a2e] font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-colors">
              Gratis Demo Aanvragen
              <ArrowRight size={18} />
            </a>
            <a href="#" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-8 py-4 rounded-full hover:bg-white/5 transition-colors">
              <Phone size={18} />
              Bel Receptionist
            </a>
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="bg-white border-t border-gray-100 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <span className="text-lg font-bold text-[#1a1a2e] tracking-tight block mb-3">
                <span className="text-[#1a1a2e]/40">Vox</span>App
              </span>
              <p className="text-gray-400 text-sm leading-relaxed">
                VoxApp is AI receptionist software die inkomende oproepen beantwoordt, afspraken boekt en uw administratie automatiseert.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Product</p>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Hoe het werkt</a>
                <a href="#prijzen" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Prijzen</a>
                <a href="#" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Sectoren</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Juridisch</p>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Privacybeleid</a>
                <a href="#" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Algemene Voorwaarden</a>
                <a href="#" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Cookie Policy</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Contact</p>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Partnerships</a>
                <a href="#" className="block text-sm text-gray-400 hover:text-[#1a1a2e] transition-colors">Algemene Vragen</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-300 text-sm">© 2026 VoxApp. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
