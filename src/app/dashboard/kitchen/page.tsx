'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Clock, Check, X, Phone, MapPin, User, Package, RefreshCw, Archive } from 'lucide-react';
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

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        if (newStatus === 'archived' || newStatus === 'delivered') {
          setOrders(prev => prev.filter(o => o.id !== orderId));
        } else {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
      }
    } catch (e) {
      console.error('Failed to update order:', e);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'new': return { bg: '#ef4444', text: 'white' };
      case 'preparing': return { bg: '#f97316', text: 'white' };
      case 'ready': return { bg: '#22c55e', text: 'white' };
      default: return { bg: '#6b7280', text: 'white' };
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'NIEUW';
      case 'preparing': return 'IN BEREIDING';
      case 'ready': return 'KLAAR';
      default: return status;
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
  };

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  if (businessLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <ModuleGuard requiredModule="kitchen">
      <DashboardLayout>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ChefHat size={32} style={{ color: '#f97316' }} />
              Keuken
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Laatste update: {lastRefresh.toLocaleTimeString('nl-BE')} • 
              {autoRefresh ? ' Auto-refresh aan' : ' Auto-refresh uit'}
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
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
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

        {/* Order Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, minHeight: 'calc(100vh - 200px)' }}>
          {/* New Orders */}
          <div style={{ background: '#16161f', borderRadius: 16, border: '2px solid #ef4444', padding: 16 }}>
            <h2 style={{ color: '#ef4444', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔔 NIEUW ({newOrders.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {newOrders.map(order => (
                <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
              ))}
              {newOrders.length === 0 && (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Geen nieuwe bestellingen</p>
              )}
            </div>
          </div>

          {/* Preparing */}
          <div style={{ background: '#16161f', borderRadius: 16, border: '2px solid #f97316', padding: 16 }}>
            <h2 style={{ color: '#f97316', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              👨‍🍳 IN BEREIDING ({preparingOrders.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
              ))}
              {preparingOrders.length === 0 && (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Geen bestellingen in bereiding</p>
              )}
            </div>
          </div>

          {/* Ready */}
          <div style={{ background: '#16161f', borderRadius: 16, border: '2px solid #22c55e', padding: 16 }}>
            <h2 style={{ color: '#22c55e', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✅ KLAAR ({readyOrders.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} />
              ))}
              {readyOrders.length === 0 && (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Geen klare bestellingen</p>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ModuleGuard>
  );
}

function OrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: Order['status']) => void }) {
  const statusColors = {
    new: { bg: '#ef4444', next: 'preparing', nextLabel: 'Start bereiding' },
    preparing: { bg: '#f97316', next: 'ready', nextLabel: 'Klaar' },
    ready: { bg: '#22c55e', next: 'delivered', nextLabel: 'Geleverd/Afgehaald' },
  };

  const config = statusColors[order.status as keyof typeof statusColors];

  return (
    <div style={{
      background: '#0a0a0f',
      borderRadius: 12,
      border: `1px solid ${config?.bg || '#2a2a35'}`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ background: config?.bg, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
          #{order.id.slice(-4).toUpperCase()}
        </span>
        <span style={{ color: 'white', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} />
          {new Date(order.created_at).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: 12 }}>
        {/* Customer Info */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <User size={14} style={{ color: '#f97316' }} />
            <span style={{ color: 'white', fontWeight: 600 }}>{order.customer_name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Phone size={14} style={{ color: '#6b7280' }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>{order.customer_phone}</span>
          </div>
          {order.delivery_type === 'delivery' && order.customer_address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} style={{ color: '#6b7280' }} />
              <span style={{ color: '#9ca3af', fontSize: 13 }}>{order.customer_address}</span>
            </div>
          )}
        </div>

        {/* Delivery Type Badge */}
        <div style={{
          display: 'inline-block',
          padding: '4px 10px',
          background: order.delivery_type === 'delivery' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
          color: order.delivery_type === 'delivery' ? '#3b82f6' : '#22c55e',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 12,
        }}>
          {order.delivery_type === 'delivery' ? '🚗 LEVERING' : '🏪 AFHALEN'}
          {order.delivery_time && ` - ${order.delivery_time}`}
        </div>

        {/* Items */}
        <div style={{ background: '#16161f', borderRadius: 8, padding: 10, marginBottom: 12 }}>
          {order.items.map((item, idx) => (
            <div key={item.id || idx} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '6px 0',
              borderBottom: idx < order.items.length - 1 ? '1px solid #2a2a35' : 'none',
            }}>
              <div>
                <span style={{ color: 'white', fontWeight: 600 }}>{item.quantity}x</span>
                <span style={{ color: '#9ca3af', marginLeft: 8 }}>{item.product_name}</span>
                {item.options && (
                  <p style={{ color: '#6b7280', fontSize: 12, margin: '2px 0 0 20px' }}>{item.options}</p>
                )}
              </div>
              <span style={{ color: '#f97316', fontWeight: 600 }}>€{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', borderRadius: 6, padding: 8, marginBottom: 12 }}>
            <p style={{ color: '#f97316', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Opmerkingen:</p>
            <p style={{ color: '#fbbf24', fontSize: 13 }}>{order.notes}</p>
          </div>
        )}

        {/* Total & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>€{order.total_amount.toFixed(2)}</span>
          
          <div style={{ display: 'flex', gap: 8 }}>
            {config && (
              <button
                onClick={() => onStatusChange(order.id, config.next as Order['status'])}
                style={{
                  padding: '8px 16px',
                  background: config.bg,
                  border: 'none',
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Check size={14} />
                {config.nextLabel}
              </button>
            )}
            <button
              onClick={() => onStatusChange(order.id, 'archived')}
              style={{
                padding: '8px 12px',
                background: '#2a2a35',
                border: 'none',
                borderRadius: 6,
                color: '#6b7280',
                fontSize: 13,
                cursor: 'pointer',
              }}
              title="Archiveren"
            >
              <Archive size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
