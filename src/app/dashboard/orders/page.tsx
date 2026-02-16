'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Clock, Search, Filter, Archive, TrendingUp, Euro, Package } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import ModuleGuard from '@/components/ModuleGuard';
import { useBusiness } from '@/lib/BusinessContext';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  options?: string;
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

type FilterPeriod = 'today' | 'week' | 'month' | 'all';

export default function OrdersPage() {
  const { businessId, loading: businessLoading } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (businessId) {
      loadOrders();
    }
  }, [businessId, filterPeriod, showArchived]);

  const loadOrders = async () => {
    if (!businessId) return;
    
    setLoading(true);
    try {
      const status = showArchived ? 'archived' : 'new,preparing,ready,delivered';
      const res = await fetch(`/api/orders?business_id=${businessId}&status=${status}&period=${filterPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
      setError('Kon bestellingen niet laden');
    }
    setLoading(false);
  };

  // Stats
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at).toDateString();
    return orderDate === new Date().toDateString();
  });
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!order.customer_name.toLowerCase().includes(query) &&
          !order.customer_phone.includes(query) &&
          !order.id.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      new: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', label: 'Nieuw' },
      preparing: { bg: 'rgba(249, 115, 22, 0.2)', color: '#f97316', label: 'In bereiding' },
      ready: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', label: 'Klaar' },
      delivered: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', label: 'Geleverd' },
      archived: { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280', label: 'Gearchiveerd' },
    };
    return styles[status] || styles.new;
  };

  if (businessLoading || loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <ModuleGuard moduleId="orders">
      <DashboardLayout>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingBag size={32} style={{ color: '#f97316' }} />
            Bestellingen
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Overzicht en archief van alle bestellingen</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Package size={20} style={{ color: '#f97316' }} />
              <span style={{ color: '#6b7280', fontSize: 14 }}>Vandaag</span>
            </div>
            <p style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{todayOrders.length}</p>
            <p style={{ color: '#6b7280', fontSize: 12 }}>bestellingen</p>
          </div>
          
          <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Euro size={20} style={{ color: '#22c55e' }} />
              <span style={{ color: '#6b7280', fontSize: 14 }}>Omzet vandaag</span>
            </div>
            <p style={{ color: '#22c55e', fontSize: 28, fontWeight: 700 }}>€{todayRevenue.toFixed(2)}</p>
          </div>
          
          <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <TrendingUp size={20} style={{ color: '#3b82f6' }} />
              <span style={{ color: '#6b7280', fontSize: 14 }}>Totaal ({filterPeriod})</span>
            </div>
            <p style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{orders.length}</p>
            <p style={{ color: '#3b82f6', fontSize: 14 }}>€{totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Zoek op naam, telefoon of bestelnr..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: '#0a0a0f',
                  border: '1px solid #2a2a35',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: 14,
                }}
              />
            </div>

            {/* Period Filter */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['today', 'week', 'month', 'all'] as FilterPeriod[]).map(period => (
                <button
                  key={period}
                  onClick={() => setFilterPeriod(period)}
                  style={{
                    padding: '10px 16px',
                    background: filterPeriod === period ? '#f97316' : '#0a0a0f',
                    border: '1px solid #2a2a35',
                    borderRadius: 8,
                    color: filterPeriod === period ? 'white' : '#9ca3af',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {{ today: 'Vandaag', week: 'Week', month: 'Maand', all: 'Alles' }[period]}
                </button>
              ))}
            </div>

            {/* Archive Toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              style={{
                padding: '10px 16px',
                background: showArchived ? '#6b7280' : '#0a0a0f',
                border: '1px solid #2a2a35',
                borderRadius: 8,
                color: showArchived ? 'white' : '#9ca3af',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Archive size={16} />
              {showArchived ? 'Archief' : 'Actief'}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ background: '#16161f', borderRadius: 12, border: '1px solid #2a2a35', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0a0a0f' }}>
                <th style={{ padding: 14, textAlign: 'left', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Bestelnr</th>
                <th style={{ padding: 14, textAlign: 'left', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Klant</th>
                <th style={{ padding: 14, textAlign: 'left', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Items</th>
                <th style={{ padding: 14, textAlign: 'left', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: 14, textAlign: 'right', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Totaal</th>
                <th style={{ padding: 14, textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: 14, textAlign: 'right', color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Tijd</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const badge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} style={{ borderTop: '1px solid #2a2a35' }}>
                    <td style={{ padding: 14 }}>
                      <span style={{ color: '#f97316', fontWeight: 600 }}>#{order.id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td style={{ padding: 14 }}>
                      <p style={{ color: 'white', fontWeight: 500 }}>{order.customer_name}</p>
                      <p style={{ color: '#6b7280', fontSize: 12 }}>{order.customer_phone}</p>
                    </td>
                    <td style={{ padding: 14, color: '#9ca3af', fontSize: 13 }}>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: 14 }}>
                      <span style={{
                        padding: '4px 8px',
                        background: order.delivery_type === 'delivery' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: order.delivery_type === 'delivery' ? '#3b82f6' : '#22c55e',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {order.delivery_type === 'delivery' ? 'Levering' : 'Afhalen'}
                      </span>
                    </td>
                    <td style={{ padding: 14, textAlign: 'right' }}>
                      <span style={{ color: 'white', fontWeight: 600 }}>€{order.total_amount.toFixed(2)}</span>
                    </td>
                    <td style={{ padding: 14, textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: badge.bg,
                        color: badge.color,
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: 14, textAlign: 'right', color: '#6b7280', fontSize: 13 }}>
                      {new Date(order.created_at).toLocaleString('nl-BE', { 
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                    Geen bestellingen gevonden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    </ModuleGuard>
  );
}
