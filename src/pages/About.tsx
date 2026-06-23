import { useEffect, useState } from 'react';
import { Award, Target, Eye, Heart, Users, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AboutUs } from '../types';

export default function About() {
  const [about, setAbout] = useState<AboutUs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('about_us').select('*').maybeSingle().then(({ data }) => {
      if (data) setAbout(data);
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
      {/* Page Header */}
      <div className="bg-hospital-red text-white py-16">
        <div className="container-width">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">About Us</h1>
          <p className="text-white/80 text-lg">Learn about our history, mission, and commitment to excellence.</p>
        </div>
      </div>

      {/* History */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-hospital-red" />
                <h2 className="text-3xl font-bold text-gray-900">Our History</h2>
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{about?.history || 'Founded in 1985, our hospital has been serving the community for over 40 years.'}</p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={about?.history_image || "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=800"}
                alt="Hospital Building"
                className="w-full h-80 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-hospital-red/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-hospital-red" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{about?.mission || 'To provide compassionate, high-quality healthcare.'}</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-hospital-green/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-hospital-green" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{about?.vision || 'To be the most trusted healthcare provider in the region.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-6 h-6 text-hospital-red" />
              <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(about?.core_values || 'Compassion, Integrity, Excellence, Innovation, Respect, Teamwork').split(',').map((value, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-hospital-red/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-5 h-5 text-hospital-red" />
                </div>
                <h4 className="font-semibold text-gray-900">{value.trim()}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Management */}
      <section className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="flex items-center gap-2 mb-8">
            <Users className="w-6 h-6 text-hospital-red" />
            <h2 className="text-3xl font-bold text-gray-900">Leadership</h2>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{about?.management || 'Our hospital is led by experienced medical professionals.'}</p>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <div className="flex items-center gap-2 mb-8">
            <Trophy className="w-6 h-6 text-hospital-red" />
            <h2 className="text-3xl font-bold text-gray-900">Achievements & Milestones</h2>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border">
            <div className="space-y-4">
              {(about?.achievements || '').split('\n').filter(Boolean).map((achievement, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-hospital-green mt-2 flex-shrink-0" />
                  <p className="text-gray-700">{achievement.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
