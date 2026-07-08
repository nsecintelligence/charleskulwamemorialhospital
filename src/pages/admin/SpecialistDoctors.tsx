import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Stethoscope,
  Plus,
  Trash,
  Edit,
  Save,
  X,
  Clock,
  User,
  Calendar,
  Award,
  Phone,
  Mail,
  Image,
  GripVertical,
} from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

interface DoctorSchedule {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
  notes: string | null;
  is_available: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  doctor_schedules?: DoctorSchedule[];
}

const DAYS_OF_WEEK = [
  { key: 0, label: 'Sunday' },
  { key: 1, label: 'Monday' },
  { key: 2, label: 'Tuesday' },
  { key: 3, label: 'Wednesday' },
  { key: 4, label: 'Thursday' },
  { key: 5, label: 'Friday' },
  { key: 6, label: 'Saturday' },
];

const SPECIALTIES = [
  'Cardiologist',
  'Neurologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Dermatologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Gynecologist',
  'Urologist',
  'Psychiatrist',
  'Gastroenterologist',
  'Pulmonologist',
  'Endocrinologist',
  'Nephrologist',
  'Oncologist',
  'Radiologist',
  'Anesthesiologist',
  'General Surgeon',
  'Physician',
  'Other',
];

const DEFAULT_SCHEDULE: DoctorSchedule = {
  day_of_week: 1,
  start_time: '09:00',
  end_time: '17:00',
  room_number: null,
  notes: null,
  is_available: true,
};

export default function AdminSpecialistDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    specialty: '',
    qualification: '',
    phone: '',
    email: '',
    photo_url: null,
    is_active: true,
  });
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('specialist_doctors')
        .select(`
          *,
          doctor_schedules (*)
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  function resetForm() {
    setFormData({
      name: '',
      specialty: '',
      qualification: '',
      phone: '',
      email: '',
      photo_url: null,
      is_active: true,
    });
    setSchedules([]);
    setEditingDoctor(null);
    setShowForm(false);
  }

  function handleEdit(doctor: Doctor) {
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      qualification: doctor.qualification,
      phone: doctor.phone,
      email: doctor.email,
      photo_url: doctor.photo_url,
      is_active: doctor.is_active,
    });
    setSchedules(doctor.doctor_schedules || []);
    setEditingDoctor(doctor);
    setShowForm(true);
  }

  async function handleDelete(doctor: Doctor) {
    if (!confirm(`Are you sure you want to delete Dr. ${doctor.name}?`)) return;

    try {
      const { error } = await supabase
        .from('specialist_doctors')
        .delete()
        .eq('id', doctor.id);

      if (error) throw error;
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert('Failed to delete doctor');
    }
  }

  function handleAddSchedule() {
    const usedDays = schedules.map(s => s.day_of_week);
    const availableDay = DAYS_OF_WEEK.find(d => !usedDays.includes(d.key));

    if (!availableDay) {
      alert('All days have been scheduled');
      return;
    }

    setSchedules([...schedules, { ...DEFAULT_SCHEDULE, day_of_week: availableDay.key }]);
  }

  function handleScheduleChange(index: number, field: keyof DoctorSchedule, value: string | boolean) {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  }

  function handleRemoveSchedule(index: number) {
    setSchedules(schedules.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const doctorData = {
        name: formData.name?.trim(),
        specialty: formData.specialty,
        qualification: formData.qualification?.trim() || null,
        phone: formData.phone?.trim() || null,
        email: formData.email?.trim() || null,
        photo_url: formData.photo_url,
        is_active: formData.is_active ?? true,
        display_order: editingDoctor?.display_order ?? doctors.length,
      };

      let doctorId: string;

      if (editingDoctor) {
        // Update existing doctor
        const { error } = await supabase
          .from('specialist_doctors')
          .update(doctorData)
          .eq('id', editingDoctor.id);

        if (error) throw error;
        doctorId = editingDoctor.id;

        // Delete existing schedules
        await supabase.from('doctor_schedules').delete().eq('doctor_id', doctorId);
      } else {
        // Create new doctor
        const { data, error } = await supabase
          .from('specialist_doctors')
          .insert(doctorData)
          .select('id')
          .single();

        if (error) throw error;
        doctorId = data.id;
      }

      // Insert schedules
      if (schedules.length > 0) {
        const scheduleData = schedules.map(s => ({
          doctor_id: doctorId,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          room_number: s.room_number || null,
          notes: s.notes || null,
          is_available: s.is_available,
        }));

        const { error: scheduleError } = await supabase
          .from('doctor_schedules')
          .insert(scheduleData);

        if (scheduleError) throw scheduleError;
      }

      resetForm();
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert('Failed to save doctor. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
            Specialist Doctors
          </h1>
          <p className="text-gray-600 mt-1">Manage specialist doctor profiles and schedules (Madaktari Bingwa)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Dr. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty *
                  </label>
                  <select
                    required
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="MD, FACP, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+255 xxx xxx xxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="doctor@ckmhospital.com"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Image className="w-4 h-4 inline mr-1" />
                  Doctor Photo
                </label>
                <ImageUpload
                  value={formData.photo_url}
                  onChange={(url) => setFormData({ ...formData, photo_url: url })}
                  bucket="images"
                  folder="doctors"
                />
              </div>

              {/* Schedules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Weekly Schedule
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Schedule
                  </button>
                </div>

                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <select
                            value={schedule.day_of_week}
                            onChange={(e) => handleScheduleChange(index, 'day_of_week', parseInt(e.target.value))}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                          >
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d.key} value={d.key}>{d.label}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                          <input
                            type="time"
                            value={schedule.start_time}
                            onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                          <input
                            type="time"
                            value={schedule.end_time}
                            onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Room</label>
                          <input
                            type="text"
                            value={schedule.room_number || ''}
                            onChange={(e) => handleScheduleChange(index, 'room_number', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                            placeholder="Room #"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={schedule.is_available}
                              onChange={(e) => handleScheduleChange(index, 'is_available', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">Available</span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                        <input
                          type="text"
                          value={schedule.notes || ''}
                          onChange={(e) => handleScheduleChange(index, 'notes', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                          placeholder="Additional notes..."
                        />
                      </div>
                    </div>
                  ))}

                  {schedules.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No schedules added yet</p>
                      <p className="text-sm text-gray-400">Click "Add Schedule" to create working hours</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctors List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center p-12">
            <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No doctors added yet</h3>
            <p className="text-gray-500 text-sm">Click "Add Doctor" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Specialty</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Schedule Days</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {doctor.photo_url ? (
                          <img
                            src={doctor.photo_url}
                            alt={doctor.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-bold">
                            {doctor.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                          {doctor.qualification && (
                            <div className="text-xs text-gray-500">{doctor.qualification}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                        <Award className="w-3 h-3" />
                        {doctor.specialty}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">
                        {doctor.phone && <div>{doctor.phone}</div>}
                        {doctor.email && <div className="text-gray-400">{doctor.email}</div>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {doctor.doctor_schedules && doctor.doctor_schedules.length > 0 ? (
                          doctor.doctor_schedules.map((s, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-0.5 rounded ${
                                s.is_available
                                  ? 'bg-gray-100 text-gray-700'
                                  : 'bg-gray-50 text-gray-400 line-through'
                              }`}
                            >
                              {DAYS_OF_WEEK.find(d => d.key === s.day_of_week)?.label.substring(0, 3)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No schedule</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          doctor.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {doctor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
