import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Service } from '../../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', details: '', featured: false, sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    if (data) setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (service?: Service) => {
    if (service) {
      setEditing(service);
      setForm({
        name: service.name,
        description: service.description,
        image_url: service.image_url || '',
        details: service.details || '',
        featured: service.featured,
        sort_order: service.sort_order,
      });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', image_url: '', details: '', featured: false, sort_order: 0 });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      await supabase.from('services').update(form).eq('id', editing.id);
    } else {
      await supabase.from('services').insert(form);
    }
    setModalOpen(false);
    await fetchData();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await supabase.from('services').delete().eq('id', id);
    await fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-hospital-red border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Services</h2>
        <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Featured</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{s.description}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.featured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
              </div>
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                label="Service Image"
                folder="services"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none" />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 text-hospital-red rounded" />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured on Homepage</label>
                </div>
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
