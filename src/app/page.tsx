'use client';

import { useState } from 'react';
import { Phone, Calendar, MessageSquare, Mic, ChevronRight, Check, Star, Menu, X, Zap, Clock, TrendingUp, Shield, Users, ArrowRight } from 'lucide-react';

const sectors = [
  { icon: '💇', name: 'Kappers & Beauty', desc: 'Afspraken boeken terwijl je knipt' },
  { icon: '🍽️', name: 'Restaurants & Horeca', desc: 'Reservaties en bestellingen via telefoon' },
  { icon: '🏥', name: 'Dokters & Tandartsen', desc: 'Patiënten plannen zonder receptie' },
  { icon: '🔧', name: 'Garages & Herstellers', desc: 'Nooit meer leads missen op de baan' },
  { icon: '⚖️', name: 'Advocaten & Boekhouders', desc: 'Intake en afspraken automatisch' },
  { icon: '🏠', name: 'Immobiliën', desc: 'Bezichtigingen en lead capture' },
];

const pricing = [
  {
    name: 'Starter',
    price: 99,
    minutes: 300,
    features: ['AI receptionist', 'Ingebouwde agenda', '1 telefoonnummer', 'Gesprekslogs', 'SMS bevestigingen'],
    popular: false,
  },
  {
    name: 'Pro',
    price: 149,
    minutes: 750,
    features: ['Alles van Starter', 'Voice cloning (eigen stem)', 'Online booking pagina', 'Meerdere medewerkers', 'SMS herinneringen', 'Analytics dashboard'],
    popular: true,
  },
  {
    name: 'Business',
    price: 249,
    minutes: 1500,
    features: ['Alles van Pro', 'Meerdere nummers', 'CRM integratie', 'Prioriteit support', 'Custom begroeting', 'API toegang'],
    popular: false,
  },
];

const stats = [
  { value: '60%', label: 'van KMO\'s mist regelmatig oproepen' },
  { value: '25%', label: 'van bellers gaat naar de concurrent' },
  { value: '24/7', label: 'bereikbaar, ook buiten de uren' },
  { value: '<3s', label: 'reactietijd bij elke oproep' },
];

