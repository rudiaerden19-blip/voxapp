'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ChevronDown, ChevronRight, Search, Upload, ArrowLeft, Shield } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  sector_type: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
}

const SECTORS = [
  { id: 'frituur', name: 'Frituur', icon: '🍟' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
  { id: 'kapsalon', name: 'Kapsalon', icon: '💇' },
  { id: 'garage', name: 'Garage', icon: '🔧' },
  { id: 'tandarts', name: 'Tandarts', icon: '🦷' },
  { id: 'dokter', name: 'Dokter', icon: '👨‍⚕️' },
  { id: 'schoonheidssalon', name: 'Schoonheidssalon', icon: '💅' },
  { id: 'immokantoor', name: 'Immokantoor', icon: '🏠' },
  { id: 'advocaat', name: 'Advocaat', icon: '⚖️' },
  { id: 'boekhouder', name: 'Boekhouder', icon: '📊' },
];

const CATEGORIES = ['algemeen', 'diensten', 'prijzen', 'openingsuren', 'faq', 'procedures', 'contact'];

export default function AdminKennisbankPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSector, setSelectedSector] = useState('garage');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['algemeen', 'diensten']);

  const [category, setCategory] = useState('algemeen');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [bulkResult, setBulkResult] = useState<{ success: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    checkAdminSession();
  }, []);

  useEffect(() => {
    if (isAdmin) loadKnowledge();
  }, [selectedSector, isAdmin]);

  const checkAdminSession = async () => {
    try {
      const res = await fetch('/api/admin/auth', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAdmin(true);
          setAuthLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('Session check failed:', e);
    }
    router.push('/admin');
  };

  async function loadKnowledge() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kennisbank?sector=${selectedSector}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error loading knowledge:', error);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/kennisbank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sector_type: selectedSector,
          category,
          title: title || content.substring(0, 50),
          content,
        }),
      });
      if (res.ok) {
        setTitle('');
        setContent('');
        loadKnowledge();
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;
    try {
      await fetch(`/api/admin/kennisbank?id=${id}`, { method: 'DELETE', credentials: 'include' });
      loadKnowledge();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkImporting(true);
    setBulkResult(null);
    setImportProgress('Bestand lezen...');

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const items = data.requests || data;
      const totalItems = items.length;
      setImportProgress(`${totalItems} items gevonden...`);

      let totalSuccess = 0;
      let totalFailed = 0;
      const CHUNK_SIZE = 500;

      for (let i = 0; i < totalItems; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        setImportProgress(`Importeren ${i + 1} - ${Math.min(i + CHUNK_SIZE, totalItems)} van ${totalItems}...`);

        const res = await fetch('/api/admin/kennisbank/import-gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sector_type: selectedSector, data: chunk }),
        });

        if (res.ok) {
          const result = await res.json();
          totalSuccess += result.success;
          totalFailed += result.failed;
        } else {
          totalFailed += chunk.length;
        }
        setBulkResult({ success: totalSuccess, failed: totalFailed, total: totalItems });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      setImportProgress('Klaar!');
      loadKnowledge();
    } catch (error) {
      console.error('Import error:', error);
      alert('Fout bij importeren');
      setImportProgress('');
    }
    setBulkImporting(false);
    e.target.value = '';
  }

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'algemeen';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  const filteredItems = searchQuery
    ? items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const currentSector = SECTORS.find(s => s.id === selectedSector);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Laden...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Shield size={48} style={{ color: '#ef4444' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1729', padding: 24 }}>
      {/* Header */}
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => router.push('/admin')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 16px', color: '#9ca3af', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} /> Terug
          </button>
          <div>
            <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0 }}>Kennisbank</h1>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Beheer kennis per sector - wordt automatisch aan klanten gekoppeld</p>
          </div>
        </div>

        {/* Sector Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {SECTORS.map(sector => (
            <button
              key={sector.id}
              onClick={() => setSelectedSector(sector.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: selectedSector === sector.id ? '#f97316' : '#1e293b',
                color: selectedSector === sector.id ? 'white' : '#9ca3af',
                fontWeight: selectedSector === sector.id ? 600 : 400,
              }}
            >
              <span>{sector.icon}</span>
              <span>{sector.name}</span>
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24 }}>
          {/* LEFT: Form */}
          <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: '1px solid #334155', height: 'fit-content' }}>
            <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={20} /> Kennis toevoegen
            </h2>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 20px 0' }}>
              Voor: {currentSector?.icon} {currentSector?.name}
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Categorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Titel</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Korte titel..."
                  style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6 }}>Inhoud</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="De kennis die de AI moet weten..."
                  rows={5}
                  style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14, resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving || !content.trim()}
                style={{
                  width: '100%', padding: '12px 20px', background: '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  opacity: (saving || !content.trim()) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Plus size={18} /> {saving ? 'Opslaan...' : 'Toevoegen'}
              </button>
            </form>

            {/* Bulk Import */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #334155' }}>
              <button
                onClick={() => setShowBulkImport(!showBulkImport)}
                style={{ width: '100%', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}
              >
                <Upload size={16} /> {showBulkImport ? 'Verberg Import' : 'Bulk Import (GPT/JSON)'}
              </button>

              {showBulkImport && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ background: '#0f172a', border: '1px solid #22c55e40', borderRadius: 8, padding: 16 }}>
                    <p style={{ color: '#22c55e', fontSize: 13, fontWeight: 600, margin: '0 0 8px 0' }}>GPT Bestand Uploaden</p>
                    <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 12px 0' }}>Upload je JSON bestand</p>
                    <label style={{
                      display: 'block',
                      padding: '12px 16px',
                      background: '#22c55e',
                      color: 'white',
                      borderRadius: 8,
                      textAlign: 'center',
                      cursor: bulkImporting ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: 14,
                      opacity: bulkImporting ? 0.5 : 1,
                    }}>
                      <Upload size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                      {bulkImporting ? 'Bezig met importeren...' : 'Selecteer JSON bestand'}
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        disabled={bulkImporting}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {importProgress && <p style={{ color: '#f59e0b', fontSize: 13, marginTop: 12 }}>{importProgress}</p>}
                    {bulkResult && (
                      <div style={{ marginTop: 12, padding: 12, background: '#1e293b', borderRadius: 6 }}>
                        <p style={{ color: '#22c55e', fontSize: 13, margin: 0 }}>{bulkResult.success.toLocaleString()} succesvol</p>
                        {bulkResult.failed > 0 && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{bulkResult.failed.toLocaleString()} mislukt</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Knowledge List */}
          <div>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoeken in kennisbank..."
                style={{ width: '100%', padding: '12px 12px 12px 44px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
            </div>

            {/* Stats */}
            <div style={{ background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
              <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
                <strong style={{ color: 'white' }}>{items.length}</strong> items voor {currentSector?.icon} {currentSector?.name}
              </p>
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Laden...</div>
            ) : items.length === 0 ? (
              <div style={{ background: '#1e293b', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid #334155' }}>
                <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>Nog geen kennis voor {currentSector?.name}</p>
                <p style={{ color: '#4b5563', fontSize: 14, marginTop: 8 }}>Voeg kennis toe via het formulier links</p>
              </div>
            ) : filteredItems ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ color: '#6b7280', fontSize: 13 }}>{filteredItems.length} resultaten</p>
                {filteredItems.map(item => (
                  <div key={item.id} style={{ background: '#1e293b', borderRadius: 8, padding: 16, border: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ background: '#374151', color: '#d1d5db', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{item.category}</span>
                      <h3 style={{ color: 'white', fontWeight: 500, margin: '8px 0 4px', fontSize: 15 }}>{item.title}</h3>
                      <p style={{ color: '#6b7280', fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const catItems = groupedItems[cat] || [];
                  if (catItems.length === 0) return null;
                  const isExpanded = expandedCategories.includes(cat);
                  return (
                    <div key={cat} style={{ background: '#1e293b', borderRadius: 8, border: '1px solid #334155', overflow: 'hidden' }}>
                      <button
                        onClick={() => toggleCategory(cat)}
                        style={{ width: '100%', padding: 16, background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        <span style={{ fontWeight: 500 }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        <span style={{ color: '#6b7280', fontSize: 13 }}>({catItems.length})</span>
                      </button>
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #334155' }}>
                          {catItems.map(item => (
                            <div key={item.id} style={{ padding: 16, borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                              <div style={{ flex: 1 }}>
                                <h3 style={{ color: 'white', fontWeight: 500, margin: '0 0 4px', fontSize: 14 }}>{item.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content}</p>
                              </div>
                              <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 8 }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
