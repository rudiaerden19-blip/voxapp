'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Package, Plus, Trash2, Check, X, Clock, Euro, Search, Filter, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id?: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  sort_order?: number;
  is_available?: boolean;
  is_popular?: boolean;
  is_promo?: boolean;
  promo_price?: number;
}

interface OptionGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  choices?: { id: string; name: string; price: number }[];
}

interface Business {
  id: string;
  type: string;
}

export default function ProductenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Product>({
    category: '',
    name: '',
    description: '',
    price: 0,
    duration_minutes: undefined,
    is_available: true,
    is_popular: false,
    is_promo: false,
    promo_price: undefined,
  });

  // Bepaal of dit een dienst-type bedrijf is (kapper, salon, etc.)
  const isServiceBusiness = business?.type && ['salon', 'kapper', 'barbier', 'schoonheid', 'massage', 'fitness'].includes(business.type.toLowerCase());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Haal business info op via API (bypass RLS)
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        setError('Niet ingelogd');
        setLoading(false);
        return;
      }

      // Gebruik API om business te laden (bypass RLS)
      const bizRes = await fetch(`/api/business/by-email?email=${encodeURIComponent(user.email)}`);
      if (!bizRes.ok) {
        setError('Geen bedrijf gevonden');
        setLoading(false);
        return;
      }
      
      const businessData = await bizRes.json();
      if (!businessData || !businessData.id) {
        setError('Geen bedrijf gevonden');
        setLoading(false);
        return;
      }
      
      setBusiness({ id: businessData.id, type: businessData.type });

      // Haal producten via admin API (bypass RLS)
      const productsRes = await fetch(`/api/admin/products?business_id=${businessData.id}`);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        if (Array.isArray(productsData)) {
          setProducts(productsData.map(p => ({
            id: p.id,
            category: p.category || 'Overig',
            name: p.name,
            description: p.description || undefined,
            price: p.price,
            duration_minutes: p.duration_minutes || undefined,
            sort_order: p.sort_order,
            is_available: p.is_available,
            is_popular: p.is_popular,
            is_promo: p.is_promo,
            promo_price: p.promo_price || undefined,
          })));
        }
      }

      // Haal optiegroepen via admin API (bypass RLS)
      const optionsRes = await fetch(`/api/admin/options?business_id=${businessData.id}`);
      if (optionsRes.ok) {
        const optionsData = await optionsRes.json();
        if (Array.isArray(optionsData)) {
          setOptionGroups(optionsData.map(g => ({
            id: g.id,
            name: g.name,
            type: g.type as 'single' | 'multiple',
            required: g.required,
            choices: g.choices || [],
          })));
        }
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      setError('Kon gegevens niet laden');
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV/TXT upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business?.id) return;

    setUploading(true);
    setError(null);

    try {
      const newProducts: { name: string; price: number }[] = [];
      
      // Parse CSV/TXT
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Skip header row
        if (i === 0 && (line.toLowerCase().includes('naam') || line.toLowerCase().includes('product'))) {
          continue;
        }
        
        // Split by comma or semicolon
        const parts = line.includes(';') ? line.split(';') : line.split(',');
        if (parts.length >= 2) {
          const name = parts[0].trim().replace(/^["']|["']$/g, '');
          const priceStr = parts[1].trim().replace(/^["']|["']$/g, '').replace(',', '.').replace('€', '');
          const price = parseFloat(priceStr);
          
          if (name && !isNaN(price)) {
            newProducts.push({ name, price });
          }
        }
      }

      if (newProducts.length === 0) {
        throw new Error('Geen producten gevonden. Gebruik formaat: naam,prijs');
      }

      // Save all products via API
      let added = 0;
      for (const prod of newProducts) {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_id: business.id,
            category: 'Producten',
            name: prod.name,
            price: prod.price,
            is_available: true,
          }),
        });
        if (res.ok) added++;
      }

      setSuccess(`${added} producten geïmporteerd!`);
      setTimeout(() => setSuccess(null), 3000);
      loadData(); // Refresh list
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload mislukt');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter producten
  const categories = [...new Set(products.map(p => p.category || 'Overig'))];
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Alle' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setFormData({
      category: categories[0] || '',
      name: '',
      description: '',
      price: 0,
      duration_minutes: isServiceBusiness ? 30 : undefined,
      is_available: true,
      is_popular: false,
      is_promo: false,
    });
    setSelectedOptionIds([]);
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEditModal = async (product: Product) => {
    setFormData({ ...product });
    setEditingProduct(product);
    
    // Haal gekoppelde opties op
    if (product.id) {
      try {
        const res = await fetch(`/api/products/options?product_id=${product.id}`);
        const linkedIds = await res.json();
        setSelectedOptionIds(Array.isArray(linkedIds) ? linkedIds : []);
      } catch {
        setSelectedOptionIds([]);
      }
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price < 0) {
      setError('Vul een naam en geldige prijs in');
      return;
    }

    if (!business) {
      setError('Geen bedrijf gevonden');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Gebruik admin API (bypass RLS)
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          id: editingProduct?.id,
          category: formData.category || 'Overig',
          name: formData.name,
          description: formData.description || null,
          price: formData.price,
          duration_minutes: formData.duration_minutes || null,
          sort_order: formData.sort_order || 0,
          is_available: formData.is_available ?? true,
          is_popular: formData.is_popular ?? false,
          is_promo: formData.is_promo ?? false,
          promo_price: formData.is_promo ? formData.promo_price : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Opslaan mislukt');
      }

      const savedProduct = await res.json();

      // Update lokale state
      const mappedProduct: Product = {
        id: savedProduct.id,
        category: savedProduct.category || 'Overig',
        name: savedProduct.name,
        description: savedProduct.description || undefined,
        price: savedProduct.price,
        duration_minutes: savedProduct.duration_minutes || undefined,
        sort_order: savedProduct.sort_order,
        is_available: savedProduct.is_available,
        is_popular: savedProduct.is_popular,
        is_promo: savedProduct.is_promo,
        promo_price: savedProduct.promo_price || undefined,
      };
      
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === mappedProduct.id ? mappedProduct : p));
      } else {
        setProducts(prev => [...prev, mappedProduct]);
      }

      setSuccess('Product opgeslagen!');
      setTimeout(() => setSuccess(null), 3000);
      closeModal();
    } catch (e) {
      console.error('Save error:', e);
      setError(e instanceof Error ? e.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;
    if (!business) return;

    try {
      const res = await fetch(`/api/admin/products?id=${productId}&business_id=${business.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Verwijderen mislukt');
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSuccess('Product verwijderd');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      console.error('Delete error:', e);
      setError('Kon product niet verwijderen');
    }
  };

  const toggleAvailable = async (product: Product) => {
    if (!product.id || !business) return;
    
    try {
      const newAvailable = !product.is_available;
      
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          id: product.id,
          ...product,
          is_available: newAvailable,
        }),
      });
      
      if (!res.ok) throw new Error('Update mislukt');
      
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_available: newAvailable } : p
      ));
    } catch {
      setError('Kon status niet wijzigen');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280' }}>Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, background: '#1f1f2e', borderRadius: 8, color: '#9ca3af', textDecoration: 'none' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Package size={28} style={{ color: '#f97316' }} />
              {isServiceBusiness ? 'Diensten' : 'Producten'}
            </h1>
            <p style={{ color: '#6b7280', marginTop: 4 }}>{products.length} {isServiceBusiness ? 'diensten' : 'producten'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#1f1f2e', border: '1px solid #3f3f4e', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            <Upload size={18} /> {uploading ? 'Uploaden...' : 'CSV Import'}
          </button>
          <button
            onClick={openAddModal}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#f97316', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            <Plus size={18} /> Nieuw {isServiceBusiness ? 'Dienst' : 'Product'}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 12, padding: 16, marginBottom: 24, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={18} /> {success}
        </div>
      )}
      {error && !showModal && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: 16, marginBottom: 24, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
          <X size={18} /> {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek product..."
            style={{ width: '100%', padding: '12px 12px 12px 42px', background: '#16161f', border: '1px solid #2a2a35', borderRadius: 12, color: 'white', fontSize: 14 }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setSelectedCategory('Alle')}
            style={{ padding: '10px 16px', background: selectedCategory === 'Alle' ? '#f97316' : '#2a2a35', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Alle
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ padding: '10px 16px', background: selectedCategory === cat ? '#f97316' : '#2a2a35', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#16161f', borderRadius: 16 }}>
          <Package size={64} style={{ color: '#4b5563', margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>Geen {isServiceBusiness ? 'diensten' : 'producten'} gevonden</h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Voeg je eerste {isServiceBusiness ? 'dienst' : 'product'} toe</p>
          <button
            onClick={openAddModal}
            style={{ padding: '12px 24px', background: '#f97316', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer' }}
          >
            + Nieuw {isServiceBusiness ? 'Dienst' : 'Product'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ background: '#16161f', borderRadius: 16, overflow: 'hidden', border: '1px solid #2a2a35' }}>
              {/* Product Content */}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#f97316', background: 'rgba(249, 115, 22, 0.15)', padding: '4px 8px', borderRadius: 4 }}>{product.category || 'Overig'}</span>
                    <h3 style={{ color: 'white', fontSize: 16, fontWeight: 600, marginTop: 8 }}>{product.name}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {product.is_promo && product.promo_price ? (
                      <>
                        <span style={{ color: '#6b7280', textDecoration: 'line-through', fontSize: 12 }}>€{product.price.toFixed(2)}</span>
                        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 18, display: 'block' }}>€{product.promo_price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span style={{ color: '#f97316', fontWeight: 700, fontSize: 18 }}>€{product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {product.description && (
                  <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{product.description}</p>
                )}

                {product.duration_minutes && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
                    <Clock size={14} /> {product.duration_minutes} minuten
                  </div>
                )}

                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  {product.is_popular && (
                    <span style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: 4 }}>🔥 Populair</span>
                  )}
                  {product.is_promo && (
                    <span style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: 4 }}>🎁 Promo</span>
                  )}
                  {!product.is_available && (
                    <span style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: 4 }}>Niet beschikbaar</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #2a2a35' }}>
                  <button
                    onClick={() => toggleAvailable(product)}
                    style={{ padding: '8px 12px', background: product.is_available ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)', border: 'none', borderRadius: 6, color: product.is_available ? '#22c55e' : '#6b7280', fontSize: 12, cursor: 'pointer' }}
                  >
                    {product.is_available ? '✓ Beschikbaar' : '✕ Niet beschikbaar'}
                  </button>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openEditModal(product)}
                      style={{ padding: 8, background: '#2a2a35', border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => product.id && handleDelete(product.id)}
                      style={{ padding: 8, background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#16161f', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}
          >
            {/* Modal Header */}
            <div style={{ padding: 24, borderBottom: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>
                {editingProduct ? `${isServiceBusiness ? 'Dienst' : 'Product'} Bewerken` : `Nieuw ${isServiceBusiness ? 'Dienst' : 'Product'}`}
              </h2>
              <button onClick={closeModal} style={{ padding: 8, background: '#2a2a35', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, color: '#ef4444', fontSize: 14 }}>
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Naam *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="bijv. Grote Friet"
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, color: 'white', fontSize: 14 }}
                />
              </div>

              {/* Category & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Categorie</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="bijv. Friet, Snacks"
                    style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, color: 'white', fontSize: 14 }}
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Prijs *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      style={{ width: '100%', padding: '14px 16px 14px 32px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, color: 'white', fontSize: 14 }}
                    />
                  </div>
                </div>
              </div>

              {/* Duration (voor diensten) */}
              {isServiceBusiness && (
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Duur (minuten)</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={formData.duration_minutes || ''}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || undefined })}
                      placeholder="30"
                      style={{ width: '100%', padding: '14px 16px 14px 42px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, color: 'white', fontSize: 14 }}
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Beschrijving</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optionele beschrijving..."
                  rows={3}
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, color: 'white', fontSize: 14, resize: 'none' }}
                />
              </div>

              {/* Status Options */}
              <div>
                <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12, display: 'block' }}>Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#0a0a0f', borderRadius: 8, cursor: 'pointer', border: formData.is_available ? '1px solid #22c55e' : '1px solid #2a2a35' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_available ?? true}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      style={{ accentColor: '#22c55e' }}
                    />
                    <span style={{ color: 'white', fontSize: 13 }}>Beschikbaar</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#0a0a0f', borderRadius: 8, cursor: 'pointer', border: formData.is_popular ? '1px solid #3b82f6' : '1px solid #2a2a35' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_popular ?? false}
                      onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                      style={{ accentColor: '#3b82f6' }}
                    />
                    <span style={{ color: 'white', fontSize: 13 }}>🔥 Populair</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#0a0a0f', borderRadius: 8, cursor: 'pointer', border: formData.is_promo ? '1px solid #22c55e' : '1px solid #2a2a35' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_promo ?? false}
                      onChange={(e) => setFormData({ ...formData, is_promo: e.target.checked })}
                      style={{ accentColor: '#22c55e' }}
                    />
                    <span style={{ color: 'white', fontSize: 13 }}>🎁 Promo</span>
                  </label>
                </div>

                {/* Promo Price */}
                {formData.is_promo && (
                  <div style={{ marginTop: 16, padding: 16, background: 'rgba(34, 197, 94, 0.1)', borderRadius: 10, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <label style={{ color: '#22c55e', fontSize: 13, marginBottom: 8, display: 'block' }}>Actieprijs</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#22c55e' }}>€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.promo_price || ''}
                        onChange={(e) => setFormData({ ...formData, promo_price: parseFloat(e.target.value) || undefined })}
                        placeholder="0.00"
                        style={{ width: '100%', padding: '14px 16px 14px 32px', background: '#0a0a0f', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 10, color: 'white', fontSize: 14 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Link Options */}
              {optionGroups.length > 0 && (
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12, display: 'block' }}>Koppel Opties</label>
                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Selecteer welke optiegroepen bij dit product horen</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {optionGroups.map(group => (
                      <label
                        key={group.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: '#0a0a0f', borderRadius: 10, cursor: 'pointer',
                          border: selectedOptionIds.includes(group.id) ? '1px solid #f97316' : '1px solid #2a2a35'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedOptionIds.includes(group.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOptionIds([...selectedOptionIds, group.id]);
                            } else {
                              setSelectedOptionIds(selectedOptionIds.filter(id => id !== group.id));
                            }
                          }}
                          style={{ accentColor: '#f97316', width: 18, height: 18 }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ color: 'white', fontWeight: 500 }}>{group.name}</span>
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 11, padding: '2px 6px', background: group.type === 'single' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)', color: group.type === 'single' ? '#3b82f6' : '#a855f7', borderRadius: 4 }}>
                              {group.type === 'single' ? 'Enkele keuze' : 'Meerdere keuzes'}
                            </span>
                            {group.required && (
                              <span style={{ fontSize: 11, padding: '2px 6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: 4 }}>Verplicht</span>
                            )}
                          </div>
                        </div>
                        <span style={{ color: '#6b7280', fontSize: 12 }}>{group.choices?.length || 0} keuzes</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: 24, borderTop: '1px solid #2a2a35', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={closeModal}
                style={{ padding: '12px 24px', background: '#2a2a35', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, cursor: 'pointer' }}
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '12px 24px', background: saving ? '#4b5563' : '#f97316', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Check size={16} /> {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
