'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { ShoppingCart, Plus, Minus, Trash2, Phone, User, Send, ArrowLeft, Clock } from 'lucide-react';
import { useParams } from 'next/navigation';

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  is_available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

interface Business {
  id: string;
  name: string;
  type: string;
  phone?: string;
  opening_hours?: any;
}

export default function BestelPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'menu' | 'cart' | 'checkout' | 'success'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  useEffect(() => {
    loadBusinessAndMenu();
  }, [slug]);

  const loadBusinessAndMenu = async () => {
    const supabase = createClient();
    
    // Find business by slug (name lowercased, no spaces)
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .ilike('name', slug.replace(/-/g, ' '));
    
    if (bizError || !businesses || businesses.length === 0) {
      // Try exact match on slug-like name
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*');
      
      const found = bizData?.find(b => 
        b.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug.toLowerCase()
      );
      
      if (!found) {
        setError('Bedrijf niet gevonden');
        setLoading(false);
        return;
      }
      
      setBusiness(found);
      loadMenu(found.id);
    } else {
      setBusiness(businesses[0]);
      loadMenu(businesses[0].id);
    }
  };

  const loadMenu = async (businessId: string) => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_available', true)
      .order('category')
      .order('name');
    
    if (!error && data) {
      setMenuItems(data);
    }
    
    setLoading(false);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))];
  
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(i => i.category === selectedCategory);

  const submitOrder = async () => {
    if (!business || cart.length === 0) return;
    
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id: business.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          order_type: orderType,
          status: 'pending',
          total_amount: getTotal(),
          notes: notes,
          source: 'online',
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      setOrderNumber(order.order_number);
      setStep('success');
      setCart([]);
      
    } catch (err: any) {
      console.error('Order error:', err);
      setError('Er ging iets mis bij het plaatsen van je bestelling.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'white', fontSize: 18 }}>Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', fontSize: 24, marginBottom: 16 }}>Oeps!</h1>
          <p style={{ color: '#9ca3af' }}>{error}</p>
        </div>
      </div>
    );
  }

  // Success page
  if (step === 'success') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ 
          background: '#1e293b', 
          borderRadius: 24, 
          padding: 48, 
          textAlign: 'center',
          maxWidth: 400,
        }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: '#22c55e', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: 40,
          }}>
            ✓
          </div>
          <h1 style={{ color: 'white', fontSize: 28, marginBottom: 8 }}>Bestelling geplaatst!</h1>
          <p style={{ color: '#22c55e', fontSize: 48, fontWeight: 700, marginBottom: 16 }}>#{orderNumber}</p>
          <p style={{ color: '#9ca3af', marginBottom: 32 }}>
            Je bestelling wordt nu bereid bij {business?.name}. 
            {orderType === 'pickup' ? ' Je krijgt een bericht wanneer deze klaar is.' : ' We leveren zo snel mogelijk!'}
          </p>
          <button
            onClick={() => { setStep('menu'); setOrderNumber(null); }}
            style={{
              padding: '14px 32px',
              background: '#f97316',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Nieuwe bestelling
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    }}>
      {/* Header */}
      <div style={{ 
        background: '#1e293b', 
        padding: '16px 24px', 
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>{business?.name}</h1>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Online bestellen</p>
          </div>
          
          <button
            onClick={() => setStep(step === 'menu' ? 'cart' : 'menu')}
            style={{
              position: 'relative',
              padding: '10px 16px',
              background: cart.length > 0 ? '#f97316' : '#334155',
              border: 'none',
              borderRadius: 12,
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ShoppingCart size={20} />
            <span style={{ fontWeight: 600 }}>€{getTotal().toFixed(2)}</span>
            {cart.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: '#ef4444',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                width: 22,
                height: 22,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        {/* Menu View */}
        {step === 'menu' && (
          <>
            {/* Categories */}
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              overflowX: 'auto', 
              paddingBottom: 16,
              marginBottom: 16,
            }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 20px',
                    background: selectedCategory === cat ? '#f97316' : '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 20,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat === 'all' ? '🍽️ Alles' : cat}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredItems.map(item => {
                const inCart = cart.find(i => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#1e293b',
                      borderRadius: 16,
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: inCart ? '2px solid #f97316' : '1px solid #334155',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: 'white', fontSize: 16, fontWeight: 600, margin: 0 }}>{item.name}</h3>
                      {item.description && (
                        <p style={{ color: '#9ca3af', fontSize: 13, margin: '4px 0 0' }}>{item.description}</p>
                      )}
                      <p style={{ color: '#f97316', fontSize: 16, fontWeight: 700, margin: '8px 0 0' }}>
                        €{item.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {inCart ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#334155',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Minus size={18} />
                        </button>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: 18, minWidth: 30, textAlign: 'center' }}>
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#f97316',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          padding: '12px 20px',
                          background: '#f97316',
                          border: 'none',
                          borderRadius: 12,
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Plus size={18} />
                        Toevoegen
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
              <div style={{
                position: 'fixed',
                bottom: 24,
                left: 24,
                right: 24,
                maxWidth: 752,
                margin: '0 auto',
              }}>
                <button
                  onClick={() => setStep('cart')}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: '#f97316',
                    border: 'none',
                    borderRadius: 16,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 10px 40px rgba(249, 115, 22, 0.4)',
                  }}
                >
                  <span>Bekijk winkelwagen ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>€{getTotal().toFixed(2)}</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Cart View */}
        {step === 'cart' && (
          <>
            <button
              onClick={() => setStep('menu')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginBottom: 24,
              }}
            >
              <ArrowLeft size={20} />
              Terug naar menu
            </button>

            <h2 style={{ color: 'white', fontSize: 24, marginBottom: 24 }}>Je winkelwagen</h2>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <ShoppingCart size={48} style={{ color: '#6b7280', marginBottom: 16 }} />
                <p style={{ color: '#6b7280' }}>Je winkelwagen is leeg</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {cart.map(item => (
                    <div
                      key={item.id}
                      style={{
                        background: '#1e293b',
                        borderRadius: 16,
                        padding: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: 'white', fontSize: 16, margin: 0 }}>{item.name}</h3>
                        <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
                          €{item.price.toFixed(2)} × {item.quantity} = €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#334155',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ color: 'white', fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#f97316',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#ef444420',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 8,
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{
                  background: '#1e293b',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Totaal</span>
                    <span style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>€{getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: '#f97316',
                    border: 'none',
                    borderRadius: 16,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  Doorgaan naar afrekenen
                </button>
              </>
            )}
          </>
        )}

        {/* Checkout View */}
        {step === 'checkout' && (
          <>
            <button
              onClick={() => setStep('cart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginBottom: 24,
              }}
            >
              <ArrowLeft size={20} />
              Terug naar winkelwagen
            </button>

            <h2 style={{ color: 'white', fontSize: 24, marginBottom: 24 }}>Afrekenen</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Order Type */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setOrderType('pickup')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: orderType === 'pickup' ? '#f9731640' : '#1e293b',
                    border: `2px solid ${orderType === 'pickup' ? '#f97316' : '#334155'}`,
                    borderRadius: 12,
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 24 }}>🏃</span>
                  <p style={{ margin: '8px 0 0', fontWeight: 600 }}>Afhalen</p>
                </button>
                <button
                  onClick={() => setOrderType('delivery')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: orderType === 'delivery' ? '#f9731640' : '#1e293b',
                    border: `2px solid ${orderType === 'delivery' ? '#f97316' : '#334155'}`,
                    borderRadius: 12,
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 24 }}>🛵</span>
                  <p style={{ margin: '8px 0 0', fontWeight: 600 }}>Levering</p>
                </button>
              </div>

              {/* Customer Info */}
              <div>
                <label style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8, display: 'block' }}>
                  <User size={14} style={{ marginRight: 8 }} />
                  Je naam
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Naam"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 16,
                  }}
                />
              </div>

              <div>
                <label style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8, display: 'block' }}>
                  <Phone size={14} style={{ marginRight: 8 }} />
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+32 4XX XX XX XX"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 16,
                  }}
                />
              </div>

              <div>
                <label style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8, display: 'block' }}>
                  Opmerkingen (optioneel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Bijv. extra saus, geen ui, etc."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 16,
                    resize: 'none',
                  }}
                />
              </div>

              {/* Summary */}
              <div style={{
                background: '#0f172a',
                borderRadius: 16,
                padding: 20,
                marginTop: 8,
              }}>
                <h3 style={{ color: 'white', fontSize: 16, marginBottom: 12 }}>Samenvatting</h3>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: '#9ca3af' }}>{item.quantity}× {item.name}</span>
                    <span style={{ color: '#9ca3af' }}>€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #334155', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'white', fontWeight: 600 }}>Totaal</span>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18 }}>€{getTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={submitOrder}
                disabled={submitting || !customerName || !customerPhone}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: submitting || !customerName || !customerPhone ? '#6b7280' : '#22c55e',
                  border: 'none',
                  borderRadius: 16,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: submitting || !customerName || !customerPhone ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <Send size={18} />
                {submitting ? 'Bestelling plaatsen...' : 'Bestelling plaatsen'}
              </button>

              <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
                Betaling bij afhaling/levering
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
