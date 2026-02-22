'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChefHat, Clock, Check, Phone, MapPin, User, RefreshCw } from 'lucide-react';
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const isPending = order.status === 'pending' || order.status === 'new';
            const headerBg = isPending ? '#f97316' : order.status === 'preparing' ? '#3b82f6' : '#22c55e';
            return (
              <div key={order.id} style={{ background: '#16161f', borderRadius: 16, border: `2px solid ${headerBg}`, overflow: 'hidden' }}>
                <div style={{ background: headerBg, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                      #{order.order_number || order.id.slice(-4).toUpperCase()}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                      {order.order_type === 'delivery' ? '🚗 LEVERING' : '🏪 AFHALEN'}
                    </span>
                    {order.source === 'phone' && (
                      <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>📞 Telefoon</span>
                    )}
                  </div>
                  <span style={{ color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} />
                    {new Date(order.created_at).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                    {order.customer_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={18} style={{ color: '#f97316' }} />
                        <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>{order.customer_name}</span>
                      </div>
                    )}
                    {order.customer_phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone size={16} style={{ color: '#6b7280' }} />
                        <span style={{ color: '#9ca3af' }}>{order.customer_phone}</span>
                      </div>
                    )}
                    {order.customer_address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={16} style={{ color: '#6b7280' }} />
                        <span style={{ color: '#9ca3af' }}>{order.customer_address}</span>
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div style={{ background: '#0a0a0f', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                      <p style={{ color: '#fbbf24', fontSize: 15, margin: 0, whiteSpace: 'pre-wrap' }}>📝 {order.notes}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {order.total_amount > 0 && (
                        <span style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>€{Number(order.total_amount).toFixed(2)}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isPending && (
                        <>
                          <button onClick={() => updateStatus(order.id, 'preparing')} style={{
                            padding: '12px 24px', background: '#3b82f6', border: 'none', borderRadius: 10,
                            color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                          }}>
                            <ChefHat size={20} /> START BEREIDING
                          </button>
                          <button onClick={() => updateStatus(order.id, 'cancelled')} style={{
                            padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
                            borderRadius: 10, color: '#ef4444', cursor: 'pointer',
                          }}>✕</button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => updateStatus(order.id, 'ready')} style={{
                          padding: '12px 24px', background: '#22c55e', border: 'none', borderRadius: 10,
                          color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <Check size={20} /> KLAAR
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button onClick={() => updateStatus(order.id, 'completed')} style={{
                          padding: '12px 24px', background: '#6b7280', border: 'none', borderRadius: 10,
                          color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <Check size={20} /> AFGEHAALD
                        </button>
                      )}
                    </div>
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
