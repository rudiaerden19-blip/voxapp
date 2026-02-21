'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage, Language } from '@/lib/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'nl', label: 'NL', flag: '🇳🇱' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
];

const businessTypeKeys = ['salon', 'garage', 'restaurant', 'takeaway', 'doctor', 'dentist', 'physio', 'other'] as const;

// Plan info for display
const planInfo: Record<string, { name: string; price: string; minutes: string }> = {
  starter: { name: 'Starter', price: '99', minutes: '375' },
  pro: { name: 'Professional', price: '149', minutes: '940' },
  business: { name: 'Business', price: '249', minutes: '1875' },
};

// Inner component that uses useSearchParams
function RegisterForm() {
  const { t, language, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'starter';
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const router = useRouter();
  
  // Get plan details
  const plan = planInfo[selectedPlan] || planInfo.starter;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      
      // 1. Create auth user (no email verification required)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: businessName,
            business_name: businessName,
            business_type: businessType,
            phone: phone,
            plan: selectedPlan,
          }
        }
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Create business record with selected plan
        const { error: businessError } = await supabase
          .from('businesses')
          .insert([{
            user_id: authData.user.id,
            name: businessName,
            type: businessType,
            phone: phone,
            email: email,
            subscription_status: 'trial',
            subscription_plan: selectedPlan,
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
          }] as any);

        if (businessError) {
          console.error('Business creation error:', businessError);
          setError(t('auth.somethingWentWrong'));
        } else {
          // Go directly to dashboard
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || t('auth.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
    }}>
      {/* Language Selector */}
      <div style={{ position: 'absolute', top: 24, right: 24 }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
              background: '#16161f', border: '1px solid #2a2a35', borderRadius: 8,
              color: 'white', fontSize: 13, cursor: 'pointer',
            }}
          >
            <Globe size={14} color="#f97316" />
            <span>{currentLang.flag} {currentLang.label}</span>
            <ChevronDown size={12} style={{ transform: langDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {langDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4, minWidth: 100,
              background: '#16161f', border: '1px solid #2a2a35', borderRadius: 8,
              overflow: 'hidden', zIndex: 100,
            }}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setLangDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    background: language === lang.code ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    border: 'none', color: language === lang.code ? '#f97316' : '#9ca3af',
                    fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#16161f',
        borderRadius: 16,
        padding: 40,
        border: '1px solid #2a2a35',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 700 }}>
              <span style={{ color: '#f97316' }}>Vox</span>
              <span style={{ color: 'white' }}>App</span>
            </span>
          </Link>
          <p style={{ color: '#9ca3af', marginTop: 8, fontSize: 14 }}>
            {t('auth.startTrial')}
          </p>
        </div>

        {/* Selected Plan Badge */}
        <div style={{
          background: 'rgba(249, 115, 22, 0.1)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Gekozen plan</p>
            <p style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>{plan.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#f97316', fontSize: 24, fontWeight: 700, margin: 0 }}>€{plan.price}</p>
            <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>/maand na trial</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          <div style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: '#f97316',
          }} />
          <div style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: step >= 2 ? '#f97316' : '#2a2a35',
          }} />
        </div>

        <form onSubmit={handleRegister}>
          {step === 1 && (
            <>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
                {t('auth.aboutBusiness')}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  {t('auth.businessName')}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                    outline: 'none',
                  }}
                  placeholder="bijv. Kapsalon Belle"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  {t('auth.businessType')}
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: businessType ? 'white' : '#6b7280',
                    fontSize: 16,
                    outline: 'none',
                  }}
                >
                  <option value="">{t('auth.selectType')}</option>
                  {businessTypeKeys.map((key) => (
                    <option key={key} value={key}>
                      {t(`auth.businessTypes.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  {t('auth.phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                    outline: 'none',
                  }}
                  placeholder="+32 ..."
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!businessName || !businessType}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: (!businessName || !businessType) ? '#6b7280' : '#f97316',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: (!businessName || !businessType) ? 'not-allowed' : 'pointer',
                }}
              >
                {t('auth.next')}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
                {t('auth.yourAccount')}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                    outline: 'none',
                  }}
                  placeholder="naam@bedrijf.be"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: 'white',
                    fontSize: 16,
                    outline: 'none',
                  }}
                  placeholder={t('auth.minChars')}
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  color: '#ef4444',
                  fontSize: 14,
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '14px 24px',
                    background: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t('auth.back')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: loading ? '#6b7280' : '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? t('auth.creatingAccount') : t('auth.startFreeTrial')}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: 24, color: '#9ca3af', fontSize: 14 }}>
          {t('auth.alreadyAccount')}{' '}
          <Link href="/login" style={{ color: '#f97316', textDecoration: 'none' }}>
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function RegisterLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          <span style={{ color: '#f97316' }}>Vox</span>
          <span style={{ color: 'white' }}>App</span>
        </div>
        <p style={{ color: '#9ca3af' }}>Laden...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoading />}>
      <RegisterForm />
    </Suspense>
  );
}
