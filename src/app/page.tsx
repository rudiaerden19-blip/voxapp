'use client';

import { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
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
  PhoneOff,
  ShoppingBag,
} from 'lucide-react';

/* ============================================
   DEMO MODAL - Audio conversation with live transcript
============================================ */
function DemoModal({ isOpen, onClose, demoType = 'belle' }: { isOpen: boolean; onClose: () => void; demoType?: 'belle' | 'garage' | 'restaurant' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  // Demo conversations
  const belleConversation = [
    { speaker: 'receptionist', text: 'Hallo, met kapsalon Belle. Hoe kan ik u helpen?', audio: '/audio/b1.mp3' },
    { speaker: 'customer', text: 'Hallo, ik wil een afspraak maken voor knippen en verven.', audio: '/audio/s1.mp3' },
    { speaker: 'receptionist', text: 'Natuurlijk, wanneer zou u willen komen?', audio: '/audio/b2.mp3' },
    { speaker: 'customer', text: 'Donderdag.', audio: '/audio/s2.mp3' },
    { speaker: 'receptionist', text: 'Donderdag om 14 uur, kan dat?', audio: '/audio/b3.mp3' },
    { speaker: 'customer', text: 'Ja, dat kan.', audio: '/audio/s3.mp3' },
    { speaker: 'receptionist', text: 'Prima, mag ik uw naam?', audio: '/audio/b4.mp3' },
    { speaker: 'customer', text: 'Veerle.', audio: '/audio/s4.mp3' },
    { speaker: 'receptionist', text: 'Dank u, dat is genoteerd. U krijgt nog een smsje van ons, goed?', audio: '/audio/b5.mp3' },
    { speaker: 'customer', text: 'Perfect, bedankt.', audio: '/audio/s5.mp3' },
    { speaker: 'receptionist', text: 'Graag gedaan, tot donderdag!', audio: '/audio/b6.mp3' },
  ];

  const garageConversation = [
    { speaker: 'receptionist', text: 'Hallo, met garage Willems. Hoe kan ik u helpen?', audio: '/audio/g_r1.mp3' },
    { speaker: 'customer', text: 'Hallo meneer, ik had mijn wagen binnengebracht. Kan u eens zien of hij al klaar is?', audio: '/audio/g_c1.mp3' },
    { speaker: 'receptionist', text: 'Mag ik even uw nummerplaat, meneer?', audio: '/audio/g_r2.mp3' },
    { speaker: 'customer', text: 'AWS405, een grijze Ford Focus.', audio: '/audio/g_c2.mp3' },
    { speaker: 'receptionist', text: 'Ah ja, ik zie het. Uw wagen is klaar, meneer. U kan hem na 13 uur komen afhalen bij ons.', audio: '/audio/g_r3.mp3' },
    { speaker: 'customer', text: 'Ok, das goed. Dan kom ik hem straks halen.', audio: '/audio/g_c3.mp3' },
    { speaker: 'receptionist', text: 'Perfect, meneer. Tot straks!', audio: '/audio/g_r4.mp3' },
  ];

  const restaurantConversation = [
    { speaker: 'receptionist', text: 'Goeiedag, met restaurant De Molen. Wat kan ik voor u doen?', audio: '/audio/r_r1.mp3' },
    { speaker: 'customer', text: 'Goedemiddag, wij zouden graag willen reserveren voor morgen avond om 19u, is dat nog mogelijk?', audio: '/audio/r_c1.mp3' },
    { speaker: 'receptionist', text: 'Even kijken... ja, voor morgen avond kan nog perfect hoor meneer.', audio: '/audio/r_r2.mp3' },
    { speaker: 'customer', text: '4 personen.', audio: '/audio/r_c2.mp3' },
    { speaker: 'receptionist', text: 'Met 4 personen, ok dat is genoteerd meneer. Morgenavond om 19 uur voor 4 personen. U krijgt hier ook nog een smsje voor.', audio: '/audio/r_r3.mp3' },
    { speaker: 'customer', text: 'Tot morgen.', audio: '/audio/r_c3.mp3' },
  ];

  const conversation = demoType === 'garage' ? garageConversation : demoType === 'restaurant' ? restaurantConversation : belleConversation;

  // Stop audio when modal closes
  useEffect(() => {
    if (!isOpen && audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
  }, [isOpen, audioRef]);

  // Play audio and type text for current line
  useEffect(() => {
    if (isPlaying && currentLine < conversation.length) {
      const line = conversation[currentLine];
      setIsTyping(true);
      setTypingText('');
      
      // Play the audio
      const audio = new Audio(line.audio);
      setAudioRef(audio);
      audio.play();
      
      // When audio ends, move to next line
      audio.onended = () => {
        setIsTyping(false);
        setTimeout(() => {
          setCurrentLine(prev => prev + 1);
        }, 100); // Sneller naar volgende lijn
      };
      
      // Sync typing with audio duration - add delay for customer lines (real recordings may have silence at start)
      const fullText = line.text;
      let charIndex = 0;
      const startDelay = 0; // No delay
      
      const typingTimeout = setTimeout(() => {
        const typingInterval = setInterval(() => {
          if (charIndex < fullText.length) {
            setTypingText(fullText.slice(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typingInterval);
          }
        }, 50);
        
        // Store interval for cleanup
        (audio as unknown as { typingInterval: NodeJS.Timeout }).typingInterval = typingInterval;
      }, startDelay);

      return () => {
        clearTimeout(typingTimeout);
        if ((audio as unknown as { typingInterval: NodeJS.Timeout }).typingInterval) {
          clearInterval((audio as unknown as { typingInterval: NodeJS.Timeout }).typingInterval);
        }
        audio.pause();
      };
    }
  }, [isPlaying, currentLine]);

  useEffect(() => {
    if (isOpen) {
      setCurrentLine(0);
      setIsPlaying(false);
      setTypingText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlay = () => {
    setCurrentLine(0);
    setTypingText('');
    setIsPlaying(true);
  };

  const handleReplay = () => {
    // Stop any playing audio
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
    setCurrentLine(0);
    setTypingText('');
    setIsPlaying(true);
  };

  const isComplete = currentLine >= conversation.length;
  const currentSpeaker = currentLine < conversation.length ? conversation[currentLine].speaker : null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: 0,
        maxWidth: 480,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ padding: '32px 32px 24px', textAlign: 'center', background: '#fafafa' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'white',
            padding: '8px 16px',
            borderRadius: 20,
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              background: isPlaying ? '#22c55e' : '#9ca3af', 
              borderRadius: '50%',
              animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Live demo</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Luister mee hoe VoxApp een afspraak boekt voor Kapsalon Belle
          </p>
        </div>

        {/* Audio Visualizer */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Spinning audio indicator */}
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            animation: isPlaying ? 'spin 3s linear infinite' : 'none',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isPlaying ? (
                <Mic size={32} style={{ color: 'white' }} />
              ) : (
                <Phone size={32} style={{ color: 'white' }} />
              )}
            </div>
          </div>

          {/* Audio bars */}
          <div style={{ display: 'flex', gap: 4, height: 32, alignItems: 'center' }}>
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: isPlaying ? `${Math.random() * 24 + 8}px` : '8px',
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 3,
                  transition: 'height 0.15s ease',
                  animation: isPlaying ? `audioBar 0.5s ease-in-out ${i * 0.05}s infinite alternate` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Transcript area */}
        <div style={{
          padding: '24px 32px',
          minHeight: 180,
          maxHeight: 220,
          overflowY: 'auto',
          background: 'white',
        }}>
          {!isPlaying && currentLine === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, paddingTop: 20 }}>
              Klik op de knop hieronder om het gesprek te starten
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Completed lines */}
              {conversation.slice(0, currentLine).map((line, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: 0.5,
                    color: line.speaker === 'receptionist' ? '#16a34a' : '#2563eb',
                  }}>
                    {line.speaker === 'receptionist' ? 'Receptionist' : 'Klant'}
                  </span>
                  <span style={{ 
                    fontSize: 15, 
                    lineHeight: 1.5,
                    color: line.speaker === 'receptionist' ? '#15803d' : '#1d4ed8',
                  }}>
                    {line.text}
                  </span>
                </div>
              ))}
              
              {/* Currently typing line */}
              {isTyping && currentSpeaker && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ 
                    fontSize: 11, 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: 0.5,
                    color: currentSpeaker === 'receptionist' ? '#16a34a' : '#2563eb',
                  }}>
                    {currentSpeaker === 'receptionist' ? 'Receptionist' : 'Klant'}
                  </span>
                  <span style={{ 
                    fontSize: 15, 
                    lineHeight: 1.5,
                    color: currentSpeaker === 'receptionist' ? '#15803d' : '#1d4ed8',
                  }}>
                    {typingText}<span style={{ 
                      display: 'inline-block', 
                      width: 2, 
                      height: 16, 
                      background: currentSpeaker === 'receptionist' ? '#16a34a' : '#2563eb',
                      marginLeft: 2,
                      animation: 'blink 0.8s infinite',
                    }} />
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Button */}
        <div style={{ padding: '0 32px 32px', background: 'white' }}>
          {!isPlaying && !isComplete ? (
            <button 
              onClick={handlePlay}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '16px 32px',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              }}
            >
              Start live demo
            </button>
          ) : isComplete ? (
            <button 
              onClick={handleReplay}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: 12,
                padding: '16px 32px',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              <RefreshCw size={18} />
              Opnieuw afspelen
            </button>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontSize: 13,
              padding: '8px 0',
            }}>
              Gesprek bezig...
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{ 
          padding: '16px 32px', 
          background: '#fafafa', 
          textAlign: 'center',
          borderTop: '1px solid #f3f4f6',
        }}>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            Dit is een simulatie van hoe VoxApp uw telefoongesprekken afhandelt.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes audioBar {
          0% { height: 8px; }
          100% { height: 28px; }
        }
      `}</style>
    </div>
  );
}

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
function HeroSection({ onOpenDemo }: { onOpenDemo: () => void }) {
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
function InboundSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section id="features" style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
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
              <button onClick={onOpenDemo} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: '#1a1a2e',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}>
                <PhoneCall size={16} />
                Luister Demo Gesprek
              </button>
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
   FEATURE SECTION 2 - Restaurant Reservations
============================================ */
function RestaurantSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section style={{ background: '#f5f5f5', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <img 
                src="/restaurant.png"
                alt="Restaurant interieur"
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Right - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Restaurant Reserveringen
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              Mis nooit meer een reservering.
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              Uw receptionist neemt reserveringen aan, bevestigt beschikbaarheid en stuurt automatisch bevestigingen — 
              ook buiten de openingsuren.
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
              <button onClick={onOpenDemo} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: '#1a1a2e',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}>
                <PhoneCall size={16} />
                Luister Demo Gesprek
              </button>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: MessageSquare, text: 'Neem reserveringen aan 24/7' },
                { icon: Calendar, text: 'Check beschikbaarheid realtime' },
                { icon: Bell, text: 'Stuur automatische bevestigingen' },
                { icon: Users, text: 'Beheer groepsreserveringen' },
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
   FEATURE SECTION - Frituur Bestellingen
============================================ */
function FrituurSection() {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const conversation = useConversation({
    onConnect: () => setCallStatus('connected'),
    onDisconnect: () => setCallStatus('idle'),
    onError: (error) => {
      console.error('Conversation error:', error);
      setErrorMessage('Er ging iets mis. Probeer het opnieuw.');
      setCallStatus('error');
    },
    onModeChange: ({ mode }) => setIsSpeaking(mode === 'speaking'),
  });

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      setErrorMessage('');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Frituur De Schans agent
      await conversation.startSession({
        agentId: 'agent_4801khcaeveffx7tbayp097p54kh',
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setErrorMessage('Kon geen verbinding maken. Controleer je microfoon.');
      setCallStatus('error');
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
      setCallStatus('ended');
      setTimeout(() => setCallStatus('idle'), 1500);
    } catch (error) {
      setCallStatus('idle');
    }
  };

  const isActive = callStatus === 'connecting' || callStatus === 'connected';

  return (
    <section style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <img 
                src="/frituur.jpg"
                alt="Frituur met verse friet"
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Right - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              Frituren & Afhaalzaken
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              Bestellingen opnemen via spraak.
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              Klanten bellen of spreken hun bestelling in. De AI noteert alles correct, 
              berekent de prijs en geeft een afhaaltijd — zonder wachtrij.
            </p>

            {/* Live Call Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
              {!isActive ? (
                <>
                  <button 
                    onClick={startCall}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: callStatus === 'error' ? '#ef4444' : '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: 100,
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      boxShadow: `0 0 30px ${callStatus === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Phone size={32} />
                  </button>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>
                    Klik om te bestellen bij Frituur De Schans
                  </p>
                  {errorMessage && (
                    <p style={{ color: '#ef4444', fontSize: 13 }}>{errorMessage}</p>
                  )}
                </>
              ) : (
                <>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={endCall}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 100,
                        width: 80,
                        height: 80,
                        cursor: 'pointer',
                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
                        animation: isSpeaking ? 'pulse 1.5s infinite' : 'none',
                      }}
                    >
                      <PhoneOff size={32} />
                    </button>
                    {callStatus === 'connecting' && (
                      <div style={{
                        position: 'absolute',
                        inset: -6,
                        border: '3px solid #22c55e',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                    )}
                  </div>
                  <p style={{ color: '#1a1a2e', fontSize: 14, fontWeight: 500 }}>
                    {callStatus === 'connecting' ? 'Verbinden met Frituur De Schans...' : 
                     isSpeaking ? 'Medewerker spreekt...' : 'Spreek uw bestelling in...'}
                  </p>
                </>
              )}
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: MessageSquare, text: 'Neemt bestellingen aan via telefoon' },
                { icon: Clock, text: 'Berekent automatisch afhaaltijd' },
                { icon: Check, text: 'Bevestigt bestelling + totaalprijs' },
                { icon: Bell, text: 'SMS bevestiging naar klant' },
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
   FEATURE SECTION 3 - Outbound Calls
