import { useEffect } from 'react';
import { ExternalLink, Clock, Calendar } from 'lucide-react';

export default function Clinic() {
  useEffect(() => {
    window.location.replace('https://timetable.ckmhospital.org');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <Calendar className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Hospital Timetable</h1>
        <p className="text-gray-600 mb-2">You are being redirected to the hospital timetable portal.</p>
        <p className="text-sm text-gray-400 mb-6 flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4" /> timetable.ckmhospital.org
        </p>
        <a
          href="https://timetable.ckmhospital.org"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Timetable
        </a>
        <p className="text-xs text-gray-400 mt-4">Click the button above if you are not redirected automatically.</p>
      </div>
    </div>
  );
}
