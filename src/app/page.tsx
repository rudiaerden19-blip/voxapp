'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useLanguage, Language } from '@/lib/LanguageContext';

// Force scroll to top on page load/refresh
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}
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
  ChevronDown,
  PhoneCall,
  CalendarCheck,
  UserCheck,
  FileText,
  Heart,
  Globe,
  RefreshCw,
  PhoneOff,
  ShoppingBag,
  MapPin,
} from 'lucide-react';

/* ============================================
   DEMO MODAL - Audio conversation with live transcript
============================================ */
function DemoModal({ isOpen, onClose, demoType = 'belle' }: { isOpen: boolean; onClose: () => void; demoType?: 'belle' | 'garage' | 'restaurant' }) {
  const { t } = useLanguage();
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
    { speaker: 'receptionist', text: 'Ik ga even kijken... ja, uw wagen staat klaar om afgehaald te worden meneer, u kan hem na 13 uur komen halen.', audio: '/audio/g_r3.mp3' },
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
      padding: 16,
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: 0,
        maxWidth: 420,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Close button - fixed at top */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#1a1a2e',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: 'white',
            zIndex: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', textAlign: 'center', background: '#fafafa', flexShrink: 0 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'white',
            padding: '6px 12px',
            borderRadius: 16,
            marginBottom: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ 
              width: 6, 
              height: 6, 
              background: isPlaying ? '#22c55e' : '#9ca3af', 
              borderRadius: '50%',
              animation: isPlaying ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{t('demoModal.liveDemo')}</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            {t('demoModal.listenDescription')}
          </p>
        </div>

        {/* Audio Visualizer */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          {/* Spinning audio indicator */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            animation: isPlaying ? 'spin 3s linear infinite' : 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isPlaying ? (
                <Mic size={24} style={{ color: 'white' }} />
              ) : (
                <Phone size={24} style={{ color: 'white' }} />
              )}
            </div>
          </div>

          {/* Audio bars */}
          <div style={{ display: 'flex', gap: 3, height: 24, alignItems: 'center' }}>
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: isPlaying ? `${Math.random() * 18 + 6}px` : '6px',
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
          padding: '16px 20px',
          minHeight: 120,
          maxHeight: 160,
          overflowY: 'auto',
          background: 'white',
          flex: 1,
        }}>
          {!isPlaying && currentLine === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, paddingTop: 20 }}>
              {t('demoModal.clickToStart')}
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
                    {line.speaker === 'receptionist' ? t('demoModal.receptionist') : t('demoModal.customer')}
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
                    {currentSpeaker === 'receptionist' ? t('demoModal.receptionist') : t('demoModal.customer')}
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
        <div style={{ padding: '0 20px 16px', background: 'white', flexShrink: 0 }}>
          {!isPlaying && !isComplete ? (
            <button 
              onClick={handlePlay}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              }}
            >
              {t('demoModal.startLiveDemo')}
            </button>
          ) : isComplete ? (
            <button 
              onClick={handleReplay}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: 10,
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <RefreshCw size={16} />
              {t('demoModal.playAgain')}
            </button>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              fontSize: 12,
              padding: '4px 0',
            }}>
              {t('demoModal.callInProgress')}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{ 
          padding: '12px 20px', 
          background: '#fafafa', 
          textAlign: 'center',
          borderTop: '1px solid #f3f4f6',
          flexShrink: 0,
        }}>
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
            {t('demoModal.simulationNote')}
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
   LANGUAGE SELECTOR
