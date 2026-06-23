import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { NewsItem } from '../types';

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('news').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) setItem(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-hospital-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <Link to="/news" className="text-hospital-red hover:underline">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-hospital-red text-white py-12">
        <div className="container-width">
          <Link to="/news" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to News
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{item.title}</h1>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Calendar className="w-4 h-4" />
            {new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
      <section className="section-padding bg-white">
        <div className="container-width max-w-4xl">
          {item.featured_image && (
            <div className="rounded-xl overflow-hidden mb-8">
              <img src={item.featured_image} alt={item.title} className="w-full h-80 md:h-96 object-cover" />
            </div>
          )}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {item.content}
          </div>
        </div>
      </section>
    </div>
  );
}
