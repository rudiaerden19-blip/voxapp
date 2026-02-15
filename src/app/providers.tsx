'use client';

import { LanguageProvider } from '@/lib/LanguageContext';
import { BusinessProvider } from '@/lib/BusinessContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <BusinessProvider>
        {children}
      </BusinessProvider>
    </LanguageProvider>
  );
}
