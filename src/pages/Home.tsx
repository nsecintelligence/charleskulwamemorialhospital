import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Users, Award, Activity, ChevronRight, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
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
        <div className="bg-hospital-red text-white py-3">
          <div className="container-width flex items-center gap-3 text-sm">
            <Activity className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong>{home.announcement_title}</strong>: {home.announcement_text}
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[500px] md:h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={home?.hero_image_url || 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
            alt="Hospital"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        </div>
        <div className="relative container-width text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-2xl">
            {home?.welcome_title || 'Welcome to City Hospital'}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
            {home?.welcome_text || 'Providing world-class healthcare with compassion and excellence.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={home?.hero_cta_link || '/contact'} className="btn-primary inline-flex items-center gap-2">
              {home?.hero_cta_text || 'Book an Appointment'} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors">
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b">
        <div className="container-width">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-hospital-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Emergency Care</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-hospital-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Medical Staff</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-hospital-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">40+</div>
              <div className="text-sm text-gray-600">Years of Service</div>
            </div>
            <div className="text-center">
              <Activity className="w-8 h-8 text-hospital-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">50+</div>
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
                    <Link to={`/services`} className="inline-flex items-center gap-1 text-hospital-red text-sm font-medium mt-3 hover:underline">
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
                    <div className="text-xs text-hospital-red font-medium mb-2">
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
      <section className="section-padding bg-gradient-to-br from-hospital-green to-emerald-900 text-white">
        <div className="container-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Help?</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Our team is here to help you. Reach out for appointments, inquiries, or emergency assistance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Call Us</h3>
              <p className="text-sm text-white/70 mb-2">General inquiries</p>
              <a href={`tel:${contact?.phone || '+1 (555) 123-4567'}`} className="text-xl font-bold hover:text-white/90 transition-colors">
                {contact?.phone || '+1 (555) 123-4567'}
              </a>
              <p className="text-sm text-white/70 mt-3 mb-1">Emergency hotline</p>
              <a href={`tel:${contact?.emergency_phone || '+1 (555) 911-0000'}`} className="text-lg font-bold text-red-300 hover:text-red-200 transition-colors">
                {contact?.emergency_phone || '+1 (555) 911-0000'}
              </a>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Email Us</h3>
              <p className="text-sm text-white/70 mb-2">Send us your questions</p>
              <a href={`mailto:${contact?.email || 'info@cityhospital.com'}`} className="text-lg font-bold hover:text-white/90 transition-colors">
                {contact?.email || 'info@cityhospital.com'}
              </a>
              <p className="text-sm text-white/70 mt-4">We typically respond within 24 hours.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Visit Us</h3>
              <p className="text-sm text-white/70 mb-2">Our location</p>
              <p className="text-base font-medium leading-relaxed">
                {contact?.address || '123 Medical Center Drive, Healthcare City, HC 12345'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-hospital-green px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get in Touch <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
