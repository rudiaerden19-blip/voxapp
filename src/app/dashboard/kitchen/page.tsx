'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChefHat, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase';
import { useBusiness } from '@/lib/BusinessContext';

export default function KitchenPage() {
  const { business } = useBusiness();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const bizIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve business ID once, store in ref to avoid stale closures
  useEffect(() => {
    if (business?.id) {
      bizIdRef.current = business.id;
      return;
    }
    if (bizIdRef.current) return; // already resolved

    const params = new URLSearchParams(window.location.search);
    const adminView = params.get('admin_view');
    if (adminView) { bizIdRef.current = adminView; return; }

    const stored = sessionStorage.getItem('vox_admin_view');
    if (stored) { bizIdRef.current = stored; return; }

    const supabase = createClient();
    supabase.from('businesses').select('id').limit(1).single()
      .then(({ data }) => {
        if (data?.id) {
          bizIdRef.current = data.id;
          fetchOrders();
        }
      });
  }, [business?.id]);

  const fetchOrders = useCallback(async () => {
    const id = bizIdRef.current;
    if (!id) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', id)
      .in('status', ['pending', 'new', 'preparing', 'ready'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setOrders(data);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    if (bizIdRef.current) fetchOrders();
    else {
      const t = setTimeout(() => { if (bizIdRef.current) fetchOrders(); }, 1000);
      return () => clearTimeout(t);
    }
  }, [business?.id, fetchOrders]);

  // Auto-refresh
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchOrders, 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (newStatus === 'completed' || newStatus === 'cancelled') {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ChefHat size={32} style={{ color: '#f97316' }} />
            Keuken
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            {orders.length} {orders.length === 1 ? 'bestelling' : 'bestellingen'} •{' '}
            Laatste update: {lastRefresh.toLocaleTimeString('nl-BE')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setAutoRefresh(v => !v)}
            style={{
              padding: '10px 16px', background: autoRefresh ? '#22c55e' : '#2a2a35',
              border: 'none', borderRadius: 8, color: 'white', fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <RefreshCw size={16} /> Auto-refresh
          </button>
          <button
            onClick={fetchOrders}
            style={{
              padding: '10px 16px', background: '#f97316', border: 'none', borderRadius: 8,
              color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Ververs nu
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ background: '#16161f', borderRadius: 16, padding: 60, textAlign: 'center', border: '1px solid #2a2a35' }}>
          <ChefHat size={48} style={{ color: '#4b5563', marginBottom: 16 }} />
          <p style={{ color: '#6b7280', fontSize: 18 }}>Geen bestellingen</p>
          <p style={{ color: '#4b5563', fontSize: 14, marginTop: 8 }}>Nieuwe bestellingen verschijnen hier automatisch</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {orders.map(order => {
            const isPending = order.status === 'pending' || order.status === 'new';
            const statusColor = isPending ? '#f97316' : order.status === 'preparing' ? '#3b82f6' : '#22c55e';
            const statusLabel = isPending ? 'NIEUW' : order.status === 'preparing' ? 'IN BEREIDING' : 'KLAAR';
            const typeLabel = order.order_type === 'delivery' ? 'LEVERING' : 'AFHALEN';
            const time = new Date(order.created_at).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={order.id} style={{
                background: '#fff', borderRadius: 4, overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)', fontFamily: "'Courier New', Courier, monospace",
                border: `3px solid ${statusColor}`,
              }}>
                {/* Ticket header */}
                <div style={{ background: statusColor, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: 22 }}>
                    #{order.order_number || order.id.slice(-4).toUpperCase()}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, background: 'rgba(0,0,0,0.2)', padding: '3px 10px', borderRadius: 4 }}>
                    {statusLabel}
                  </span>
                </div>

                {/* Ticket body — receipt style */}
                <div style={{ padding: '16px 20px', color: '#111' }}>
                  {/* Type + tijd */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #999', paddingBottom: 10, marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{typeLabel}</span>
                    <span style={{ fontSize: 14, color: '#555' }}>{time}</span>
                  </div>

                  {/* Klantgegevens */}
                  <div style={{ borderBottom: '1px dashed #999', paddingBottom: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#777' }}>Klant:</span>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{order.customer_name || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#777' }}>Tel:</span>
                      <span style={{ fontSize: 14 }}>{order.customer_phone || '-'}</span>
                    </div>
                  </div>

                  {/* Bestelling items */}
                  <div style={{ borderBottom: '1px dashed #999', paddingBottom: 12, marginBottom: 12, minHeight: 48 }}>
                    <div style={{ fontSize: 12, color: '#777', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Bestelling</div>
                    {order.notes ? (
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {order.notes}
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: '#aaa', fontStyle: 'italic' }}>Geen details</div>
                    )}
                  </div>

                  {/* Totaal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>TOTAAL</span>
                    <span style={{ fontSize: 22, fontWeight: 900 }}>
                      {order.total_amount > 0 ? `€${Number(order.total_amount).toFixed(2)}` : '—'}
                    </span>
                  </div>

                  {/* Actieknoppen */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isPending && (
                      <>
                        <button onClick={() => updateStatus(order.id, 'preparing')} style={{
                          flex: 1, padding: '12px', background: '#3b82f6', border: 'none', borderRadius: 6,
                          color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                        }}>
                          START BEREIDING
                        </button>
                        <button onClick={() => updateStatus(order.id, 'cancelled')} style={{
                          padding: '12px 14px', background: '#fee2e2', border: '1px solid #ef4444',
                          borderRadius: 6, color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: 15,
                        }}>✕</button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button onClick={() => updateStatus(order.id, 'ready')} style={{
                        flex: 1, padding: '12px', background: '#22c55e', border: 'none', borderRadius: 6,
                        color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      }}>
                        KLAAR
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button onClick={() => updateStatus(order.id, 'completed')} style={{
                        flex: 1, padding: '12px', background: '#6b7280', border: 'none', borderRadius: 6,
                        color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      }}>
                        AFGEHAALD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