============================================ */
function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];
  
  const current = languages.find(l => l.code === language) || languages[0];
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '8px 12px',
          color: 'white',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        <span style={{ fontSize: 18 }}>{current.flag}</span>
        <ChevronDown size={16} style={{ opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </button>
      
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 150 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            background: '#1a1520',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 8,
            minWidth: 160,
            zIndex: 200,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  background: language === lang.code ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <Check size={16} color="#f97316" style={{ marginLeft: 'auto' }} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================
   NAVIGATION
============================================ */
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

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
              <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>{t('nav.features')}</a>
              <a href="#how-it-works" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>{t('nav.howItWorks')}</a>
              <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>{t('nav.pricing')}</a>
              <a href="#contact" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>{t('nav.contact')}</a>
              <a href="/over-ons" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>{t('nav.aboutUs')}</a>
            </div>

            <div style={{ display: 'none', alignItems: 'center', gap: 16 }} className="desktop-nav">
              <LanguageSelector />
              <a href="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: 15 }}>{t('nav.login')}</a>
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
                {t('nav.tryFree')}
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
          <a href="#features" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{t('nav.features')}</a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{t('nav.howItWorks')}</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{t('nav.pricing')}</a>
          <a href="#contact" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{t('nav.contact')}</a>
          <a href="/over-ons" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '16px 0', color: 'white', textDecoration: 'none', fontSize: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{t('nav.aboutUs')}</a>
          <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <LanguageSelector />
          </div>
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
              {t('nav.tryFree')} <ArrowRight size={18} />
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
  const { t } = useLanguage();
  return (
    <section id="hero" style={{
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
          <span style={{ color: '#9ca3af', fontSize: 14 }}>{t('hero.badge')}</span>
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
              {t('hero.title1')}<br />
              {t('hero.title2')}<br />
              <span style={{ color: '#f97316' }}>{t('hero.title3')}</span>
            </h1>

            <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.7, marginBottom: 12 }}>
              {t('hero.subtitle')}
            </p>
            <p style={{ fontSize: 16, color: '#f97316', fontWeight: 500, marginBottom: 32 }}>
              {t('hero.tagline')}
            </p>

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
                alt={t('hero.professionalReceptionist')}
                className="hero-image"
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>

            {/* Floating Chat Bubble - Top Right - Hidden on mobile */}
            <div className="hero-floating-chat" style={{
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
                <span style={{ fontSize: 12, color: '#6b7280' }}>{t('hero.receptionist')}</span>
              </div>
              <p style={{ fontSize: 14, color: '#1a1a2e', margin: 0 }}>
                &quot;{t('hero.greeting')}&quot;
              </p>
            </div>

            {/* Action Badges - Right Side - Hidden on mobile */}
            <div className="hero-floating-badges" style={{ position: 'absolute', top: 160, right: -30, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Check, text: t('hero.receptionistAnswers'), color: '#22c55e' },
                { icon: CalendarCheck, text: t('hero.appointmentScheduled'), color: '#f97316' },
                { icon: Send, text: t('hero.confirmationSent'), color: '#3b82f6' },
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
   FOR WHO SECTION - Business Types Grid
============================================ */
function ForWhoSection() {
  const { t } = useLanguage();
  const businesses = [
    { icon: '💇', key: 'kapsalons' },
    { icon: '👨‍⚕️', key: 'dokterspraktijken' },
    { icon: '🏥', key: 'ziekenhuizen' },
    { icon: '🏨', key: 'hotels' },
    { icon: '🍟', key: 'frituren' },
    { icon: '🥙', key: 'kebabzaken' },
    { icon: '🍕', key: 'pizzerias' },
    { icon: '🍝', key: 'restaurants' },
    { icon: '🦷', key: 'tandartsen' },
    { icon: '👁️', key: 'opticiens' },
    { icon: '💆', key: 'beautysalons' },
    { icon: '🏋️', key: 'fitnessstudios' },
    { icon: '🚗', key: 'garages' },
    { icon: '🏠', key: 'immobilienkantoren' },
    { icon: '⚖️', key: 'advocatenkantoren' },
    { icon: '📊', key: 'boekhoudkantoren' },
    { icon: '🐕', key: 'dierenklinieken' },
    { icon: '💐', key: 'bloemenwinkels' },
    { icon: '🧹', key: 'schoonmaakbedrijven' },
    { icon: '🔧', key: 'loodgieters' },
  ];

  return (
    <section style={{ background: '#f5f5f5', padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span style={{ color: '#f97316', fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            {t('forWho.badge')}
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', margin: '12px 0 16px 0' }}>
            {t('forWho.title1')} <span style={{ color: '#f97316' }}>{t('forWho.title2')}</span>
          </h2>
          <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 600, margin: '0 auto' }}>
            {t('forWho.subtitle')}
          </p>
          <p style={{ fontSize: 'clamp(20px, 3vw, 28px)', color: '#f97316', fontWeight: 700, maxWidth: 800, margin: '24px auto 0', lineHeight: 1.4 }}>
            Al bewezen door talrijke bedrijven: 80% minder kosten, 40% meer omzet
          </p>
        </div>

        <div className="for-who-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: 20,
        }}>
          {businesses.map((b, i) => (
            <div 
              key={i}
              style={{
                background: 'white',
                borderRadius: 12,
                padding: '24px 20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>{b.icon}</span>
              <p style={{ margin: 0, fontWeight: 600, color: '#1a1a2e', fontSize: 15 }}>{t(`forWho.businesses.${b.key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURE SECTION 1 - Inbound Calls
============================================ */
function InboundSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  const { t } = useLanguage();

  return (
    <section id="features" style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('inbound.badge')}
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              {t('inbound.title')}
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              {t('inbound.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
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
                {t('inbound.startFree')}
              </a>
              <button onClick={onOpenDemo} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              }}>
                <PhoneCall size={16} />
                {t('inbound.listenDemo')}
              </button>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: MessageSquare, key: 'feature1' },
                { icon: Calendar, key: 'feature2' },
                { icon: PhoneCall, key: 'feature3' },
                { icon: Users, key: 'feature4' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <item.icon size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: 15, color: '#1a1a2e' }}>{t(`inbound.${item.key}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <img 
                src="/garage.png"
                alt={t('inbound.garageWorkshop')}
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
  const { t } = useLanguage();

  return (
    <section style={{ background: '#f5f5f5', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <img 
                src="/restaurant.png"
                alt={t('restaurant.restaurantInterior')}
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Right - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('restaurant.badge')}
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              {t('restaurant.title')}
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              {t('restaurant.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
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
                {t('inbound.startFree')}
              </a>
              <button onClick={onOpenDemo} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
              }}>
                <PhoneCall size={16} />
                {t('inbound.listenDemo')}
              </button>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: MessageSquare, key: 'feature1' },
                { icon: Calendar, key: 'feature2' },
                { icon: Bell, key: 'feature3' },
                { icon: Users, key: 'feature4' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <item.icon size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: 15, color: '#1a1a2e' }}>{t(`restaurant.${item.key}`)}</span>
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
  const { t } = useLanguage();
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedDemoLang, setSelectedDemoLang] = useState<'nl' | 'en' | 'fr' | 'de'>('nl');

  const demoLanguages = [
    { code: 'nl' as const, flag: '🇳🇱', label: 'NL' },
    { code: 'en' as const, flag: '🇬🇧', label: 'EN' },
    { code: 'fr' as const, flag: '🇫🇷', label: 'FR' },
    { code: 'de' as const, flag: '🇩🇪', label: 'DE' },
  ];

  // Frituur agent IDs per language
  const frituurAgents: Record<string, string> = {
    nl: 'agent_4801khcaeveffx7tbayp097p54kh',
    en: 'agent_0201khethnnte7gbgw1hebcyhjq5',
    fr: 'agent_8501khetjab0fcvs299t4mj89sfm',
    de: 'agent_1801khetjxk3e8s9xmg8xqadjjnk',
  };

  const conversation = useConversation({
    onConnect: () => setCallStatus('connected'),
    onDisconnect: () => setCallStatus('idle'),
    onError: (error) => {
      console.error('Conversation error:', error);
      setErrorMessage(t('frituur.errorMessage'));
      setCallStatus('error');
    },
    onModeChange: ({ mode }) => setIsSpeaking(mode === 'speaking'),
  });

  const startCall = async () => {
    try {
      setCallStatus('connecting');
      setErrorMessage('');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Frituur De Schans agent - use selected language
      await conversation.startSession({
        agentId: frituurAgents[selectedDemoLang],
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setErrorMessage(t('frituur.micError'));
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
                alt={t('frituur.frituurImage')}
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Right - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('frituur.badge')}
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              {t('frituur.title')}
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              {t('frituur.subtitle')}
            </p>

            {/* Live Call Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, marginBottom: 32 }}>
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
                      boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)',
                      animation: 'breathe 2s ease-in-out infinite',
                    }}
                  >
                    <Phone size={32} />
                  </button>
                  {/* Language selector for demo */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {demoLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedDemoLang(lang.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: selectedDemoLang === lang.code ? '2px solid #f97316' : '1px solid #d1d5db',
                          background: selectedDemoLang === lang.code ? '#fff7ed' : 'white',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: selectedDemoLang === lang.code ? 600 : 400,
                          color: selectedDemoLang === lang.code ? '#f97316' : '#6b7280',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                  <p style={{ color: '#f97316', fontSize: 14, fontWeight: 500 }}>
                    {t('frituur.clickToOrder')}
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
                    {callStatus === 'connecting' ? t('frituur.connecting') : 
                     isSpeaking ? t('frituur.staffSpeaking') : t('frituur.speakOrder')}
                  </p>
                </>
              )}
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: MessageSquare, key: 'feature1' },
                { icon: Clock, key: 'feature2' },
                { icon: Check, key: 'feature3' },
                { icon: Bell, key: 'feature4' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <item.icon size={18} style={{ color: '#6b7280' }} />
                  <span style={{ fontSize: 15, color: '#1a1a2e' }}>{t(`frituur.${item.key}`)}</span>
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
   KASSA SCHERM SECTIE - Bestelling Demo
============================================ */
function KassaSection() {
  const { t, language } = useLanguage();
  return (
    <section style={{ background: '#1a1a2e', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header Text */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('kassa.badge')}
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 20 }}>
            {t('kassa.title1')}<br />
            <span style={{ color: '#f97316' }}>{t('kassa.title2')}</span>
          </h2>
          <p style={{ fontSize: 16, color: '#9ca3af', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            {t('kassa.subtitle')}
          </p>
          <p style={{ fontSize: 15, color: '#f97316', fontWeight: 500, maxWidth: 600, margin: '16px auto 0' }}>
            {t('kassa.smsInfo')}
          </p>
        </div>

        {/* Kassa Screen + Bon Printer */}
        <div className="kassa-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'start' }}>
          
          {/* Kassa Scherm */}
          <div style={{
            background: '#0a0a0a',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            border: '4px solid #333',
          }}>
            {/* Screen Header */}
            <div style={{ background: '#f97316', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Frituur De Schans</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{t('kassa.kassa')}</span>
            </div>
            
            {/* New Order Alert */}
            <div style={{ background: '#22c55e', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bell size={18} style={{ color: 'white' }} />
              <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{t('kassa.newOrder')}</span>
            </div>

            {/* Order Content */}
            <div style={{ padding: 20 }}>
              {/* Customer Info */}
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #333' }}>
                <p style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>{t('kassa.customer')}</p>
                <p style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>Jan Peeters</p>
                <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0 0' }}>Kerkstraat 42, 2000 Antwerpen</p>
                <p style={{ color: '#9ca3af', fontSize: 14, margin: '2px 0 0 0' }}>0471 23 45 67</p>
              </div>

              {/* Order Type + Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ 
                  display: 'inline-block',
                  background: '#3b82f6', 
                  color: 'white', 
                  padding: '6px 14px', 
                  borderRadius: 20, 
                  fontSize: 12, 
                  fontWeight: 600,
                }}>
                  {t('kassa.deliver')}
                </div>
                <div style={{ color: '#f97316', fontSize: 14, fontWeight: 600 }}>
                  {t('kassa.at')} 16:00
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', marginBottom: 10 }}>{t('kassa.order')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                    <span>1x Grote Friet + Mayonaise</span>
                    <span style={{ color: '#22c55e' }}>€4,50</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                    <span>1x Frikandel</span>
                    <span style={{ color: '#22c55e' }}>€2,50</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                    <span>1x Cola (blikje)</span>
                    <span style={{ color: '#22c55e' }}>€2,00</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div style={{ 
                background: '#1a1a1a', 
                margin: '0 -20px -20px', 
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: '#9ca3af', fontSize: 14 }}>{t('kassa.total')}</span>
                <span style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>€9,00</span>
              </div>
            </div>
          </div>

          {/* Bon Printer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Printer */}
            <div style={{
              background: '#2a2a2a',
              borderRadius: '12px 12px 0 0',
              padding: '20px 30px 10px',
              width: '100%',
              maxWidth: 280,
              position: 'relative',
            }}>
              <div style={{ 
                background: '#1a1a1a', 
                height: 8, 
                borderRadius: 4, 
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ width: '60%', height: 2, background: '#333' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: 10, textTransform: 'uppercase' }}>{t('kassa.bonPrinter')}</span>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>

            {/* Receipt/Bon */}
            <div style={{
              background: '#fffef5',
              width: '100%',
              maxWidth: 280,
              padding: 20,
              fontFamily: 'monospace',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative',
            }}>
              {/* Torn edge effect */}
              <div style={{
                position: 'absolute',
                top: -8,
                left: 0,
                right: 0,
                height: 8,
                background: 'linear-gradient(135deg, #fffef5 25%, transparent 25%), linear-gradient(-135deg, #fffef5 25%, transparent 25%)',
                backgroundSize: '16px 16px',
              }} />

              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1a1a2e' }}>FRITUUR DE SCHANS</p>
                <p style={{ fontSize: 10, color: '#666', margin: '4px 0 0 0' }}>Marktplein 15, 2000 Antwerpen</p>
                <p style={{ fontSize: 10, color: '#666', margin: '2px 0 0 0' }}>Tel: 03 123 45 67</p>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '12px 0', marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: '#666', margin: '0 0 4px 0' }}>{t('kassa.orderNr')}1247</p>
                <p style={{ fontSize: 10, color: '#666', margin: 0 }}>14-02-2026 15:23</p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, margin: '0 0 6px 0', color: '#1a1a2e' }}>{language === 'nl' ? 'KLANT:' : language === 'en' ? 'CUSTOMER:' : language === 'fr' ? 'CLIENT:' : 'KUNDE:'} Jan Peeters</p>
                <p style={{ fontSize: 10, color: '#666', margin: 0 }}>Kerkstraat 42, 2000 Antwerpen</p>
                <p style={{ fontSize: 10, color: '#666', margin: '2px 0 0 0' }}>{language === 'nl' ? 'LEVEREN om' : language === 'en' ? 'DELIVER at' : language === 'fr' ? 'LIVRER à' : 'LIEFERN um'} 16:00</p>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: '#1a1a2e' }}>
                  <span>1x {language === 'nl' ? 'Grote Friet + Mayo' : language === 'en' ? 'Large Fries + Mayo' : language === 'fr' ? 'Grandes Frites + Mayo' : 'Große Pommes + Mayo'}</span>
                  <span>€4,50</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: '#1a1a2e' }}>
                  <span>1x Frikandel</span>
                  <span>€2,50</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#1a1a2e' }}>
                  <span>1x Cola ({language === 'nl' ? 'blikje' : language === 'en' ? 'can' : language === 'fr' ? 'canette' : 'Dose'})</span>
                  <span>€2,00</span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed #ccc', paddingTop: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
                  <span>{t('kassa.total')}</span>
                  <span>€9,00</span>
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: 10, color: '#999', marginTop: 16, marginBottom: 0 }}>
                {t('kassa.thankYou')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   ROI CALCULATOR SECTIE
============================================ */
function ROICalculatorSection() {
  const { t } = useLanguage();
  const [maandsalaris, setMaandsalaris] = useState(2500);
  const [aantalFTE, setAantalFTE] = useState(1);

  // VoxApp kosten (Starter pakket - vast bedrag)
  const voxAppPlan = 'Starter';
  const voxAppKostenPerMaand = 99;
  const totaalVoxAppPerJaar = voxAppKostenPerMaand * 12; // €1.188 per jaar

  // Huidige kosten personeel = bruto salaris x 12 x FTE
  const jaarlijksePersoneelskosten = maandsalaris * 12 * aantalFTE;
  
  // Totale huidige kosten
  const totaleHuidigeKosten = jaarlijksePersoneelskosten;
  
  // Besparing
  const jaarlijkseBesparing = Math.max(0, totaleHuidigeKosten - totaalVoxAppPerJaar);
  const maandelijkseBesparing = jaarlijkseBesparing / 12;
  const roi = totaleHuidigeKosten > 0 ? Math.round((jaarlijkseBesparing / totaleHuidigeKosten) * 100) : 0;
  const terugverdientijd = jaarlijkseBesparing > 0 ? (totaalVoxAppPerJaar / (jaarlijkseBesparing / 12)) : 0;

  return (
    <section style={{ background: '#0f0a14', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            {t('roi.title1')} <span style={{ color: '#22c55e' }}>ROI</span> {t('roi.title2')}
          </h2>
          <p style={{ fontSize: 16, color: '#9ca3af', maxWidth: 600, margin: '0 auto' }}>
            {t('roi.subtitle')}
          </p>
        </div>

        <div className="roi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
          {/* Left - Sliders */}
          <div style={{ background: '#1a1025', borderRadius: 16, padding: 32 }}>
            <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Settings size={20} style={{ color: '#9ca3af' }} />
              {t('roi.currentSituation')}
            </h3>

            {/* Maandsalaris */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ color: '#9ca3af', fontSize: 14 }}>{t('roi.grossSalary')}</label>
                <span style={{ color: 'white', fontWeight: 600 }}>€{maandsalaris.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1500" 
                max="4000" 
                step="100"
                value={maandsalaris}
                onChange={(e) => setMaandsalaris(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Aantal FTE */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ color: '#9ca3af', fontSize: 14 }}>{t('roi.numberOfFTE')}</label>
                <span style={{ color: 'white', fontWeight: 600 }}>{aantalFTE}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="1"
                value={aantalFTE}
                onChange={(e) => setAantalFTE(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Berekening */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, marginTop: 8 }}>
              <h4 style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{t('roi.calculation')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>{t('roi.salaryX12')}</span>
                  <span style={{ color: 'white', fontSize: 13 }}>€{(maandsalaris * 12).toLocaleString()}{t('roi.perYear')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>x {aantalFTE} FTE</span>
                  <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 600 }}>€{Math.round(jaarlijksePersoneelskosten).toLocaleString()}{t('roi.perYear')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Besparing Card */}
            <div style={{ background: '#1a1025', borderRadius: 16, padding: 32, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                {t('roi.directSavings')}
              </p>
              <p style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, color: '#22c55e', margin: '0 0 8px 0' }}>
                €{Math.max(0, Math.round(jaarlijkseBesparing)).toLocaleString()}
              </p>
              <p style={{ color: '#9ca3af', fontSize: 14 }}>
                {t('roi.thatsPerMonth')} <span style={{ color: '#22c55e', fontWeight: 600 }}>€{Math.max(0, Math.round(maandelijkseBesparing)).toLocaleString()}</span> {t('roi.perMonth')}
              </p>

              {/* ROI & Terugverdientijd */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>ROI</p>
                  <p style={{ color: '#22c55e', fontSize: 28, fontWeight: 700, margin: 0 }}>{Math.round(roi)}%</p>
                </div>
                <div>
                  <p style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>{t('roi.paybackTime')}</p>
                  <p style={{ color: '#8b5cf6', fontSize: 28, fontWeight: 700, margin: 0 }}>{terugverdientijd.toFixed(1)} {t('roi.months')}</p>
                </div>
              </div>
            </div>

            {/* Kosten Vergelijking */}
            <div style={{ background: '#1a1025', borderRadius: 16, padding: 32 }}>
              <p style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
                {t('roi.costComparison')}
              </p>
              
              {/* Huidige Situatie */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>{t('roi.currentSituation')}</span>
                  <span style={{ color: '#ef4444', fontSize: 16, fontWeight: 600 }}>€{Math.round(totaleHuidigeKosten).toLocaleString()}</span>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', borderRadius: 4, height: 8 }}>
                  <div style={{ background: '#ef4444', borderRadius: 4, height: 8, width: '100%' }} />
                </div>
              </div>

              {/* Met VoxApp */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>{t('roi.withVoxApp')} ({voxAppPlan})</span>
                  <span style={{ color: '#22c55e', fontSize: 16, fontWeight: 600 }}>€{Math.round(totaalVoxAppPerJaar).toLocaleString()}</span>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.2)', borderRadius: 4, height: 8 }}>
                  <div style={{ 
                    background: '#22c55e', 
                    borderRadius: 4, 
                    height: 8, 
                    width: `${Math.min(100, (totaalVoxAppPerJaar / totaleHuidigeKosten) * 100)}%` 
                  }} />
                </div>
              </div>

              <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>
                * {t('roi.basedOn')} {voxAppPlan} {t('roi.packageExclVat')}
              </p>
            </div>

            {/* Extra Waarde */}
            <div style={{ background: '#1a1025', borderRadius: 16, padding: 24 }}>
              <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={16} />
                {t('roi.extraValue')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>{t('roi.availability247')}</span>
                  <span style={{ color: 'white', fontSize: 13 }}>€1.200</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>{t('roi.noVacationPlanning')}</span>
                  <span style={{ color: 'white', fontSize: 13 }}>€1.500</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{t('roi.totalExtraValue')}</span>
                  <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 600 }}>€2.700{t('roi.perYear')}</span>
                </div>
              </div>
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
  const { t, language } = useLanguage();
  return (
    <section style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Professional Calendar - Hidden on mobile */}
          <div className="calendar-desktop" style={{ position: 'relative' }}>
            <div style={{
              background: 'white',
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}>
              {/* Calendar header */}
              <div style={{ background: '#f97316', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>{language === 'nl' ? 'Februari' : language === 'en' ? 'February' : language === 'fr' ? 'Février' : 'Februar'} 2026</p>
                  <p style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{t('outbound.weekOverview')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500 }}>{t('outbound.day')}</button>
                  <button style={{ background: 'white', border: 'none', color: '#f97316', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>{t('outbound.week')}</button>
                </div>
              </div>

              {/* Days header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid #e5e7eb' }}>
                {(language === 'nl' ? ['Ma 10', 'Di 11', 'Wo 12', 'Do 13', 'Vr 14'] : 
                  language === 'en' ? ['Mon 10', 'Tue 11', 'Wed 12', 'Thu 13', 'Fri 14'] : 
                  language === 'fr' ? ['Lun 10', 'Mar 11', 'Mer 12', 'Jeu 13', 'Ven 14'] : 
                  ['Mo 10', 'Di 11', 'Mi 12', 'Do 13', 'Fr 14']).map((day, i) => (
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
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>{language === 'nl' ? 'Knippen' : language === 'en' ? 'Haircut' : language === 'fr' ? 'Coupe' : 'Schnitt'}</p>
                        <p style={{ fontSize: 10, color: '#a16207' }}>Marie V.</p>
                      </div>
                      <div></div>
                      <div style={{ background: '#dbeafe', borderLeft: '3px solid #3b82f6', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#1e40af' }}>{language === 'nl' ? 'Consult' : language === 'en' ? 'Consult' : language === 'fr' ? 'Conseil' : 'Beratung'}</p>
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
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#9a3412' }}>{language === 'nl' ? 'Kleuren' : language === 'en' ? 'Coloring' : language === 'fr' ? 'Coloration' : 'Färben'}</p>
                        <p style={{ fontSize: 10, color: '#c2410c' }}>Lisa G.</p>
                      </div>
                      <div></div>
                      <div style={{ background: '#dcfce7', borderLeft: '3px solid #22c55e', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>{language === 'nl' ? 'Knippen' : language === 'en' ? 'Haircut' : language === 'fr' ? 'Coupe' : 'Schnitt'}</p>
                        <p style={{ fontSize: 10, color: '#15803d' }}>Jan P.</p>
                      </div>
                      <div style={{ background: '#fef3c7', borderLeft: '3px solid #f59e0b', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e' }}>{language === 'nl' ? 'Baard' : language === 'en' ? 'Beard' : language === 'fr' ? 'Barbe' : 'Bart'}</p>
                        <p style={{ fontSize: 10, color: '#a16207' }}>Tom H.</p>
                      </div>
                    </div>
                  </div>

                  {/* 11:00 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#9ca3af', width: 40 }}>11:00</span>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      <div style={{ background: '#dcfce7', borderLeft: '3px solid #22c55e', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>{language === 'nl' ? 'Föhnen' : language === 'en' ? 'Blow dry' : language === 'fr' ? 'Brushing' : 'Föhnen'}</p>
                        <p style={{ fontSize: 10, color: '#15803d' }}>Emma S.</p>
                      </div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div style={{ background: '#dbeafe', borderLeft: '3px solid #3b82f6', borderRadius: 4, padding: 8 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#1e40af' }}>{language === 'nl' ? 'Knippen' : language === 'en' ? 'Haircut' : language === 'fr' ? 'Coupe' : 'Schnitt'}</p>
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
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>{t('outbound.newBooking')}</p>
                    <p style={{ fontSize: 11, color: '#15803d' }}>Sarah M. - {language === 'nl' ? 'Knippen & Kleuren' : language === 'en' ? 'Cut & Color' : language === 'fr' ? 'Coupe & Coloration' : 'Schneiden & Färben'} - {language === 'nl' ? 'Di 11 feb' : language === 'en' ? 'Tue Feb 11' : language === 'fr' ? 'Mar 11 fév' : 'Di 11. Feb'}, 14:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('outbound.badge')}
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              {t('outbound.title')}
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              {t('outbound.subtitle')}
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: Users, text: t('outbound.feature1') },
                { icon: Calendar, text: t('outbound.feature2') },
                { icon: Heart, text: t('outbound.feature3') },
                { icon: Bell, text: t('outbound.feature4') },
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
  const { t } = useLanguage();
  return (
    <section style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left - Text */}
          <div>
            <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('automation.badge')}
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 20 }}>
              {t('automation.title')}
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>
              {t('automation.subtitle')}
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: Send, text: t('automation.feature1') },
                { icon: RefreshCw, text: t('automation.feature2') },
                { icon: PhoneCall, text: t('automation.feature3') },
                { icon: UserCheck, text: t('automation.feature4') },
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
   TRY LIVE SECTION - Test the receptionist
============================================ */
function TryLiveSection() {
  const { t } = useLanguage();
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedDemoLang, setSelectedDemoLang] = useState<'nl' | 'en' | 'fr' | 'de'>('nl');
  const conversationRef = useRef<ReturnType<typeof useConversation> | null>(null);

  const demoLanguages = [
    { code: 'nl' as const, flag: '🇳🇱', label: 'NL' },
    { code: 'en' as const, flag: '🇬🇧', label: 'EN' },
    { code: 'fr' as const, flag: '🇫🇷', label: 'FR' },
    { code: 'de' as const, flag: '🇩🇪', label: 'DE' },
  ];

  // Kapsalon Belle agent IDs per language
  const belleAgents: Record<string, string> = {
    nl: 'agent_7001kh7ck6cvfpqvrt1gc63bs88k',
    en: 'agent_7101khetmv6aedatrzg030vn5ge4',
    fr: 'agent_9401khetnphqe2kb1g9d861rzn0g',
    de: 'agent_1501khetp4xtfpeamd250tpfqwjy',
  };

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
      setErrorMessage(t('tryLive.errorGeneral'));
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
      
      // Start the conversation with the agent - use selected language
      await conversation.startSession({
        agentId: belleAgents[selectedDemoLang],
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      setErrorMessage(t('tryLive.errorConnection'));
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
          {t('tryLive.badge')}
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
          {t('tryLive.title')}
        </h2>
        <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.7, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
          {t('tryLive.subtitle')}
        </p>

        {/* Call Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {!isActive ? (
            <>
              <button 
                onClick={startCall}
                className="call-button-large"
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
              {/* Language selector for demo */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {demoLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedDemoLang(lang.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: selectedDemoLang === lang.code ? '2px solid #f97316' : '2px solid rgba(255,255,255,0.2)',
                      background: selectedDemoLang === lang.code ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: selectedDemoLang === lang.code ? 600 : 400,
                      color: selectedDemoLang === lang.code ? '#f97316' : '#9ca3af',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
              {errorMessage && (
                <p style={{ color: '#ef4444', fontSize: 14, maxWidth: 300 }}>
                  {errorMessage}
                </p>
              )}
              {callStatus === 'ended' && (
                <p style={{ color: '#22c55e', fontSize: 14 }}>
                  {t('tryLive.callEnded')}
                </p>
              )}
              {callStatus === 'idle' && !errorMessage && (
                <p style={{ color: '#6b7280', fontSize: 14 }}>
                  {t('tryLive.clickToCall')}
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
                    {callStatus === 'connecting' && t('tryLive.connecting')}
                    {callStatus === 'connected' && (isSpeaking ? t('tryLive.speaking') : t('tryLive.listening'))}
                  </span>
                </div>
                
                {callStatus === 'connected' && (
                  <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 0 }}>
                    {isSpeaking ? t('tryLive.pleaseWait') : t('tryLive.speakNow')}
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
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>{t('tryLive.tryFor')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {[
                t('tryLive.example1'),
                t('tryLive.example2'),
                t('tryLive.example3'),
                t('tryLive.example4'),
                t('tryLive.example5'),
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
  const { t } = useLanguage();
  const steps = [
    { num: '01', icon: Users, titleKey: 'step1.title', descKey: 'step1.desc' },
    { num: '02', icon: Settings, titleKey: 'step2.title', descKey: 'step2.desc' },
    { num: '03', icon: Mic, titleKey: 'step3.title', descKey: 'step3.desc' },
    { num: '04', icon: Phone, titleKey: 'step4.title', descKey: 'step4.desc' },
  ];

  return (
    <section id="how-it-works" style={{ background: '#0f0a14', padding: '200px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('howItWorks.badge')}
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            {t('howItWorks.title1')} <span style={{ color: '#f97316' }}>{t('howItWorks.title2')}</span>
          </h2>
          <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 500, margin: '0 auto' }}>
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
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
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 8 }}>{t(`howItWorks.${step.titleKey}`)}</h3>
              <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6 }}>{t(`howItWorks.${step.descKey}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   STATS SECTION - Animated Counters
============================================ */
function StatsSection() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState({ revenue: 0, clients: 0, uptime: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setCounts({
          revenue: Math.round(2.5 * easeOut * 10) / 10,
          clients: Math.round(500 * easeOut),
          uptime: Math.round(99.9 * easeOut * 10) / 10,
        });
        
        if (step >= steps) clearInterval(timer);
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [isVisible]);

  const stats = [
    { value: `€${counts.revenue}M+`, label: t('stats.processed') },
    { value: `${counts.clients}+`, label: t('stats.activeBusinesses') },
    { value: `${counts.uptime}%`, label: t('stats.uptimeGuarantee') },
    { value: '24/7', label: t('stats.supportAvailable') },
  ];

  return (
    <section ref={sectionRef} style={{ background: '#f5f5f5', padding: '60px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <p style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: 700, 
                color: '#1a1a2e', 
                margin: '0 0 8px 0',
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PRICING SECTION
============================================ */
function PricingSection() {
  const { t } = useLanguage();
  const plans = [
    {
      key: 'starter',
      price: '99',
      minutes: '300',
      appointments: '~150',
      extra: '0,40',
      featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
      popular: false,
    },
    {
      key: 'pro',
      price: '149',
      minutes: '750',
      appointments: '~375',
      extra: '0,35',
      featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
      popular: true,
    },
    {
      key: 'business',
      price: '249',
      minutes: '1500',
      appointments: '~750',
      extra: '0,30',
      featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
      popular: false,
    },
  ];

  return (
    <section id="pricing" style={{ background: '#e3e3e3', padding: '200px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('pricing.badge')}
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 16 }}>
            {t('pricing.title1')} <span style={{ color: '#f97316' }}>{t('pricing.title2')}</span>
          </h2>
          <p style={{ fontSize: 18, color: '#9ca3af' }}>
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {plans.map((plan) => (
            <div key={plan.key} style={{
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
                }}>{t('pricing.popular')}</span>
              )}

              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>{t(`pricing.${plan.key}.name`)}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{t(`pricing.${plan.key}.desc`)}</p>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 18, color: '#9ca3af' }}>€</span>
                <span style={{ fontSize: 48, fontWeight: 700, color: '#f97316' }}>{plan.price}</span>
                <span style={{ fontSize: 16, color: '#9ca3af' }}>{t('pricing.perMonth')}</span>
              </div>

              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                {plan.appointments} {t('pricing.appointments')}<br />
                <span style={{ fontSize: 12 }}>({plan.minutes} {t('pricing.minutes')} • €{plan.extra} {t('pricing.extraMinute')})</span>
              </p>

              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
                {plan.featureKeys.map((fKey, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', fontSize: 14, color: '#374151' }}>
                    <Check size={16} style={{ color: '#f97316' }} />
                    {t(`pricing.${plan.key}.${fKey}`)}
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
                {t('pricing.startTrial')}
              </a>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 12 }}>
                {t('pricing.monthlyCancelable')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PARTNERS SECTION - Auto-sliding logos
============================================ */
function PartnersSection() {
  const partners = [
    { name: 'Rogiers Motiv', logo: '/partners/rogiers-motiv.png' },
    { name: 'Frituur Nolim', logo: '/partners/frituur-nolim.png' },
    { name: 'Jacqmar', logo: '/partners/jacqmar.png' },
    { name: 'Vysion Consulting', logo: '/partners/vysion.png' },
    { name: 'PostNL', logo: '/partners/postnl.png' },
    { name: 'Bol.com', logo: '/partners/bolcom.png' },
    { name: 'Rogiers Mercedes', logo: '/partners/rogiers-mercedes.png' },
  ];

  // Duplicate array for seamless loop
  const allPartners = [...partners, ...partners];

  const { t } = useLanguage();
  return (
    <section style={{ background: '#1a1a2e', padding: '60px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center', marginBottom: 40 }}>
        <span style={{ color: '#f97316', fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Partners</span>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'white', margin: '12px 0 0 0' }}>
          {t('partners.title').split(' ')[0]} <span style={{ color: '#f97316' }}>{t('partners.title').split(' ').slice(1).join(' ') || 'Partners'}</span>
        </h2>
      </div>
      
      <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 0' }}>
        <div 
          className="partners-slider"
          style={{ 
            display: 'flex', 
            gap: 48,
            animation: 'slideLeft 40s linear infinite',
            width: 'fit-content',
            padding: '0 24px',
            alignItems: 'center',
          }}
        >
          {allPartners.map((partner, i) => (
            <div 
              key={i} 
              className="partner-card"
              style={{ 
                flexShrink: 0,
                width: 180,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img 
                src={partner.logo} 
                alt={partner.name}
                loading="eager"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  filter: 'grayscale(100%) brightness(2)',
                  opacity: 0.8,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 768px) {
          .partner-card {
            min-width: 200px !important;
            width: 200px !important;
            height: 120px !important;
          }
          .partners-slider {
            gap: 40px !important;
            padding: 0 20px !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ============================================
   FAQ SECTION
============================================ */
function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];

  return (
    <section id="faq" style={{ background: '#1a1025', padding: '200px 0' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{t('faq.badge')}</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'white' }}>
            {t('faq.title1')} <span style={{ color: '#f97316' }}>{t('faq.title2')}</span>
          </h2>
        </div>

        <div>
          {faqKeys.map((key, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 600, color: 'white' }}>{t(`faq.${key}.q`)}</span>
                <ChevronRight size={20} style={{ color: '#f97316', transform: openIndex === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
              {openIndex === i && (
                <p style={{ paddingBottom: 24, color: '#9ca3af', lineHeight: 1.7 }}>{t(`faq.${key}.a`)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   TESTIMONIALS SECTION
============================================ */
function TestimonialsSection() {
  const { t } = useLanguage();
  const testimonials = [
    {
      name: t('testimonials.testimonial1.author'),
      role: t('testimonials.testimonial1.role'),
      initials: 'MV',
      color: '#22c55e',
      text: t('testimonials.testimonial1.text'),
    },
    {
      name: t('testimonials.testimonial2.author'),
      role: t('testimonials.testimonial2.role'),
      initials: 'SJ',
      color: '#3b82f6',
      text: t('testimonials.testimonial2.text'),
    },
    {
      name: t('testimonials.testimonial3.author'),
      role: t('testimonials.testimonial3.role'),
      initials: 'PH',
      color: '#a855f7',
      text: t('testimonials.testimonial3.text'),
    },
  ];

  return (
    <section style={{ background: '#1a1a2e', padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 60 }}>
          {t('testimonials.title')}
        </h2>
        
        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
          {testimonials.map((testimonial, i) => (
            <div 
              key={i}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: 30,
              }}
            >
              {/* Stars */}
              <div style={{ marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: '#fbbf24', fontSize: 18 }}>★</span>
                ))}
              </div>
              
              {/* Quote */}
              <p style={{ color: '#d1d5db', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                {testimonial.text}
              </p>
              
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: testimonial.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                }}>
                  {testimonial.initials}
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, margin: 0, fontSize: 15 }}>{testimonial.name}</p>
                  <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>{testimonial.role}</p>
                </div>
              </div>
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
  const { t } = useLanguage();
  const [showSupport, setShowSupport] = useState(false);
  const [supportStatus, setSupportStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedSupportLang, setSelectedSupportLang] = useState<'nl' | 'en' | 'fr' | 'de'>('nl');

  const supportLanguages = [
    { code: 'nl' as const, flag: '🇳🇱', label: 'NL' },
    { code: 'en' as const, flag: '🇬🇧', label: 'EN' },
    { code: 'fr' as const, flag: '🇫🇷', label: 'FR' },
    { code: 'de' as const, flag: '🇩🇪', label: 'DE' },
  ];

  // VoxApp Support agent IDs per language
  const supportAgents: Record<string, string> = {
    nl: 'agent_8201khegn801frdb3hvebx2rh5fr',
    en: 'agent_2901khexjstrfzzb4bdcqa3n7fbe',
    fr: 'agent_8801khexnv29eh6s5n44cdv07rzy',
    de: 'agent_3001khexq046f1cbz1dyswbwkhye',
  };
  
  const supportConversation = useConversation({
    onConnect: () => setSupportStatus('connected'),
    onDisconnect: () => setSupportStatus('idle'),
    onError: (error) => {
      console.error('Support conversation error:', error);
      setSupportStatus('error');
    },
    onModeChange: ({ mode }) => setIsSpeaking(mode === 'speaking'),
  });

  const startSupportCall = async () => {
    try {
      setSupportStatus('connecting');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // VoxApp Support Agent - use selected language
      await supportConversation.startSession({
        agentId: supportAgents[selectedSupportLang],
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start support call:', error);
      setSupportStatus('error');
    }
  };

  const endSupportCall = async () => {
    await supportConversation.endSession();
    setSupportStatus('idle');
  };

  const closeSupport = async () => {
    if (supportStatus === 'connected' || supportStatus === 'connecting') {
      await supportConversation.endSession();
    }
    setSupportStatus('idle');
    setShowSupport(false);
  };

  return (
    <>
      <section style={{ background: '#e3e3e3', padding: '200px 0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>
            {t('cta.title1')} <span style={{ color: '#f97316' }}>{t('cta.title2')}</span>
          </h2>
          <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 40 }}>
            {t('cta.subtitle')}
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
              {t('cta.startTrial')} <ArrowRight size={18} />
            </a>
            <button 
              onClick={() => setShowSupport(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: '#1a1a2e',
                padding: '16px 32px',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                border: '1px solid #d1d5db',
                cursor: 'pointer',
              }}>
              <Headphones size={18} />
              {t('cta.talkToTeam')}
            </button>
          </div>
          
          {/* Language selector for support */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            {supportLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedSupportLang(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: selectedSupportLang === lang.code ? '2px solid #f97316' : '1px solid #d1d5db',
                  background: selectedSupportLang === lang.code ? '#fff7ed' : 'white',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 18 }}>{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Support Modal */}
      {showSupport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
        }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: 24,
            padding: 40,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
            position: 'relative',
          }}>
            <button 
              onClick={closeSupport}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: 8,
              }}
            >
              <X size={24} />
            </button>

            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: supportStatus === 'connected' 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: supportStatus === 'connected' 
                ? '0 0 40px rgba(34, 197, 94, 0.4)' 
                : '0 0 40px rgba(249, 115, 22, 0.4)',
              animation: isSpeaking ? 'pulse 1s infinite' : 'none',
            }}>
              <Headphones size={36} color="white" />
            </div>

            <h3 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {t('cta.support')}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>
              {supportStatus === 'idle' && t('cta.askQuestions')}
              {supportStatus === 'connecting' && t('cta.connecting')}
              {supportStatus === 'connected' && (isSpeaking ? t('cta.speaking') : t('cta.listening'))}
              {supportStatus === 'error' && t('cta.error')}
            </p>

            {supportStatus === 'idle' || supportStatus === 'error' ? (
              <button
                onClick={startSupportCall}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Phone size={20} />
                {t('cta.startCall')}
              </button>
            ) : supportStatus === 'connecting' ? (
              <div style={{
                width: '100%',
                padding: '16px 32px',
                background: '#374151',
                color: '#9ca3af',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
              }}>
                Verbinden...
              </div>
            ) : (
              <button
                onClick={endSupportCall}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Phone size={20} />
                {t('cta.endCall')}
              </button>
            )}

            <p style={{ color: '#6b7280', fontSize: 12, marginTop: 16 }}>
              Prijzen • Features • Demo • Integraties
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================
   CONTACT SECTION
============================================ */
function ContactSection() {
  const { t } = useLanguage();
  const [showSupport, setShowSupport] = useState(false);
  const [supportStatus, setSupportStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const supportConversation = useConversation({
    onConnect: () => setSupportStatus('connected'),
    onDisconnect: () => setSupportStatus('idle'),
    onError: (error) => {
      console.error('Support conversation error:', error);
      setSupportStatus('error');
    },
    onModeChange: ({ mode }) => setIsSpeaking(mode === 'speaking'),
  });

  const startSupportCall = async () => {
    try {
      setSupportStatus('connecting');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await supportConversation.startSession({
        agentId: 'agent_8201khegn801frdb3hvebx2rh5fr',
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start support call:', error);
      setSupportStatus('error');
    }
  };

  const endSupportCall = async () => {
    await supportConversation.endSession();
    setSupportStatus('idle');
  };

  const closeSupport = async () => {
    if (supportStatus === 'connected' || supportStatus === 'connecting') {
      await supportConversation.endSession();
    }
    setSupportStatus('idle');
    setShowSupport(false);
  };

  return (
    <>
      <section id="contact" style={{ background: '#0a0710', padding: '100px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ color: '#f97316', fontSize: 14, fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>
            CONTACT
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'white', marginBottom: 20 }}>
            {t('contact.title')}
          </h2>
          <p style={{ fontSize: 18, color: '#9ca3af', marginBottom: 48, lineHeight: 1.7 }}>
            {t('contact.subtitle')}
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: 24,
            marginBottom: 48 
          }}>
            {/* Email */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 32,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'rgba(249, 115, 22, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Send size={24} color="#f97316" />
              </div>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t('contact.email')}</h3>
              <a href="mailto:info@vysionhoreca.com" style={{ color: '#f97316', textDecoration: 'none', fontSize: 16 }}>
                info@vysionhoreca.com
              </a>
            </div>

            {/* Website */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 32,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'rgba(249, 115, 22, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Globe size={24} color="#f97316" />
              </div>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t('contact.website')}</h3>
              <a href="https://voxapp.tech" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316', textDecoration: 'none', fontSize: 16 }}>
                voxapp.tech
              </a>
            </div>

            {/* Locatie */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 32,
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'rgba(249, 115, 22, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <MapPin size={24} color="#f97316" />
              </div>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t('contact.location')}</h3>
              <p style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.6 }}>
                Siberiëstraat 24<br />
                3900 Pelt<br />
                België
              </p>
            </div>

            {/* Live Chat */}
            <div 
              onClick={() => setShowSupport(true)}
              style={{
                background: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                borderRadius: 16,
                padding: 32,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Headphones size={24} color="white" />
              </div>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t('contact.liveSupport')}</h3>
              <p style={{ color: '#f97316', fontSize: 16 }}>
                {t('contact.talkNow')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Modal */}
      {showSupport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20,
        }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: 24,
            padding: 40,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center',
            position: 'relative',
          }}>
            <button 
              onClick={closeSupport}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: 8,
              }}
            >
              <X size={24} />
            </button>

            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: supportStatus === 'connected' 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: supportStatus === 'connected' 
                ? '0 0 40px rgba(34, 197, 94, 0.4)' 
                : '0 0 40px rgba(249, 115, 22, 0.4)',
              animation: isSpeaking ? 'pulse 1s infinite' : 'none',
            }}>
              <Headphones size={36} color="white" />
            </div>

            <h3 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              {t('cta.support')}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>
              {supportStatus === 'idle' && t('cta.askQuestions')}
              {supportStatus === 'connecting' && t('cta.connecting')}
              {supportStatus === 'connected' && (isSpeaking ? t('cta.speaking') : t('cta.listening'))}
              {supportStatus === 'error' && t('cta.error')}
            </p>

            {supportStatus === 'idle' || supportStatus === 'error' ? (
              <button
                onClick={startSupportCall}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background: '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Phone size={20} />
                {t('cta.startCall')}
              </button>
            ) : supportStatus === 'connecting' ? (
              <div style={{
                width: '100%',
                padding: '16px 32px',
                background: '#374151',
                color: '#9ca3af',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
              }}>
                Verbinden...
              </div>
            ) : (
              <button
                onClick={endSupportCall}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Phone size={20} />
                {t('cta.endCall')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================
   FOOTER
============================================ */
function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ background: '#0a0710', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '60px 0 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 22, fontWeight: 700, color: 'white', textDecoration: 'none', marginBottom: 16 }}>
              <span style={{ color: '#f97316' }}>Vox</span>App
            </a>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginTop: 16 }}>
              {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: 16 }}>{t('footer.product')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#features" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t('footer.features')}</a>
              <a href="#pricing" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t('footer.pricing')}</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: 16 }}>{t('footer.company')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="/over-ons" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t('footer.aboutUs')}</a>
              <a href="#contact" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t('footer.contact')}</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'white', marginBottom: 16 }}>{t('footer.support')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#faq" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t('footer.helpCenter')}</a>
              <a href="#faq" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>{t('footer.faq')}</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#6b7280' }}>© 2026 Vysion. {t('footer.allRights')}</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="/privacy" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>{t('footer.privacy')}</a>
            <a href="/voorwaarden" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 13 }}>{t('footer.terms')}</a>
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
  const { t } = useLanguage();
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoType, setDemoType] = useState<'belle' | 'garage' | 'restaurant'>('belle');
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Scroll to top on page load/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
    // Check if cookies are already accepted
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setShowCookieBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setShowCookieBanner(false);
  };

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
      <FrituurSection />
      <KassaSection />
      <ROICalculatorSection />
      <ForWhoSection />
      <InboundSection onOpenDemo={openGarageDemo} />
      <RestaurantSection onOpenDemo={openRestaurantDemo} />
      <OutboundSection />
      <AutomationSection />
      <TryLiveSection />
      <HowItWorksSection />
      <StatsSection />
      <PricingSection />
      <PartnersSection />
      <FAQSection />
      <TestimonialsSection />
      <CTASection />
      <ContactSection />
      <Footer />
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} demoType={demoType} />
      
      {/* Cookie Banner */}
      {showCookieBanner && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(26, 26, 46, 0.98)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 24px',
          zIndex: 9999,
        }}>
          <div style={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: 20,
          }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <p style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                {t('cookies.title')}
              </p>
              <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.6 }}>
                {t('cookies.message')}{' '}
                <a href="/privacy" style={{ color: '#f97316', textDecoration: 'underline' }}>{t('cookies.cookiePolicy')}</a>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={declineCookies}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: '#9ca3af',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {t('cookies.decline')}
              </button>
              <button
                onClick={acceptCookies}
                style={{
                  padding: '10px 24px',
                  background: '#f97316',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('cookies.accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
