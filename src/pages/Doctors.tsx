import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Lock,
  Stethoscope,
  Calendar,
  BedDouble,
  FlaskConical,
  Scan,
  Pill,
  Users,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const modules = [
  { icon: HeartPulse, title: 'Patient Registration', desc: 'Unique PIN generation, digital signatures, insurance & ID capture, allergies and blood type tracking.' },
  { icon: Stethoscope, title: 'Electronic Health Records', desc: 'Centralized patient history, ICD-10/11 coding, interactive anatomical maps for pain marking.' },
  { icon: FlaskConical, title: 'CPOE Order Entry', desc: 'Electronic lab, scan & medication orders with instant drug-allergy interaction alerts.' },
  { icon: Calendar, title: 'Smart Scheduling', desc: 'Real-time doctor calendars, automated shift rotations, on-call and leave management.' },
  { icon: BedDouble, title: 'Bed & Ward Management', desc: 'Visual ADT floor-plan grid, bed categorization (ICU, CCU, Isolation), auto housekeeping alerts.' },
  { icon: Users, title: 'HR & Credentialing', desc: 'Staff profiles, payroll metrics, license & board certification expiry tracking.' },
  { icon: Scan, title: 'Radiology (RIS & PACS)', desc: 'Imaging appointments for X-Ray, MRI, CT, Ultrasound with voice-to-text dictation notes.' },
  { icon: Pill, title: 'Pharmacy & Inventory', desc: 'Batch tracking, FIFO logic, expiry timelines, auto-purchase orders below threshold.' },
];

export default function Doctors() {
  const navigate = useNavigate();
  const [siteName, setSiteName] = useState('');
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('homepage_content').select('site_name, site_logo_url').maybeSingle().then(({ data }) => {
      if (data?.site_name) setSiteName(data.site_name);
      if (data?.site_logo_url) setSiteLogo(data.site_logo_url);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>

        <div className="relative container-width py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium mb-8">
              <ShieldCheck className="w-4 h-4" />
              Hospital Management System
            </div>

            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-16 w-16 object-contain rounded-full bg-white/10 p-1.5" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-2xl">
                  {siteName.charAt(0) || 'H'}
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Hospital Management System
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-2xl mx-auto">
              An integrated platform for patient records, clinical workflows, diagnostics, and hospital operations.
            </p>
            <p className="text-sm text-emerald-400/80 mb-10 font-medium">
              {siteName || 'Hospital'} — Authorized Staff Access Only
            </p>

            {/* Enter Button */}
            <button
              onClick={() => navigate('/hms/login')}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:scale-105"
            >
              <Lock className="w-5 h-5" />
              Enter Hospital Management System
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-6 text-xs text-slate-400">
              Only authorized hospital staff may access this system. Unauthorized access is prohibited and logged.
            </p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="container-width pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">System Modules</h2>
          <p className="text-slate-400">Everything your hospital needs in one secure platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <div
                key={i}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                  <Icon className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="text-white font-semibold mb-2">{mod.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/10">
        <div className="container-width py-10 text-center">
          <p className="text-slate-400 text-sm">
            Need access credentials? Contact your hospital administrator.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
          >
            Return to hospital website
          </button>
        </div>
      </div>
    </div>
  );
}
