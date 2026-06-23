import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { TopBar } from '../../types';
import { Save, Plus, X } from 'lucide-react';

export default function AdminTopBar() {
  const [data, setData] = useState<TopBar | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    emergency_phone: '',
    working_hours: '',
    announcements: [] as string[],
    marquee_speed: 30,
    is_active: true,
  });
  const [newAnnouncement, setNewAnnouncement] = useState('');

  useEffect(() => {
    supabase.from('top_bar').select('*').maybeSingle().then(({ data }) => {
      if (data) {
        setData(data);
        setForm({
          emergency_phone: data.emergency_phone,
          working_hours: data.working_hours,
          announcements: data.announcements || [],
          marquee_speed: data.marquee_speed || 30,
          is_active: data.is_active,
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (data) {
      await supabase.from('top_bar').update(form).eq('id', data.id);
    } else {
      await supabase.from('top_bar').insert(form);
    }
    setSaving(false);
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setForm({ ...form, announcements: [...form.announcements, newAnnouncement.trim()] });
    setNewAnnouncement('');
  };

  const removeAnnouncement = (index: number) => {
    setForm({ ...form, announcements: form.announcements.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-hospital-red border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Top Bar Settings</h2>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
            <input
              value={form.emergency_phone}
              onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
            <input
              value={form.working_hours}
              onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marquee Speed (seconds)</label>
          <input
            type="number"
            min={5}
            max={120}
            value={form.marquee_speed}
            onChange={(e) => setForm({ ...form, marquee_speed: parseInt(e.target.value) || 30 })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Lower = faster scrolling. Default is 30 seconds.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 text-hospital-red rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Show Marquee Announcements</label>
        </div>

        <div className="border-t pt-5">
          <h3 className="font-semibold text-gray-900 mb-4">Marquee Announcements</h3>
          <div className="flex gap-2 mb-4">
            <input
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Enter announcement text..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-hospital-red focus:border-transparent outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAnnouncement(); } }}
            />
            <button
              type="button"
              onClick={addAnnouncement}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {form.announcements.map((text, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-hospital-red flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-700">{text}</span>
                <button
                  type="button"
                  onClick={() => removeAnnouncement(i)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {form.announcements.length === 0 && (
              <p className="text-sm text-gray-400 italic">No announcements added. Add some to display them in the marquee.</p>
            )}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
