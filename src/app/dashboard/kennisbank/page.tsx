'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { createClient } from '@/lib/supabase';

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  'algemeen',
  'diensten',
  'prijzen',
  'openingsuren',
  'levering',
  'faq',
  'producten',
  'contact',
];

export default function KennisbankPage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState('algemeen');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Search test
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string>('');

  useEffect(() => {
    loadBusiness();
  }, []);

  async function loadBusiness() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (business) {
        setBusinessId(business.id);
        loadKnowledge(business.id);
      }
    }
  }

  async function loadKnowledge(bizId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/knowledge?business_id=${bizId}`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading knowledge:', error);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId || !content.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          category,
          title: title || content.substring(0, 50),
          content,
        }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        loadKnowledge(businessId);
      }
    } catch (error) {
      console.error('Error saving knowledge:', error);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;

    try {
      await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      if (businessId) loadKnowledge(businessId);
    } catch (error) {
      console.error('Error deleting knowledge:', error);
    }
  }

  async function handleSearch() {
    if (!businessId || !searchQuery.trim()) return;

    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          query: searchQuery,
        }),
      });

      const data = await res.json();
      setSearchResults(data.context || 'Geen resultaten gevonden');
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults('Fout bij zoeken');
    }
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'algemeen';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Kennisbank</h1>
        <p className="text-gray-600 mb-8">
          Voeg kennis toe die de AI kan gebruiken om vragen te beantwoorden.
          Hoe meer informatie, hoe slimmer de AI.
        </p>

        {/* Add new knowledge */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Nieuwe kennis toevoegen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Categorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Titel (optioneel)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Korte beschrijving"
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Inhoud</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Voer hier de kennis in die de AI moet weten..."
                rows={4}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Opslaan...' : 'Toevoegen'}
            </button>
          </form>
        </div>

        {/* Test search */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test zoeken</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Stel een vraag..."
              className="flex-1 border rounded-lg p-2"
            />
            <button
              onClick={handleSearch}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Zoeken
            </button>
          </div>
          {searchResults && (
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Gevonden context:</p>
              <pre className="whitespace-pre-wrap text-sm">{searchResults}</pre>
            </div>
          )}
        </div>

        {/* Knowledge list */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Opgeslagen kennis ({items.length})</h2>

          {loading ? (
            <p className="text-gray-500">Laden...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">Nog geen kennis toegevoegd.</p>
          ) : (
            Object.entries(groupedItems).map(([cat, catItems]) => (
              <div key={cat} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-semibold">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({catItems.length})
                </div>
                <div className="divide-y">
                  {catItems.map((item) => (
                    <div key={item.id} className="p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {item.content}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 ml-4"
                      >
                        Verwijder
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