============================================ */
function OutboundSection() {
  return (
    <section style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Professional Calendar - Hidden on mobile */}
          <div style={{ position: 'relative' }} className="hidden md:block">
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
    <section style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
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
   TRY LIVE SECTION - Test the AI receptionist
============================================ */
function TryLiveSection() {
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const conversationRef = useRef<ReturnType<typeof useConversation> | null>(null);

  // We'll use the hook at component level
  const conversation = useConversation({
    onConnect: () => {
      setCallStatus('connected');
    },
    onDisconnect: () => {
      setCallStatus('idle');
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setErrorMessage('Er ging iets mis. Probeer het opnieuw.');
      setCallStatus('error');
    },
    onModeChange: ({ mode }) => {
      setIsSpeaking(mode === 'speaking');
    },
  });

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      setErrorMessage('');
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation with the agent
      await conversation.startSession({
        agentId: 'agent_7001kh7ck6cvfpqvrt1gc63bs88k',
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setErrorMessage('Kon geen verbinding maken. Controleer of je microfoon toegang hebt gegeven.');
      setCallStatus('error');
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
      setCallStatus('ended');
      setTimeout(() => setCallStatus('idle'), 1500);
    } catch (error) {
      console.error('Failed to end call:', error);
      setCallStatus('idle');
    }
  };

  const isActive = callStatus === 'connecting' || callStatus === 'connected';

  return (
    <section style={{ background: '#1a1a2e', padding: '120px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          Probeer Het Zelf
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
          Bel nu met onze receptionist
        </h2>
        <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.7, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
          Test zelf hoe natuurlijk onze receptionist klinkt. Probeer een afspraak te maken of stel een vraag.
        </p>

        {/* Call Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {!isActive ? (
            <>
              <button 
                onClick={startCall}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  background: callStatus === 'error' ? '#ef4444' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: 100,
                  width: 120,
                  height: 120,
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 0 40px ${callStatus === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Phone size={40} />
              </button>
              {errorMessage && (
                <p style={{ color: '#ef4444', fontSize: 14, maxWidth: 300 }}>
                  {errorMessage}
                </p>
              )}
              {callStatus === 'ended' && (
                <p style={{ color: '#22c55e', fontSize: 14 }}>
                  Gesprek beëindigd. Bedankt voor het testen!
                </p>
              )}
              {callStatus === 'idle' && !errorMessage && (
                <p style={{ color: '#6b7280', fontSize: 14 }}>
                  Klik om te bellen • Gratis • Geen registratie nodig
                </p>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              {/* Call Status */}
              <div style={{
                background: callStatus === 'connected' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                border: `2px solid ${callStatus === 'connected' ? '#22c55e' : '#f97316'}`,
                borderRadius: 20,
                padding: '40px 60px',
                minWidth: 'min(300px, 90vw)',
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: callStatus === 'connected' ? '#22c55e' : '#f97316',
                    animation: 'pulse 1.5s infinite',
                  }} />
                  <span style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>
                    {callStatus === 'connecting' && 'Verbinden...'}
                    {callStatus === 'connected' && (isSpeaking ? 'Receptionist spreekt...' : 'Receptionist luistert...')}
                  </span>
                </div>
                
                {callStatus === 'connected' && (
                  <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 0 }}>
                    {isSpeaking ? 'Even wachten...' : 'Spreek nu, de receptionist luistert'}
                  </p>
                )}
              </div>

              {/* Audio Visualizer */}
              {callStatus === 'connected' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 40 }}>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: isSpeaking ? `${20 + Math.random() * 20}px` : '8px',
                        background: isSpeaking ? '#22c55e' : '#6b7280',
                        borderRadius: 3,
                        transition: 'height 0.1s ease',
                        animation: isSpeaking ? `audioWave 0.5s infinite ${i * 0.1}s` : 'none',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* End Call Button */}
              <button 
                onClick={endCall}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 100,
                  width: 80,
                  height: 80,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <PhoneOff size={32} />
              </button>
            </div>
          )}
        </div>

        {/* Example prompts */}
        {!isActive && callStatus !== 'ended' && (
          <div style={{ marginTop: 48 }}>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>Probeer bijvoorbeeld:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {[
                '"Ik wil een afspraak maken"',
                '"Wat zijn jullie prijzen?"',
                '"Zijn jullie morgen open?"',
              ].map((prompt, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  padding: '8px 16px',
                  color: '#9ca3af',
                  fontSize: 13,
                }}>
                  {prompt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation for audio wave */}
      <style>{`
        @keyframes audioWave {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
      `}</style>
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
    <section id="how-it-works" style={{ background: '#0f0a14', padding: '200px 0' }}>
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
      appointments: '~150',
      extra: '0,40',
      features: ['Receptionist 24/7', 'Ingebouwde agenda', '1 medewerker', 'SMS bevestigingen', 'Gesprekstranscripties', 'Email support'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '149',
      desc: 'Voor groeiende teams.',
      minutes: '750',
      appointments: '~375',
      extra: '0,35',
      features: ['Alles van Starter, plus:', '5 medewerkers', 'Voice cloning', 'Uitgaande herinneringen', 'Online booking pagina', 'Priority support'],
      popular: true,
    },
    {
      name: 'Business',
      price: '249',
      desc: 'Voor grotere bedrijven.',
      minutes: '1500',
      appointments: '~750',
      extra: '0,30',
      features: ['Alles van Pro, plus:', 'Onbeperkt medewerkers', 'Meerdere locaties', 'API toegang', 'Custom integraties', 'Account manager'],
      popular: false,
    },
  ];

  return (
    <section id="pricing" style={{ background: '#e3e3e3', padding: '200px 0' }}>
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
              background: '#ffffff',
              border: plan.popular ? '2px solid #f97316' : '1px solid #d1d5db',
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

              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>{plan.name}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{plan.desc}</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 18, color: '#9ca3af' }}>€</span>
                <span style={{ fontSize: 48, fontWeight: 700, color: '#f97316' }}>{plan.price}</span>
                <span style={{ fontSize: 16, color: '#9ca3af' }}>/maand</span>
              </div>

              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                {plan.appointments} afspraken/maand<br />
                <span style={{ fontSize: 12 }}>({plan.minutes} min incl. • €{plan.extra}/extra min)</span>
              </p>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', fontSize: 14, color: '#374151' }}>
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
                color: plan.popular ? 'white' : '#1a1a2e',
                padding: '14px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                border: plan.popular ? 'none' : '1px solid #d1d5db',
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
    <section style={{ background: '#1a1025', padding: '200px 0' }}>
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
    <section style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>
          Klaar om nooit meer een <span style={{ color: '#f97316' }}>oproep te missen?</span>
        </h2>
        <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 40 }}>
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
            color: '#1a1a2e',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid #d1d5db',
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
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoType, setDemoType] = useState<'belle' | 'garage' | 'restaurant'>('belle');

  const openBelleDemo = () => {
    setDemoType('belle');
    setDemoOpen(true);
  };

  const openGarageDemo = () => {
    setDemoType('garage');
    setDemoOpen(true);
  };

  const openRestaurantDemo = () => {
    setDemoType('restaurant');
    setDemoOpen(true);
  };
  
  return (
    <main>
      <Navigation />
      <HeroSection onOpenDemo={openBelleDemo} />
      <InboundSection onOpenDemo={openGarageDemo} />
      <RestaurantSection onOpenDemo={openRestaurantDemo} />
      <FrituurSection />
      <OutboundSection />
      <AutomationSection />
      <TryLiveSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} demoType={demoType} />
    </main>
  );
}
