import { Users, AlertTriangle, CheckCircle, Clock, Award, ShieldCheck } from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  role: string;
  specialty: string;
  licenseNo: string;
  licenseExpiry: string;
  boardCert: string;
  certExpiry: string;
  deaNo: string;
  phone: string;
  email: string;
  performance: number;
}

const demoStaff: Staff[] = [
  { id: '1', name: 'Dr. Sarah Mwasa', role: 'Doctor', specialty: 'Cardiology', licenseNo: 'MD-TZ-10245', licenseExpiry: '2026-09-08', boardCert: 'Internal Medicine', certExpiry: '2027-03-01', deaNo: 'DEA-AK8821', phone: '+255 712 200 001', email: 's.mwasa@hospital.com', performance: 4.8 },
  { id: '2', name: 'Dr. Joseph Temba', role: 'Doctor', specialty: 'Endocrinology', licenseNo: 'MD-TZ-10312', licenseExpiry: '2026-12-15', boardCert: 'Endocrinology', certExpiry: '2028-06-01', deaNo: 'DEA-JT4521', phone: '+255 712 200 002', email: 'j.temba@hospital.com', performance: 4.6 },
  { id: '3', name: 'Dr. Mary Lyimo', role: 'Doctor', specialty: 'Neurology', licenseNo: 'MD-TZ-10488', licenseExpiry: '2027-01-20', boardCert: 'Neurology', certExpiry: '2026-11-30', deaNo: 'DEA-ML7733', phone: '+255 712 200 003', email: 'm.lyimo@hospital.com', performance: 4.9 },
  { id: '4', name: 'Nurse Anna Kessi', role: 'Nurse', specialty: 'ICU', licenseNo: 'RN-TZ-5521', licenseExpiry: '2026-08-25', boardCert: 'Critical Care', certExpiry: '2027-02-14', deaNo: '', phone: '+255 712 200 004', email: 'a.kessi@hospital.com', performance: 4.7 },
  { id: '5', name: 'James Mushi', role: 'Staff', specialty: 'Lab Technician', licenseNo: 'LT-TZ-2208', licenseExpiry: '2028-03-10', boardCert: 'Medical Lab', certExpiry: '2028-03-10', deaNo: '', phone: '+255 712 200 005', email: 'j.mushi@hospital.com', performance: 4.5 },
];

function getExpiryStatus(date: string) {
  const expiry = new Date(date);
  const now = new Date();
  const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
  if (days <= 60) return { label: `Expires in ${days}d`, color: 'bg-amber-100 text-amber-700', icon: Clock };
  return { label: 'Valid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
}

export default function HmsStaff() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Human Resources & Credentialing</h2>
        <p className="text-sm text-slate-500">Staff profiles, license tracking, board certifications & DEA numbers</p>
      </div>

      {/* Expiring alerts */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-amber-800">Credential Expiry Alerts</h3>
        </div>
        <div className="space-y-1.5">
          {demoStaff.flatMap(s => {
            const lic = getExpiryStatus(s.licenseExpiry);
            const cert = getExpiryStatus(s.certExpiry);
            const alerts: string[] = [];
            if (lic.label !== 'Valid') alerts.push(`${s.name} — License ${lic.label}`);
            if (cert.label !== 'Valid') alerts.push(`${s.name} — Board Cert ${cert.label}`);
            return alerts;
          }).map((msg, i) => (
            <p key={i} className="text-sm text-amber-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {msg}
            </p>
          ))}
        </div>
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demoStaff.map(s => {
          const licStatus = getExpiryStatus(s.licenseExpiry);
          const certStatus = getExpiryStatus(s.certExpiry);
          const LicIcon = licStatus.icon;
          const CertIcon = certStatus.icon;
          return (
            <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{s.name}</h3>
                  <p className="text-sm text-slate-500">{s.role} · {s.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-slate-600">Performance: {s.performance}/5.0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    License #{s.licenseNo}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${licStatus.color}`}>
                    <LicIcon className="w-3 h-3" /> {licStatus.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-slate-400" />
                    {s.boardCert}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${certStatus.color}`}>
                    <CertIcon className="w-3 h-3" /> {certStatus.label}
                  </span>
                </div>
                {s.deaNo && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">DEA #{s.deaNo}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Valid</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-50 text-xs text-slate-400 space-y-0.5">
                  <p>{s.phone}</p>
                  <p>{s.email}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
