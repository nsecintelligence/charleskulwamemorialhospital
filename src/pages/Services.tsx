import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Service } from '../types';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('services').select('*').order('sort_order').then(({ data }) => {
      if (data) setServices(data);
      setLoading(false);
    });
  }, []);

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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Services</h1>
          <p className="text-white/80 text-lg">Comprehensive healthcare services tailored to your needs.</p>
        </div>
      </div>
      <section className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                {service.image_url && (
                  <div className="h-52 overflow-hidden">
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope className="w-5 h-5 text-green-700 flex-shrink-0" />
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  {service.details && (
                    <p className="text-gray-500 text-sm mt-3 leading-relaxed">{service.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
