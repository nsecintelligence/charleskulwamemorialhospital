import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ContactInfo } from '../../types';
import { Save } from 'lucide-react';

export default function AdminContact() {
  const [data, setData] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    address: '', phone: '', email: '', emergency_phone: '', map_embed_url: '',
    social_facebook: '', social_twitter: '', social_instagram: '', social_linkedin: ''
  });

  useEffect(() => {
    supabase.from('contact_info').select('*').maybeSingle().then(({ data }) => {
      if (data) {
        setData(data);
        setForm({
          address: data.address,
          phone: data.phone,
          email: data.email,
          emergency_phone: data.emergency_phone,
          map_embed_url: data.map_embed_url || '',
          social_facebook: data.social_facebook || '',
          social_twitter: data.social_twitter || '',
          social_instagram: data.social_instagram || '',
          social_linkedin: data.social_linkedin || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (data) {
      await supabase.from('contact_info').update(form).eq('id', data.id);
    } else {
      await supabase.from('contact_info').insert(form);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
            <input value={form.emergency_phone} onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
          <input value={form.map_embed_url} onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input value={form.social_facebook} onChange={(e) => setForm({ ...form, social_facebook: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
            <input value={form.social_twitter} onChange={(e) => setForm({ ...form, social_twitter: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input value={form.social_instagram} onChange={(e) => setForm({ ...form, social_instagram: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input value={form.social_linkedin} onChange={(e) => setForm({ ...form, social_linkedin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
