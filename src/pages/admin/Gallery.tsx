import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { GalleryItem } from '../../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ image_url: '', caption: '', category: 'general', sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from('gallery').select('*').order('sort_order');
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (item?: GalleryItem) => {
    if (item) {
      setEditing(item);
      setForm({ image_url: item.image_url, caption: item.caption || '', category: item.category, sort_order: item.sort_order });
    } else {
      setEditing(null);
      setForm({ image_url: '', caption: '', category: 'general', sort_order: 0 });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      await supabase.from('gallery').update(form).eq('id', editing.id);
    } else {
      await supabase.from('gallery').insert(form);
    }
    setModalOpen(false);
    await fetchData();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('gallery').delete().eq('id', id);
    await fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-hospital-red border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
        <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Image
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
            <div className="h-48 overflow-hidden">
              <img src={item.image_url} alt={item.caption || ''} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-1">{item.caption || 'No caption'}</p>
              <p className="text-xs text-gray-500 mb-3">{item.category} | Order: {item.sort_order}</p>
              <div className="flex gap-2">
                <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">{editing ? 'Edit Image' : 'Add Image'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                label="Gallery Image *"
                folder="gallery"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
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
