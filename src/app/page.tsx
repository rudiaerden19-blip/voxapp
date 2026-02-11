'use client';

import { useState } from 'react';
import { Phone, Calendar, MessageSquare, Mic, Check, Menu, X, ArrowRight } from 'lucide-react';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <span className="text-white font-black text-base">V</span>
            </div>
            <span className="text-xl font-bold text-white">VoxApp</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#hoe" className="text-sm text-zinc-400 hover:text-white transition-colors">Hoe het werkt</a>
            <a href="#prijzen" className="text-sm text-zinc-400 hover:text-white transition-colors">Prijzen</a>
            <a href="#start" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
              Gratis proberen
            </a>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-1">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#09090b] border-t border-white/5 px-5 py-5 space-y-4">
            <a href="#hoe" onClick={() => setMenuOpen(false)} className="block text-zinc-300 text-lg py-1">Hoe het werkt</a>
            <a href="#prijzen" onClick={() => setMenuOpen(false)} className="block text-zinc-300 text-lg py-1">Prijzen</a>
            <a href="#start" onClick={() => setMenuOpen(false)} className="block bg-violet-600 text-white text-center font-semibold px-5 py-3.5 rounded-full text-lg mt-2">
              Gratis proberen
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-40 md:pb-24 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[2.5rem] md:text-6xl font-black text-white leading-[1.1] mb-5">
            Mis nooit meer<br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">een oproep.</span>
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-md mx-auto mb-8">
            Uw AI receptionist neemt op, boekt afspraken en beantwoordt vragen. 24/7. Met uw eigen stem.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <a href="#start" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-all flex items-center justify-center gap-2">
              Start gratis
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Conversation demo */}
      <section className="pb-16 md:pb-24 px-5">
        <div className="max-w-sm mx-auto bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden">
          <div className="bg-violet-600/10 px-4 py-3 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
              <Phone size={18} className="text-white" />
            </div>
            <div>
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
                <span className="text-white text-[10px] font-bold">AI</span>
              </div>
              <div className="bg-violet-600/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                <p className="text-sm text-zinc-200">Welkom bij Kapsalon Sarah, waarmee kan ik u helpen?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-white/5 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%]">
                <p className="text-sm text-zinc-300">Ik wil een afspraak voor knippen, donderdag.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="text-white text-[10px] font-bold">AI</span>
              </div>
              <div className="bg-violet-600/10 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                <p className="text-sm text-zinc-200">Donderdag 14u30, knippen €35. Ik boek het in en stuur een SMS!</p>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-white/5 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-green-400" />
              <span className="text-xs text-green-400 font-medium">Geboekt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-violet-400" />
              <span className="text-xs text-violet-400 font-medium">SMS verstuurd</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors - simple */}
      <section className="py-12 px-5 border-t border-white/5">
        <p className="text-center text-zinc-500 text-sm mb-6">Voor elke zaak</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
          {['💇 Kapper', '🍽️ Restaurant', '🏥 Dokter', '🔧 Garage', '⚖️ Advocaat', '🏠 Immobiliën', '🐾 Dierenarts', '💅 Beauty'].map((s, i) => (
            <span key={i} className="bg-[#18181b] border border-white/5 rounded-full px-4 py-2 text-sm text-zinc-300">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="hoe" className="py-16 px-5">
        <h2 className="text-2xl md:text-4xl font-black text-white text-center mb-10">
          Klaar in 10 minuten.
        </h2>

        <div className="max-w-sm mx-auto space-y-6">
          {[
            { num: '1', icon: '🏪', title: 'Kies uw sector', desc: 'Kapper, restaurant, dokter...' },
            { num: '2', icon: '📝', title: 'Vul uw info in', desc: 'Diensten, prijzen, openingsuren.' },
            { num: '3', icon: '🎙️', title: 'Kies uw stem', desc: 'Standaard of kloon uw eigen stem.' },
            { num: '4', icon: '✅', title: 'Klaar!', desc: 'AI neemt op. Afspraken in uw agenda.' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{step.icon}</span>
              </div>
              <div>
                <h3 className="text-white font-bold">{step.title}</h3>
                <p className="text-sm text-zinc-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Voice clone highlight */}
      <section className="py-12 px-5 mx-5 bg-gradient-to-br from-violet-600/10 to-transparent rounded-3xl border border-violet-500/10">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
            <Mic size={28} className="text-violet-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Uw stem. Uw zaak.</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Neem 5 minuten op en uw AI klinkt precies als u. 
            Klanten merken het verschil niet.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="prijzen" className="py-16 px-5">
        <h2 className="text-2xl md:text-4xl font-black text-white text-center mb-3">
          Eenvoudige prijzen.
        </h2>
        <p className="text-center text-zinc-500 text-sm mb-10">Eerste maand gratis. Geen contract.</p>

        <div className="max-w-sm mx-auto space-y-4 md:max-w-4xl md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          {[
            {
              name: 'Starter',
              price: 99,
              desc: '300 minuten/maand',
              features: ['AI receptionist', 'Ingebouwde agenda', '1 telefoonnummer', 'SMS bevestigingen'],
              popular: false,
            },
            {
              name: 'Pro',
              price: 149,
              desc: '750 minuten/maand',
              features: ['Alles van Starter', 'Voice cloning', 'Online booking pagina', 'Meerdere medewerkers', 'Analytics'],
              popular: true,
            },
            {
              name: 'Business',
              price: 249,
              desc: '1500 minuten/maand',
              features: ['Alles van Pro', 'Meerdere nummers', 'CRM integratie', 'Prioriteit support', 'API toegang'],
              popular: false,
            },
          ].map((plan, i) => (
            <div key={i} className={`rounded-2xl p-6 border ${plan.popular ? 'bg-violet-600/10 border-violet-500/20' : 'bg-[#18181b] border-white/5'}`}>
              {plan.popular && (
                <span className="inline-block bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Populairst
                </span>
              )}
              <h3 className="text-white font-bold text-lg">{plan.name}</h3>
              <p className="text-zinc-500 text-sm mb-3">{plan.desc}</p>
              <p className="mb-4">
                <span className="text-3xl font-black text-white">€{plan.price}</span>
                <span className="text-zinc-500 text-sm">/maand</span>
              </p>
              <ul className="space-y-2 mb-5">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-sm text-zinc-400 flex items-center gap-2">
                    <Check size={14} className="text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#start" className={`block text-center py-3 rounded-full font-semibold text-sm ${plan.popular ? 'bg-violet-600 text-white' : 'bg-white/5 text-white border border-white/10'}`}>
                Start gratis
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="py-16 px-5">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-4">
            Klaar om te starten?
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Eerste maand gratis. Geen creditcard nodig.
          </p>
          <a href="#" className="block bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-all">
            Start gratis proefperiode
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="text-sm font-bold text-white">VoxApp</span>
          </div>
          <p className="text-zinc-600 text-xs">© 2026 VoxApp. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  );
}
