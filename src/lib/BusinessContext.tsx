'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { ModuleId } from '@/lib/modules';

// Comprehensive Business interface
export interface Business {
  id: string;
  name: string;
  type: string;
  email: string | null;
  phone: string | null;
  subscription_status: string;
  trial_ends_at: string | null;
  enabled_modules?: ModuleId[];
  // Extended fields for settings
  address?: string | null;
  description?: string | null;
  website?: string | null;
  street?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  opening_hours?: Record<string, unknown> | null;
  voice_id?: string | null;
  welcome_message?: string | null;
  user_id?: string;
  stripe_customer_id?: string | null;
}

interface BusinessContextType {
  business: Business | null;
  businessId: string | null;
  businessType: string;
  isAdminView: boolean;
  adminViewId: string | null;
  loading: boolean;
  error: string | null;
  clearAdminView: () => void;
  refreshBusiness: () => Promise<void>;
  getHref: (path: string) => string;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const SESSION_KEY = 'vox_admin_view';

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminViewId, setAdminViewId] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Get admin view ID from URL or sessionStorage
  const getAdminViewId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    // First check URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlViewId = urlParams.get('admin_view');
    
    if (urlViewId) {
      // Save to sessionStorage for persistence
      sessionStorage.setItem(SESSION_KEY, urlViewId);
      return urlViewId;
    }
    
    // Fall back to sessionStorage
    return sessionStorage.getItem(SESSION_KEY);
  }, []);

  // Helper to build href with admin_view parameter
  const getHref = useCallback((path: string): string => {
    const viewId = adminViewId || (typeof window !== 'undefined' ? getAdminViewId() : null);
    if (viewId) {
      return `${path}?admin_view=${viewId}`;
    }
    return path;
  }, [adminViewId, getAdminViewId]);

  // Clear admin view and go back to own dashboard
  const clearAdminView = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
    setAdminViewId(null);
    setIsAdminView(false);
    setBusiness(null);
    setLoading(true);
    // Navigate to dashboard without admin_view
    router.push('/dashboard');
  }, [router]);

  // Load business data
  const loadBusiness = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const viewId = getAdminViewId();
      
      if (viewId) {
        // Admin viewing a tenant - load by ID
        setAdminViewId(viewId);
        setIsAdminView(true);
        
        const res = await fetch(`/api/business/${viewId}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
        } else {
          // Try alternate endpoint
          const tenantRes = await fetch(`/api/admin/tenants?id=${viewId}`);
          if (tenantRes.ok) {
            const tenants = await tenantRes.json();
            if (Array.isArray(tenants) && tenants.length > 0) {
              setBusiness(tenants[0]);
            }
          } else {
            setError('Could not load tenant');
          }
        }
      } else {
        // Normal user - load own business
        setIsAdminView(false);
        setAdminViewId(null);
        
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Not logged in - redirect to login (only on dashboard pages)
          if (pathname?.startsWith('/dashboard')) {
            router.push('/login');
          }
          setLoading(false);
          return;
        }
        
        if (user.email) {
          const res = await fetch(`/api/business/by-email?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.id) {
              setBusiness(data);
            } else {
              // No business - redirect to onboarding
              if (pathname?.startsWith('/dashboard') && pathname !== '/dashboard/onboarding') {
                router.push('/dashboard/onboarding');
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load business:', err);
      setError('Failed to load business data');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [getAdminViewId, pathname, router]);

  // Refresh business data (for use after updates)
  const refreshBusiness = useCallback(async () => {
    await loadBusiness();
  }, [loadBusiness]);

  // Initial load
  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  // Re-check on pathname change (handles navigation)
  useEffect(() => {
    if (initialized && pathname?.startsWith('/dashboard')) {
      // Check if admin_view changed in URL
      const currentViewId = getAdminViewId();
      if (currentViewId !== adminViewId) {
        loadBusiness();
      }
    }
  }, [pathname, initialized, adminViewId, getAdminViewId, loadBusiness]);

  // Debug log (remove after testing)
  if (business) {
    console.log('[BusinessContext] business loaded:', business.name, 'type:', business.type, 'id:', business.id);
  }

  const value: BusinessContextType = {
    business,
    businessId: business?.id || null,
    businessType: business?.type || '',
    isAdminView,
    adminViewId,
    loading,
    error,
    clearAdminView,
    refreshBusiness,
    getHref,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}

// Convenience hook for just getting business type (commonly needed)
export function useBusinessType(): string {
  const { businessType } = useBusiness();
  return businessType;
}
