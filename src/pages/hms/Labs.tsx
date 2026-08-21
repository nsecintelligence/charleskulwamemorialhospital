import { useState } from 'react';
import {
  FlaskConical,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Barcode,
} from 'lucide-react';

interface Sample {
  id: string;
  barcode: string;
  patientPin: string;
  patientName: string;
  sampleType: 'blood' | 'tissue' | 'fluid';
  testOrdered: string;
  status: 'collected' | 'processing' | 'completed';
  result?: string;
  critical?: boolean;
  collectedAt: string;
}

const demoSamples: Sample[] = [
  { id: '1', barcode: 'LAB-BC-001234', patientPin: 'PIN-2026-0001', patientName: 'John Mwakyusa', sampleType: 'blood', testOrdered: 'Full Blood Count', status: 'completed', result: 'WBC 11.2 (elevated), RBC normal, Platelets normal', critical: true, collectedAt: '2026-08-10T08:00' },
  { id: '2', barcode: 'LAB-BC-001235', patientPin: 'PIN-2026-0003', patientName: 'Grace Massawe', sampleType: 'blood', testOrdered: 'HbA1c', status: 'processing', collectedAt: '2026-08-10T09:30' },
  { id: '3', barcode: 'LAB-TS-001236', patientPin: 'PIN-2026-0002', patientName: 'Sarah Kimaro', sampleType: 'tissue', testOrdered: 'Biopsy Histopathology', status: 'collected', collectedAt: '2026-08-11T07:00' },
  { id: '4', barcode: 'LAB-FL-001237', patientPin: 'PIN-2026-0004', patientName: 'Joseph Temba', sampleType: 'fluid', testOrdered: 'CSF Analysis', status: 'completed', result: 'Normal: protein 35 mg/dL, glucose 60 mg/dL', critical: false, collectedAt: '2026-08-09T14:00' },
];

const typeColors: Record<string, string> = {
  blood: 'bg-red-50 text-red-600',
  tissue: 'bg-purple-50 text-purple-600',
  fluid: 'bg-blue-50 text-blue-600',
};

const statusColors: Record<string, string> = {
  collected: 'bg-slate-100 text-slate-600',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export default function HmsLabs() {
  const [search, setSearch] = useState('');
  const [samples, setSamples] = useState<Sample[]>(demoSamples);
  const [selected, setSelected] = useState<Sample | null>(null);
  const [resultInput, setResultInput] = useState('');

  const filtered = samples.filter(s =>
    s.patientName.toLowerCase().includes(search.toLowerCase()) ||
    s.barcode.toLowerCase().includes(search.toLowerCase()) ||
    s.patientPin.toLowerCase().includes(search.toLowerCase())
  );

  const saveResult = () => {
    if (!selected || !resultInput.trim()) return;
    const isCritical = /elevated|high|low|abnormal|critical/i.test(resultInput);
    setSamples(samples.map(s => s.id === selected.id ? { ...s, status: 'completed', result: resultInput, critical: isCritical } : s));
    setSelected(null);
    setResultInput('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Laboratory Information System (LIS)</h2>
        <p className="text-sm text-slate-500">Barcode sample tracking, analyzer integration, critical result flagging</p>
      </div>

      {/* Critical alert */}
      {samples.filter(s => s.critical).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Critical Results Pending Physician Review</p>
            <p className="text-sm text-red-700 mt-1">
              {samples.filter(s => s.critical).length} sample(s) flagged with abnormal/critical values. Immediate physician notification required.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by barcode, patient name or PIN..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Samples */}
      <div className="space-y-3">
        {filtered.map(s => (
          <div
            key={s.id}
            onClick={() => { setSelected(s); setResultInput(s.result || ''); }}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg ${typeColors[s.sampleType]} flex items-center justify-center flex-shrink-0`}>
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 text-sm">{s.patientName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span>
                    {s.critical && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">CRITICAL</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Barcode className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-xs text-slate-500">{s.barcode}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{s.testOrdered} · <span className="capitalize">{s.sampleType}</span> sample</p>
                  {s.result && <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded">{s.result}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Result entry modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Lab Result Entry</h3>
                <p className="text-sm text-slate-500 font-mono">{selected.barcode}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">Patient:</span> <strong>{selected.patientName}</strong></div>
                <div><span className="text-slate-400">PIN:</span> {selected.patientPin}</div>
                <div><span className="text-slate-400">Test:</span> {selected.testOrdered}</div>
                <div><span className="text-slate-400">Type:</span> <span className="capitalize">{selected.sampleType}</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enter Result Values</label>
                <textarea
                  value={resultInput}
                  onChange={(e) => setResultInput(e.target.value)}
                  rows={4}
                  placeholder="Enter lab results... (e.g. WBC 11.2, RBC 4.5, etc.)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Results containing keywords like "elevated", "abnormal", "high", "low" will be auto-flagged as critical.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveResult}
                  disabled={!resultInput.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Save Result
                </button>
                <button onClick={() => setSelected(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
