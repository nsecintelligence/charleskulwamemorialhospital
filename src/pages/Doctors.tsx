import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Phone, Mail, Calendar, User, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SpecialistDoctor, DoctorSchedule } from '../types';
import { useLanguage, getTranslatedArray } from '../context/LanguageContext';

export default function Doctors() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<SpecialistDoctor[]>([]);
  const [schedules, setSchedules] = useState<Record<string, DoctorSchedule[]>>({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [docsRes, schedRes] = await Promise.all([
        supabase.from('specialist_doctors').select('*').eq('is_active', true).order('display_order'),
        supabase.from('doctor_schedules').select('*').order('day_of_week'),
      ]);
      if (docsRes.data) setDoctors(docsRes.data);
      if (schedRes.data) {
        const map: Record<string, DoctorSchedule[]> = {};
        schedRes.data.forEach((s: DoctorSchedule) => {
          if (!map[s.doctor_id]) map[s.doctor_id] = [];
          map[s.doctor_id].push(s);
        });
        setSchedules(map);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const dayNames = getTranslatedArray('doctors.days', language);

  const specialties = Array.from(new Set(doctors.map(d => d.specialty).filter(Boolean))) as string[];

  const filtered = filter === 'all' ? doctors : doctors.filter(d => d.specialty === filter);

  const handleBook = (doctor: SpecialistDoctor) => {
    navigate('/contact', { state: { department: doctor.specialty, doctorName: doctor.name } });
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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t('doctors.title')}</h1>
          <p className="text-white/80 text-lg">{t('doctors.subtitle')}</p>
        </div>
      </div>

      <section className="section-padding bg-gray-50">
        <div className="container-width">
          {specialties.length > 0 && (
            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
              <span className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
                <Filter className="w-4 h-4" /> {t('doctors.all')}:
              </span>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === 'all' ? 'bg-green-700 text-white' : 'bg-white text-gray-700 hover:bg-green-50 border'
                }`}
              >
                {t('doctors.all')}
              </button>
              {specialties.map(sp => (
                <button
                  key={sp}
                  onClick={() => setFilter(sp)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === sp ? 'bg-green-700 text-white' : 'bg-white text-gray-700 hover:bg-green-50 border'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-12">{t('doctors.noDoctors')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((doctor) => {
                const docSchedules = schedules[doctor.id] || [];
                return (
                  <div key={doctor.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 p-6">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {doctor.photo_url ? (
                          <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{doctor.name}</h3>
                        <p className="text-sm text-green-700 font-medium">{doctor.specialty}</p>
                        {doctor.qualification && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doctor.qualification}</p>
                        )}
                      </div>
                    </div>

                    {docSchedules.length > 0 && (
                      <div className="px-6 pb-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {t('doctors.schedule')}
                        </div>
                        <div className="space-y-1">
                          {docSchedules.map(s => (
                            <div key={s.id} className="text-xs text-gray-600 flex justify-between">
                              <span className="font-medium">{dayNames[s.day_of_week] || ''}</span>
                              <span>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}{s.room_number ? ` · ${s.room_number}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-6 pb-4 space-y-1.5">
                      {doctor.phone && (
                        <a href={`tel:${doctor.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors">
                          <Phone className="w-3.5 h-3.5" /> {doctor.phone}
                        </a>
                      )}
                      {doctor.email && (
                        <a href={`mailto:${doctor.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 transition-colors truncate">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{doctor.email}</span>
                        </a>
                      )}
                    </div>

                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handleBook(doctor)}
                        className="w-full bg-green-700 text-white py-2.5 rounded-lg font-medium hover:bg-green-800 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Stethoscope className="w-4 h-4" />
                        {t('doctors.bookWith')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
