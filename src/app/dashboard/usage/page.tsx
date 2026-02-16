'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useBusiness } from '@/lib/BusinessContext';
import { Phone, Clock, TrendingUp, AlertCircle, BarChart3, Calendar, Euro } from 'lucide-react';

interface UsageData {
  business: {
    id: string;
    name: string;
    plan: string;
  };
  currentMonth: {
    month: string;
    totalCalls: number;
    totalMinutes: number;
    includedMinutes: number;
    extraMinutes: number;
    extraCost: number;
    usagePercentage: number;
    avgMinutesPerDay: number;
    projectedMonthlyMinutes: number;
  };
  recentCalls: Array<{
    id: string;
    duration_minutes: number;
    caller_phone: string | null;
    status: string;
    summary: string | null;
    created_at: string;
  }>;
  usageHistory: Array<{
    month: string;
    total_calls: number;
    total_minutes: number;
    extra_minutes: number;
  }>;
  limits: {
    includedMinutes: number;
    extraMinuteCost: number;
  };
}

export default function UsagePage() {
  const { businessId } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (businessId) {
      fetchUsage();
    }
  }, [businessId]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/usage?business_id=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      } else {
        setError('Kon verbruik niet laden');
      }
    } catch (e) {
      setError('Fout bij laden verbruik');
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${months[parseInt(m) - 1]} ${year}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-BE', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'transferred': return '#f97316';
      case 'failed': return '#ef4444';
      case 'missed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Voltooid';
      case 'transferred': return 'Doorgeschakeld';
      case 'failed': return 'Mislukt';
      case 'missed': return 'Gemist';
      default: return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
          Laden...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !usage) {
    return (
      <DashboardLayout>
        <div style={{ padding: 24, textAlign: 'center', color: '#ef4444' }}>
          {error || 'Geen data beschikbaar'}
        </div>
      </DashboardLayout>
    );
  }

  const isOverLimit = usage.currentMonth.extraMinutes > 0;
  const isNearLimit = usage.currentMonth.usagePercentage >= 80 && !isOverLimit;

  return (
    <DashboardLayout>
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111' }}>Verbruik</h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>
            Bekijk uw AI-minuten en gespreksgeschiedenis
          </p>
        </div>

        {/* Warning Alert */}
        {(isOverLimit || isNearLimit) && (
          <div style={{
            background: isOverLimit ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${isOverLimit ? '#fecaca' : '#fde68a'}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <AlertCircle size={24} color={isOverLimit ? '#ef4444' : '#f59e0b'} />
            <div>
              <div style={{ fontWeight: 600, color: isOverLimit ? '#dc2626' : '#d97706' }}>
                {isOverLimit ? 'Limiet overschreden' : 'Bijna aan limiet'}
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>
                {isOverLimit 
                  ? `U heeft ${usage.currentMonth.extraMinutes} extra minuten gebruikt (€${usage.currentMonth.extraCost} extra kosten)`
                  : `U heeft ${usage.currentMonth.usagePercentage}% van uw limiet gebruikt`
                }
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}>
          {/* Total Calls */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Phone size={18} color="#6366f1" />
              <span style={{ fontSize: 14, color: '#6b7280' }}>Totaal Oproepen</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#111' }}>
              {usage.currentMonth.totalCalls}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>deze maand</div>
          </div>

          {/* Total Minutes */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock size={18} color="#22c55e" />
              <span style={{ fontSize: 14, color: '#6b7280' }}>Minuten Gebruikt</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#111' }}>
              {usage.currentMonth.totalMinutes}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              van {usage.currentMonth.includedMinutes} inbegrepen
            </div>
          </div>

          {/* Extra Minutes */}
          <div style={{
            background: isOverLimit ? '#fef2f2' : 'white',
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${isOverLimit ? '#fecaca' : '#e5e7eb'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Euro size={18} color={isOverLimit ? '#ef4444' : '#6b7280'} />
              <span style={{ fontSize: 14, color: '#6b7280' }}>Extra Kosten</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: isOverLimit ? '#ef4444' : '#111' }}>
              €{usage.currentMonth.extraCost.toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {usage.currentMonth.extraMinutes} extra minuten
            </div>
          </div>

          {/* Projection */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 20,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <TrendingUp size={18} color="#f97316" />
              <span style={{ fontSize: 14, color: '#6b7280' }}>Geschatte Maand</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#111' }}>
              {usage.currentMonth.projectedMonthlyMinutes}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              minuten (±{usage.currentMonth.avgMinutesPerDay}/dag)
            </div>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          border: '1px solid #e5e7eb',
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Verbruik deze maand</span>
            <span style={{ color: '#6b7280' }}>
              {usage.currentMonth.totalMinutes} / {usage.currentMonth.includedMinutes} min
            </span>
          </div>
          <div style={{
            background: '#f3f4f6',
            borderRadius: 999,
            height: 12,
            overflow: 'hidden',
          }}>
            <div style={{
              background: isOverLimit 
                ? 'linear-gradient(90deg, #22c55e 0%, #f59e0b 80%, #ef4444 100%)'
                : isNearLimit 
                  ? 'linear-gradient(90deg, #22c55e 0%, #f59e0b 100%)'
                  : '#22c55e',
              height: '100%',
              width: `${Math.min(100, usage.currentMonth.usagePercentage)}%`,
              borderRadius: 999,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: 8,
            fontSize: 12,
            color: '#6b7280',
          }}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
        }}>
          {/* Usage History */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <BarChart3 size={20} color="#6366f1" />
              <span style={{ fontWeight: 600, fontSize: 18 }}>Verbruik Geschiedenis</span>
            </div>
            {usage.usageHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {usage.usageHistory.map((month) => (
                  <div key={month.month} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <span style={{ fontWeight: 500 }}>{formatMonth(month.month)}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>{month.total_minutes} min</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {month.total_calls} oproepen
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>
                Nog geen verbruiksgeschiedenis
              </div>
            )}
          </div>

          {/* Recent Calls */}
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Calendar size={20} color="#22c55e" />
              <span style={{ fontWeight: 600, fontSize: 18 }}>Recente Oproepen</span>
            </div>
            {usage.recentCalls.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
                {usage.recentCalls.map((call) => (
                  <div key={call.id} style={{
                    padding: 12,
                    background: '#f9fafb',
                    borderRadius: 8,
                    borderLeft: `4px solid ${getStatusColor(call.status)}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>
                        {call.caller_phone || 'Onbekend nummer'}
                      </span>
                      <span style={{ 
                        fontSize: 12, 
                        color: getStatusColor(call.status),
                        fontWeight: 500,
                      }}>
                        {getStatusLabel(call.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                      <span>{call.duration_minutes} min</span>
                      <span>{formatDate(call.created_at)}</span>
                    </div>
                    {call.summary && (
                      <div style={{ 
                        marginTop: 8, 
                        fontSize: 13, 
                        color: '#374151',
                        lineHeight: 1.4,
                      }}>
                        {call.summary.length > 100 ? call.summary.slice(0, 100) + '...' : call.summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>
                Nog geen oproepen ontvangen
              </div>
            )}
          </div>
        </div>

        {/* Plan Info */}
        <div style={{
          marginTop: 32,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: 12,
          padding: 24,
          color: 'white',
        }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
            Uw Plan: {usage.business.plan.charAt(0).toUpperCase() + usage.business.plan.slice(1)}
          </div>
          <div style={{ opacity: 0.9, marginBottom: 16 }}>
            {usage.limits.includedMinutes} minuten inbegrepen per maand • 
            €{usage.limits.extraMinuteCost.toFixed(2)} per extra minuut
          </div>
          <button style={{
            background: 'white',
            color: '#6366f1',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Upgrade Plan
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
