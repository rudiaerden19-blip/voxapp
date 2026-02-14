'use client';

import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();
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
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            color: '#9ca3af', 
            textDecoration: 'none',
            fontSize: 14,
          }}>
            <ArrowLeft size={18} />
            {t('nav.backToHome')}
          </a>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
          {t('privacy.title')}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 48 }}>{t('privacy.lastUpdated')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section1.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('privacy.section1.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section2.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: 16 }}>{t('privacy.section2.intro')}</p>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li>{t('privacy.section2.item1')}</li>
              <li>{t('privacy.section2.item2')}</li>
              <li>{t('privacy.section2.item3')}</li>
              <li>{t('privacy.section2.item4')}</li>
              <li>{t('privacy.section2.item5')}</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section3.title')}</h2>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li>{t('privacy.section3.item1')}</li>
              <li>{t('privacy.section3.item2')}</li>
              <li>{t('privacy.section3.item3')}</li>
              <li>{t('privacy.section3.item4')}</li>
              <li>{t('privacy.section3.item5')}</li>
              <li>{t('privacy.section3.item6')}</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section4.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('privacy.section4.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section5.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('privacy.section5.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section6.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: 16 }}>{t('privacy.section6.intro')}</p>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li>{t('privacy.section6.item1')}</li>
              <li>{t('privacy.section6.item2')}</li>
              <li>{t('privacy.section6.item3')}</li>
              <li>{t('privacy.section6.item4')}</li>
              <li>{t('privacy.section6.item5')}</li>
              <li>{t('privacy.section6.item6')}</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section7.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('privacy.section7.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('privacy.section8.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('privacy.section8.content')}<br /><br />
              <strong style={{ color: 'white' }}>{t('contact.email')}:</strong> info@vysionhoreca.com<br />
              <strong style={{ color: 'white' }}>{t('contact.website')}:</strong> voxapp.tech
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
