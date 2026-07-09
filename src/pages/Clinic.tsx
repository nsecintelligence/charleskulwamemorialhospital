import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Phone, Mail, MapPin, Stethoscope, Award, ChevronRight, Download, ZoomIn, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DoctorSchedule {
  id: string;
  day_of_week: number | null;
  specific_date: string | null;
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

const SWAHILI_DAYS = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
const SWAHILI_MONTHS = ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'];

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

const SPECIALTY_COLORS: Record<string, string> = {
  Gynaecologist: 'from-pink-500 to-rose-600',
  Physician: 'from-red-500 to-red-700',
  'ENT Surgeon': 'from-blue-500 to-blue-700',
  Ophthalmologist: 'from-cyan-500 to-cyan-700',
  Paediatrician: 'from-yellow-500 to-amber-600',
  'Orthopedic Surgeon': 'from-slate-500 to-slate-700',
  Dermatologist: 'from-orange-500 to-orange-700',
  Physiotherapist: 'from-green-500 to-green-700',
};

const SPECIALTY_ICONS: Record<string, string> = {
  Gynaecologist: '🩺',
  Physician: '❤️',
  'ENT Surgeon': '👂',
  Ophthalmologist: '👁️',
  Paediatrician: '👶',
  'Orthopedic Surgeon': '🦴',
  Dermatologist: '🧴',
  Physiotherapist: '💪',
};

// Determine which schedules apply for a given date
function getSchedulesForDate(doctor: Doctor, dateStr: string): DoctorSchedule[] {
  const date = new Date(dateStr + 'T00:00:00');
  const dow = date.getDay();
  return doctor.doctor_schedules.filter(s => {
    if (!s.is_available) return false;
    if (s.specific_date) return s.specific_date === dateStr;
    return s.day_of_week === dow;
  });
}

function doctorAvailableOnDate(doctor: Doctor, dateStr: string): boolean {
  return getSchedulesForDate(doctor, dateStr).length > 0;
}

// Build the list of dates for July 2026 (the month shown on the timetable)
function buildJulyDates(): string[] {
  const dates: string[] = [];
  for (let d = 1; d <= 31; d++) {
    const date = new Date(2026, 6, d); // month is 0-indexed
    dates.push(toDateString(date));
  }
  return dates;
}

export default function Clinic() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(toDateString(new Date()));
  const [showImageModal, setShowImageModal] = useState(false);

  const timetableImage = '/images/timetable/IMG-20260707-WA0018.jpg';
  const todayStr = toDateString(new Date());
  const allDates = buildJulyDates();

  // If today is not in July 2026, default to first date of timetable month
  useEffect(() => {
    if (!allDates.includes(todayStr)) {
      setSelectedDate('2026-07-09');
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const { data, error } = await supabase
        .from('specialist_doctors')
        .select(`
          id, name, specialty, qualification, photo_url, phone, email,
          doctor_schedules ( id, day_of_week, specific_date, start_time, end_time, room_number, notes, is_available )
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

  // Count available doctors per date
  function countForDate(dateStr: string): number {
    return doctors.filter(d => doctorAvailableOnDate(d, dateStr)).length;
  }

  // Has special (non-recurring / specific_date) doctors on that date
  function hasSpecialClinic(dateStr: string): boolean {
    return doctors.some(d => d.doctor_schedules.some(s => s.is_available && s.specific_date === dateStr));
  }

  const filteredDoctors = doctors.filter(d => doctorAvailableOnDate(d, selectedDate));

  const selDateObj = new Date(selectedDate + 'T00:00:00');
  const selDayName = SWAHILI_DAYS[selDateObj.getDay()];
  const selMonthName = SWAHILI_MONTHS[selDateObj.getMonth()];
  const selDateLabel = `${selDateObj.getDate()} ${selMonthName} ${selDateObj.getFullYear()} — ${selDayName}`;

  // Navigate months (we only have July 2026 for now)
  const visibleMonth = 'Julai 2026';

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
            <p className="text-gray-600 max-w-2xl mx-auto">Bonyeza picha kukuza ili uione vizuri zaidi.</p>
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

      {/* Date Filter + Doctor List */}
      <section id="ratiba" className="bg-gray-50">
        <div className="container-width section-padding">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Madaktari Wanaopatikana kwa Tarehe</h2>
            <p className="text-gray-600">Chagua tarehe hapa chini kuona madaktari wanaopatikana siku hiyo</p>
          </div>

          {/* Calendar Strip */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            {/* Month header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-gray-800 text-lg">{visibleMonth}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Kliniki Maalum
                </span>
                <span className="inline-flex items-center gap-1.5 ml-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" /> Leo
                </span>
              </div>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Jp', 'Jt', 'Jn', 'Jtno', 'Alh', 'Ij', 'Jms'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            {(() => {
              const firstDay = new Date(2026, 6, 1).getDay(); // Wednesday = 3
              const cells: (string | null)[] = Array(firstDay).fill(null).concat(allDates);
              // pad to fill last row
              while (cells.length % 7 !== 0) cells.push(null);
              const weeks: (string | null)[][] = [];
              for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

              return (
                <div className="space-y-1">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                      {week.map((dateStr, di) => {
                        if (!dateStr) return <div key={di} />;
                        const count = loading ? null : countForDate(dateStr);
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedDate;
                        const isSpecial = !loading && hasSpecialClinic(dateStr);
                        const dayNum = new Date(dateStr + 'T00:00:00').getDate();

                        return (
                          <button
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`relative flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-150 border-2 text-center ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105'
                                : isToday
                                ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200'
                            }`}
                          >
                            {/* Special clinic dot */}
                            {isSpecial && !isSelected && (
                              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                            )}
                            <span className="text-sm font-bold leading-none">{dayNum}</span>
                            {count !== null && count > 0 && (
                              <span className={`text-xs mt-1 font-semibold ${isSelected ? 'text-white/80' : 'text-emerald-600'}`}>
                                +{count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Legend note */}
            <p className="text-xs text-gray-400 mt-4 text-center">
              Nambari (+) inaonyesha idadi ya madaktari wanaopatikana siku hiyo. Nukta ya kijani inaonyesha kliniki maalum.
            </p>
          </div>

          {/* Selected date header */}
          {!loading && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-lg">
                  Madaktari wa <span className="text-emerald-600">{selDateLabel}</span>
                </span>
              </div>
              <span className="ml-auto bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
                {filteredDoctors.length} daktari
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
            </div>
          )}

          {/* Empty for date */}
          {!loading && filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Stethoscope className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Hakuna Daktari Bingwa tarehe hii</h3>
              <p className="text-gray-500 text-sm">Jaribu tarehe nyingine au angalia ratiba iliyo juu.</p>
            </div>
          )}

          {/* Doctor Cards */}
          {!loading && filteredDoctors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => {
                const schedules = getSchedulesForDate(doctor, selectedDate);
                const schedule = schedules[0];
                const isSpecific = schedule?.specific_date != null;
                const gradientColor = SPECIALTY_COLORS[doctor.specialty] || 'from-emerald-500 to-emerald-700';
                const isToday = selectedDate === todayStr;

                return (
                  <div
                    key={doctor.id}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 ${
                      isToday ? 'border-emerald-200 ring-1 ring-emerald-200' : 'border-gray-100'
                    }`}
                  >
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
                            {SPECIALTY_ICONS[doctor.specialty] || '🏥'}
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

                      {/* Schedule for selected date */}
                      {schedule && (
                        <div className={`rounded-xl p-4 border ${isToday ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-semibold text-gray-700">{selDayName}, {selDateLabel.split('—')[0].trim()}</span>
                            {isToday && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Leo</span>}
                            {isSpecific && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-auto">Kliniki Maalum</span>
                            )}
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
                      )}

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
            <p className="text-gray-600 mb-8">Piga simu au fika hospitali kupata miadi na daktari bingwa wetu.</p>
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
