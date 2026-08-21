import { useState } from 'react';
import {
  Search,
  Plus,
  HeartPulse,
  Phone,
  Droplet,
  AlertCircle,
  X,
  Shield,
} from 'lucide-react';

interface Patient {
  pin: string;
  name: string;
  dob: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: string;
  emergencyPhone: string;
  insurance: string;
  insuranceNo: string;
  status: 'active' | 'admitted' | 'discharged';
}

const demoPatients: Patient[] = [
  { pin: 'PIN-2026-0001', name: 'John Mwakyusa', dob: '1985-03-15', gender: 'Male', bloodType: 'O+', allergies: ['Penicillin'], emergencyContact: 'Mary Mwakyusa', emergencyPhone: '+255 712 100 001', insurance: 'BRITAM', insuranceNo: 'BRT-5521', status: 'admitted' },
  { pin: 'PIN-2026-0002', name: 'Sarah Kimaro', dob: '1990-07-22', gender: 'Female', bloodType: 'A-', allergies: [], emergencyContact: 'David Kimaro', emergencyPhone: '+255 712 100 002', insurance: 'JUBILEE', insuranceNo: 'JUB-3398', status: 'active' },
  { pin: 'PIN-2026-0003', name: 'Grace Massawe', dob: '1978-11-09', gender: 'Female', bloodType: 'B+', allergies: ['Sulfa drugs', 'Aspirin'], emergencyContact: 'Peter Massawe', emergencyPhone: '+255 712 100 003', insurance: 'NSSF', insuranceNo: 'NSSF-8871', status: 'active' },
  { pin: 'PIN-2026-0004', name: 'Joseph Temba', dob: '1965-01-30', gender: 'Male', bloodType: 'AB+', allergies: [], emergencyContact: 'Anna Temba', emergencyPhone: '+255 712 100 004', insurance: 'MHIF', insuranceNo: 'MHIF-2210', status: 'discharged' },
];

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  admitted: 'bg-blue-100 text-blue-700',
  discharged: 'bg-slate-100 text-slate-600',
};

const bloodTypeColors: Record<string, string> = {
  'O+': 'text-red-600',
  'O-': 'text-red-700',
  'A+': 'text-blue-600',
  'A-': 'text-blue-700',
  'B+': 'text-emerald-600',
  'B-': 'text-emerald-700',
  'AB+': 'text-purple-600',
  'AB-': 'text-purple-700',
};

export default function HmsPatients() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(demoPatients);
  const [form, setForm] = useState({
    name: '', dob: '', gender: 'Male', bloodType: 'O+',
    allergies: '', emergencyContact: '', emergencyPhone: '',
    insurance: '', insuranceNo: '',
  });

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.pin.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = `PIN-2026-${String(patients.length + 1).padStart(4, '0')}`;
    const newPatient: Patient = {
      pin,
      name: form.name,
      dob: form.dob,
      gender: form.gender,
      bloodType: form.bloodType,
      allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean),
      emergencyContact: form.emergencyContact,
      emergencyPhone: form.emergencyPhone,
      insurance: form.insurance,
      insuranceNo: form.insuranceNo,
      status: 'active',
    };
    setPatients([newPatient, ...patients]);
    setShowForm(false);
    setForm({ name: '', dob: '', gender: 'Male', bloodType: 'O+', allergies: '', emergencyContact: '', emergencyPhone: '', insurance: '', insuranceNo: '' });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Registration & Onboarding</h2>
          <p className="text-sm text-slate-500">Unique PIN tracking, insurance & ID capture, allergies and blood types</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or PIN..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
        />
      </div>

      {/* Patient cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.pin} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-400">{p.pin}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>
                {p.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-slate-400 w-16">DOB</span>
                <span>{new Date(p.dob).toLocaleDateString()}</span>
                <span className="text-slate-400">· {p.gender}</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplet className={`w-4 h-4 ${bloodTypeColors[p.bloodType] || 'text-slate-400'}`} />
                <span className="text-slate-600 text-sm">Blood: <strong>{p.bloodType}</strong></span>
              </div>
              {p.allergies.length > 0 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {p.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-xs">{p.emergencyContact} · {p.emergencyPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-xs">{p.insurance} · {p.insuranceNo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">No patients found.</div>
      )}

      {/* Registration modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Register New Patient</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                A unique Patient Identification Number (PIN) will be auto-generated for lifelong tracking.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input required type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
                  <select value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Allergies (comma-separated)</label>
                  <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Aspirin" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact Name</label>
                  <input required value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Phone</label>
                  <input required value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Provider</label>
                  <input value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} placeholder="e.g. BRITAM, NSSF" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Number</label>
                  <input value={form.insuranceNo} onChange={(e) => setForm({ ...form, insuranceNo: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                  Generate PIN & Register
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
