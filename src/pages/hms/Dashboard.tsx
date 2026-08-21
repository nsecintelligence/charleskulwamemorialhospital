import { Link } from 'react-router-dom';
import {
  HeartPulse,
  BedDouble,
  FlaskConical,
  Pill,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Activity,
} from 'lucide-react';

const metrics = [
  { label: 'Total Patients', value: '1,247', icon: HeartPulse, color: 'bg-blue-50 text-blue-600', trend: '+12 this week' },
  { label: 'Beds Occupied', value: '38 / 60', icon: BedDouble, color: 'bg-red-50 text-red-600', trend: '63% capacity' },
  { label: 'Pending Lab Results', value: '7', icon: FlaskConical, color: 'bg-amber-50 text-amber-600', trend: '2 critical' },
  { label: 'Low-Stock Items', value: '4', icon: Pill, color: 'bg-orange-50 text-orange-600', trend: 'Auto-PO needed' },
  { label: 'Expiring Credentials', value: '3', icon: Users, color: 'bg-purple-50 text-purple-600', trend: 'Within 60 days' },
  { label: "Today's Appointments", value: '23', icon: Calendar, color: 'bg-emerald-50 text-emerald-600', trend: '5 pending' },
];

const quickLinks = [
  { path: '/hms/patients', label: 'Register Patient', icon: HeartPulse },
  { path: '/hms/cpoe', label: 'New Order', icon: Activity },
  { path: '/hms/beds', label: 'Ward Status', icon: BedDouble },
  { path: '/hms/labs', label: 'Lab Results', icon: FlaskConical },
];

const alerts = [
  { type: 'critical', message: '2 lab results flagged as critical — require immediate physician review', icon: AlertTriangle },
  { type: 'warning', message: 'Drug "Amoxicillin 500mg" below reorder threshold (12 units left)', icon: Pill },
  { type: 'warning', message: 'Dr. Sarah Mwasa — license expires in 28 days', icon: Users },
];

export default function HmsDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Hospital Management Dashboard</h2>
        <p className="text-emerald-50 text-sm">System overview and quick actions</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-lg ${m.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-300" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{m.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{m.label}</div>
              <div className="text-xs text-slate-400 mt-2">{m.trend}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickLinks.map((q, i) => {
              const Icon = q.icon;
              return (
                <Link
                  key={i}
                  to={q.path}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Icon className="w-4 h-4 text-slate-600 group-hover:text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{q.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.map((a, i) => {
              const Icon = a.icon;
              const bg = a.type === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100';
              const ic = a.type === 'critical' ? 'text-red-600' : 'text-amber-600';
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${bg}`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ic}`} />
                  <span className="text-sm text-slate-700">{a.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
