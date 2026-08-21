import { useState } from 'react';
import { BedDouble, X, Check, Brush, Filter } from 'lucide-react';

interface Bed {
  id: string;
  bedNumber: string;
  ward: string;
  type: 'General' | 'Semi-Private' | 'ICU' | 'CCU' | 'Isolation';
  status: 'vacant' | 'occupied' | 'cleaning';
  patientName?: string;
  admissionDate?: string;
}

const demoBeds: Bed[] = [
  { id: '1', bedNumber: 'G-01', ward: 'Ward A', type: 'General', status: 'occupied', patientName: 'John Mwakyusa', admissionDate: '2026-08-09' },
  { id: '2', bedNumber: 'G-02', ward: 'Ward A', type: 'General', status: 'vacant' },
  { id: '3', bedNumber: 'G-03', ward: 'Ward A', type: 'General', status: 'cleaning' },
  { id: '4', bedNumber: 'G-04', ward: 'Ward A', type: 'General', status: 'vacant' },
  { id: '5', bedNumber: 'SP-01', ward: 'Ward B', type: 'Semi-Private', status: 'occupied', patientName: 'Grace Massawe', admissionDate: '2026-08-10' },
  { id: '6', bedNumber: 'SP-02', ward: 'Ward B', type: 'Semi-Private', status: 'vacant' },
  { id: '7', bedNumber: 'ICU-01', ward: 'ICU', type: 'ICU', status: 'occupied', patientName: 'Joseph Temba', admissionDate: '2026-08-07' },
  { id: '8', bedNumber: 'ICU-02', ward: 'ICU', type: 'ICU', status: 'vacant' },
  { id: '9', bedNumber: 'CCU-01', ward: 'CCU', type: 'CCU', status: 'cleaning' },
  { id: '10', bedNumber: 'CCU-02', ward: 'CCU', type: 'CCU', status: 'vacant' },
  { id: '11', bedNumber: 'ISO-01', ward: 'Isolation', type: 'Isolation', status: 'occupied', patientName: 'Sarah Kimaro', admissionDate: '2026-08-10' },
  { id: '12', bedNumber: 'ISO-02', ward: 'Isolation', type: 'Isolation', status: 'vacant' },
];

const statusConfig = {
  vacant: { color: 'bg-emerald-100 border-emerald-300 text-emerald-700', dot: 'bg-emerald-500', label: 'Vacant' },
  occupied: { color: 'bg-red-100 border-red-300 text-red-700', dot: 'bg-red-500', label: 'Occupied' },
  cleaning: { color: 'bg-amber-100 border-amber-300 text-amber-700', dot: 'bg-amber-500', label: 'Cleaning' },
};

const typeColors: Record<string, string> = {
  General: 'text-slate-600',
  'Semi-Private': 'text-blue-600',
  ICU: 'text-red-600',
  CCU: 'text-orange-600',
  Isolation: 'text-purple-600',
};

type FilterType = 'all' | 'General' | 'Semi-Private' | 'ICU' | 'CCU' | 'Isolation';

export default function HmsBeds() {
  const [beds, setBeds] = useState<Bed[]>(demoBeds);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  const filtered = filter === 'all' ? beds : beds.filter(b => b.type === filter);

  const counts = {
    total: beds.length,
    vacant: beds.filter(b => b.status === 'vacant').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    cleaning: beds.filter(b => b.status === 'cleaning').length,
  };

  const discharge = (id: string) => {
    setBeds(beds.map(b => b.id === id ? { ...b, status: 'cleaning', patientName: undefined, admissionDate: undefined } : b));
    setSelectedBed(null);
  };

  const markClean = (id: string) => {
    setBeds(beds.map(b => b.id === id ? { ...b, status: 'vacant' } : b));
    setSelectedBed(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Bed & Ward Management (ADT)</h2>
        <p className="text-sm text-slate-500">Admission, Discharge, Transfer — visual floor-plan grid</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-slate-900">{counts.total}</div>
          <div className="text-sm text-slate-500">Total Beds</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-emerald-600">{counts.vacant}</div>
          <div className="text-sm text-slate-500">Vacant</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-red-600">{counts.occupied}</div>
          <div className="text-sm text-slate-500">Occupied</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="text-2xl font-bold text-amber-600">{counts.cleaning}</div>
          <div className="text-sm text-slate-500">Cleaning</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400" />
        {(['all', 'General', 'Semi-Private', 'ICU', 'CCU', 'Isolation'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All Beds' : f}
          </button>
        ))}
      </div>

      {/* Floor plan grid */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map(bed => {
            const cfg = statusConfig[bed.status];
            return (
              <button
                key={bed.id}
                onClick={() => setSelectedBed(bed)}
                className={`relative p-4 rounded-xl border-2 ${cfg.color} transition-all hover:scale-105 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <BedDouble className="w-5 h-5" />
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${bed.status === 'occupied' ? 'animate-pulse' : ''}`} />
                </div>
                <div className="text-sm font-bold">{bed.bedNumber}</div>
                <div className={`text-xs ${typeColors[bed.type]}`}>{bed.type}</div>
                <div className="text-xs mt-1 opacity-75">{cfg.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bed detail modal */}
      {selectedBed && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">Bed {selectedBed.bedNumber}</h3>
                <p className="text-sm text-slate-500">{selectedBed.ward} · {selectedBed.type}</p>
              </div>
              <button onClick={() => setSelectedBed(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className={`p-3 rounded-lg ${statusConfig[selectedBed.status].color}`}>
                <span className="font-semibold">Status: {statusConfig[selectedBed.status].label}</span>
              </div>

              {selectedBed.status === 'occupied' && selectedBed.patientName && (
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-400">Patient:</span> <strong>{selectedBed.patientName}</strong></div>
                  <div><span className="text-slate-400">Admitted:</span> {selectedBed.admissionDate && new Date(selectedBed.admissionDate).toLocaleDateString()}</div>
                  <button
                    onClick={() => discharge(selectedBed.id)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Discharge Patient
                  </button>
                  <p className="text-xs text-slate-400">Bed will be set to "Cleaning" for housekeeping after discharge.</p>
                </div>
              )}

              {selectedBed.status === 'cleaning' && (
                <div className="space-y-3">
                  <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                    Housekeeping has been notified. Bed is being cleaned.
                  </p>
                  <button
                    onClick={() => markClean(selectedBed.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Brush className="w-4 h-4" /> Mark as Cleaned & Vacant
                  </button>
                </div>
              )}

              {selectedBed.status === 'vacant' && (
                <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg">
                  This bed is available for admission.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
