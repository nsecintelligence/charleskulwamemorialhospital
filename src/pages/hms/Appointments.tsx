import { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Sun,
  Moon,
  Cloud,
  Phone,
  CheckCircle,
  X,
} from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface Shift {
  id: string;
  staffName: string;
  role: string;
  date: string;
  shiftType: 'morning' | 'evening' | 'night';
  onCall: boolean;
  onLeave: boolean;
}

const demoAppointments: Appointment[] = [
  { id: '1', patientName: 'John Mwakyusa', doctorName: 'Dr. Sarah Mwasa', department: 'Cardiology', date: '2026-08-11', time: '09:00', status: 'confirmed' },
  { id: '2', patientName: 'Grace Massawe', doctorName: 'Dr. Joseph Temba', department: 'Endocrinology', date: '2026-08-11', time: '10:30', status: 'pending' },
  { id: '3', patientName: 'Sarah Kimaro', doctorName: 'Dr. Sarah Mwasa', department: 'General', date: '2026-08-11', time: '14:00', status: 'confirmed' },
  { id: '4', patientName: 'Joseph Temba', doctorName: 'Dr. Mary Lyimo', department: 'Neurology', date: '2026-08-12', time: '11:00', status: 'pending' },
];

const demoShifts: Shift[] = [
  { id: '1', staffName: 'Dr. Sarah Mwasa', role: 'Doctor', date: '2026-08-11', shiftType: 'morning', onCall: false, onLeave: false },
  { id: '2', staffName: 'Dr. Joseph Temba', role: 'Doctor', date: '2026-08-11', shiftType: 'evening', onCall: true, onLeave: false },
  { id: '3', staffName: 'Nurse Anna Kessi', role: 'Nurse', date: '2026-08-11', shiftType: 'night', onCall: false, onLeave: false },
  { id: '4', staffName: 'Dr. Mary Lyimo', role: 'Doctor', date: '2026-08-11', shiftType: 'morning', onCall: false, onLeave: true },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

const shiftIcons = {
  morning: Sun,
  evening: Cloud,
  night: Moon,
};

const shiftColors = {
  morning: 'bg-amber-50 text-amber-600',
  evening: 'bg-orange-50 text-orange-600',
  night: 'bg-indigo-50 text-indigo-600',
};

type Tab = 'appointments' | 'shifts';

export default function HmsAppointments() {
  const [tab, setTab] = useState<Tab>('appointments');
  const [appts, setAppts] = useState<Appointment[]>(demoAppointments);

  const updateApptStatus = (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    setAppts(appts.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Smart Appointment & Shift Scheduling</h2>
        <p className="text-sm text-slate-500">Real-time doctor calendars, shift rotations, on-call & leave management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['appointments', 'shifts'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'appointments' && (
        <div className="space-y-3">
          {appts.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm">{a.patientName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status]}`}>{a.status}</span>
                    </div>
                    <p className="text-sm text-slate-500">{a.doctorName} · {a.department}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(a.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>
                    </div>
                  </div>
                </div>
                {a.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateApptStatus(a.id, 'confirmed')} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">
                      <CheckCircle className="w-4 h-4 inline mr-1" />Confirm
                    </button>
                    <button onClick={() => updateApptStatus(a.id, 'cancelled')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                      <X className="w-4 h-4 inline mr-1" />Cancel
                    </button>
                  </div>
                )}
                {a.status === 'confirmed' && (
                  <button onClick={() => updateApptStatus(a.id, 'completed')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200">
                    <CheckCircle className="w-4 h-4 inline mr-1" />Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'shifts' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Staff</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Shift</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {demoShifts.map(s => {
                const ShiftIcon = shiftIcons[s.shiftType];
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.staffName}</td>
                    <td className="px-4 py-3 text-slate-600">{s.role}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${shiftColors[s.shiftType]}`}>
                        <ShiftIcon className="w-3.5 h-3.5" />
                        {s.shiftType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.onLeave ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">On Leave</span>
                      ) : s.onCall ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">On Call</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
