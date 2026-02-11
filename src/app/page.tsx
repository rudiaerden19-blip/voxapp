'use client';

import { useState, useEffect } from 'react';
import { Phone, ArrowRight, Menu, X } from 'lucide-react';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleMessages(1), 800),
      setTimeout(() => setVisibleMessages(2), 2400),
      setTimeout(() => setVisibleMessages(3), 4200),
      setTimeout(() => setVisibleMessages(4), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-violet-500">Vox</span>App
          </span>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#werking" className="text-sm text-zinc-400 hover:text-white transition-colors">Hoe het werkt</a>
            <a href="#prijzen" className="text-sm text-zinc-400 hover:text-white transition-colors">Prijzen</a>
            <a href="#start" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors">
              Gratis starten
            </a>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black border-t border-white/5 px-6 py-6 space-y-5">
            <a href="#werking" onClick={() => setMenuOpen(false)} className="block text-lg text-zinc-300">Hoe het werkt</a>
            <a href="#prijzen" onClick={() => setMenuOpen(false)} className="block text-lg text-zinc-300">Prijzen</a>
            <a href="#start" onClick={() => setMenuOpen(false)} className="block bg-violet-600 text-white text-center font-medium py-3.5 rounded-full text-lg">
              Gratis starten
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-violet-400 text-sm font-medium tracking-wide uppercase mb-6">AI Receptionist</p>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-6 tracking-tight">
          Mis nooit<br />meer een<br />
          <span className="text-violet-500">oproep.</span>
        </h1>
        
        <p className="text-zinc-500 text-lg md:text-xl max-w-md mb-10 leading-relaxed">
          Uw AI receptionist neemt op, boekt afspraken en beantwoordt vragen. 24/7.
        </p>

        <a href="#start" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all inline-flex items-center gap-2">
          Start gratis
          <ArrowRight size={18} />
        </a>

        <p className="text-zinc-700 text-sm mt-4">Geen creditcard nodig</p>
      </section>

      {/* Live demo conversation */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-md mx-auto">
          <p className="text-center text-zinc-600 text-xs uppercase tracking-widest mb-10">Zo klinkt het</p>
          
          <div className="bg-zinc-950 rounded-3xl border border-white/5 overflow-hidden">
            {/* Call header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                <Phone size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Kapsalon Sarah</p>
                <p className="text-zinc-600 text-xs">+32 472 *** ***</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-500 text-xs">Live</span>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 min-h-[280px]">
              {visibleMessages >= 1 && (
                <div className="flex gap-3 animate-[fadeIn_0.4s_ease-out]">
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center mt-1">
                    <span className="text-[9px] font-bold text-white">AI</span>
                  </div>
                  <p className="text-[15px] text-zinc-300 leading-relaxed">
                    Welkom bij Kapsalon Sarah, waarmee kan ik u helpen?
                  </p>
                </div>
              )}

              {visibleMessages >= 2 && (
                <div className="flex justify-end animate-[fadeIn_0.4s_ease-out]">
                  <p className="text-[15px] text-zinc-500 leading-relaxed text-right max-w-[80%]">
                    Ik wil een afspraak voor knippen, donderdag.
                  </p>
                </div>
              )}

              {visibleMessages >= 3 && (
                <div className="flex gap-3 animate-[fadeIn_0.4s_ease-out]">
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center mt-1">
                    <span className="text-[9px] font-bold text-white">AI</span>
                  </div>
                  <p className="text-[15px] text-zinc-300 leading-relaxed">
                    Donderdag om 14u30 is vrij. Knippen kost €35. Zal ik inboeken?
                  </p>
                </div>
              )}

              {visibleMessages >= 4 && (
                <div className="flex justify-end animate-[fadeIn_0.4s_ease-out]">
                  <p className="text-[15px] text-zinc-500 leading-relaxed text-right">
                    Ja, graag!
                  </p>
                </div>
              )}
            </div>

            {/* Result bar */}
            {visibleMessages >= 4 && (
              <div className="px-5 py-3 border-t border-white/5 flex items-center gap-6 animate-[fadeIn_0.4s_ease-out]">
                <span className="text-green-500 text-xs font-medium">✓ Afspraak geboekt</span>
                <span className="text-violet-400 text-xs font-medium">✓ SMS verstuurd</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
            Voor elke ondernemer<br />die een telefoon heeft.
          </h2>
          <p className="text-zinc-500 text-lg mb-12">
            Kapper. Restaurant. Dokter. Garage. Advocaat. Iedereen.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { emoji: '💇', label: 'Kappers' },
              { emoji: '🍽️', label: 'Horeca' },
              { emoji: '🏥', label: 'Dokters' },
              { emoji: '🔧', label: 'Garages' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <span className="text-4xl block mb-2">{s.emoji}</span>
                <span className="text-zinc-400 text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="werking" className="py-24 md:py-32 px-6 bg-zinc-950">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight">
            Klaar in 10 minuten.
          </h2>

          <div className="space-y-12">
            {[
              { num: '01', title: 'Kies uw sector', desc: 'Kapper, restaurant, dokter, garage — wij passen ons aan.' },
              { num: '02', title: 'Vul uw info in', desc: 'Diensten, prijzen, openingsuren. Simpel formulier.' },
              { num: '03', title: 'Kies uw stem', desc: 'Standaard stem of kloon uw eigen stem in 5 minuten.' },
              { num: '04', title: 'Klaar', desc: 'Uw AI receptionist neemt op. Afspraken in uw agenda.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <span className="text-violet-600 font-mono text-sm mt-1 w-8 flex-shrink-0">{step.num}</span>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{step.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice clone */}
      <section className="py-24 md:py-32 px-6 text-center">
        <p className="text-violet-400 text-sm font-medium tracking-wide uppercase mb-6">Exclusief</p>
        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
          Uw stem. Uw zaak.
        </h2>
        <p className="text-zinc-500 text-lg max-w-md mx-auto leading-relaxed">
          Kloon uw stem in 5 minuten. Klanten denken dat ze met u praten.
        </p>
      </section>

      {/* Pricing */}
      <section id="prijzen" className="py-24 md:py-32 px-6 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-4 tracking-tight">Prijzen</h2>
          <p className="text-center text-zinc-600 mb-16">Eerste maand gratis. Geen contract.</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Starter', price: 99, mins: '300 min/maand', features: ['AI receptionist', 'Agenda', '1 nummer', 'SMS'] },
              { name: 'Pro', price: 149, mins: '750 min/maand', features: ['Voice cloning', 'Booking pagina', 'Medewerkers', 'Analytics'], pop: true },
              { name: 'Business', price: 249, mins: '1500 min/maand', features: ['Meerdere nummers', 'CRM integratie', 'Prioriteit support', 'API'] },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 ${plan.pop ? 'bg-violet-600/10 border-2 border-violet-500/30' : 'border border-white/5'}`}>
                {plan.pop && <p className="text-violet-400 text-xs font-semibold mb-3">POPULAIRST</p>}
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <p className="text-zinc-600 text-sm mb-4">{plan.mins}</p>
                <p className="text-4xl font-black text-white mb-1">€{plan.price}<span className="text-zinc-600 text-base font-normal">/mo</span></p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-zinc-400">✓ {f}</li>
                  ))}
                </ul>
                <a href="#start" className={`block text-center py-3 rounded-full font-medium text-sm mt-6 ${plan.pop ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-300'}`}>
                  Start gratis
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="py-32 px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
          Klaar?
        </h2>
        <a href="#" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all inline-flex items-center gap-2">
          Start gratis proefperiode
          <ArrowRight size={18} />
        </a>
        <p className="text-zinc-700 text-sm mt-4">Geen creditcard nodig</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <span className="text-zinc-700 text-sm">© 2026 VoxApp</span>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
