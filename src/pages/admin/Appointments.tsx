import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Appointment } from '../../types';
import { X, Check, Clock, Phone, Mail, Calendar, User, RefreshCw } from 'lucide-react';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    const { data } = await query;
    if (data) setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    await supabase.from('appointments').delete().eq('id', id);
    fetchAppointments();
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
        <button
          onClick={fetchAppointments}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filter === s ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'all' && ` (${appointments.length})`}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No appointments found.</div>
        ) : (
          <div className="divide-y">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{apt.patient_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${apt.patient_phone}`} className="hover:text-green-700">
                          {apt.patient_phone}
                        </a>
                      </div>
                      {apt.patient_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${apt.patient_email}`} className="hover:text-green-700">
                            {apt.patient_email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(apt.preferred_date).toLocaleDateString()}</span>
                        {apt.preferred_time && <span>at {apt.preferred_time}</span>}
                      </div>
                      {apt.department && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Dept:</span>
                          <span className="font-medium">{apt.department}</span>
                        </div>
                      )}
                    </div>
                    {apt.message && (
                      <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                        {apt.message}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      Submitted: {new Date(apt.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, 'confirmed')}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                        >
                          <Check className="w-4 h-4 inline mr-1" />
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, 'cancelled')}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(apt.id, 'completed')}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                      >
                        <Check className="w-4 h-4 inline mr-1" />
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
