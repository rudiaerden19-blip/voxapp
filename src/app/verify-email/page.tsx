'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get email from localStorage (saved during registration)
    const savedEmail = localStorage.getItem('pendingVerificationEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const resendEmail = async () => {
    if (!email) return;
    
    setResending(true);
    setError('');
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      }
    } catch (err: any) {
      setError(err?.message || 'Er ging iets mis');
    } finally {
      setResending(false);
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
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(249, 115, 22, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Mail size={36} style={{ color: '#f97316' }} />
        </div>

        {/* Title */}
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Controleer je inbox
        </h1>
        
        <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 8 }}>
          We hebben een verificatie-email gestuurd naar:
        </p>
        
        {email && (
          <p style={{ color: '#f97316', fontSize: 18, fontWeight: 600, marginBottom: 24 }}>
            {email}
          </p>
        )}

        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
          Klik op de link in de email om je account te activeren. 
          Check ook je spam folder als je de email niet ziet.
        </p>

        {/* Resend Button */}
        <button
          onClick={resendEmail}
          disabled={resending || resent}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px 24px',
            background: resent ? 'rgba(34, 197, 94, 0.15)' : resending ? '#6b7280' : 'rgba(249, 115, 22, 0.15)',
            color: resent ? '#22c55e' : '#f97316',
            border: resent ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: resending || resent ? 'not-allowed' : 'pointer',
            marginBottom: 16,
          }}
        >
          {resent ? (
            <>
              <CheckCircle size={18} />
              Email opnieuw verstuurd!
            </>
          ) : resending ? (
            <>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Versturen...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Email opnieuw versturen
            </>
          )}
        </button>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            color: '#ef4444',
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Back to login */}
        <Link href="/login" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          Terug naar inloggen
        </Link>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
