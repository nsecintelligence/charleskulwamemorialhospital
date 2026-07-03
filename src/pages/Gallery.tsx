import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import type { GalleryItem } from '../types';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('gallery').select('*').order('sort_order').then(({ data }) => {
      if (data) {
        setItems(data);
        const cats = [...new Set(data.map((i) => i.category))];
        setCategories(cats);
      }
      setLoading(false);
    });
  }, []);

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-green-700 text-white py-16">
        <div className="container-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Photo Gallery</h1>
          <p className="text-white/80 text-lg">Explore our facilities, events, and community.</p>
        </div>
      </div>
      <section className="section-padding bg-gray-50">
        <div className="container-width">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === 'all' ? 'bg-green-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    activeCategory === cat ? 'bg-green-700 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="h-64 overflow-hidden">
                  <img src={item.image_url} alt={item.caption || ''} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
