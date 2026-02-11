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
  ChevronRight,
  Check,
  Star,
  Play,
  ArrowRight,
  PhoneIncoming,
  PhoneOutgoing,
  Zap,
  Shield,
  Globe,
  Mic,
  Menu,
  X,
  Bell,
  UserCheck,
  FileText,
  Send,
  Headphones,
} from 'lucide-react';

// Navigation Component
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VoxApp</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">Hoe het werkt</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Prijzen</a>
            <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
              Inloggen
            </a>
            <a href="/register" className="btn-primary text-sm py-2.5 px-5">
              Gratis proberen
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors py-2">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors py-2">Hoe het werkt</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors py-2">Prijzen</a>
              <a href="#faq" className="text-gray-300 hover:text-white transition-colors py-2">FAQ</a>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <a href="/login" className="text-gray-300 hover:text-white transition-colors font-medium py-2">Inloggen</a>
                <a href="/register" className="btn-primary text-center justify-center">
                  Gratis proberen
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="gradient-hero min-h-screen pt-20 lg:pt-24 relative overflow-hidden">
      {/* Background blobs */}
      <div className="blob blob-primary w-96 h-96 -top-48 -left-48 absolute" />
      <div className="blob blob-secondary w-80 h-80 top-1/3 right-0 absolute" />
      <div className="blob blob-primary w-64 h-64 bottom-0 left-1/4 absolute" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Nu beschikbaar in België, Nederland & Duitsland</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 animate-fade-in-up">
              Uw AI receptionist.{' '}
              <span className="gradient-text">24/7 bereikbaar.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up delay-100">
              Mis nooit meer een oproep. VoxApp neemt de telefoon op, boekt afspraken in uw agenda, 
              en beantwoordt vragen van klanten. Met uw eigen stem.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 animate-fade-in-up delay-200">
              <a href="/register" className="btn-primary text-base lg:text-lg py-4 px-8">
                Start gratis proefperiode
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#demo" className="btn-secondary text-base lg:text-lg py-4 px-8">
                <Play className="w-5 h-5" />
                Bekijk demo
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-400 animate-fade-in-up delay-300">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Geen contract</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Eerste maand gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Setup in 10 min</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-slide-right delay-200">
            <div className="dashboard-preview">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Welkom terug</p>
                  <h3 className="text-white text-lg font-semibold">Kapsalon Belle</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-semibold">KB</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="stat-card">
                  <div className="flex items-center gap-2 mb-1">
                    <PhoneIncoming className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-xs">Vandaag</span>
                  </div>
                  <p className="text-2xl font-bold text-white">24</p>
                  <p className="text-xs text-gray-500">oproepen</p>
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-gray-400 text-xs">Geboekt</span>
                  </div>
                  <p className="text-2xl font-bold text-white">18</p>
                  <p className="text-xs text-gray-500">afspraken</p>
                </div>
                <div className="stat-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-400 text-xs">Gespaard</span>
                  </div>
                  <p className="text-2xl font-bold text-white">2.4u</p>
                  <p className="text-xs text-gray-500">per dag</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <p className="text-gray-400 text-sm font-medium">Recente gesprekken</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Marie Van den Berg</p>
                      <p className="text-gray-500 text-xs">Afspraak geboekt - Knippen & Kleuren</p>
                    </div>
                    <span className="text-gray-500 text-xs">2 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Peter Janssen</p>
                      <p className="text-gray-500 text-xs">Vraag beantwoord - Openingsuren</p>
                    </div>
                    <span className="text-gray-500 text-xs">8 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Lisa de Groot</p>
                      <p className="text-gray-500 text-xs">Afspraak verzet naar morgen 14:00</p>
                    </div>
                    <span className="text-gray-500 text-xs">15 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -top-4 -right-4 glass rounded-xl p-4 animate-float shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Inkomende oproep</p>
                  <p className="text-gray-400 text-xs">AI beantwoordt...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}

