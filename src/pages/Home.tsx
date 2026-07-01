import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Users, Award, Activity, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { HomepageContent, Service, NewsItem, ContactInfo } from '../types';

export default function Home() {
  const [home, setHome] = useState<HomepageContent | null>(null);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [homeRes, servicesRes, newsRes, contactRes] = await Promise.all([
        supabase.from('homepage_content').select('*').maybeSingle(),
        supabase.from('services').select('*').eq('featured', true).order('sort_order'),
        supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('contact_info').select('*').maybeSingle(),
      ]);
      if (homeRes.data) setHome(homeRes.data);
      if (servicesRes.data) setFeaturedServices(servicesRes.data);
      if (newsRes.data) setLatestNews(newsRes.data);
      if (contactRes.data) setContact(contactRes.data);
      setLoading(false);
    };
    fetchData();
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
      {/* Announcement Banner */}
      {home?.announcement_active && (
        <div className="bg-green-700 text-white py-3">
          <div className="container-width flex items-center gap-3 text-sm">
            <Activity className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong>{home.announcement_title}</strong>: {home.announcement_text}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[580px] md:h-[680px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={home?.hero_image_url || 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
            alt="Hospital"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
        </div>
        <div className="relative container-width text-white">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-white/90 mb-5">
              <span className="w-8 h-0.5 bg-green-700" />
              24/7 Emergency & Specialist Care
            </span>
            <h1 className="text-[2.6rem] md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight mb-5">
              <span className="text-blue-500">{home?.welcome_title || 'Charles Kulwa Memorial'}</span>
              <br className="hidden sm:block" />
              <span className="text-green-700">{home?.welcome_title_line2 || 'Hospital'}</span>
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-9 max-w-xl leading-relaxed">
              Compassionate, high-quality healthcare with modern facilities, experienced professionals, and patient-first service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={home?.hero_cta_link || '/contact'}
                className="inline-flex items-center gap-2 bg-green-700 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-green-800 transition-colors shadow-lg shadow-green-700/25"
              >
                {home?.hero_cta_text || 'Book an Appointment'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all backdrop-blur-sm"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b">
        <div className="container-width">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-green-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Emergency Care</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-green-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Medical Staff</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-green-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">10+</div>
              <div className="text-sm text-gray-600">Years of Service</div>
            </div>
            <div className="text-center">
              <Activity className="w-8 h-8 text-green-700 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">15+</div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-width">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive healthcare services delivered with cutting-edge technology and compassionate care.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-48 overflow-hidden">
                    <img src={service.image_url || ''} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
                    <Link to={`/services`} className="inline-flex items-center gap-1 text-green-700 text-sm font-medium mt-3 hover:underline">
                      Learn more <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/services" className="btn-primary inline-flex items-center gap-2">
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {latestNews.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-width">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Latest News</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Stay updated with the latest happenings at City Hospital.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map((item) => (
                <Link key={item.id} to={`/news/${item.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-48 overflow-hidden">
                    <img src={item.featured_image || ''} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-green-700 font-medium mb-2">
                      {new Date(item.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.content.substring(0, 120)}...</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/news" className="btn-primary inline-flex items-center gap-2">
                All News <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Contact / Need Help */}
      <section className="py-10 md:py-12 bg-gradient-to-br from-green-700 to-emerald-900 text-white">
        <div className="container-width">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Need Help?</h2>
            <p className="text-base text-white/80 max-w-2xl mx-auto">
              Our team is here to help you. Reach out for appointments, inquiries, or emergency assistance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold">Call Us</h3>
              </div>
              <a href={`tel:${contact?.phone || '+1 (555) 123-4567'}`} className="text-lg font-bold hover:text-white/90 transition-colors">
                {contact?.phone || '+1 (555) 123-4567'}
              </a>
              <p className="text-sm text-white/70 mt-2">Emergency: <a href={`tel:${contact?.emergency_phone || '+1 (555) 911-0000'}`} className="font-bold text-red-300 hover:text-red-200 transition-colors">{contact?.emergency_phone || '+1 (555) 911-0000'}</a></p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold">Email Us</h3>
              </div>
              <a href={`mailto:${contact?.email || 'info@cityhospital.com'}`} className="text-lg font-bold hover:text-white/90 transition-colors">
                {contact?.email || 'info@cityhospital.com'}
              </a>
              <p className="text-sm text-white/70 mt-2">We typically respond within 24 hours.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold">Visit Us</h3>
              </div>
              <p className="text-base font-medium leading-relaxed">
                {contact?.address || '123 Medical Center Drive, Healthcare City, HC 12345'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
