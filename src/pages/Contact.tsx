import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ContactInfo, Department } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Appointment form
  const [apt, setApt] = useState({ patient_name: '', patient_phone: '', patient_email: '', department: '', preferred_date: '', preferred_time: '', message: '' });
  const [aptSubmitted, setAptSubmitted] = useState(false);
  const [aptError, setAptError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('contact_info').select('*').maybeSingle(),
      supabase.from('departments').select('*').order('sort_order'),
    ]).then(([contactRes, deptRes]) => {
      if (contactRes.data) setContact(contactRes.data);
      if (deptRes.data) setDepartments(deptRes.data);
      setLoading(false);
    });
  }, []);

  // Pre-fill from navigation state (from Doctors page)
  useEffect(() => {
    if (location.state) {
      const state = location.state as { department?: string; doctorName?: string };
      if (state.department) setApt(prev => ({ ...prev, department: state.department }));
      if (state.doctorName) setApt(prev => ({ ...prev, message: language === 'sw' ? `Nataka kuona Daktari ${state.doctorName}` : `I would like to see Dr. ${state.doctorName}` }));
    }
  }, [location.state, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleAptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAptError(false);
    const { error } = await supabase.from('appointments').insert(apt);
    if (!error) {
      setAptSubmitted(true);
      setApt({ patient_name: '', patient_phone: '', patient_email: '', department: '', preferred_date: '', preferred_time: '', message: '' });
    } else {
      setAptError(true);
    }
    setSubmitting(false);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('contact.title')}</h1>
          <p className="text-white/80 text-lg">{t('contact.subtitle')}</p>
        </div>
      </div>
      <section className="section-padding bg-gray-50">
        <div className="container-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.getInTouch')}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('footer.address')}</h4>
                    <p className="text-gray-600 text-sm">{contact?.address || '123 Medical Center Drive, Healthcare City, HC 12345'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('footer.phone')}</h4>
                    <p className="text-gray-600 text-sm">{contact?.phone || '+1 (555) 123-4567'}</p>
                    <p className="text-red-700 text-sm font-semibold">{t('topbar.emergency')}: {contact?.emergency_phone || '+1 (555) 911-0000'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('footer.email')}</h4>
                    <p className="text-gray-600 text-sm">{contact?.email || 'info@cityhospital.com'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white p-5 rounded-xl shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-700/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('contact.workingHours')}</h4>
                    <p className="text-gray-600 text-sm">{t('contact.emergency247')}</p>
                    <p className="text-gray-600 text-sm">{t('contact.outpatient')}</p>
                  </div>
                </div>
              </div>
              {contact?.map_embed_url && (
                <div className="mt-8 rounded-xl overflow-hidden shadow-sm">
                  <iframe src={contact.map_embed_url} width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Hospital Location" />
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Appointment Booking */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-700" />
                  {t('contact.bookAppointment')}
                </h2>
                <p className="text-gray-600 text-sm mb-4">{t('contact.bookDesc')}</p>
                {aptSubmitted ? (
                  <div className="bg-white rounded-xl p-8 shadow-sm text-center border border-green-200">
                    <CheckCircle className="w-16 h-16 text-green-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.bookingSent')}</h3>
                    <p className="text-gray-600">{t('contact.bookingSentDesc')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleAptSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    {aptError && (
                      <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{t('contact.bookingError')}</div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.patientName')} *</label>
                      <input type="text" required value={apt.patient_name}
                        onChange={(e) => setApt({ ...apt, patient_name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.patientPhone')} *</label>
                        <input type="tel" required value={apt.patient_phone}
                          onChange={(e) => setApt({ ...apt, patient_phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.patientEmail')}</label>
                        <input type="email" value={apt.patient_email}
                          onChange={(e) => setApt({ ...apt, patient_email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.selectDept')}</label>
                      <select value={apt.department}
                        onChange={(e) => setApt({ ...apt, department: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none bg-white">
                        <option value="">--</option>
                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        <option value="General">{language === 'sw' ? 'Mataratibu ya Jumla' : 'General'}</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.preferredDate')} *</label>
                        <input type="date" required value={apt.preferred_date}
                          onChange={(e) => setApt({ ...apt, preferred_date: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.preferredTime')}</label>
                        <input type="time" value={apt.preferred_time}
                          onChange={(e) => setApt({ ...apt, preferred_time: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.additionalMsg')}</label>
                      <textarea rows={2} value={apt.message}
                        onChange={(e) => setApt({ ...apt, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none resize-none" />
                    </div>
                    <button type="submit" disabled={submitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                      <Send className="w-4 h-4" /> {t('contact.submitBooking')}
                    </button>
                  </form>
                )}
              </div>

              {/* Contact Message Form */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.sendMessage')}</h2>
                {submitted ? (
                  <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                    <CheckCircle className="w-16 h-16 text-green-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.messageSent')}</h3>
                    <p className="text-gray-600">{t('contact.messageSentDesc')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.fullName')}</label>
                      <input type="text" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('footer.email')}</label>
                        <input type="email" required value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('footer.phone')}</label>
                        <input type="tel" value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.subject')}</label>
                      <input type="text" required value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')}</label>
                      <textarea required rows={4} value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none resize-none" />
                    </div>
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> {t('contact.send')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
