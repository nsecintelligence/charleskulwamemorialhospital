import { useState } from 'react';
import {
  Scan,
  X,
  CheckCircle,
  Clock,
  Mic,
  Save,
} from 'lucide-react';

interface RadiologyOrder {
  id: string;
  patientPin: string;
  patientName: string;
  scanType: 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound';
  appointmentDate: string;
  status: 'scheduled' | 'in-progress' | 'reported';
  radiologistNotes?: string;
  pacsUrl?: string;
}

const demoOrders: RadiologyOrder[] = [
  { id: '1', patientPin: 'PIN-2026-0002', patientName: 'Sarah Kimaro', scanType: 'X-Ray', appointmentDate: '2026-08-11T10:00', status: 'reported', radiologistNotes: 'No acute cardiopulmonary findings. Lungs are clear. Cardiac silhouette normal.', pacsUrl: 'pacs://img/XR-2026-0042' },
  { id: '2', patientPin: 'PIN-2026-0001', patientName: 'John Mwakyusa', scanType: 'MRI', appointmentDate: '2026-08-12T14:00', status: 'scheduled' },
  { id: '3', patientPin: 'PIN-2026-0004', patientName: 'Joseph Temba', scanType: 'CT Scan', appointmentDate: '2026-08-11T16:00', status: 'in-progress' },
  { id: '4', patientPin: 'PIN-2026-0003', patientName: 'Grace Massawe', scanType: 'Ultrasound', appointmentDate: '2026-08-13T09:00', status: 'scheduled' },
];

const scanTypeColors: Record<string, string> = {
  'X-Ray': 'bg-slate-100 text-slate-700',
  'MRI': 'bg-blue-50 text-blue-600',
  'CT Scan': 'bg-purple-50 text-purple-600',
  'Ultrasound': 'bg-emerald-50 text-emerald-600',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  reported: 'bg-emerald-100 text-emerald-700',
};

export default function HmsRadiology() {
  const [orders, setOrders] = useState<RadiologyOrder[]>(demoOrders);
  const [selected, setSelected] = useState<RadiologyOrder | null>(null);
  const [notes, setNotes] = useState('');
  const [pacsUrl, setPacsUrl] = useState('');
  const [listening, setListening] = useState(false);

  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice-to-text is not supported in this browser. Please type your notes manually.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    setListening(true);
    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = 0; i < event.results.length; i++) {
        finalText += event.results[i][0].transcript;
      }
      setNotes(finalText);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const saveReport = () => {
    if (!selected) return;
    setOrders(orders.map(o => o.id === selected.id ? { ...o, status: 'reported', radiologistNotes: notes, pacsUrl: pacsUrl || o.pacsUrl } : o));
    setSelected(null);
    setNotes('');
    setPacsUrl('');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Radiology Information System (RIS & PACS)</h2>
        <p className="text-sm text-slate-500">Imaging appointments, PACS integration, voice-to-text dictation</p>
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {orders.map(o => (
          <div
            key={o.id}
            onClick={() => {
              setSelected(o);
              setNotes(o.radiologistNotes || '');
              setPacsUrl(o.pacsUrl || '');
            }}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Scan className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900 text-sm">{o.patientName}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${scanTypeColors[o.scanType]}`}>{o.scanType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{o.patientPin}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {new Date(o.appointmentDate).toLocaleString()}
                  </div>
                  {o.radiologistNotes && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded italic">"{o.radiologistNotes.substring(0, 100)}..."</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dictation / report modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-slate-900">Radiology Report</h3>
                <p className="text-sm text-slate-500">{selected.patientName} · {selected.scanType}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">PIN:</span> {selected.patientPin}</div>
                <div><span className="text-slate-400">Appointment:</span> {new Date(selected.appointmentDate).toLocaleString()}</div>
              </div>

              {/* PACS link */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PACS Image Reference</label>
                <input
                  value={pacsUrl}
                  onChange={(e) => setPacsUrl(e.target.value)}
                  placeholder="pacs://img/..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                />
              </div>

              {/* Dictation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Radiologist Notes</label>
                  <button
                    type="button"
                    onClick={startDictation}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      listening ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {listening ? 'Listening...' : 'Voice Dictation'}
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={6}
                  placeholder="Dictate or type radiology findings here..."
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveReport}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Report
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
