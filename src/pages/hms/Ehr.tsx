import { useState } from 'react';
import {
  Search,
  FileText,
  Plus,
  Activity,
  Pill,
  Stethoscope,
  AlertCircle,
} from 'lucide-react';

interface Record {
  id: string;
  patientPin: string;
  patientName: string;
  date: string;
  doctor: string;
  diagnosis: string;
  icdCode: string;
  prescription: string;
  notes: string;
  painPoints: string[];
}

const bodyRegions = [
  'Head', 'Neck', 'Left Shoulder', 'Right Shoulder', 'Chest', 'Abdomen',
  'Left Arm', 'Right Arm', 'Left Hand', 'Right Hand',
  'Left Leg', 'Right Leg', 'Left Foot', 'Right Foot', 'Back', 'Lower Back',
];

const demoRecords: Record[] = [
  {
    id: '1', patientPin: 'PIN-2026-0001', patientName: 'John Mwakyusa', date: '2026-08-09',
    doctor: 'Dr. Sarah Mwasa', diagnosis: 'Hypertension', icdCode: 'I10',
    prescription: 'Amlodipine 5mg OD', notes: 'BP 150/95. Advised low-salt diet. Follow-up in 2 weeks.',
    painPoints: ['Chest', 'Head'],
  },
  {
    id: '2', patientPin: 'PIN-2026-0003', patientName: 'Grace Massawe', date: '2026-08-08',
    doctor: 'Dr. Joseph Temba', diagnosis: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9',
    prescription: 'Metformin 500mg BID', notes: 'HbA1c 7.8%. Started on metformin. Dietary counseling given.',
    painPoints: ['Left Foot'],
  },
];

export default function HmsEhr() {
  const [search, setSearch] = useState('');
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  const patientRecords = demoRecords.filter(r =>
    !selectedPin || r.patientPin === selectedPin
  );

  const filtered = demoRecords.filter(r =>
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.patientPin.toLowerCase().includes(search.toLowerCase())
  );

  const togglePainPoint = (region: string) => {
    setPainPoints(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Electronic Health Records (EHR)</h2>
        <p className="text-sm text-slate-500">Patient history, ICD-10/11 coding, interactive anatomical map</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedPin(null); }}
          placeholder="Search patient by name or PIN..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {/* Patient list */}
      {!selectedPin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelectedPin(r.patientPin); setPainPoints(r.painPoints); }}
              className="text-left bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{r.patientName}</h3>
                  <p className="text-xs text-slate-400">{r.patientPin}</p>
                </div>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p><span className="text-slate-400">Diagnosis:</span> {r.diagnosis}</p>
                <p><span className="text-slate-400">ICD:</span> <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{r.icdCode}</span></p>
                <p><span className="text-slate-400">Date:</span> {new Date(r.date).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Patient detail view */}
      {selectedPin && (
        <div className="space-y-5">
          <button
            onClick={() => setSelectedPin(null)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to patient list
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Anatomical map */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Interactive Anatomical Map</h3>
                <span className="text-xs text-slate-400">Click body regions to mark pain/surgical areas</span>
              </div>

              {/* Body figure */}
              <div className="flex justify-center mb-4">
                <div className="relative w-48 h-64">
                  {/* Simple body silhouette */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300" />
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-20 h-32 rounded-t-2xl bg-slate-200 border-2 border-slate-300" />
                  <div className="absolute top-14 left-1/2 -translate-x-[42px] w-5 h-24 rounded bg-slate-200 border-2 border-slate-300" />
                  <div className="absolute top-14 left-1/2 translate-x-[22px] w-5 h-24 rounded bg-slate-200 border-2 border-slate-300" />
                  <div className="absolute top-40 left-1/2 -translate-x-[30px] w-6 h-28 rounded bg-slate-200 border-2 border-slate-300" />
                  <div className="absolute top-40 left-1/2 translate-x-[8px] w-6 h-28 rounded bg-slate-200 border-2 border-slate-300" />

                  {/* Pain point markers */}
                  {painPoints.includes('Head') && <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Chest') && <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Abdomen') && <div className="absolute top-32 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Left Arm') && <div className="absolute top-18 -left-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Right Arm') && <div className="absolute top-18 -right-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Left Leg') && <div className="absolute top-44 left-2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Right Leg') && <div className="absolute top-44 right-2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Left Foot') && <div className="absolute bottom-0 left-2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Right Foot') && <div className="absolute bottom-0 right-2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                  {painPoints.includes('Back') && <div className="absolute top-24 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 animate-pulse" />}
                </div>
              </div>

              {/* Region buttons */}
              <div className="flex flex-wrap gap-2">
                {bodyRegions.map((region) => (
                  <button
                    key={region}
                    onClick={() => togglePainPoint(region)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      painPoints.includes(region)
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Record details */}
            <div className="space-y-4">
              {patientRecords.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">{r.patientName}</h3>
                    <span className="text-xs text-slate-400">{r.patientPin}</span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600"><strong>Diagnosis:</strong> {r.diagnosis}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{r.icdCode}</span>
                      <span className="text-slate-400 text-xs">ICD Code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600"><strong>Prescription:</strong> {r.prescription}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600"><strong>Doctor:</strong> {r.doctor}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-slate-600 text-sm">
                      <strong>Notes:</strong> {r.notes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
