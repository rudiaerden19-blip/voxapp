'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const businessTypes = [
    { value: 'salon', label: 'Kapsalon / Schoonheidssalon' },
    { value: 'garage', label: 'Garage / Autoservice' },
    { value: 'restaurant', label: 'Restaurant / Café' },
    { value: 'takeaway', label: 'Frituur / Takeaway' },
    { value: 'doctor', label: 'Huisarts / Dokter' },
    { value: 'dentist', label: 'Tandarts' },
    { value: 'physio', label: 'Kinesist / Fysiotherapeut' },
    { value: 'other', label: 'Andere' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Create business record
        const { error: businessError } = await supabase
          .from('businesses')
          .insert({
            user_id: authData.user.id,
            name: businessName,
            type: businessType,
            phone: phone,
            email: email,
            trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dagen trial
          });

        if (businessError) {
          console.error('Business creation error:', businessError);
          setError('Account aangemaakt maar bedrijf kon niet worden opgeslagen. Neem contact op.');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: '#16161f',
        borderRadius: 16,
        padding: 40,
        border: '1px solid #2a2a35',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 700 }}>
              <span style={{ color: '#f97316' }}>Vox</span>
              <span style={{ color: 'white' }}>App</span>
            </span>
          </Link>
          <p style={{ color: '#9ca3af', marginTop: 8, fontSize: 14 }}>
            Start je gratis proefperiode van 30 dagen
          </p>
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
                Over je bedrijf
              </h2>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  Bedrijfsnaam
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
                  Type bedrijf
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
                  <option value="">Selecteer type...</option>
                  {businessTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  Telefoonnummer
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
                Volgende
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600, marginBottom: 24 }}>
                Je account
              </h2>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>
                  E-mailadres
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
                  Wachtwoord
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
                  placeholder="Minimaal 6 karakters"
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
                  Terug
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
                  {loading ? 'Account aanmaken...' : 'Start gratis proefperiode'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: 24, color: '#9ca3af', fontSize: 14 }}>
          Al een account?{' '}
          <Link href="/login" style={{ color: '#f97316', textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
