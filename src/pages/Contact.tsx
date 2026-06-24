import { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ContactInfo } from '../types';

export default function Contact() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('contact_info').select('*').maybeSingle().then(({ data }) => {
      if (data) setContact(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Contact Us</h1>
          <p className="text-white/80 text-lg">We are here to help. Reach out anytime.</p>
        </div>
      </div>
      <section className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600 text-sm">{contact?.address || '123 Medical Center Drive, Healthcare City, HC 12345'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600 text-sm">{contact?.phone || '+1 (555) 123-4567'}</p>
                    <p className="text-red-700 text-sm font-semibold">Emergency: {contact?.emergency_phone || '+1 (555) 911-0000'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600 text-sm">{contact?.email || 'info@cityhospital.com'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Working Hours</h4>
                    <p className="text-gray-600 text-sm">Emergency: 24/7</p>
                    <p className="text-gray-600 text-sm">Outpatient: Mon-Fri 8AM - 6PM</p>
                  </div>
                </div>
              </div>
              {/* Map */}
              {contact?.map_embed_url && (
                <div className="mt-8 rounded-xl overflow-hidden shadow-sm">
                  <iframe
                    src={contact.map_embed_url}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Hospital Location"
                  />
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
              {submitted ? (
                <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                  <CheckCircle className="w-16 h-16 text-green-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. We will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none resize-none"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
