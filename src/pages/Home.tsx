import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Users, Award, Activity, ChevronRight, Phone, Mail, MapPin, ChevronLeft, ChevronRight as ChevronRightIcon, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { HomepageContent, Service, NewsItem, ContactInfo, HeroSlide } from '../types';

export default function Home() {
  const [home, setHome] = useState<HomepageContent | null>(null);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [homeRes, servicesRes, newsRes, contactRes, slidesRes] = await Promise.all([
        supabase.from('homepage_content').select('*').maybeSingle(),
        supabase.from('services').select('*').eq('featured', true).order('sort_order'),
        supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('contact_info').select('*').maybeSingle(),
        supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order'),
      ]);
      if (homeRes.data) setHome(homeRes.data);
      if (servicesRes.data) setFeaturedServices(servicesRes.data);
      if (newsRes.data) setLatestNews(newsRes.data);
      if (contactRes.data) setContact(contactRes.data);
      if (slidesRes.data && slidesRes.data.length > 0) setSlides(slidesRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length, nextSlide]);

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
        <div className="bg-green-700 text-white py-2 sm:py-3 overflow-hidden">
          <div className="container-width">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="whitespace-nowrap animate-marquee-sm inline-block sm:inline">
                  <strong>{home.announcement_title}</strong>: {home.announcement_text}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[580px] lg:h-[680px] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {slides.length > 0 ? slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={slide.image_url}
                alt={slide.title || 'Hospital'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
            </div>
          )) : (
            <>
              <img
                src={home?.hero_image_url || 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
                alt="Hospital"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20" />
            </>
          )}
        </div>

        {/* Slide Navigation Arrows - only show if multiple slides */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators - only show if multiple slides */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-6 sm:w-8'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        <div className="relative container-width text-white z-10">
          <div className="max-w-2xl px-4 sm:px-0">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white/90 mb-3 sm:mb-5">
              <span className="w-6 sm:w-8 h-0.5 bg-green-700" />
              24/7 Emergency & Specialist Care
            </span>
            <h1 className="text-2xl sm:text-[2.6rem] md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] tracking-tight mb-3 sm:mb-5">
              <span className="text-blue-500">{home?.welcome_title || 'Charles Kulwa Memorial'}</span>
              <br className="hidden sm:block" />
              <span className="text-green-700">{home?.welcome_title_line2 || 'Hospital'}</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-9 max-w-xl leading-relaxed">
              Compassionate, high-quality healthcare with modern facilities, experienced professionals, and patient-first service.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to={home?.hero_cta_link || '/contact'}
                className="inline-flex items-center gap-2 bg-green-700 text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg font-semibold hover:bg-green-800 transition-colors shadow-lg shadow-green-700/25 text-sm sm:text-base"
              >
                {home?.hero_cta_text || 'Book an Appointment'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg font-semibold border border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all backdrop-blur-sm text-sm sm:text-base"
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
              <div className="text-2xl font-bold text-gray-900">40+</div>
              <div className="text-sm text-gray-600">Years of Service</div>
            </div>
            <div className="text-center">
              <Activity className="w-8 h-8 text-green-700 mx-auto mb-2" />
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
                    <img src={service.image_url || ''} alt={service.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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

      {/* Insurance Services */}
      <section className="section-padding bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container-width">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <ShieldCheck className="w-4 h-4" />
              Insurance Partners
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Insurance Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We work with major insurance providers to ensure accessible and affordable healthcare for all our patients.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {/* NHIF */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/images/insurance/services/MHIF_IMAGE.jpg"
                  alt="NHIF"
                  className="w-full h-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">NHIF</h3>
              <p className="text-xs text-gray-500">National Health Insurance Fund</p>
            </div>

            {/* Strategies */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/images/insurance/services/STRATEGIES_IMAGE.jpg"
                  alt="Strategies"
                  className="w-full h-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Strategies</h3>
              <p className="text-xs text-gray-500">Insurance Solutions</p>
            </div>

            {/* Jubilee */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/images/insurance/services/JUBILEE_INSURANCE.png"
                  alt="Jubilee Insurance"
                  className="w-full h-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Jubilee</h3>
              <p className="text-xs text-gray-500">Jubilee Insurance</p>
            </div>

            {/* NSSF */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/images/insurance/services/NSSF.jpg"
                  alt="NSSF"
                  className="w-full h-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">NSSF</h3>
              <p className="text-xs text-gray-500">National Social Security Fund</p>
            </div>

            {/* Assemble */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/images/insurance/services/ASSEMBLE.png"
                  alt="Assemble"
                  className="w-full h-full object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Assemble</h3>
              <p className="text-xs text-gray-500">Healthcare Coverage</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-10 bg-white rounded-xl border border-emerald-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-gray-700">
              <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <p className="text-sm">We accept multiple insurance plans. Contact us to verify your coverage and benefits.</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm whitespace-nowrap"
            >
              Verify Your Insurance <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

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
                    <img src={item.featured_image || ''} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
