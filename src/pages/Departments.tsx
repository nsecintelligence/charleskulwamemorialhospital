import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Department } from '../types';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('departments').select('*').order('sort_order').then(({ data }) => {
      if (data) setDepartments(data);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Departments</h1>
          <p className="text-white/80 text-lg">Specialized care across every medical discipline.</p>
        </div>
      </div>
      <section className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-52 overflow-hidden">
                  <img src={dept.image_url || ''} alt={dept.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-hospital-red" />
                    <h3 className="text-lg font-bold text-gray-900">{dept.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{dept.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
