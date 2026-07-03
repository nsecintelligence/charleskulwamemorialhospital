import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { DownloadableForm } from '../../types';
import { Save, Plus, X, ChevronUp, ChevronDown, Download } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function AdminForms() {
  const [forms, setForms] = useState<DownloadableForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingForm, setEditingForm] = useState<DownloadableForm | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    file_url: '',
    category: 'general',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    const { data } = await supabase.from('downloadable_forms').select('*').order('sort_order');
    if (data) setForms(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      file_url: '',
      category: 'general',
      sort_order: forms.length,
      is_active: true,
    });
    setEditingForm(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingForm) {
      await supabase
        .from('downloadable_forms')
        .update({
          name: form.name,
          description: form.description || null,
          file_url: form.file_url,
          category: form.category,
          sort_order: form.sort_order,
          is_active: form.is_active,
        })
        .eq('id', editingForm.id);
    } else {
      await supabase.from('downloadable_forms').insert({
        name: form.name,
        description: form.description || null,
        file_url: form.file_url,
        category: form.category,
        sort_order: form.sort_order,
        is_active: form.is_active,
      });
    }

    await fetchForms();
    resetForm();
    setSaving(false);
  };

  const handleEdit = (f: DownloadableForm) => {
    setEditingForm(f);
    setForm({
      name: f.name,
      description: f.description || '',
      file_url: f.file_url,
      category: f.category,
      sort_order: f.sort_order,
      is_active: f.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    await supabase.from('downloadable_forms').delete().eq('id', id);
    await fetchForms();
  };

  const handleToggleActive = async (f: DownloadableForm) => {
    await supabase.from('downloadable_forms').update({ is_active: !f.is_active }).eq('id', f.id);
    await fetchForms();
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= forms.length) return;

    await Promise.all([
      supabase.from('downloadable_forms').update({ sort_order: newIndex }).eq('id', forms[index].id),
      supabase.from('downloadable_forms').update({ sort_order: index }).eq('id', forms[newIndex].id),
    ]);

    await fetchForms();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Downloadable Forms</h2>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">{editingForm ? 'Edit Form' : 'Add New Form'}</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                placeholder="e.g. Patient Registration Form"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
              >
                <option value="general">General</option>
                <option value="registration">Registration</option>
                <option value="insurance">Insurance</option>
                <option value="medical">Medical Records</option>
                <option value="consent">Consent Forms</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
            <input
              type="url"
              value={form.file_url}
              onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
              placeholder="https://example.com/form.pdf"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-green-700 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Show this form</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editingForm ? 'Update Form' : 'Add Form'}
            </button>
            {editingForm && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {forms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No forms yet. Add your first form above.</div>
        ) : (
          <div className="divide-y">
            {forms.map((f, index) => (
              <div key={f.id} className={`p-4 flex items-center gap-4 ${!f.is_active ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveItem(index, 'down')} disabled={index === forms.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{f.name}</div>
                  <div className="text-sm text-gray-500">{f.description || 'No description'}</div>
                  <div className="text-xs text-gray-400 mt-1">Category: {f.category}</div>
                </div>
                <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-green-700 hover:bg-green-50 rounded-lg">
                  <Download className="w-4 h-4" />
                </a>
                <button onClick={() => handleToggleActive(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${f.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {f.is_active ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => handleEdit(f)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50">
                  Edit
                </button>
                <button onClick={() => handleDelete(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
