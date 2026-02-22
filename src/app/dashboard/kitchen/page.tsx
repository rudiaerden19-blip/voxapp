'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Clock, Check, Phone, MapPin, User, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ModuleGuard from '@/components/ModuleGuard';
import { useBusiness } from '@/lib/BusinessContext';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  options?: string;
  notes?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_time?: string;
  items: OrderItem[];
  total_amount: number;
  status: 'new' | 'preparing' | 'ready' | 'delivered' | 'archived';
  notes?: string;
  created_at: string;
}

export default function KitchenPage() {
  const { businessId, loading: businessLoading } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!businessId) return;
    
    try {
      const res = await fetch(`/api/orders?business_id=${businessId}&status=new,preparing,ready`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setLastRefresh(new Date());
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
      setError('Kon bestellingen niet laden');
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    if (businessId) {
      loadOrders();
    }
  }, [businessId, loadOrders]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadOrders]);

  const markAsReady = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    } catch (e) {
      console.error('Failed to update order:', e);
    }
  };

  if (businessLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <ModuleGuard moduleId="kitchen">
      <DashboardLayout>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ChefHat size={32} style={{ color: '#f97316' }} />
              Keuken
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              {orders.length} {orders.length === 1 ? 'bestelling' : 'bestellingen'} • 
              Laatste update: {lastRefresh.toLocaleTimeString('nl-BE')}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                padding: '10px 16px',
                background: autoRefresh ? '#22c55e' : '#2a2a35',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RefreshCw size={16} />
              Auto-refresh
            </button>
            <button
              onClick={loadOrders}
              style={{
                padding: '10px 16px',
                background: '#f97316',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ververs nu
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: 16, marginBottom: 24, color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div style={{ 
            background: '#16161f', 
            borderRadius: 16, 
            padding: 60, 
            textAlign: 'center',
            border: '1px solid #2a2a35',
          }}>
            <ChefHat size={48} style={{ color: '#4b5563', marginBottom: 16 }} />
            <p style={{ color: '#6b7280', fontSize: 18 }}>Geen bestellingen</p>
            <p style={{ color: '#4b5563', fontSize: 14, marginTop: 8 }}>Nieuwe bestellingen verschijnen hier automatisch</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order.id} style={{
                background: '#16161f',
                borderRadius: 16,
                border: '2px solid #f97316',
                overflow: 'hidden',
              }}>
                {/* Order Header */}
                <div style={{ 
                  background: '#f97316', 
                  padding: '12px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                      #{order.id.slice(-4).toUpperCase()}
                    </span>
                    <span style={{ 
                      background: order.delivery_type === 'delivery' ? '#3b82f6' : '#22c55e',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      {order.delivery_type === 'delivery' ? '🚗 LEVERING' : '🏪 AFHALEN'}
                    </span>
                  </div>
                  <span style={{ color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} />
                    {new Date(order.created_at).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Order Content */}
                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 24, alignItems: 'start' }}>
                  {/* Customer Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <User size={18} style={{ color: '#f97316' }} />
                      <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>{order.customer_name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Phone size={16} style={{ color: '#6b7280' }} />
                      <span style={{ color: '#9ca3af' }}>{order.customer_phone}</span>
                    </div>
                    {order.delivery_type === 'delivery' && order.customer_address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <MapPin size={16} style={{ color: '#6b7280', marginTop: 2 }} />
                        <span style={{ color: '#9ca3af' }}>{order.customer_address}</span>
                      </div>
                    )}
                    {order.delivery_time && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: 8 }}>
                        <span style={{ color: '#f97316', fontWeight: 600 }}>⏰ {order.delivery_time}</span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div style={{ background: '#0a0a0f', borderRadius: 12, padding: 16 }}>
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '10px 0',
                        borderBottom: idx < order.items.length - 1 ? '1px solid #2a2a35' : 'none',
                      }}>
                        <div>
                          <span style={{ color: '#f97316', fontWeight: 700, fontSize: 18, marginRight: 12 }}>{item.quantity}x</span>
                          <span style={{ color: 'white', fontSize: 16 }}>{item.product_name}</span>
                          {item.options && (
                            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4, marginLeft: 36 }}>{item.options}</p>
                          )}
                          {item.notes && (
                            <p style={{ color: '#fbbf24', fontSize: 13, marginTop: 4, marginLeft: 36 }}>📝 {item.notes}</p>
                          )}
                        </div>
                        <span style={{ color: '#9ca3af' }}>€{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <div style={{ marginTop: 12, padding: 12, background: 'rgba(249, 115, 22, 0.1)', borderRadius: 8 }}>
                        <span style={{ color: '#f97316', fontWeight: 600 }}>Opmerkingen: </span>
                        <span style={{ color: '#fbbf24' }}>{order.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Total & Action */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 4 }}>Totaal</p>
                    <p style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
                      €{order.total_amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => markAsReady(order.id)}
                      style={{
                        width: '100%',
                        padding: '16px 24px',
                        background: '#22c55e',
                        border: 'none',
                        borderRadius: 12,
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                      }}
                    >
                      <Check size={24} />
                      KLAAR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </ModuleGuard>
  );
}