const steps = [
  { icon: <Users size={24} />, title: 'Kies uw sector', desc: 'Kapper, restaurant, dokter, garage... wij passen ons aan.' },
  { icon: <MessageSquare size={24} />, title: 'Vul uw info in', desc: 'Diensten, prijzen, openingsuren, medewerkers. 10 minuten setup.' },
  { icon: <Mic size={24} />, title: 'Kies uw stem', desc: 'Standaard stem of kloon uw eigen stem. Klanten herkennen u.' },
  { icon: <Phone size={24} />, title: 'Klaar!', desc: 'Uw AI receptionist neemt op. Afspraken verschijnen in uw agenda.' },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="text-lg font-bold text-white">VoxApp</span>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#sectors" className="text-sm text-zinc-400 hover:text-white transition-colors">Sectoren</a>
            <a href="#how" className="text-sm text-zinc-400 hover:text-white transition-colors">Hoe het werkt</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Prijzen</a>
            <a href="#demo" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
              Gratis proberen
            </a>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#09090b] border-t border-white/5 px-4 py-4 space-y-4">
            <a href="#sectors" onClick={() => setMenuOpen(false)} className="block text-zinc-300 py-2">Sectoren</a>
            <a href="#how" onClick={() => setMenuOpen(false)} className="block text-zinc-300 py-2">Hoe het werkt</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="block text-zinc-300 py-2">Prijzen</a>
            <a href="#demo" onClick={() => setMenuOpen(false)} className="block bg-violet-600 text-white text-center font-semibold px-5 py-3 rounded-full">
              Gratis proberen
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-300">AI-powered receptionist voor uw zaak</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
            Mis nooit meer<br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">een oproep.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Uw AI receptionist neemt elke oproep op, boekt afspraken en beantwoordt vragen. 
            24/7. Met uw eigen stem. Vanaf €99/maand.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <a href="#demo" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
              Start gratis proefperiode
              <ArrowRight size={20} />
            </a>
            <a href="#how" className="bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors flex items-center justify-center gap-2 border border-white/10">
              <Phone size={20} />
              Bel de demo
            </a>
          </div>

          {/* Conversation demo */}
          <div className="max-w-sm mx-auto bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden shadow-2xl shadow-violet-500/5">
            <div className="bg-violet-600/10 px-4 py-3 flex items-center gap-3 border-b border-white/5">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                <Phone size={18} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Inkomende oproep</p>
                <p className="text-violet-300 text-xs">+32 472 *** ***</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">Live</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-violet-600/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <p className="text-sm text-zinc-200">Welkom bij Kapsalon Sarah, waarmee kan ik u helpen?</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-white/5 rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                  <p className="text-sm text-zinc-300">Ik wil graag een afspraak voor knippen, donderdag.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-violet-600/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <p className="text-sm text-zinc-200">Donderdag om 10u of 14u30, wat past beter? Knippen is €35.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-white/5 rounded-2xl rounded-tr-sm px-3.5 py-2.5">
                  <p className="text-sm text-zinc-300">14u30 graag!</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-violet-600/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <p className="text-sm text-zinc-200">Perfect! Donderdag 14u30 knippen. U krijgt een SMS bevestiging. Tot dan! 💇</p>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">Afspraak geboekt</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-violet-400" />
                <span className="text-xs text-violet-400 font-medium">SMS verstuurd</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-violet-400 mb-1">{stat.value}</p>
              <p className="text-xs md:text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section id="sectors" className="py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Voor elke zaak die een telefoon heeft.
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Kies uw sector en uw AI receptionist weet meteen wat te doen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sector, i) => (
              <div key={i} className="bg-[#18181b] rounded-2xl p-5 border border-white/5 hover:border-violet-500/30 transition-all hover:bg-[#1c1c20] group cursor-pointer">
                <div className="text-3xl mb-3">{sector.icon}</div>
                <h3 className="text-white font-bold mb-1 group-hover:text-violet-300 transition-colors">{sector.name}</h3>
                <p className="text-sm text-zinc-500">{sector.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-16 md:py-24 px-4 bg-[#0f0f12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Kent u dit?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Problem */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <X size={20} /> Zonder VoxApp
              </h3>
              <ul className="space-y-3">
                {[
                  'Telefoon gaat, handen vol, kan niet opnemen',
                  'Klant belt na sluitingstijd → voicemail',
                  'Drukke shift, 5 gemiste oproepen',
                  'Klant belt concurrent want niemand nam op',
                  'Receptionist kost €2.000+/maand',
                ].map((item, i) => (
                  <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-6">
              <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                <Check size={20} /> Met VoxApp
              </h3>
              <ul className="space-y-3">
                {[
                  'AI neemt elke oproep op binnen 2 seconden',
                  '24/7 bereikbaar, ook \'s nachts en op zondag',
                  'Afspraken verschijnen automatisch in uw agenda',
                  'Klant krijgt meteen antwoord en boekt',
                  'Vanaf €99/maand — 95% goedkoper',
                ].map((item, i) => (
                  <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Klaar in 10 minuten.
            </h2>
            <p className="text-zinc-400">Geen technische kennis nodig. Geen installatie. Gewoon invullen en klaar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="bg-[#18181b] rounded-2xl p-6 border border-white/5 relative">
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400 mb-4">
                  {step.icon}
                </div>
                <div className="absolute top-5 right-5 text-4xl font-black text-white/5">{i + 1}</div>
                <h3 className="text-white font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-zinc-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 bg-[#0f0f12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Alles wat u nodig heeft.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Phone size={22} />, title: 'AI Telefoon', desc: 'Neemt elke oproep op, begrijpt de klant, en handelt af.' },
              { icon: <Mic size={22} />, title: 'Uw Eigen Stem', desc: 'Kloon uw stem. Klanten denken dat ze met u praten.' },
              { icon: <Calendar size={22} />, title: 'Slimme Agenda', desc: 'Afspraken boeken, verzetten, annuleren. Automatisch.' },
              { icon: <MessageSquare size={22} />, title: 'SMS & Berichten', desc: 'Automatische bevestigingen en herinneringen per SMS.' },
              { icon: <Shield size={22} />, title: 'Doorverbinden', desc: 'Urgente oproepen gaan direct naar u door. Altijd.' },
              { icon: <TrendingUp size={22} />, title: 'Inzichten', desc: 'Zie hoeveel oproepen, afspraken en omzet de AI genereert.' },
            ].map((feature, i) => (
              <div key={i} className="bg-[#18181b] rounded-2xl p-5 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400 mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice cloning highlight */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
            <Mic size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-300">Exclusief bij VoxApp</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Uw stem. Uw zaak.<br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">100% persoonlijk.</span>
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8 leading-relaxed">
            Neem 5 minuten uw stem op en uw AI receptionist klinkt precies als u. 
            Klanten merken het verschil niet. Dat is het niveau van vertrouwen dat uw zaak verdient.
          </p>
          <div className="bg-[#18181b] rounded-2xl p-6 border border-white/5 max-w-sm mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                <Mic size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">Sarah&apos;s stem</p>
                <p className="text-xs text-zinc-500">Gekloond in 5 minuten</p>
              </div>
            </div>
            <div className="bg-violet-600/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></div>
                <span className="text-xs text-violet-300 font-medium">AI spreekt met Sarah&apos;s stem</span>
              </div>
              <p className="text-sm text-zinc-300 italic">&ldquo;Hoi, welkom bij Kapsalon Sarah! Wil je een afspraak maken?&rdquo;</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-24 px-4 bg-[#0f0f12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Eenvoudige prijzen. Geen verrassingen.
            </h2>
            <p className="text-zinc-400">Eerste maand gratis. Geen contract. Stop wanneer u wilt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {pricing.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${plan.popular ? 'bg-violet-600/10 border-violet-500/30 relative' : 'bg-[#18181b] border-white/5'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Populairst
                  </div>
                )}
                <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">{plan.minutes} minuten/maand</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">€{plan.price}</span>
                  <span className="text-zinc-500 text-sm">/maand</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="text-sm text-zinc-400 flex items-center gap-2">
                      <Check size={14} className="text-violet-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#demo" className={`block text-center py-3 rounded-full font-semibold text-sm transition-colors ${plan.popular ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                  Start gratis
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-zinc-600 text-sm mt-8">
            Alle prijzen excl. BTW. Belgisch telefoonnummer inbegrepen.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="py-16 md:py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Klaar om nooit meer een oproep te missen?
          </h2>
          <p className="text-zinc-400 mb-8">
            Start vandaag. Eerste maand gratis. Geen creditcard nodig.
          </p>
          <a href="#" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105">
            Start gratis proefperiode
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="text-sm font-bold text-white">VoxApp</span>
          </div>
          <p className="text-zinc-600 text-sm">© 2026 VoxApp. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Voorwaarden</a>
            <a href="#" className="text-zinc-500 text-sm hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
