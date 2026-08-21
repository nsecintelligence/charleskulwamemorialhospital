import { useState } from 'react';
import {
  Stethoscope,
  Plus,
  AlertTriangle,
  FlaskConical,
  Scan,
  Pill,
  CheckCircle,
  X,
  Clock,
} from 'lucide-react';

interface Order {
  id: string;
  patientPin: string;
  patientName: string;
  doctor: string;
  type: 'lab' | 'radiology' | 'medication';
  details: string;
  status: 'pending' | 'completed' | 'cancelled';
  alert?: string;
  date: string;
}

const demoOrders: Order[] = [
  { id: '1', patientPin: 'PIN-2026-0001', patientName: 'John Mwakyusa', doctor: 'Dr. Sarah Mwasa', type: 'lab', details: 'Full Blood Count (FBC)', status: 'pending', date: '2026-08-10' },
  { id: '2', patientPin: 'PIN-2026-0003', patientName: 'Grace Massawe', doctor: 'Dr. Joseph Temba', type: 'medication', details: 'Metformin 500mg BID', status: 'pending', alert: 'Patient allergy: Sulfa drugs — no conflict detected', date: '2026-08-10' },
  { id: '3', patientPin: 'PIN-2026-0002', patientName: 'Sarah Kimaro', doctor: 'Dr. Sarah Mwasa', type: 'radiology', details: 'Chest X-Ray', status: 'completed', date: '2026-08-08' },
];

const typeIcons = {
  lab: FlaskConical,
  radiology: Scan,
  medication: Pill,
};

const typeColors = {
  lab: 'bg-amber-50 text-amber-600',
  radiology: 'bg-blue-50 text-blue-600',
  medication: 'bg-emerald-50 text-emerald-600',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function HmsCpoe() {
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientPin: '', patientName: '', type: 'lab' as 'lab' | 'radiology' | 'medication',
    details: '', allergy: '',
  });
  const [alert, setAlert] = useState<string | null>(null);

  const knownAllergies: Record<string, string[]> = {
    'PIN-2026-0001': ['Penicillin'],
    'PIN-2026-0003': ['Sulfa drugs', 'Aspirin'],
  };

  const checkInteraction = (pin: string, medDetails: string) => {
    const allergies = knownAllergies[pin] || [];
    const matched = allergies.filter(a => medDetails.toLowerCase().includes(a.toLowerCase().split(' ')[0]));
    if (matched.length > 0) {
      setAlert(`DRUG-ALLERGY ALERT: Patient has recorded allergy to ${matched.join(', ')}. This medication may be contraindicated.`);
    } else {
      setAlert(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: Order = {
      id: String(orders.length + 1),
      patientPin: form.patientPin,
      patientName: form.patientName,
      doctor: 'Dr. Current User',
      type: form.type,
      details: form.details,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      alert: alert || undefined,
    };
    setOrders([newOrder, ...orders]);
    setShowForm(false);
    setForm({ patientPin: '', patientName: '', type: 'lab', details: '', allergy: '' });
    setAlert(null);
  };

  const updateStatus = (id: string, status: 'completed' | 'cancelled') => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">CPOE — Physician Order Entry</h2>
          <p className="text-sm text-slate-500">Electronic lab, scan & medication orders with drug-allergy alerts</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((o) => {
          const Icon = typeIcons[o.type];
          return (
            <div key={o.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg ${typeColors[o.type]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{o.patientName}</h3>
                      <span className="text-xs text-slate-400">{o.patientPin}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
                    </div>
                    <p className="text-sm text-slate-600"><strong>{o.details}</strong></p>
                    <p className="text-xs text-slate-400 mt-1">Ordered by {o.doctor} · {new Date(o.date).toLocaleDateString()}</p>
                    {o.alert && (
                      <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-amber-700">{o.alert}</span>
                      </div>
                    )}
                  </div>
                </div>
                {o.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(o.id, 'completed')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200">
                      <CheckCircle className="w-4 h-4 inline mr-1" />Complete
                    </button>
                    <button onClick={() => updateStatus(o.id, 'cancelled')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                      <X className="w-4 h-4 inline mr-1" />Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New order modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">New Medical Order</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient PIN</label>
                  <input required value={form.patientPin} onChange={(e) => {
                    const pin = e.target.value;
                    setForm({ ...form, patientPin: pin });
                    if (form.type === 'medication') checkInteraction(pin, form.details);
                  }} placeholder="PIN-2026-XXXX" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                  <input required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['lab', 'radiology', 'medication'] as const).map(t => {
                    const Icon = typeIcons[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm({ ...form, type: t })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                          form.type === t ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${form.type === t ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-medium capitalize">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order Details</label>
                <input required value={form.details} onChange={(e) => {
                  setForm({ ...form, details: e.target.value });
                  if (form.type === 'medication') checkInteraction(form.patientPin, e.target.value);
                }} placeholder={form.type === 'lab' ? 'e.g. Full Blood Count' : form.type === 'radiology' ? 'e.g. Chest X-Ray' : 'e.g. Amoxicillin 500mg'} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>

              {alert && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{alert}</span>
                </div>
              )}
              {!alert && form.type === 'medication' && form.patientPin && (
                <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-emerald-700">No known drug-allergy conflicts detected.</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">Submit Order</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
