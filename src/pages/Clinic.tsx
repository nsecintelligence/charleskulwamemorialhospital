import { ExternalLink, Calendar, Clock, Stethoscope, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Clinic() {
  const timetableUrl = 'https://timetable.ckmhospital.org';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-15" />
        <div className="relative container-width section-padding py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Stethoscope className="w-4 h-4" />
              Specialist Clinic
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Madaktari Bingwa</h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-6">
              Tazama ratiba ya madaktari bingwa wetu. Piga simu au fika hospitali kwa miadi.
            </p>
            <a
              href={timetableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              View Hospital Timetable
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Timetable Info Card */}
      <section className="bg-white">
        <div className="container-width section-padding">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <Clock className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Hospital Timetable Portal</h2>
            <p className="text-gray-600 mb-6">
              Our full specialist doctor timetable is available on our dedicated timetable portal.
              Click the button below to view the complete schedule.
            </p>
            <a
              href={timetableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-emerald-600/25"
            >
              <ExternalLink className="w-4 h-4" />
              Open timetable.ckmhospital.org
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="container-width section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Jinsi ya Kupata Miadi</h2>
            <p className="text-gray-600 mb-8">Piga simu au fika hospitali kupata miadi na daktari bingwa wetu.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Piga Simu</h3>
                <p className="text-sm text-gray-600">+255 786 013 232 / +255 756 339 619</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Tuma Ujumbe</h3>
                <p className="text-sm text-gray-600">Wasiliana nasi kupitia fomu ya mawasiliano.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Fika Hospitali</h3>
                <p className="text-sm text-gray-600">Runzewe Wilayani Bukombe Mkoani Geita</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-8 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Wasiliana Nasi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
