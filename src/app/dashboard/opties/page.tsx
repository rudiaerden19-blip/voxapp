'use client';

import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Check, X, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface OptionChoice {
  id?: string;
  name: string;
  price: number;
  sort_order?: number;
}

interface OptionGroup {
  id?: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  sort_order?: number;
  choices?: OptionChoice[];
}

interface Business {
  id: string;
}

export default function OptiesPage() {
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<OptionGroup>({
    name: '',
    type: 'multiple',
    required: false,
    choices: [{ name: '', price: 0 }],
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setLoading(true);
    setError(null);
    try {
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
      
      setBusiness({ id: businessData.id });

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
            sort_order: g.sort_order,
            choices: g.choices || [],
          })));
        }
      }
    } catch (e) {
      console.error('Failed to load options:', e);
      setError('Kon opties niet laden');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      type: 'multiple',
      required: false,
      choices: [{ name: '', price: 0 }],
    });
    setEditingGroup(null);
    setShowModal(true);
  };

  const openEditModal = (group: OptionGroup) => {
    setFormData({
      ...group,
      choices: group.choices && group.choices.length > 0 
        ? group.choices 
        : [{ name: '', price: 0 }],
    });
    setEditingGroup(group);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setError(null);
  };

  const addChoice = () => {
    setFormData({
      ...formData,
      choices: [...(formData.choices || []), { name: '', price: 0 }],
    });
  };

  const removeChoice = (index: number) => {
    const newChoices = formData.choices?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, choices: newChoices });
  };

  const updateChoice = (index: number, field: 'name' | 'price', value: string | number) => {
    const newChoices = formData.choices?.map((choice, i) => 
      i === index ? { ...choice, [field]: value } : choice
    ) || [];
    setFormData({ ...formData, choices: newChoices });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Vul een naam in voor de optiegroep');
      return;
    }

    const validChoices = formData.choices?.filter(c => c.name.trim()) || [];
    if (validChoices.length === 0) {
      setError('Voeg minimaal één keuze toe');
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
      const res = await fetch('/api/admin/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          id: editingGroup?.id,
          name: formData.name,
          type: formData.type,
          required: formData.required,
          sort_order: formData.sort_order || 0,
          choices: validChoices,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Opslaan mislukt');
      }

      const savedGroup = await res.json();

      // Update lokale state
      const updatedGroup: OptionGroup = {
        id: savedGroup.id,
        name: savedGroup.name,
        type: savedGroup.type as 'single' | 'multiple',
        required: savedGroup.required,
        sort_order: savedGroup.sort_order,
        choices: savedGroup.choices || validChoices,
      };
      
      if (editingGroup) {
        setOptionGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      } else {
        setOptionGroups(prev => [...prev, updatedGroup]);
      }

      setSuccess('Optiegroep opgeslagen!');
      setTimeout(() => setSuccess(null), 3000);
      closeModal();
    } catch (e) {
      console.error('Save error:', e);
      setError(e instanceof Error ? e.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Weet je zeker dat je deze optiegroep wilt verwijderen?')) return;
    if (!business) return;

    try {
      const res = await fetch(`/api/admin/options?id=${groupId}&business_id=${business.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Verwijderen mislukt');
      
      setOptionGroups(prev => prev.filter(g => g.id !== groupId));
      setSuccess('Optiegroep verwijderd');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      console.error('Delete error:', e);
      setError('Kon optiegroep niet verwijderen');
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Settings size={28} style={{ color: '#f97316' }} />
            Optie Menu
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4 }}>Maak optiegroepen voor producten (sauzen, maten, extras)</p>
        </div>
        <button
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#f97316', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus size={18} /> Nieuwe Optiegroep
        </button>
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

      {/* Info Box */}
      <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Hoe werkt het?</h3>
        <ul style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li><strong>Enkele keuze:</strong> Klant kiest één optie (bijv. Maat: Klein/Medium/Groot)</li>
          <li><strong>Meerdere keuzes:</strong> Klant kan meerdere selecteren (bijv. Sauzen: Mayo, Curry)</li>
          <li><strong>Verplicht:</strong> Klant moet kiezen voor bestelling</li>
          <li><strong>Prijs €0:</strong> Gratis optie | <strong>Prijs &gt;€0:</strong> Betalende optie</li>
        </ul>
      </div>

      {/* Option Groups List */}
      {optionGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#16161f', borderRadius: 16 }}>
          <Settings size={64} style={{ color: '#4b5563', margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>Geen optiegroepen</h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Maak je eerste optiegroep aan</p>
          <button
            onClick={openAddModal}
            style={{ padding: '12px 24px', background: '#f97316', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer' }}
          >
            + Nieuwe Optiegroep
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {optionGroups.map(group => (
            <div key={group.id} style={{ background: '#16161f', borderRadius: 16, padding: 20, border: '1px solid #2a2a35' }}>
              {/* Group Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{group.name}</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '4px 8px', background: group.type === 'single' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)', color: group.type === 'single' ? '#3b82f6' : '#a855f7', borderRadius: 4 }}>
                      {group.type === 'single' ? 'Enkele keuze' : 'Meerdere keuzes'}
                    </span>
                    {group.required && (
                      <span style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: 4 }}>Verplicht</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEditModal(group)}
                    style={{ padding: 10, background: '#2a2a35', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => group.id && handleDelete(group.id)}
                    style={{ padding: 10, background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Choices */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.choices?.map((choice, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#0a0a0f', borderRadius: 8 }}>
                    <span style={{ color: 'white', fontSize: 13 }}>{choice.name}</span>
                    <span style={{ color: choice.price > 0 ? '#f97316' : '#6b7280', fontSize: 12, fontWeight: 500 }}>
                      {choice.price > 0 ? `+€${choice.price.toFixed(2)}` : 'Gratis'}
                    </span>
                  </div>
                ))}
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
                {editingGroup ? 'Optiegroep Bewerken' : 'Nieuwe Optiegroep'}
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
                  placeholder="bijv. Sauzen, Maten, Extra's"
                  style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, color: 'white', fontSize: 14 }}
                />
              </div>

              {/* Type & Required */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Type keuze</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'single' | 'multiple' })}
                    style={{ width: '100%', padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, color: 'white', fontSize: 14 }}
                  >
                    <option value="single">Enkele keuze</option>
                    <option value="multiple">Meerdere keuzes</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8, display: 'block' }}>Verplicht?</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: '#f97316' }}
                    />
                    <span style={{ color: 'white', fontSize: 14 }}>Klant moet kiezen</span>
                  </label>
                </div>
              </div>

              {/* Choices */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label style={{ color: '#9ca3af', fontSize: 13 }}>Keuzes *</label>
                  <button
                    type="button"
                    onClick={addChoice}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#f97316', border: 'none', borderRadius: 8, color: 'white', fontSize: 12, cursor: 'pointer' }}
                  >
                    <Plus size={14} /> Keuze
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {formData.choices?.map((choice, index) => (
                    <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={choice.name}
                        onChange={(e) => updateChoice(index, 'name', e.target.value)}
                        placeholder="Naam (bijv. Mayonaise)"
                        style={{ flex: 1, padding: '12px 14px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 13 }}
                      />
                      <div style={{ position: 'relative', width: 100 }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 12 }}>+€</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={choice.price || ''}
                          onChange={(e) => updateChoice(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          style={{ width: '100%', padding: '12px 14px 12px 32px', background: '#0a0a0f', border: '1px solid #2a2a35', borderRadius: 8, color: 'white', fontSize: 13 }}
                        />
                      </div>
                      {(formData.choices?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(index)}
                          style={{ padding: 10, background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: 8, color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 12 }}>
                  💡 Prijs €0 = gratis optie | Prijs &gt;€0 = betalende optie
                </p>
              </div>
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
