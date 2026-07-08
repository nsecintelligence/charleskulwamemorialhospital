import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, User, Clock, Phone, Mail, MapPin, Stethoscope, Award, ChevronRight } from 'lucide-react';
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
  { key: 0, label: 'Sunday', short: 'Sun' },
  { key: 1, label: 'Monday', short: 'Mon' },
  { key: 2, label: 'Tuesday', short: 'Tue' },
  { key: 3, label: 'Wednesday', short: 'Wed' },
  { key: 4, label: 'Thursday', short: 'Thu' },
  { key: 5, label: 'Friday', short: 'Fri' },
  { key: 6, label: 'Saturday', short: 'Sat' },
];

const DAY_COLORS = [
  'bg-red-50 border-red-200',
  'bg-blue-50 border-blue-200',
  'bg-green-50 border-green-200',
  'bg-yellow-50 border-yellow-200',
  'bg-purple-50 border-purple-200',
  'bg-orange-50 border-orange-200',
  'bg-pink-50 border-pink-200',
];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function Clinic() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const { data, error } = await supabase
        .from('specialist_doctors')
        .select(`
          id,
          name,
          specialty,
          qualification,
          photo_url,
          phone,
          email,
          doctor_schedules (
            id,
            day_of_week,
            start_time,
            end_time,
            room_number,
            notes,
            is_available
          )
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

  // Get current day (0-6, Sunday = 0)
  const today = new Date().getDay();

  // Filter doctors by selected day
  const filteredDoctors = selectedDay !== null
    ? doctors.filter(d => d.doctor_schedules.some(s => s.day_of_week === selectedDay))
    : doctors;

  // Get schedule for a specific day
  function getScheduleForDay(doctor: Doctor, day: number): DoctorSchedule | undefined {
    return doctor.doctor_schedules.find(s => s.day_of_week === day);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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
              View the timetable of our specialist doctors (Madaktari Bingwa). Book an appointment with our qualified medical specialists for expert care.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Book Appointment <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="#timetable"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View Timetable
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section id="timetable" className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container-width py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Day Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <span className="text-sm font-medium text-gray-600 shrink-0">Filter by day:</span>
              <button
                onClick={() => setSelectedDay(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                  selectedDay === null
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Days
              </button>
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                    selectedDay === day.key
                      ? 'bg-emerald-600 text-white'
                      : day.key === today
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.short}
                  {day.key === today && <span className="ml-1">(Today)</span>}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="container-width section-padding flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!loading && doctors.length === 0 && (
        <div className="container-width section-padding">
          <div className="text-center py-16">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Specialists Available</h3>
            <p className="text-gray-600">Specialist doctor schedules will be available soon.</p>
          </div>
        </div>
      )}

      {/* Grid View */}
      {!loading && doctors.length > 0 && viewMode === 'grid' && (
        <section className="container-width section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Doctor Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    {doctor.photo_url ? (
                      <img
                        src={doctor.photo_url}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{doctor.name}</h3>
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mt-1">
                        <Award className="w-4 h-4" />
                        {doctor.specialty}
                      </div>
                      {doctor.qualification && (
                        <p className="text-gray-500 text-sm mt-1">{doctor.qualification}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {doctor.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                    {doctor.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Weekly Schedule
                  </h4>
                  <div className="space-y-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const schedule = getScheduleForDay(doctor, day.key);
                      const isToday = day.key === today;

                      return (
                        <div
                          key={day.key}
                          className={`flex items-center justify-between py-2 px-3 rounded-lg border ${
                            schedule && schedule.is_available
                              ? isToday
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-gray-50 border-gray-200'
                              : 'bg-gray-50 border-gray-200 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${schedule && schedule.is_available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <span className="text-sm font-medium text-gray-700">{day.label}</span>
                            {isToday && (
                              <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full">Today</span>
                            )}
                          </div>
                          {schedule && schedule.is_available ? (
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                              </div>
                              {schedule.room_number && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                                  <MapPin className="w-3 h-3" />
                                  Room {schedule.room_number}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not Available</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Table View */}
      {!loading && doctors.length > 0 && viewMode === 'table' && (
        <section className="container-width section-padding">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Doctor</th>
                    {DAYS_OF_WEEK.map((day) => (
                      <th
                        key={day.key}
                        className={`text-center py-4 px-4 text-sm font-semibold ${
                          day.key === selectedDay || (selectedDay === null && day.key === today)
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-gray-700'
                        }`}
                      >
                        <div>{day.label}</div>
                        {day.key === today && (
                          <div className="text-xs font-normal text-emerald-600">(Today)</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {doctor.photo_url ? (
                            <img
                              src={doctor.photo_url}
                              alt={doctor.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-bold">
                              {doctor.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-emerald-600">{doctor.specialty}</div>
                          </div>
                        </div>
                      </td>
                      {DAYS_OF_WEEK.map((day) => {
                        const schedule = getScheduleForDay(doctor, day.key);
                        const isToday = day.key === today;

                        return (
                          <td
                            key={day.key}
                            className={`py-4 px-4 text-center ${
                              isToday ? 'bg-emerald-50' : ''
                            }`}
                          >
                            {schedule && schedule.is_available ? (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatTime(schedule.start_time)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  to {formatTime(schedule.end_time)}
                                </div>
                                {schedule.room_number && (
                                  <div className="text-xs text-gray-400">
                                    Room {schedule.room_number}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container-width section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Book an Appointment</h2>
            <p className="text-gray-600 mb-8">
              To book an appointment with our specialist doctors, please contact us through any of the following methods:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-sm text-gray-600">Call our reception desk during working hours to schedule your appointment.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <p className="text-sm text-gray-600">Send us an email with your preferred date and doctor for booking.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                <p className="text-sm text-gray-600">Walk in to our reception to book an appointment in person.</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-8 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Contact Us Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
