import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { HeroSlide } from '../../types';
import { Save, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState({
    image_url: '',
    title: '',
    subtitle: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data } = await supabase.from('hero_slides').select('*').order('sort_order');
    if (data) setSlides(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      image_url: '',
      title: '',
      subtitle: '',
      sort_order: slides.length,
      is_active: true,
    });
    setEditingSlide(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingSlide) {
      await supabase
        .from('hero_slides')
        .update({
          image_url: form.image_url,
          title: form.title || null,
          subtitle: form.subtitle || null,
          sort_order: form.sort_order,
          is_active: form.is_active,
        })
        .eq('id', editingSlide.id);
    } else {
      await supabase.from('hero_slides').insert({
        image_url: form.image_url,
        title: form.title || null,
        subtitle: form.subtitle || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      });
    }

    await fetchSlides();
    resetForm();
    setSaving(false);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setForm({
      image_url: slide.image_url,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    await supabase.from('hero_slides').delete().eq('id', id);
    await fetchSlides();
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    await supabase.from('hero_slides').update({ is_active: !slide.is_active }).eq('id', slide.id);
    await fetchSlides();
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    await Promise.all([
      supabase.from('hero_slides').update({ sort_order: newIndex }).eq('id', slides[index].id),
      supabase.from('hero_slides').update({ sort_order: index }).eq('id', slides[newIndex].id),
    ]);

    await fetchSlides();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Hero Slides</h2>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h3>
        <div className="space-y-5">
          <ImageUpload
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
            label="Slide Image"
            folder="hero-slides"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                placeholder="Overlay title on the slide"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (optional)</label>
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                placeholder="Overlay subtitle"
              />
            </div>
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
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Show this slide</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : editingSlide ? 'Update Slide' : 'Add Slide'}
            </button>
            {editingSlide && (
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {slides.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No slides yet. Add your first slide above.</div>
        ) : (
          <div className="divide-y">
            {slides.map((slide, index) => (
              <div key={slide.id} className={`p-4 flex items-center gap-4 ${!slide.is_active ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveSlide(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <img src={slide.image_url} alt={slide.title || 'Slide'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{slide.title || 'No title'}</div>
                  <div className="text-sm text-gray-500 truncate">{slide.subtitle || 'No subtitle'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      slide.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {slide.is_active ? 'Active' : 'Hidden'}
                  </button>
                  <button onClick={() => handleEdit(slide)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
