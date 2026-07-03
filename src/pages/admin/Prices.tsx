import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ServicePrice } from '../../types';
import { Save, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function AdminPrices() {
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ServicePrice | null>(null);
  const [form, setForm] = useState({
    service_name: '',
    category: '',
    price: '',
    currency: 'TZS',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const { data } = await supabase.from('service_prices').select('*').order('created_at');
    if (data) setPrices(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      service_name: '',
      category: '',
      price: '',
      currency: 'TZS',
      description: '',
      is_active: true,
    });
    setEditingPrice(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const priceValue = parseFloat(form.price);

    if (editingPrice) {
      await supabase
        .from('service_prices')
        .update({
          service_name: form.service_name,
          category: form.category || null,
          price: priceValue,
          currency: form.currency,
          description: form.description || null,
          is_active: form.is_active,
        })
        .eq('id', editingPrice.id);
    } else {
      await supabase.from('service_prices').insert({
        service_name: form.service_name,
        category: form.category || null,
        price: priceValue,
        currency: form.currency,
        description: form.description || null,
        is_active: form.is_active,
      });
    }

    await fetchPrices();
    resetForm();
    setSaving(false);
  };

  const handleEdit = (p: ServicePrice) => {
    setEditingPrice(p);
    setForm({
      service_name: p.service_name,
      category: p.category || '',
      price: p.price.toString(),
      currency: p.currency,
      description: p.description || '',
      is_active: p.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price entry?')) return;
    await supabase.from('service_prices').delete().eq('id', id);
    await fetchPrices();
  };

  const handleToggleActive = async (p: ServicePrice) => {
    await supabase.from('service_prices').update({ is_active: !p.is_active }).eq('id', p.id);
    await fetchPrices();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Service Prices</h2>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">{editingPrice ? 'Edit Price' : 'Add New Price'}</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
              <input
                value={form.service_name}
                onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                placeholder="e.g. General Consultation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
              >
                <option value="">Select Category</option>
                <option value="consultation">Consultation</option>
                <option value="laboratory">Laboratory</option>
                <option value="imaging">Imaging/X-Ray</option>
                <option value="surgery">Surgery</option>
                <option value="maternity">Maternity</option>
                <option value="inpatient">Inpatient</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
              >
                <option value="TZS">TZS (Tanzanian Shilling)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="KES">KES (Kenyan Shilling)</option>
                <option value="UGX">UGX (Ugandan Shilling)</option>
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
              placeholder="Additional details about the service"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="price_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 text-green-700 rounded"
            />
            <label htmlFor="price_active" className="text-sm font-medium text-gray-700">Show this price publicly</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editingPrice ? 'Update Price' : 'Add Price'}
            </button>
            {editingPrice && (
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
        {prices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No prices yet. Add your first price above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {prices.map((p) => (
                  <tr key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{p.service_name}</div>
                      {p.description && <div className="text-xs text-gray-500">{p.description}</div>}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{p.category || '-'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {p.currency} {p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
