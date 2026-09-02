import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { HomepageContent } from '../../types';
import { Save } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function AdminHomepage() {
  const [data, setData] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: '', site_logo_url: '',
    welcome_title: '', welcome_title_line2: '', welcome_text: '', hero_image_url: '', hero_cta_text: '', hero_cta_link: '',
    announcement_title: '', announcement_text: '', announcement_active: false,
    director_name: '', director_title: '', director_statement: '', director_photo_url: '',
  });

  useEffect(() => {
    supabase.from('homepage_content').select('*').maybeSingle().then(({ data }) => {
      if (data) {
        setData(data);
        setForm({
          site_name: data.site_name || 'City Hospital',
          site_logo_url: data.site_logo_url || '',
          welcome_title: data.welcome_title,
          welcome_title_line2: data.welcome_title_line2 || '',
          welcome_text: data.welcome_text,
          hero_image_url: data.hero_image_url || '',
          hero_cta_text: data.hero_cta_text,
          hero_cta_link: data.hero_cta_link,
          announcement_title: data.announcement_title || '',
          announcement_text: data.announcement_text || '',
          announcement_active: data.announcement_active,
          director_name: data.director_name || '',
          director_title: data.director_title || '',
          director_statement: data.director_statement || '',
          director_photo_url: data.director_photo_url || '',
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (data) {
      await supabase.from('homepage_content').update(form).eq('id', data.id);
    } else {
      await supabase.from('homepage_content').insert(form);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Homepage Content</h2>
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div className="border-b pb-5">
          <h3 className="font-semibold text-gray-900 mb-4">Site Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
              <input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
            </div>
            <div>
              <ImageUpload
                value={form.site_logo_url}
                onChange={(url) => setForm({ ...form, site_logo_url: url })}
                label="Logo"
                folder="logos"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Title Line 1</label>
            <input value={form.welcome_title} onChange={(e) => setForm({ ...form, welcome_title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" placeholder="e.g. Charles Kulwa Memorial" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Title Line 2</label>
            <input value={form.welcome_title_line2} onChange={(e) => setForm({ ...form, welcome_title_line2: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" placeholder="e.g. Hospital" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Text</label>
          <textarea rows={3} value={form.welcome_text} onChange={(e) => setForm({ ...form, welcome_text: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
        </div>
        <ImageUpload
          value={form.hero_image_url}
          onChange={(url) => setForm({ ...form, hero_image_url: url })}
          label="Hero Image"
          folder="hero"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
            <input value={form.hero_cta_text} onChange={(e) => setForm({ ...form, hero_cta_text: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
            <input value={form.hero_cta_link} onChange={(e) => setForm({ ...form, hero_cta_link: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
        </div>
        <div className="border-t pt-5">
          <h3 className="font-semibold text-gray-900 mb-4">Executive Director's Statement</h3>
          <p className="text-sm text-gray-500 mb-4">This appears on the homepage right before the services section. Upload a photo and write the director's welcome message.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Director Name</label>
              <input value={form.director_name} onChange={(e) => setForm({ ...form, director_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" placeholder="e.g. Dr. John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Director Title</label>
              <input value={form.director_title} onChange={(e) => setForm({ ...form, director_title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" placeholder="e.g. Executive Director" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Director's Statement</label>
            <textarea rows={4} value={form.director_statement} onChange={(e) => setForm({ ...form, director_statement: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" placeholder="Welcome message from the director..." />
          </div>
          <div className="mt-4">
            <ImageUpload
              value={form.director_photo_url}
              onChange={(url) => setForm({ ...form, director_photo_url: url })}
              label="Director Photo"
              folder="director"
            />
          </div>
        </div>
        <div className="border-t pt-5">
          <h3 className="font-semibold text-gray-900 mb-4">Announcement Banner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Title</label>
              <input value={form.announcement_title} onChange={(e) => setForm({ ...form, announcement_title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input type="checkbox" id="announcement_active" checked={form.announcement_active} onChange={(e) => setForm({ ...form, announcement_active: e.target.checked })} className="w-4 h-4 text-green-700 rounded" />
              <label htmlFor="announcement_active" className="text-sm font-medium text-gray-700">Show Announcement</label>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Text</label>
            <textarea rows={2} value={form.announcement_text} onChange={(e) => setForm({ ...form, announcement_text: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
