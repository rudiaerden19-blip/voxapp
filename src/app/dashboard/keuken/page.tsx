'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useBusiness } from '@/lib/BusinessContext';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Clock, Phone, User, ChefHat, Check, X, Bell, RefreshCw, Printer } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string | null;
}

interface Order {
  id: string;
  order_number?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  order_type?: 'pickup' | 'delivery' | string | null;
  status: string;
  total_amount: number | null;
  notes?: string | null;
  estimated_ready_time?: string | null;
  pickup_time?: string | null;
  created_at: string;
  order_items?: OrderItem[] | any;
  source?: string | null;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#f97316', text: 'white', label: 'Nieuw' },
  preparing: { bg: '#3b82f6', text: 'white', label: 'In bereiding' },
  ready: { bg: '#22c55e', text: 'white', label: 'Klaar' },
  completed: { bg: '#6b7280', text: 'white', label: 'Afgehaald' },
  cancelled: { bg: '#ef4444', text: 'white', label: 'Geannuleerd' },
};

const sourceIcons: Record<string, string> = {
  phone: '📞',
  whatsapp: '💬',
  online: '🌐',
  'walk-in': '🚶',
};

export default function KeukenPage() {
  const { business, loading: businessLoading } = useBusiness();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [playSound, setPlaySound] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const loadOrders = useCallback(async () => {
    if (!business?.id) return;
    
    const supabase = createClient();
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });
    
    if (filter === 'active') {
      query = query.in('status', ['pending', 'preparing', 'ready']);
    }
    
    const { data, error } = await query.limit(50);
    
    if (!error && data) {
      // Check for new orders
      const pendingOrders = data.filter(o => o.status === 'pending');
      if (pendingOrders.length > lastOrderCount && playSound && lastOrderCount > 0) {
        playNotificationSound();
      }
      setLastOrderCount(pendingOrders.length);
      setOrders(data);
    }
    
    setLoading(false);
  }, [business?.id, filter, lastOrderCount, playSound]);

  useEffect(() => {
    if (business?.id) {
      loadOrders();
      
      // Poll every 5 seconds for new orders
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [business?.id, loadOrders]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (!error) {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
      ));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Nu';
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    return `${hours}u ${diffMins % 60}m`;
  };

  if (businessLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <RefreshCw size={32} className="animate-spin" style={{ color: '#f97316' }} />
        </div>
      </DashboardLayout>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <DashboardLayout>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ChefHat size={32} style={{ color: '#f97316' }} />
              Keuken
            </h1>
            <p style={{ color: '#9ca3af', marginTop: 4 }}>
              {pendingOrders.length} nieuwe • {preparingOrders.length} in bereiding • {readyOrders.length} klaar
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => setPlaySound(!playSound)}
              style={{
                padding: '10px 16px',
                background: playSound ? '#f9731620' : '#1e293b',
                border: `1px solid ${playSound ? '#f97316' : '#334155'}`,
                borderRadius: 8,
                color: playSound ? '#f97316' : '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Bell size={18} />
              Geluid {playSound ? 'aan' : 'uit'}
            </button>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'active' | 'all')}
              style={{
                padding: '10px 16px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="active">Actieve bestellingen</option>
              <option value="all">Alle bestellingen</option>
            </select>
            
            <button
              onClick={loadOrders}
              style={{
                padding: '10px 16px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RefreshCw size={18} />
              Vernieuwen
            </button>
          </div>
        </div>

        {/* Orders Grid - 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {/* Column 1: Nieuw */}
          <div>
            <div style={{ 
              background: '#f9731640', 
              borderRadius: '12px 12px 0 0', 
              padding: '12px 16px',
              borderBottom: '2px solid #f97316',
            }}>
              <h2 style={{ color: '#f97316', fontSize: 16, fontWeight: 600, margin: 0 }}>
                🔔 Nieuw ({pendingOrders.length})
              </h2>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '0 0 12px 12px', padding: 12, minHeight: 400 }}>
              {pendingOrders.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Geen nieuwe bestellingen</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pendingOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onUpdateStatus={updateOrderStatus}
                      formatTime={formatTime}
                      getTimeSince={getTimeSince}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In bereiding */}
          <div>
            <div style={{ 
              background: '#3b82f640', 
              borderRadius: '12px 12px 0 0', 
              padding: '12px 16px',
              borderBottom: '2px solid #3b82f6',
            }}>
              <h2 style={{ color: '#3b82f6', fontSize: 16, fontWeight: 600, margin: 0 }}>
                👨‍🍳 In bereiding ({preparingOrders.length})
              </h2>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '0 0 12px 12px', padding: 12, minHeight: 400 }}>
              {preparingOrders.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Geen bestellingen in bereiding</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {preparingOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onUpdateStatus={updateOrderStatus}
                      formatTime={formatTime}
                      getTimeSince={getTimeSince}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Klaar */}
          <div>
            <div style={{ 
              background: '#22c55e40', 
              borderRadius: '12px 12px 0 0', 
              padding: '12px 16px',
              borderBottom: '2px solid #22c55e',
            }}>
              <h2 style={{ color: '#22c55e', fontSize: 16, fontWeight: 600, margin: 0 }}>
                ✅ Klaar ({readyOrders.length})
              </h2>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '0 0 12px 12px', padding: 12, minHeight: 400 }}>
              {readyOrders.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Geen klare bestellingen</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {readyOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onUpdateStatus={updateOrderStatus}
                      formatTime={formatTime}
                      getTimeSince={getTimeSince}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Order Card Component
function OrderCard({ 
  order, 
  onUpdateStatus,
  formatTime,
  getTimeSince,
}: { 
  order: Order; 
  onUpdateStatus: (id: string, status: string) => void;
  formatTime: (date: string) => string;
  getTimeSince: (date: string) => string;
}) {
  const statusInfo = statusColors[order.status];
  
  return (
    <div style={{
      background: '#0f172a',
      borderRadius: 12,
      border: `2px solid ${order.status === 'pending' ? '#f97316' : '#334155'}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        background: order.status === 'pending' ? '#f9731620' : 'transparent',
        borderBottom: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
            #{order.order_number || order.id.slice(0, 6).toUpperCase()}
          </span>
          <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 8 }}>
            {sourceIcons[order.source || 'walk-in']} {order.order_type === 'delivery' ? '🛵 Levering' : '🏃 Afhalen'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#9ca3af', fontSize: 13 }}>{getTimeSince(order.created_at)}</span>
        </div>
      </div>

      {/* Items */}
      <div style={{ padding: 16 }}>
        {order.order_items && order.order_items.length > 0 ? (
          <div style={{ marginBottom: 12 }}>
            {order.order_items.map((item: OrderItem, idx: number) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: idx < order.order_items!.length - 1 ? '1px solid #334155' : 'none',
              }}>
                <span style={{ color: 'white', fontSize: 14 }}>
                  <strong style={{ color: '#f97316' }}>{item.quantity}x</strong> {item.name}
                </span>
                <span style={{ color: '#9ca3af', fontSize: 14 }}>€{item.total_price?.toFixed(2) || '0.00'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6b7280', fontSize: 14 }}>Geen items</p>
        )}

        {order.notes && (
          <div style={{ 
            background: '#fef3c720', 
            border: '1px solid #fef3c7', 
            borderRadius: 8, 
            padding: 10,
            marginBottom: 12,
          }}>
            <p style={{ color: '#fef3c7', fontSize: 13, margin: 0 }}>📝 {order.notes}</p>
          </div>
        )}

        {/* Customer info */}
        {order.customer_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <User size={14} style={{ color: '#9ca3af' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>{order.customer_name}</span>
          </div>
        )}
        {order.customer_phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Phone size={14} style={{ color: '#9ca3af' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>{order.customer_phone}</span>
          </div>
        )}

        {/* Total */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 0',
          borderTop: '1px solid #334155',
        }}>
          <span style={{ color: 'white', fontWeight: 600 }}>Totaal</span>
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>
            €{(order.total_amount || 0).toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'preparing')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <ChefHat size={18} />
                Start bereiding
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'cancelled')}
                style={{
                  padding: '12px 16px',
                  background: '#ef444420',
                  border: '1px solid #ef4444',
                  borderRadius: 8,
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </>
          )}
          
          {order.status === 'preparing' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'ready')}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#22c55e',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Check size={18} />
              Klaar!
            </button>
          )}
          
          {order.status === 'ready' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'completed')}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#6b7280',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Check size={18} />
              Afgehaald
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
