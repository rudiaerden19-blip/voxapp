'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Trash2, ChevronDown, ChevronRight, Search, Upload, FileJson } from 'lucide-react';

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

const CATEGORIES = [
  'algemeen',
  'diensten',
  'prijzen',
  'openingsuren',
  'faq',
  'procedures',
  'contact',
];

export default function AdminKennisbankPage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>('frituur');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['algemeen']);

  // Form state
  const [category, setCategory] = useState('algemeen');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk import
  const [bulkJson, setBulkJson] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: number; failed: number; total: number } | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    loadKnowledge();
  }, [selectedSector]);

  async function loadKnowledge() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/kennisbank?sector=${selectedSector}`);
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
      console.error('Error saving knowledge:', error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;

    try {
      await fetch(`/api/admin/kennisbank?id=${id}`, { method: 'DELETE' });
      loadKnowledge();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
    }
  }

  function toggleCategory(cat: string) {
    setExpandedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  }

  async function handleBulkImport() {
    if (!bulkJson.trim()) return;

    setBulkImporting(true);
    setBulkResult(null);

    try {
      const items = JSON.parse(bulkJson);
      
      if (!Array.isArray(items)) {
        alert('JSON moet een array zijn');
        setBulkImporting(false);
        return;
      }

      // Split into chunks of 1000
      const CHUNK_SIZE = 500;
      let totalSuccess = 0;
      let totalFailed = 0;

      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        
        const res = await fetch('/api/admin/kennisbank/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sector_type: selectedSector,
            items: chunk,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          totalSuccess += data.success;
          totalFailed += data.failed;
        } else {
          totalFailed += chunk.length;
        }

        // Update progress
        setBulkResult({
          success: totalSuccess,
          failed: totalFailed,
          total: items.length,
        });
      }

      setBulkJson('');
      loadKnowledge();
    } catch (error) {
      console.error('Bulk import error:', error);
      alert('Ongeldige JSON. Controleer het formaat.');
    }

    setBulkImporting(false);
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'algemeen';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  // Filter by search
  const filteredItems = searchQuery
    ? items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const currentSector = SECTORS.find(s => s.id === selectedSector);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Kennisbank</h1>
            <p className="text-gray-400 mt-1">
              Beheer kennis per sector - wordt automatisch aan klanten gekoppeld bij registratie
            </p>
          </div>
        </div>

        {/* Sector tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {SECTORS.map(sector => (
            <button
              key={sector.id}
              onClick={() => setSelectedSector(sector.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                selectedSector === sector.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{sector.icon}</span>
              <span>{sector.name}</span>
              {items.length > 0 && selectedSector === sector.id && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {items.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Add new knowledge */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Plus size={20} />
                Kennis toevoegen
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Voor: {currentSector?.icon} {currentSector?.name}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Categorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Korte titel..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Inhoud
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="De kennis die de AI moet weten..."
                    rows={6}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !content.trim()}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Opslaan...' : (
                    <>
                      <Plus size={18} />
                      Toevoegen
                    </>
                  )}
                </button>
              </form>

              {/* Bulk Import Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition"
                >
                  <Upload size={18} />
                  {showBulkImport ? 'Verberg' : 'Bulk Import (JSON)'}
                </button>

                {showBulkImport && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-3 text-xs text-gray-400">
                      <p className="flex items-center gap-1 mb-2">
                        <FileJson size={14} />
                        JSON formaat:
                      </p>
                      <pre className="overflow-x-auto">
{`[
  {
    "category": "diensten",
    "title": "APK keuring",
    "content": "Een APK..."
  },
  ...
]`}
                      </pre>
                    </div>
                    <textarea
                      value={bulkJson}
                      onChange={(e) => setBulkJson(e.target.value)}
                      placeholder="Plak hier je JSON array..."
                      rows={8}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm font-mono"
                    />
                    {bulkResult && (
                      <div className="bg-gray-700 rounded-lg p-3 text-sm">
                        <p className="text-green-400">{bulkResult.success} succesvol</p>
                        {bulkResult.failed > 0 && (
                          <p className="text-red-400">{bulkResult.failed} mislukt</p>
                        )}
                        <p className="text-gray-400">Totaal: {bulkResult.total}</p>
                      </div>
                    )}
                    <button
                      onClick={handleBulkImport}
                      disabled={bulkImporting || !bulkJson.trim()}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {bulkImporting ? (
                        <>Importeren... {bulkResult ? `(${bulkResult.success}/${bulkResult.total})` : ''}</>
                      ) : (
                        <>
                          <Upload size={18} />
                          Importeer JSON
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Knowledge list */}
          <div className="lg:col-span-2">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoeken in kennisbank..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-gray-400 text-center py-12">Laden...</div>
            ) : items.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400">
                  Nog geen kennis voor {currentSector?.name}.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Voeg kennis toe via het formulier links.
                </p>
              </div>
            ) : filteredItems ? (
              // Search results
              <div className="space-y-2">
                <p className="text-gray-400 text-sm mb-2">
                  {filteredItems.length} resultaten voor &quot;{searchQuery}&quot;
                </p>
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <h3 className="text-white font-medium mt-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grouped by category
              <div className="space-y-2">
                {CATEGORIES.map(cat => {
                  const catItems = groupedItems[cat] || [];
                  if (catItems.length === 0) return null;
                  const isExpanded = expandedCategories.includes(cat);

                  return (
                    <div key={cat} className="bg-gray-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-750"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          <span className="text-white font-medium">
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({catItems.length})
                          </span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-gray-700 divide-y divide-gray-700">
                          {catItems.map(item => (
                            <div key={item.id} className="p-4 flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-white font-medium">{item.title}</h3>
                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                  {item.content}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-400 hover:text-red-300 p-2 ml-2"
                              >
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
    </AdminLayout>
  );
}
