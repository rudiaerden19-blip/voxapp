'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { hasModule, getBusinessType, ModuleId, MODULES } from '@/lib/modules';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

interface ModuleGuardProps {
  moduleId: ModuleId;
  children: React.ReactNode;
}

interface Business {
  id: string;
  type: string;
  name: string;
}

export default function ModuleGuard({ moduleId, children }: ModuleGuardProps) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/business/by-email?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const biz = await res.json();
        setBusiness(biz);
        setHasAccess(hasModule(biz.type, moduleId));
      }
    } catch (e) {
      console.error('Failed to load business:', e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>Laden...</div>
      </div>
    );
  }

  if (!hasAccess && business) {
    const businessConfig = getBusinessType(business.type);
    const moduleConfig = MODULES[moduleId];
    
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ 
            width: 64, height: 64, borderRadius: '50%', 
            background: 'rgba(239, 68, 68, 0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Lock size={28} color="#ef4444" />
          </div>
          
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
            Module niet beschikbaar
          </h2>
          
          <p style={{ color: '#9ca3af', marginBottom: 24, lineHeight: 1.6 }}>
            De <strong style={{ color: '#f97316' }}>{moduleConfig.name}</strong> module 
            is niet beschikbaar voor <strong style={{ color: 'white' }}>{businessConfig.name}</strong>.
          </p>

          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            Jouw actieve modules: {businessConfig.modules.map(m => MODULES[m]?.name).join(', ')}
          </p>
          
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', background: '#f97316', borderRadius: 8,
            color: 'white', fontWeight: 600, textDecoration: 'none',
          }}>
            <ArrowLeft size={18} />
            Terug naar Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
