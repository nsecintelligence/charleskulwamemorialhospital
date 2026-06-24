import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { AboutUs } from '../../types';
import { Save } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function AdminAbout() {
  const [data, setData] = useState<AboutUs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ history: '', history_image: '', mission: '', vision: '', core_values: '', management: '', achievements: '' });

  useEffect(() => {
    supabase.from('about_us').select('*').maybeSingle().then(({ data }) => {
      if (data) {
        setData(data);
        setForm({
          history: data.history,
          history_image: data.history_image || '',
          mission: data.mission,
          vision: data.vision,
          core_values: data.core_values,
          management: data.management,
          achievements: data.achievements,
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (data) {
      await supabase.from('about_us').update(form).eq('id', data.id);
    } else {
      await supabase.from('about_us').insert(form);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">About Us</h2>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">History</label>
          <textarea rows={5} value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <ImageUpload
          value={form.history_image}
          onChange={(url) => setForm({ ...form, history_image: url })}
          label="History Section Image"
          folder="about"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
          <textarea rows={3} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vision</label>
          <textarea rows={3} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Core Values (comma-separated)</label>
          <input value={form.core_values} onChange={(e) => setForm({ ...form, core_values: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Management</label>
          <textarea rows={4} value={form.management} onChange={(e) => setForm({ ...form, management: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (one per line)</label>
          <textarea rows={6} value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
