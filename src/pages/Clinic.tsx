import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Phone, Mail, MapPin, Stethoscope, Award, ChevronRight, Download, ZoomIn, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DoctorSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
  notes: string | null;
  is_available: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  doctor_schedules: DoctorSchedule[];
}

const DAYS_OF_WEEK = [
  { key: 0, label: 'Jumapili', swahili: 'Jumapili', short: 'Jp' },
  { key: 1, label: 'Jumatatu', swahili: 'Jumatatu', short: 'Jt' },
  { key: 2, label: 'Jumanne', swahili: 'Jumanne', short: 'Jn' },
  { key: 3, label: 'Jumatano', swahili: 'Jumatano', short: 'Jtno' },
  { key: 4, label: 'Alhamisi', swahili: 'Alhamisi', short: 'Alh' },
  { key: 5, label: 'Ijumaa', swahili: 'Ijumaa', short: 'Ij' },
  { key: 6, label: 'Jumamosi', swahili: 'Jumamosi', short: 'Jms' },
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getSpecialtyIcon(specialty: string): string {
  const icons: Record<string, string> = {
    'Gynaecologist': '🩺',
    'Physician': '❤️',
    'ENT Surgeon': '👂',
    'Ophthalmologist': '👁️',
    'Paediatrician': '👶',
    'Orthopedic Surgeon': '🦴',
    'Dermatologist': '🧴',
    'Physiotherapist': '💪',
  };
  return icons[specialty] || '🏥';
}

const SPECIALTY_COLORS: Record<string, string> = {
  'Gynaecologist': 'from-pink-500 to-rose-600',
  'Physician': 'from-red-500 to-red-700',
  'ENT Surgeon': 'from-blue-500 to-blue-700',
  'Ophthalmologist': 'from-cyan-500 to-cyan-700',
  'Paediatrician': 'from-yellow-500 to-amber-600',
  'Orthopedic Surgeon': 'from-gray-500 to-gray-700',
  'Dermatologist': 'from-orange-500 to-orange-700',
  'Physiotherapist': 'from-green-500 to-green-700',
};

export default function Clinic() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [showImageModal, setShowImageModal] = useState(false);

  const timetableImage = '/images/timetable/IMG-20260707-WA0018.jpg';
  const today = new Date().getDay();

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const { data, error } = await supabase
        .from('specialist_doctors')
        .select(`
          id, name, specialty, qualification, photo_url, phone, email,
          doctor_schedules ( id, day_of_week, start_time, end_time, room_number, notes, is_available )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDoctors(data as Doctor[] || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }

  // Count available doctors per day
  function countForDay(day: number): number {
    return doctors.filter(d => d.doctor_schedules.some(s => s.day_of_week === day && s.is_available)).length;
  }

  // Doctors available on selected day
  const filteredDoctors = doctors.filter(d =>
    d.doctor_schedules.some(s => s.day_of_week === selectedDay && s.is_available)
  );

  function getScheduleForDay(doctor: Doctor, day: number): DoctorSchedule | undefined {
    return doctor.doctor_schedules.find(s => s.day_of_week === day && s.is_available);
  }

  const selectedDayName = DAYS_OF_WEEK.find(d => d.key === selectedDay)?.label || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-15" />
        <div className="relative container-width section-padding py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Stethoscope className="w-4 h-4" />
              Specialist Clinic
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Madaktari Bingwa</h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-6">
              Tazama ratiba ya madaktari bingwa wetu. Piga simu au fika hospitali kwa miadi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Pata Miadi <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="#ratiba"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Tazama Ratiba
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Timetable Image */}
      <section className="bg-white">
        <div className="container-width section-padding">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ratiba ya Clinic za Madaktari Bingwa</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bonyeza picha kukuza ili uione vizuri zaidi.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div
              className="relative bg-gray-50 rounded-2xl border-2 border-emerald-100 overflow-hidden shadow-lg cursor-pointer group"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={timetableImage}
                alt="Ratiba ya Madaktari Bingwa"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                  <ZoomIn className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Bonyeza Kukuza</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <a
                href={timetableImage}
                download="CKM-Ratiba-Madaktari-Bingwa.jpg"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/25"
              >
                <Download className="w-5 h-5" />
                Pakua Ratiba
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={timetableImage}
              alt="Ratiba ya Madaktari Bingwa"
              className="w-full h-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Day Filter + Doctor List */}
      <section id="ratiba" className="bg-gray-50">
        <div className="container-width section-padding">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Madaktari Wanaopatikana Leo na Kila Siku</h2>
            <p className="text-gray-600">Chagua siku hapa chini kuona madaktari wanaopatikana</p>
          </div>

          {/* Day Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">Chagua Siku:</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const count = loading ? null : countForDay(day.key);
                const isToday = day.key === today;
                const isSelected = day.key === selectedDay;

                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(day.key)}
                    className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 border-2 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
                        : isToday
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {isToday && !isSelected && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded-full leading-none">Leo</span>
                    )}
                    <span className="text-xs font-bold">{day.short}</span>
                    <span className="text-xs mt-0.5 font-medium">{day.swahili.substring(0, 5)}</span>
                    {count !== null && (
                      <span className={`mt-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isSelected ? 'bg-white/20 text-white' : count > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result header */}
          {!loading && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-lg">
                  {selectedDay === today ? (
                    <>Madaktari wa Leo — <span className="text-emerald-600">{selectedDayName}</span></>
                  ) : (
                    <>Madaktari wa <span className="text-emerald-600">{selectedDayName}</span></>
                  )}
                </span>
              </div>
              <span className="ml-auto bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                {filteredDoctors.length} daktari{filteredDoctors.length !== 1 ? '' : ''}
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
            </div>
          )}

          {/* Empty for day */}
          {!loading && filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Stethoscope className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Hakuna Daktari Bingwa {selectedDayName}</h3>
              <p className="text-gray-500 text-sm">Jaribu siku nyingine au angalia ratiba iliyo juu.</p>
            </div>
          )}

          {/* Doctor Cards */}
          {!loading && filteredDoctors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => {
                const schedule = getScheduleForDay(doctor, selectedDay)!;
                const gradientColor = SPECIALTY_COLORS[doctor.specialty] || 'from-emerald-500 to-emerald-700';
                const isToday = selectedDay === today;

                return (
                  <div
                    key={doctor.id}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 ${
                      isToday ? 'border-emerald-200 ring-1 ring-emerald-200' : 'border-gray-100'
                    }`}
                  >
                    {/* Color top bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${gradientColor}`} />

                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {doctor.photo_url ? (
                          <img
                            src={doctor.photo_url}
                            alt={doctor.name}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white text-2xl flex-shrink-0`}>
                            {getSpecialtyIcon(doctor.specialty)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 leading-snug text-base">{doctor.name}</h3>
                          <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold mt-1">
                            <Award className="w-3.5 h-3.5" />
                            {doctor.specialty}
                          </div>
                          {doctor.qualification && (
                            <p className="text-gray-500 text-xs mt-1 leading-relaxed">{doctor.qualification}</p>
                          )}
                        </div>
                      </div>

                      {/* Schedule for selected day */}
                      <div className={`rounded-xl p-4 border ${isToday ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-gray-700">{selectedDayName}</span>
                          {isToday && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Leo</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-base font-bold text-gray-900">
                            {formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}
                          </span>
                        </div>
                        {schedule.room_number && (
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Chumba {schedule.room_number}</span>
                          </div>
                        )}
                        {schedule.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">{schedule.notes}</p>
                        )}
                      </div>

                      {/* Contact */}
                      {(doctor.phone || doctor.email) && (
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                          {doctor.phone && (
                            <a href={`tel:${doctor.phone}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                              <Phone className="w-4 h-4" />
                              {doctor.phone}
                            </a>
                          )}
                          {doctor.email && (
                            <a href={`mailto:${doctor.email}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                              <Mail className="w-4 h-4" />
                              {doctor.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container-width section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Jinsi ya Kupata Miadi</h2>
            <p className="text-gray-600 mb-8">
              Piga simu au fika hospitali kupata miadi na daktari bingwa wetu.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Piga Simu</h3>
                <p className="text-sm text-gray-600">+255 786 013 232 / +255 756 339 619</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Tuma Ujumbe</h3>
                <p className="text-sm text-gray-600">Wasiliana nasi kupitia fomu ya mawasiliano.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Fika Hospitali</h3>
                <p className="text-sm text-gray-600">Runzewe Wilayani Bukombe Mkoani Geita</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-8 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Wasiliana Nasi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
