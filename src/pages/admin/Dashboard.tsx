import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Building2, Image, Newspaper, HelpCircle, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const cards = [
  { path: '/admin/services', label: 'Services', icon: Stethoscope, color: 'bg-red-50 text-red-600' },
  { path: '/admin/departments', label: 'Departments', icon: Building2, color: 'bg-green-50 text-green-600' },
  { path: '/admin/gallery', label: 'Gallery', icon: Image, color: 'bg-blue-50 text-blue-600' },
  { path: '/admin/news', label: 'News', icon: Newspaper, color: 'bg-amber-50 text-amber-600' },
  { path: '/admin/faq', label: 'FAQ', icon: HelpCircle, color: 'bg-purple-50 text-purple-600' },
  { path: '/admin/about', label: 'About Us', icon: Users, color: 'bg-teal-50 text-teal-600' },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const results: Record<string, number> = {};
      const tables = ['services', 'departments', 'gallery', 'news', 'faq'];
      for (const table of tables) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        results[table] = count || 0;
      }
      setCounts(results);
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const key = card.label.toLowerCase().replace(' ', '_');
          return (
            <Link
              key={card.path}
              to={card.path}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{counts[key] || 0}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{card.label}</h3>
              <p className="text-sm text-gray-500 mt-1">Manage {card.label.toLowerCase()}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
