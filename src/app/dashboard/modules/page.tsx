'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase';
import { useBusiness } from '@/lib/BusinessContext';
import { getBusinessType, ModuleId, MODULES } from '@/lib/modules';
import { Package, Calendar, ShoppingBag, UtensilsCrossed, CalendarCheck, Users, Wrench, CreditCard, Home, Car, FileText, Briefcase } from 'lucide-react';

const moduleIcons: Record<ModuleId, React.ComponentType<{ size?: number; color?: string }>> = {
  appointments: Calendar,
  menu: Package,
  products: Package,
  orders: ShoppingBag,
  kitchen: UtensilsCrossed,
  delivery_slots: Calendar,
  reservations: CalendarCheck,
  services: Briefcase,
  staff: Users,
  workorders: Wrench,
  members: CreditCard,
  properties: Home,
  patients: FileText,
  vehicles: Car,
};

const moduleLabels: Record<ModuleId, string> = {
  appointments: 'Afspraken',
  menu: 'Menu',
  products: 'Producten',
  orders: 'Bestellingen',
  kitchen: 'Keuken',
  delivery_slots: 'Levertijden',
  reservations: 'Reserveringen',
  services: 'Diensten',
  staff: 'Team',
  workorders: 'Werkorders',
  members: 'Leden',
  properties: 'Panden',
  patients: 'Dossiers',
  vehicles: 'Voertuigen',
};

const moduleDescriptions: Record<ModuleId, string> = {
  appointments: 'Plan en beheer afspraken met klanten',
  menu: 'Beheer je menu met gerechten en prijzen',
  products: 'Beheer je producten, prijzen en categorieën',
  orders: 'Ontvang en verwerk bestellingen',
  kitchen: 'Keukenweergave voor bestellingen',
  delivery_slots: 'Stel levertijden en bezorgslots in',
  reservations: 'Tafelreserveringen beheren',
  services: 'Diensten en prijzen invoeren',
  staff: 'Teamleden en roosters beheren',
  workorders: 'Werkorders en opdrachten bijhouden',
  members: 'Ledenbestand en abonnementen',
  properties: 'Panden en woningen beheren',
  patients: 'Patiëntendossiers bijhouden',
  vehicles: 'Voertuigregistratie beheren',
};

export default function ModulesPage() {
  const { business, refreshBusiness } = useBusiness();
  const [enabledModules, setEnabledModules] = useState<ModuleId[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const businessType = business?.type ? getBusinessType(business.type) : null;
  const availableModules = businessType?.modules || [];

  useEffect(() => {
    if (business) {
      if (business.enabled_modules) {
        setEnabledModules(business.enabled_modules);
      } else if (businessType) {
        setEnabledModules(businessType.modules);
      }
    }
  }, [business, businessType]);

  const toggleModule = async (moduleId: ModuleId) => {
    const newEnabled = enabledModules.includes(moduleId)
      ? enabledModules.filter(m => m !== moduleId)
      : [...enabledModules, moduleId];
    
    setEnabledModules(newEnabled);
    setSaving(true);

    try {
      if (!business?.id) return;
      
      const supabase = createClient();
      const { error } = await supabase
        .from('businesses')
        .update({ enabled_modules: newEnabled } as any)
        .eq('id', business.id);

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refreshBusiness();
    } catch (err) {
      console.error('Error saving modules:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>
            Modules
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            Kies welke functies je wilt gebruiken. Schakel modules in of uit met de slider.
          </p>
        </div>

        {saved && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
            color: '#22c55e',
            fontSize: 14,
          }}>
            Modules opgeslagen!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {availableModules.map((moduleId) => {
            const isEnabled = enabledModules.includes(moduleId);
            const Icon = moduleIcons[moduleId];
            const label = moduleLabels[moduleId];
            const description = moduleDescriptions[moduleId];

            return (
              <div
                key={moduleId}
                style={{
                  background: '#16161f',
                  border: '1px solid #2a2a35',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: isEnabled ? 'rgba(249, 115, 22, 0.15)' : '#0a0a0f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={22} color={isEnabled ? '#f97316' : '#4b5563'} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: isEnabled ? 'white' : '#4b5563',
                      marginBottom: 4,
                      transition: 'color 0.2s',
                    }}>
                      {label}
                    </h3>
                    <p style={{
                      fontSize: 13,
                      color: isEnabled ? '#9ca3af' : '#374151',
                      transition: 'color 0.2s',
                    }}>
                      {description}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleModule(moduleId)}
                  disabled={saving}
                  style={{
                    position: 'relative',
                    width: 52,
                    height: 28,
                    borderRadius: 14,
                    border: 'none',
                    background: isEnabled ? '#f97316' : '#374151',
                    cursor: saving ? 'wait' : 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 3,
                    left: isEnabled ? 27 : 3,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            );
          })}
        </div>

        {availableModules.length === 0 && (
          <div style={{
            background: '#16161f',
            border: '1px solid #2a2a35',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
          }}>
            <p style={{ color: '#9ca3af' }}>
              Geen modules beschikbaar voor dit bedrijfstype.
            </p>
          </div>
        )}

        <div style={{
          marginTop: 32,
          padding: 16,
          background: 'rgba(249, 115, 22, 0.1)',
          borderRadius: 8,
          border: '1px solid rgba(249, 115, 22, 0.2)',
        }}>
          <p style={{ color: '#f97316', fontSize: 13 }}>
            💡 <strong>Tip:</strong> Schakel alleen de modules in die je echt gebruikt. 
            Zo blijft je dashboard overzichtelijk.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
