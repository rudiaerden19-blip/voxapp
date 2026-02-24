'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, Check, Plus, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface MenuItem {
  category: string;
  name: string;
  price: string;
}

function parseMenuFromPrompt(prompt: string): MenuItem[] {
  const items: MenuItem[] = [];
  let currentCategory = '';
  const lines = prompt.split('\n');

  for (const line of lines) {
    const catMatch = line.match(/^###\s+(.+)/);
    if (catMatch) {
      currentCategory = catMatch[1].trim();
      continue;
    }
    const itemMatch = line.match(/^-\s+(.+?):\s+€([\d,\.]+)/);
    if (itemMatch && currentCategory) {
      items.push({
        category: currentCategory,
        name: itemMatch[1].trim(),
        price: itemMatch[2].trim(),
      });
    }
  }
  return items;
}

function buildMenuSection(items: MenuItem[]): string {
  const categories: Record<string, MenuItem[]> = {};
  for (const item of items) {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  }

  return Object.entries(categories)
    .map(([cat, catItems]) => {
      const lines = catItems.map(i => `- ${i.name}: €${i.price}`).join('\n');
      return `### ${cat}\n${lines}`;
    })
    .join('\n\n');
}

function rebuildPromptWithMenu(prompt: string, newItems: MenuItem[]): string {
  const menuStart = prompt.indexOf('## MENU FRITUUR NOLIM');
  const menuEnd = prompt.indexOf('\n## GESPREKSSTROOM');
  if (menuStart === -1 || menuEnd === -1) return prompt;

  const before = prompt.slice(0, menuStart);
  const after = prompt.slice(menuEnd);
  const newMenu = `## MENU FRITUUR NOLIM\n\n${buildMenuSection(newItems)}`;
  return before + newMenu + after;
}

const CATEGORIES = ['FRIET', 'SNACKS', 'SAUZEN', 'BROODJES & BURGERS', 'DRANKEN'];

export default function AnjaInstellingenPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [sensitivity, setSensitivity] = useState(0.6);
  const [fullPrompt, setFullPrompt] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);

  const [newItem, setNewItem] = useState({ category: 'SNACKS', name: '', price: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/retell/agent-settings');
      const data = await res.json();
      setSensitivity(data.interruption_sensitivity ?? 0.6);
      setFullPrompt(data.general_prompt ?? '');
      setMenuItems(parseMenuFromPrompt(data.general_prompt ?? ''));
    } catch {
      setError('Kon instellingen niet laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const updatedPrompt = rebuildPromptWithMenu(fullPrompt, menuItems);
      const res = await fetch('/api/retell/agent-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interruption_sensitivity: sensitivity,
          general_prompt: updatedPrompt,
        }),
      });
      if (!res.ok) throw new Error('Opslaan mislukt');
      setFullPrompt(updatedPrompt);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newItem.name || !newItem.price) return;
    setMenuItems([...menuItems, { ...newItem }]);
    setNewItem({ category: newItem.category, name: '', price: '' });
  };

  const removeItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const sensitivityLabel = (v: number) => {
    if (v <= 0.2) return 'Heel geduldig (wacht lang)';
    if (v <= 0.4) return 'Geduldig';
    if (v <= 0.6) return 'Normaal';
    if (v <= 0.8) return 'Snel';
    return 'Zeer snel (onderbreekt snel)';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Anja instellingen laden...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
            Anja Instellingen — Frituur Nolim
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>
            Pas het menu, gedrag en gevoeligheid aan. Wijzigingen zijn meteen actief na opslaan.
          </p>
        </div>

        {/* Interruption sensitivity */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
            Luistergeduld
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Hoe lang wacht Anja voor ze antwoordt? Links = wacht lang, rechts = reageert snel.
          </p>
          <input
            type="range"
            min={0.1}
            max={0.9}
            step={0.05}
            value={sensitivity}
            onChange={e => setSensitivity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#f97316', marginBottom: 10 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#6b7280', fontSize: 12 }}>Heel geduldig</span>
            <span style={{ color: '#f97316', fontWeight: 600, fontSize: 14 }}>{sensitivityLabel(sensitivity)}</span>
            <span style={{ color: '#6b7280', fontSize: 12 }}>Snel</span>
          </div>
          <p style={{ color: '#4b5563', fontSize: 12 }}>Huidige waarde: {sensitivity}</p>
        </div>

        {/* Menu beheer */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 600, marginBottom: 6 }}>
            Menu beheer
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            Voeg producten toe of verwijder ze. Anja kent alleen producten die hier staan.
          </p>

          {/* Nieuw item toevoegen */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Categorie</label>
              <select
                value={newItem.category}
                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 14 }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: '2 1 200px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Naam</label>
              <input
                type="text"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="bijv. Bicky burger"
                style={{ width: '100%', padding: '10px 12px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
            </div>
            <div style={{ flex: '0 1 100px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Prijs (€)</label>
              <input
                type="text"
                value={newItem.price}
                onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="6,50"
                style={{ width: '100%', padding: '10px 12px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 14 }}
              />
            </div>
            <button
              onClick={addItem}
              disabled={!newItem.name || !newItem.price}
              style={{ padding: '10px 18px', background: (!newItem.name || !newItem.price) ? '#374151' : '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 14, cursor: (!newItem.name || !newItem.price) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
            >
              <Plus size={16} /> Toevoegen
            </button>
          </div>

          {/* Menu per categorie */}
          {Object.entries(groupedItems).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <h3 style={{ color: '#f97316', fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {cat}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map((item, i) => {
                  const globalIndex = menuItems.findIndex((m, idx) =>
                    m.name === item.name && m.category === item.category && idx >= 0 &&
                    menuItems.slice(0, idx + 1).filter(x => x.name === item.name && x.category === item.category).length ===
                    items.slice(0, i + 1).filter(x => x.name === item.name).length
                  );
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0a0a0f', borderRadius: 8 }}>
                      <span style={{ color: 'white', fontSize: 14 }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#f97316', fontWeight: 600, fontSize: 14 }}>€{item.price}</span>
                        <button
                          onClick={() => removeItem(globalIndex)}
                          style={{ padding: 4, background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p style={{ color: '#4b5563', fontSize: 13, marginTop: 8 }}>
            {menuItems.length} items in het menu
          </p>
        </div>

        {/* Geavanceerd: volledige prompt */}
        <div style={{ background: '#16161f', borderRadius: 16, border: '1px solid #2a2a35', padding: 24, marginBottom: 24 }}>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {showPrompt ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            Geavanceerd: volledige AI instructies
          </button>

          {showPrompt && (
            <>
              <p style={{ color: '#6b7280', fontSize: 13, margin: '12px 0' }}>
                Pas hier de volledige tekst aan die Anja volgt. Wijzig dit alleen als je weet wat je doet.
                Het menu bovenaan heeft voorrang bij opslaan.
              </p>
              <textarea
                value={fullPrompt}
                onChange={e => setFullPrompt(e.target.value)}
                rows={30}
                style={{ width: '100%', padding: '12px 14px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: '#e5e7eb', fontSize: 13, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6 }}
              />
            </>
          )}
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 12, marginBottom: 16, color: '#ef4444', fontSize: 14 }}>
            {error}
          </div>
        )}
        {saved && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 12, marginBottom: 16, color: '#22c55e', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={16} /> Opgeslagen! Anja gebruikt de nieuwe instellingen meteen.
          </div>
        )}

        {/* Knoppen */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 24px', background: saving ? '#6b7280' : '#f97316', border: 'none', borderRadius: 10, color: 'white', fontSize: 16, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Opslaan...' : <><Save size={18} /> Opslaan & Activeren</>}
          </button>
          <button
            onClick={load}
            style={{ padding: '14px 16px', background: 'transparent', border: '1px solid #2a2a35', borderRadius: 10, color: '#9ca3af', cursor: 'pointer' }}
            title="Herladen"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
