import { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FAQ } from '../types';

export default function FAQPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('faq').select('*').order('sort_order').then(({ data }) => {
      if (data) setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-hospital-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-hospital-red text-white py-16">
        <div className="container-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Frequently Asked Questions</h1>
          <p className="text-white/80 text-lg">Find answers to common questions about our services.</p>
        </div>
      </div>
      <section className="section-padding bg-gray-50">
        <div className="container-width max-w-3xl">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-hospital-red flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{item.question}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
                </button>
                {openId === item.id && (
                  <div className="px-5 pb-5">
                    <div className="pl-8 text-gray-600 leading-relaxed border-l-2 border-hospital-red/30 ml-1">
                      {item.answer}
                    </div>
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
