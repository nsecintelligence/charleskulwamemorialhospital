import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { NewsItem } from '../../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function AdminNews() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState({ title: '', featured_image: '', content: '', is_published: true });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item?: NewsItem) => {
    if (item) {
      setEditing(item);
      setForm({ title: item.title, featured_image: item.featured_image || '', content: item.content, is_published: item.is_published });
    } else {
      setEditing(null);
      setForm({ title: '', featured_image: '', content: '', is_published: true });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      await supabase.from('news').update(form).eq('id', editing.id);
    } else {
      await supabase.from('news').insert({ ...form, published_at: new Date().toISOString() });
    }
    setModalOpen(false);
    await fetchData();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('news').delete().eq('id', id);
    await fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-hospital-red border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">News & Updates</h2>
        <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add News
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Published</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(item.published_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">{editing ? 'Edit News' : 'Add News'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
              </div>
              <ImageUpload
                value={form.featured_image}
                onChange={(url) => setForm({ ...form, featured_image: url })}
                label="Featured Image"
                folder="news"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 text-hospital-red rounded" />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
