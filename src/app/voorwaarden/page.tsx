'use client';

import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function VoorwaardenPage() {
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
          {t('terms.title')}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 48 }}>{t('terms.lastUpdated')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section1.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              <strong style={{ color: 'white' }}>VoxApp:</strong> {t('terms.section1.voxapp')}<br />
              <strong style={{ color: 'white' }}>{t('terms.section1.customerLabel')}:</strong> {t('terms.section1.customer')}<br />
              <strong style={{ color: 'white' }}>{t('terms.section1.servicesLabel')}:</strong> {t('terms.section1.services')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section2.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section2.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section3.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section3.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section4.title')}</h2>
            <ul style={{ color: '#9ca3af', lineHeight: 2, paddingLeft: 24 }}>
              <li><strong style={{ color: 'white' }}>Starter:</strong> {t('terms.section4.starter')}</li>
              <li><strong style={{ color: 'white' }}>Pro:</strong> {t('terms.section4.pro')}</li>
              <li><strong style={{ color: 'white' }}>Business:</strong> {t('terms.section4.business')}</li>
            </ul>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, marginTop: 16 }}>
              {t('terms.section4.trial')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section5.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section5.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section6.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section6.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section7.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section7.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section8.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section8.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section9.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section9.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section10.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section10.content')}
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#f97316' }}>{t('terms.section11.title')}</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8 }}>
              {t('terms.section11.content')}<br /><br />
              <strong style={{ color: 'white' }}>{t('contact.email')}:</strong> info@vysionhoreca.com<br />
              <strong style={{ color: 'white' }}>{t('contact.website')}:</strong> voxapp.tech
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