// Logo Cloud Section
function LogoCloudSection() {
  const stats = [
    { value: '6.6M+', label: 'Potentiële klanten' },
    { value: '24/7', label: 'Beschikbaarheid' },
    { value: '10 min', label: 'Setup tijd' },
    { value: '3', label: 'Talen ondersteund' },
  ];

  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section with Tabs
function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: 'inbound',
      title: 'Inkomende oproepen',
      icon: PhoneIncoming,
      description: 'Uw AI receptionist beantwoordt elke oproep professioneel en vriendelijk.',
      items: [
        { icon: Phone, title: 'Beantwoord oproepen', desc: 'Professionele begroeting met uw bedrijfsnaam' },
        { icon: Calendar, title: 'Boek afspraken', desc: 'Direct in uw ingebouwde agenda, geen externe tools' },
        { icon: MessageSquare, title: 'Beantwoord vragen', desc: 'Openingsuren, prijzen, diensten - alles automatisch' },
        { icon: Send, title: 'Stuur bevestigingen', desc: 'SMS bevestiging direct na het boeken' },
      ],
    },
    {
      id: 'outbound',
      title: 'Uitgaande oproepen',
      icon: PhoneOutgoing,
      description: 'Proactieve communicatie met uw klanten, volledig geautomatiseerd.',
      items: [
        { icon: Bell, title: 'Herinneringen', desc: 'Automatische herinnering dag voor de afspraak' },
        { icon: Phone, title: 'Follow-ups', desc: 'Nabellen van gemiste oproepen' },
        { icon: Calendar, title: 'Herboekingen', desc: 'Klanten uitnodigen om opnieuw te boeken' },
        { icon: UserCheck, title: 'Bevestigingen', desc: 'Afspraakbevestiging vragen' },
      ],
    },
    {
      id: 'automation',
      title: 'Automatisering',
      icon: Zap,
      description: 'Administratie automatiseren zodat u zich kunt focussen op uw vak.',
      items: [
        { icon: FileText, title: 'Transcripties', desc: 'Elk gesprek wordt automatisch uitgeschreven' },
        { icon: BarChart3, title: 'Rapportages', desc: 'Inzicht in oproepen, afspraken en trends' },
        { icon: Users, title: 'Klantendatabase', desc: 'Automatisch bijgehouden contactgegevens' },
        { icon: Settings, title: 'Integraties', desc: 'Koppeling met uw bestaande tools' },
      ],
    },
  ];

  const activeFeature = features[activeTab];

  return (
    <section id="features" className="section bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-indigo-600 font-semibold mb-4">FEATURES</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Alles wat u nodig heeft.{' '}
            <span className="gradient-text">In één platform.</span>
          </h2>
          <p className="text-lg text-gray-600">
            VoxApp combineert AI-telefonie, agendabeheer en klantcommunicatie in één 
            gebruiksvriendelijk platform. Geen externe tools nodig.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => setActiveTab(index)}
              className={`tab-button flex items-center gap-2 ${activeTab === index ? 'active' : ''}`}
            >
              <feature.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{feature.title}</span>
            </button>
          ))}
        </div>

        {/* Feature Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Feature List */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeFeature.title}</h3>
            <p className="text-gray-600 mb-8">{activeFeature.description}</p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {activeFeature.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="feature-icon shrink-0 !w-12 !h-12 !mb-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-2xl p-8 lg:p-12">
              <div className="bg-white rounded-xl shadow-xl p-6">
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Inkomende oproep</p>
                        <p className="text-sm text-gray-600">+32 485 123 456</p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">Live</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">AI Transcript:</p>
                      <p className="text-gray-900">&quot;Goedemiddag, Kapsalon Belle, waarmee kan ik u helpen?&quot;</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">Afspraak boeken</span>
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded-full">Knippen</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">Morgen 14:00</span>
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-6 h-6 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Herinneringen vandaag</p>
                          <p className="text-sm text-gray-600">12 klanten gebeld</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-indigo-600">12</span>
                    </div>
                    <div className="space-y-2">
                      {['Marie V. - Bevestigd', 'Peter J. - Voicemail', 'Lisa G. - Verzet naar 15:00'].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-indigo-50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-indigo-600">847</p>
                        <p className="text-sm text-gray-600">Oproepen deze maand</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-green-600">92%</p>
                        <p className="text-sm text-gray-600">Succesvol afgehandeld</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">Populaire diensten</p>
                      <div className="space-y-2">
                        {[
                          { name: 'Knippen', pct: 45 },
                          { name: 'Kleuren', pct: 30 },
                          { name: 'Knippen & Kleuren', pct: 25 },
                        ].map((service, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{service.name}</span>
                              <span className="text-gray-500">{service.pct}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-indigo-500 rounded-full"
                                style={{ width: `${service.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Agenda USP Section
function AgendaSection() {
  return (
    <section className="section gradient-hero relative overflow-hidden">
      {/* Background elements */}
      <div className="blob blob-primary w-96 h-96 -top-48 right-0 absolute" />
      <div className="blob blob-secondary w-64 h-64 bottom-0 left-0 absolute" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Agenda Preview */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-gray-900">Februari 2026</h4>
                  <p className="text-sm text-gray-500">Week 7</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">Week</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">Maand</button>
                </div>
              </div>

              {/* Staff Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['Sarah', 'Lisa', 'Emma'].map((name, i) => (
                  <button
                    key={name}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      i === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                {[
                  { time: '09:00', client: 'Marie Van den Berg', service: 'Knippen', duration: '30 min', color: 'indigo' },
                  { time: '09:30', client: null, service: null, duration: null, color: null },
                  { time: '10:00', client: 'Peter Janssen', service: 'Knippen & Baard', duration: '45 min', color: 'cyan' },
                  { time: '10:45', client: 'Lisa de Groot', service: 'Kleuren', duration: '90 min', color: 'purple' },
                ].map((slot, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-sm text-gray-500 w-12">{slot.time}</span>
                    {slot.client ? (
                      <div className={`flex-1 p-3 rounded-lg bg-${slot.color}-50 border-l-4 border-${slot.color}-500`}
                        style={{
                          backgroundColor: slot.color === 'indigo' ? '#eef2ff' : slot.color === 'cyan' ? '#ecfeff' : '#faf5ff',
                          borderLeftColor: slot.color === 'indigo' ? '#6366f1' : slot.color === 'cyan' ? '#06b6d4' : '#a855f7'
                        }}
                      >
                        <p className="font-medium text-gray-900 text-sm">{slot.client}</p>
                        <p className="text-xs text-gray-600">{slot.service} • {slot.duration}</p>
                      </div>
                    ) : (
                      <div className="flex-1 p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <p className="text-sm text-gray-400">Beschikbaar</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Booking indicator */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">AI boekt nu een afspraak...</p>
                    <p className="text-xs text-green-600">Nieuwe klant: Jan Pieters - Knippen om 12:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-gray-300">Uniek bij VoxApp</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ingebouwde agenda.{' '}
              <span className="gradient-text">Geen externe tools.</span>
            </h2>

            <p className="text-lg text-gray-400 mb-8">
              Dit is wat ons onderscheidt. Uw AI receptionist boekt afspraken direct in de 
              VoxApp agenda. Geen Google Calendar, geen Outlook, geen sync-problemen. 
              Eén platform voor alles.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Dag, week en maand weergave',
                'Per medewerker met werkuren',
                'Diensten met duur & prijs',
                'Automatische SMS herinneringen',
                'Online booking pagina voor klanten',
                'Wachtlijst beheer',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <a href="/register" className="btn-primary inline-flex">
              Probeer de agenda gratis
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Account aanmaken',
      description: 'Registreer in 2 minuten. Kies uw sector en vul uw bedrijfsgegevens in.',
      icon: Users,
    },
    {
      number: '02',
      title: 'Diensten & medewerkers',
      description: 'Voeg uw diensten toe met prijzen en duur. Configureer werkuren per medewerker.',
      icon: Settings,
    },
    {
      number: '03',
      title: 'Stem kiezen of klonen',
      description: 'Kies een standaard stem of kloon uw eigen stem in 5 minuten.',
      icon: Mic,
    },
    {
      number: '04',
      title: 'Telefoonnummer koppelen',
      description: 'Krijg een nieuw nummer of koppel uw bestaande nummer via doorschakeling.',
      icon: Phone,
    },
  ];

  return (
    <section id="how-it-works" className="section bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-indigo-600 font-semibold mb-4">HOE HET WERKT</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Live in 10 minuten.{' '}
            <span className="gradient-text">Geen technische kennis nodig.</span>
          </h2>
          <p className="text-lg text-gray-600">
            Onze stap-voor-stap wizard begeleidt u door de setup. 
            Geen lange implementaties, geen IT-team nodig.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 z-0" 
                  style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }} 
                />
              )}
              
              <div className="card text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-4xl font-bold text-gray-200 absolute top-4 right-4">{step.number}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="/register" className="btn-primary inline-flex">
            Start nu - eerste maand gratis
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Voice Clone Section
function VoiceCloneSection() {
  return (
    <section className="section bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-100 rounded-full px-4 py-2 mb-6">
              <Mic className="w-4 h-4 text-indigo-600" />
              <span className="text-sm text-indigo-700 font-medium">Voice Cloning</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Uw AI klinkt als{' '}
              <span className="gradient-text">uzelf.</span>
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Klanten herkennen uw stem. Met onze voice cloning technologie 
              neemt uw AI receptionist op met een stem die precies klinkt als u. 
              Persoonlijk en professioneel.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">5 minuten opnemen</h4>
                  <p className="text-gray-600">Lees een korte tekst in en uw stem is gekloneerd.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">3 talen ondersteund</h4>
                  <p className="text-gray-600">Nederlands, Frans en Duits. Perfect voor de Benelux en DACH.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">100% veilig</h4>
                  <p className="text-gray-600">Uw stemdata wordt versleuteld opgeslagen en nooit gedeeld.</p>
                </div>
              </div>
            </div>

            <a href="/register" className="btn-primary inline-flex">
              Kloon uw stem gratis
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Right - Visualization */}
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 lg:p-12">
              <div className="bg-white rounded-xl shadow-xl p-6 text-center">
                {/* Waveform visualization */}
                <div className="w-24 h-24 rounded-full gradient-primary mx-auto mb-6 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                
                <h4 className="font-bold text-gray-900 mb-2">Stem klonen</h4>
                <p className="text-gray-600 text-sm mb-6">Lees de volgende tekst hardop voor:</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 italic">
                    &quot;Goedemiddag, welkom bij ons bedrijf. Waarmee kan ik u vandaag helpen?&quot;
                  </p>
                </div>

                {/* Fake waveform */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-indigo-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 40 + 10}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm text-gray-500">0:42 / 5:00</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-32">
                    <div className="h-2 bg-indigo-500 rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Studio kwaliteit</p>
                  <p className="text-xs text-gray-500">Powered by ElevenLabs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Sinds VoxApp mis ik geen enkele oproep meer. Mijn klanten zijn onder de indruk dat ze direct geholpen worden, ook als ik aan het knippen ben.",
      author: "Sarah de Vries",
      role: "Eigenaar, Kapsalon Belle",
      avatar: "SV",
    },
    {
      quote: "Vroeger verloor ik 30% van de reservaties omdat ik in de keuken stond. Nu boekt de AI alles automatisch in. Omzet is met 20% gestegen.",
      author: "Marco Rossi",
      role: "Chef, Ristorante Milano",
      avatar: "MR",
    },
    {
      quote: "De setup duurde letterlijk 10 minuten. Geen IT-gedoe, geen lange implementatie. Gewoon werken vanaf dag één.",
      author: "Dr. Lisa Janssen",
      role: "Tandarts, Smile Clinic Antwerpen",
      avatar: "LJ",
    },
    {
      quote: "Ik sta de hele dag onder auto's. VoxApp zorgt dat ik geen klanten meer mis. De voice clone klinkt echt als mij!",
      author: "Tom Hendricks",
      role: "Eigenaar, Garage Hendricks",
      avatar: "TH",
    },
    {
      quote: "Mijn secretaresse kan nu focussen op patiënten in de praktijk. De AI handelt alle telefonische afspraken perfect af.",
      author: "Dr. Peter Van Damme",
      role: "Huisarts, Huisartsenpraktijk Centrum",
      avatar: "PV",
    },
  ];

  return (
    <section className="section gradient-hero relative overflow-hidden">
      <div className="blob blob-primary w-80 h-80 -top-40 -right-40 absolute" />
      <div className="blob blob-secondary w-64 h-64 bottom-0 left-1/4 absolute" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-indigo-400 font-semibold mb-4">REVIEWS</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Geliefd door{' '}
            <span className="gradient-text">KMO&apos;s overal.</span>
          </h2>
        </div>

        {/* Reviews Slider */}
        <div className="review-slider">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="review-card card-dark">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">&quot;{testimonial.quote}&quot;</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white font-semibold">{testimonial.avatar}</span>
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '99',
      description: 'Perfect voor zelfstandigen en kleine praktijken.',
      minutes: '300',
      extraMinute: '0,40',
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
      price: '149',
      description: 'Voor groeiende teams met meerdere medewerkers.',
      minutes: '750',
      extraMinute: '0,35',
      features: [
        'Alles van Starter',
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
      price: '249',
      description: 'Voor grotere bedrijven met hoge volumes.',
      minutes: '1500',
      extraMinute: '0,30',
      features: [
        'Alles van Pro',
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
    <section id="pricing" className="section bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-indigo-600 font-semibold mb-4">PRIJZEN</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Eenvoudige, transparante{' '}
            <span className="gradient-text">prijzen.</span>
          </h2>
          <p className="text-lg text-gray-600">
            Geen verborgen kosten. Eerste maand gratis. Geen contract.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card ${plan.popular ? 'pricing-popular' : ''}`}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg text-gray-600">€</span>
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/maand</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {plan.minutes} minuten incl. • €{plan.extraMinute}/extra min
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'btn-primary w-full justify-center'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Start gratis proefperiode
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Grotere volumes of custom oplossingen nodig?{' '}
            <a href="/contact" className="text-indigo-600 font-semibold hover:underline">
              Neem contact op
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Hoe snel kan ik starten?',
      answer: 'Binnen 10 minuten. Onze setup wizard begeleidt u stap voor stap. U hoeft alleen uw bedrijfsgegevens, diensten en werkuren in te vullen. Geen technische kennis vereist.',
    },
    {
      question: 'Kan ik mijn bestaande telefoonnummer behouden?',
      answer: 'Ja! U kunt uw bestaande nummer doorschakelen naar uw VoxApp AI-nummer. Zo verandert er niets voor uw klanten. Wij helpen u gratis met de configuratie.',
    },
    {
      question: 'Hoe werkt de voice cloning?',
      answer: 'U leest 5 minuten een tekst in via onze app. Onze AI analyseert uw stem en creëert een digitale kopie die precies zo klinkt als u. Veilig, privé en van studio-kwaliteit.',
    },
    {
      question: 'Wat als de AI een vraag niet kan beantwoorden?',
      answer: 'De AI is getraind om vragen door te verbinden naar u of een voicemail achter te laten. U bepaalt zelf in de instellingen hoe dit werkt.',
    },
    {
      question: 'Welke talen worden ondersteund?',
      answer: 'Nederlands, Frans en Duits. De AI herkent automatisch in welke taal de beller spreekt en schakelt over. Perfect voor België en de grensregio\'s.',
    },
    {
      question: 'Is er een contract of opzegtermijn?',
      answer: 'Nee. U kunt maandelijks opzeggen, zonder opgaaf van reden. De eerste maand is volledig gratis — geen creditcard nodig om te starten.',
    },
    {
      question: 'Hoe zit het met privacy en GDPR?',
      answer: 'VoxApp is 100% GDPR-compliant. Alle data wordt versleuteld opgeslagen op Europese servers. Gesprekken worden automatisch verwijderd na 30 dagen, tenzij u anders instelt.',
    },
  ];

  return (
    <section id="faq" className="section bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-indigo-600 font-semibold mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Veelgestelde{' '}
            <span className="gradient-text">vragen.</span>
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <ChevronRight
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final CTA Section
function CTASection() {
  return (
    <section className="section gradient-hero relative overflow-hidden">
      <div className="blob blob-primary w-96 h-96 -top-48 left-1/4 absolute" />
      <div className="blob blob-secondary w-80 h-80 bottom-0 right-0 absolute" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Klaar om nooit meer een{' '}
            <span className="gradient-text">oproep te missen?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start vandaag nog met VoxApp. Eerste maand gratis, 
            geen contract, setup in 10 minuten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn-primary text-lg py-4 px-8">
              Start gratis proefperiode
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/contact" className="btn-secondary text-lg py-4 px-8">
              <Headphones className="w-5 h-5" />
              Praat met ons team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VoxApp</span>
            </div>
            <p className="text-gray-500 mb-6 max-w-sm">
              De AI-receptionist voor elke KMO. Mis nooit meer een oproep, 
              boek afspraken automatisch, en laat uw stem het werk doen.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Prijzen</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integraties</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
            </ul>
          </div>

          {/* Bedrijf */}
          <div>
            <h4 className="text-white font-semibold mb-4">Bedrijf</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Over ons</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vacatures</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 VoxApp. Alle rechten voorbehouden.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Voorwaarden</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function Home() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      <LogoCloudSection />
      <FeaturesSection />
      <AgendaSection />
      <HowItWorksSection />
      <VoiceCloneSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
